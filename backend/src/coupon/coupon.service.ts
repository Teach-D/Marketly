import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import type { Coupon, UserCoupon } from '@prisma/client';

export type UserCouponWithCoupon = UserCoupon & { coupon: Coupon };

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCouponDto): Promise<Coupon> {
    return this.prisma.coupon.create({
      data: {
        ...dto,
        validFrom: new Date(dto.validFrom),
        validUntil: new Date(dto.validUntil),
      },
    });
  }

  async findAll(): Promise<Coupon[]> {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async issue(userId: string, couponId: string): Promise<UserCoupon> {
    const coupon = await this.prisma.coupon.findUnique({ where: { id: couponId } });
    if (!coupon) throw new BusinessException(ErrorCode.COUPON_NOT_FOUND, HttpStatus.NOT_FOUND);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.userCoupon.findUnique({
        where: { userId_couponId: { userId, couponId } },
      });
      if (existing) throw new BusinessException(ErrorCode.COUPON_ALREADY_ISSUED, HttpStatus.CONFLICT);

      const updated = await tx.coupon.updateMany({
        where: { id: couponId, issuedCount: { lt: coupon.maxIssueCount } },
        data: { issuedCount: { increment: 1 } },
      });
      if (updated.count === 0) {
        throw new BusinessException(ErrorCode.COUPON_SOLD_OUT, HttpStatus.CONFLICT);
      }

      return tx.userCoupon.create({ data: { userId, couponId } });
    });
  }

  async findMyCoupons(userId: string): Promise<UserCouponWithCoupon[]> {
    return this.prisma.userCoupon.findMany({
      where: { userId, usedAt: null },
      include: { coupon: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async applyCoupon(
    userId: string,
    couponId: string,
    orderAmount: number,
  ): Promise<{ discountAmount: number; userCouponId: string }> {
    const userCoupon = await this.prisma.userCoupon.findUnique({
      where: { userId_couponId: { userId, couponId } },
      include: { coupon: true },
    });
    if (!userCoupon) throw new BusinessException(ErrorCode.COUPON_NOT_ISSUED, HttpStatus.BAD_REQUEST);
    if (userCoupon.usedAt) throw new BusinessException(ErrorCode.COUPON_ALREADY_USED, HttpStatus.CONFLICT);

    const { coupon } = userCoupon;
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      throw new BusinessException(ErrorCode.COUPON_EXPIRED, HttpStatus.CONFLICT);
    }
    if (orderAmount < coupon.minOrderAmount) {
      throw new BusinessException(ErrorCode.COUPON_MIN_ORDER_AMOUNT, HttpStatus.BAD_REQUEST);
    }

    const discountAmount = Math.floor(orderAmount * (coupon.discountRate / 100));
    return { discountAmount, userCouponId: userCoupon.id };
  }
}
