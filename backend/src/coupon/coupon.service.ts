import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThanOrEqual, IsNull } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { REDIS_KEYS } from '../common/constants/redis-keys';
import { Coupon } from './coupon.entity';
import { UserCoupon } from './user-coupon.entity';

const COUPON_ISSUE_SCRIPT = `
local maxCount = tonumber(redis.call('GET', KEYS[1]))
if not maxCount then return -2 end
local openAt = redis.call('GET', KEYS[3])
if openAt and tonumber(ARGV[2]) < tonumber(openAt) then return -3 end
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
    @InjectRepository(Coupon) private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(UserCoupon) private readonly userCouponRepository: Repository<UserCoupon>,
    private readonly dataSource: DataSource,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const coupon = await this.couponRepository.save(
      this.couponRepository.create({
        ...dto,
        openAt: new Date(dto.openAt),
        validFrom: new Date(dto.validFrom),
        validUntil: new Date(dto.validUntil),
      }),
    );
    const openAtSec = Math.floor(coupon.openAt.getTime() / 1000);
    await Promise.all([
      this.redis.setString(REDIS_KEYS.couponMax(coupon.id), String(coupon.maxIssueCount)),
      this.redis.setString(REDIS_KEYS.couponOpenAt(coupon.id), String(openAtSec)),
    ]);
    return coupon;
  }

  findAll(): Promise<Coupon[]> {
    return this.couponRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findEvents() {
    const now = new Date();
    const coupons = await this.couponRepository.find({
      where: { validUntil: MoreThanOrEqual(now) },
      order: { openAt: 'ASC' },
    });
    return coupons.map((c) => ({
      ...c,
      status: this.resolveStatus(c, now),
    }));
  }

  private resolveStatus(coupon: Coupon, now: Date): 'upcoming' | 'open' | 'sold_out' {
    if (now < coupon.openAt) return 'upcoming';
    if (coupon.issuedCount >= coupon.maxIssueCount) return 'sold_out';
    return 'open';
  }

  async issue(userId: string, couponId: string): Promise<UserCoupon> {
    const nowSec = Math.floor(Date.now() / 1000);
    const result = await this.redis.evalScript(
      COUPON_ISSUE_SCRIPT,
      [REDIS_KEYS.couponMax(couponId), REDIS_KEYS.couponIssued(couponId), REDIS_KEYS.couponOpenAt(couponId)],
      [userId, String(nowSec)],
    );

    switch (result) {
      case -3:
        throw new BusinessException(ErrorCode.COUPON_NOT_OPEN, HttpStatus.CONFLICT);
      case -1:
        throw new BusinessException(ErrorCode.COUPON_ALREADY_ISSUED, HttpStatus.CONFLICT);
      case 0:
        throw new BusinessException(ErrorCode.COUPON_SOLD_OUT, HttpStatus.CONFLICT);
      case -2:
        return this.issueFromDb(userId, couponId);
      default:
        return this.userCouponRepository.save(
          this.userCouponRepository.create({ userId, couponId }),
        );
    }
  }

  private async issueFromDb(userId: string, couponId: string): Promise<UserCoupon> {
    const coupon = await this.couponRepository.findOne({ where: { id: couponId } });
    if (!coupon) throw new BusinessException(ErrorCode.COUPON_NOT_FOUND, HttpStatus.NOT_FOUND);
    if (new Date() < coupon.openAt) {
      throw new BusinessException(ErrorCode.COUPON_NOT_OPEN, HttpStatus.CONFLICT);
    }

    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(UserCoupon, { where: { userId, couponId } });
      if (existing) throw new BusinessException(ErrorCode.COUPON_ALREADY_ISSUED, HttpStatus.CONFLICT);

      const result = await manager
        .createQueryBuilder()
        .update(Coupon)
        .set({ issuedCount: () => 'issued_count + 1' })
        .where('id = :id AND issued_count < :max', { id: couponId, max: coupon.maxIssueCount })
        .execute();
      if (result.affected === 0) {
        throw new BusinessException(ErrorCode.COUPON_SOLD_OUT, HttpStatus.CONFLICT);
      }

      return manager.save(UserCoupon, manager.create(UserCoupon, { userId, couponId }));
    });
  }

  async findMyCoupons(userId: string): Promise<UserCouponWithCoupon[]> {
    return this.userCouponRepository.find({
      where: { userId, usedAt: IsNull() },
      relations: ['coupon'],
      order: { createdAt: 'DESC' },
    }) as Promise<UserCouponWithCoupon[]>;
  }

  async applyCoupon(
    userId: string,
    couponId: string,
    orderAmount: number,
  ): Promise<{ discountAmount: number; userCouponId: string }> {
    const userCoupon = await this.userCouponRepository.findOne({
      where: { userId, couponId },
      relations: ['coupon'],
    }) as UserCouponWithCoupon | null;
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
