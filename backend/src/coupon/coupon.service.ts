import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { REDIS_KEYS } from '../common/constants/redis-keys';
import type { Coupon, UserCoupon } from '@prisma/client';

const COUPON_ISSUE_SCRIPT = `
local maxCount = tonumber(redis.call('GET', KEYS[1]))
if not maxCount then return -2 end
local isAlreadyIssued = redis.call('SISMEMBER', KEYS[2], ARGV[1])
if isAlreadyIssued == 1 then return -1 end
local currentCount = redis.call('SCARD', KEYS[2])
if currentCount >= maxCount then return 0 end
redis.call('SADD', KEYS[2], ARGV[1])
return 1
`;

export type UserCouponWithCoupon = UserCoupon & { coupon: Coupon };

@Injectable()
export class CouponService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const coupon = await this.prisma.coupon.create({
      data: {
        ...dto,
        validFrom: new Date(dto.validFrom),
        validUntil: new Date(dto.validUntil),
      },
    });
    await this.redis.setString(REDIS_KEYS.couponMax(coupon.id), String(coupon.maxIssueCount));
    return coupon;
  }

  async findAll(): Promise<Coupon[]> {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async issue(userId: string, couponId: string): Promise<UserCoupon> {
    const result = await this.redis.evalScript(
      COUPON_ISSUE_SCRIPT,
      [REDIS_KEYS.couponMax(couponId), REDIS_KEYS.couponIssued(couponId)],
      [userId],
    );

    switch (result) {
      case -1:
        throw new BusinessException(ErrorCode.COUPON_ALREADY_ISSUED, HttpStatus.CONFLICT);
      case 0:
        throw new BusinessException(ErrorCode.COUPON_SOLD_OUT, HttpStatus.CONFLICT);
      case -2:
        return this.issueFromDb(userId, couponId);
      default:
        return this.prisma.userCoupon.create({ data: { userId, couponId } });
    }
  }

  private async issueFromDb(userId: string, couponId: string): Promise<UserCoupon> {
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
