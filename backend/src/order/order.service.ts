import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { CouponService } from '../coupon/coupon.service';
import { OrderStatus, VALID_TRANSITIONS } from './enums/order-status.enum';
import { CartService } from '../cart/cart.service';
import { Role } from '../common/enums/role.enum';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { REDIS_KEYS, STATS_DAILY_TTL, STATS_MONTHLY_TTL } from '../common/constants/redis-keys';
import { toDateStr, toMonthStr } from '../common/utils/date.util';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../product/product.entity';
import { UserCoupon } from '../coupon/user-coupon.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(UserCoupon) private readonly userCouponRepository: Repository<UserCoupon>,
    private readonly dataSource: DataSource,
    private readonly redis: RedisService,
    private readonly couponService: CouponService,
    private readonly cartService: CartService,
  ) {}

  async createFromCart(userId: string, couponId?: string) {
    const cartItems = await this.cartService.findMyCart(userId);
    if (!cartItems.length) {
      throw new BusinessException(ErrorCode.CART_EMPTY, HttpStatus.BAD_REQUEST);
    }

    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK, HttpStatus.CONFLICT);
      }
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    let discountAmount = 0;
    let userCouponId: string | undefined;
    if (couponId) {
      const coupon = await this.couponService.applyCoupon(userId, couponId, subtotal);
      discountAmount = coupon.discountAmount;
      userCouponId = coupon.userCouponId;
    }

    const totalPrice = subtotal - discountAmount;

    const result = await this.dataSource.transaction(async (manager) => {
      const savedOrder = await manager.save(
        Order,
        manager.create(Order, {
          userId,
          totalPrice,
          discountAmount,
          couponId: couponId ?? null,
          status: OrderStatus.PAID,
        }),
      );

      const items = cartItems.map((item) =>
        manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        }),
      );
      await manager.save(OrderItem, items);

      for (const cartItem of cartItems) {
        await manager.decrement(Product, { id: cartItem.productId }, 'stock', cartItem.quantity);
        await manager.increment(Product, { id: cartItem.productId }, 'salesCount', cartItem.quantity);
      }

      if (userCouponId) {
        await manager.update(UserCoupon, { id: userCouponId }, {
          usedAt: new Date(),
          orderId: savedOrder.id,
        });
      }

      return manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['items', 'items.product'],
      });
    });

    await this.cartService.clearCart(userId);

    for (const cartItem of cartItems) {
      await this.redis.zIncrBy(REDIS_KEYS.SALES_RANKING, cartItem.quantity, cartItem.productId);
    }

    await this.updateRevenueStats(totalPrice);
    await this.incrementOrderStats();

    return result;
  }

  findMyOrders(userId: string) {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  findAllOrders() {
    return this.orderRepository.find({
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(orderId: string, userId: string, role: Role) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product'],
    });
    if (!order) throw new BusinessException(ErrorCode.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    if (role !== Role.ADMIN && order.userId !== userId) {
      throw new BusinessException(ErrorCode.ORDER_FORBIDDEN, HttpStatus.FORBIDDEN);
    }
    return order;
  }

  async cancel(orderId: string, userId: string, role: Role) {
    const order = await this.findById(orderId, userId, role);
    this.assertTransition(order.status, OrderStatus.CANCELLED);

    const items = (await order.items) as OrderItem[];

    const cancelled = await this.dataSource.transaction(async (manager) => {
      for (const item of items) {
        if (item.productId) {
          await manager.increment(Product, { id: item.productId }, 'stock', item.quantity);
          await manager.decrement(Product, { id: item.productId }, 'salesCount', item.quantity);
        }
      }

      await manager.update(Order, { id: orderId }, { status: OrderStatus.CANCELLED });

      return manager.findOne(Order, {
        where: { id: orderId },
        relations: ['items', 'items.product'],
      });
    });

    for (const item of items) {
      if (item.productId) {
        await this.redis.zIncrBy(REDIS_KEYS.SALES_RANKING, -item.quantity, item.productId);
      }
    }

    return cancelled;
  }

  async ship(orderId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new BusinessException(ErrorCode.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    this.assertTransition(order.status, OrderStatus.SHIPPING);
    await this.orderRepository.update(orderId, { status: OrderStatus.SHIPPING });
    return this.orderRepository.findOne({ where: { id: orderId } });
  }

  async deliver(orderId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new BusinessException(ErrorCode.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    this.assertTransition(order.status, OrderStatus.DELIVERED);
    await this.orderRepository.update(orderId, { status: OrderStatus.DELIVERED });
    return this.orderRepository.findOne({ where: { id: orderId } });
  }

  private async updateRevenueStats(amount: number): Promise<void> {
    const date = toDateStr(new Date());
    const month = toMonthStr(new Date());
    await Promise.all([
      this.redis.incrByFloat(REDIS_KEYS.statsRevenueDaily(date), amount, STATS_DAILY_TTL),
      this.redis.incrByFloat(REDIS_KEYS.statsRevenueMonthly(month), amount, STATS_MONTHLY_TTL),
    ]);
  }

  private async incrementOrderStats(): Promise<void> {
    const date = toDateStr(new Date());
    const month = toMonthStr(new Date());
    await Promise.all([
      this.redis.incrBy(REDIS_KEYS.statsOrdersDaily(date), 1, STATS_DAILY_TTL),
      this.redis.incrBy(REDIS_KEYS.statsOrdersMonthly(month), 1, STATS_MONTHLY_TTL),
    ]);
  }

  private assertTransition(current: OrderStatus, next: OrderStatus) {
    if (!VALID_TRANSITIONS[current].includes(next)) {
      throw new BusinessException(ErrorCode.ORDER_INVALID_STATUS, HttpStatus.CONFLICT);
    }
  }
}
