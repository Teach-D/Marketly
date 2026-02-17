import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus, VALID_TRANSITIONS } from './enums/order-status.enum';
import { CartService } from '../cart/cart.service';
import { CartItem } from '../cart/cart-item.entity';
import { Product } from '../product/product.entity';
import { Role } from '../common/enums/role.enum';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly cartService: CartService,
    private readonly dataSource: DataSource,
  ) {}

  async createFromCart(userId: string): Promise<Order> {
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

    return this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, { userId, totalPrice, status: OrderStatus.PAID });
      const savedOrder = await manager.save(order);

      for (const cartItem of cartItems) {
        const orderItem = manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItem.product.price,
        });
        await manager.save(orderItem);
        await manager.decrement(Product, { id: cartItem.productId }, 'stock', cartItem.quantity);
      }

      await manager.delete(CartItem, { userId });
      return savedOrder;
    });
  }

  async findMyOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(orderId: string, userId: string, role: Role): Promise<Order> {
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

  async cancel(orderId: string, userId: string, role: Role): Promise<Order> {
    const order = await this.findById(orderId, userId, role);
    this.assertTransition(order.status, OrderStatus.CANCELLED);
    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }

  async ship(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new BusinessException(ErrorCode.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    this.assertTransition(order.status, OrderStatus.SHIPPING);
    order.status = OrderStatus.SHIPPING;
    return this.orderRepository.save(order);
  }

  async deliver(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new BusinessException(ErrorCode.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    this.assertTransition(order.status, OrderStatus.DELIVERED);
    order.status = OrderStatus.DELIVERED;
    return this.orderRepository.save(order);
  }

  private assertTransition(current: OrderStatus, next: OrderStatus): void {
    if (!VALID_TRANSITIONS[current].includes(next)) {
      throw new BusinessException(ErrorCode.ORDER_INVALID_STATUS, HttpStatus.CONFLICT);
    }
  }
}
