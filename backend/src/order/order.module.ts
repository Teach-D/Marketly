import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModule } from '../cart/cart.module';
import { CouponModule } from '../coupon/coupon.module';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../product/product.entity';
import { UserCoupon } from '../coupon/user-coupon.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, UserCoupon]),
    CartModule,
    CouponModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
