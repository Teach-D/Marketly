import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { OrderStatus, VALID_TRANSITIONS } from './enums/order-status.enum';
import { CartService } from '../cart/cart.service';
import { Role } from '../common/enums/role.enum';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { REDIS_KEYS } from '../common/constants/redis-keys';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly cartService: CartService,
  ) {}

  async createFromCart(userId: string) {
    const cartItems = await this.cartService.findMyCart(userId);
    if (!cartItems.length) {
      throw new BusinessException(ErrorCode.CART_EMPTY, HttpStatus.BAD_REQUEST);
    }

    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK, HttpStatus.CONFLICT);
      }
    }

    const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          totalPrice,
          status: OrderStatus.PAID,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      for (const cartItem of cartItems) {
        await tx.product.update({
          where: { id: cartItem.productId },
          data: {
            stock: { decrement: cartItem.quantity },
            salesCount: { increment: cartItem.quantity },
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });

    for (const cartItem of cartItems) {
      await this.redis.zIncrBy(REDIS_KEYS.SALES_RANKING, cartItem.quantity, cartItem.productId);
    }

    return result;
  }

  async findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllOrders() {
    return this.prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orderId: string, userId: string, role: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
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

    const cancelled = await this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              salesCount: { decrement: item.quantity },
            },
          });
        }
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
        include: { items: { include: { product: true } } },
      });
    });

    for (const item of order.items) {
      if (item.productId) {
        await this.redis.zIncrBy(REDIS_KEYS.SALES_RANKING, -item.quantity, item.productId);
      }
    }

    return cancelled;
  }

  async ship(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BusinessException(ErrorCode.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    this.assertTransition(order.status, OrderStatus.SHIPPING);
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.SHIPPING },
    });
  }

  async deliver(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BusinessException(ErrorCode.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    this.assertTransition(order.status, OrderStatus.DELIVERED);
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.DELIVERED },
    });
  }

  private assertTransition(current: OrderStatus, next: OrderStatus) {
    if (!VALID_TRANSITIONS[current].includes(next)) {
      throw new BusinessException(ErrorCode.ORDER_INVALID_STATUS, HttpStatus.CONFLICT);
    }
  }
}
