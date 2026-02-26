import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModule } from '../cart/cart.module';
import { CouponModule } from '../coupon/coupon.module';

@Module({
  imports: [CartModule, CouponModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
