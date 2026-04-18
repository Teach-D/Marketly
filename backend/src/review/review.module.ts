import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Review } from './review.entity';
import { OrderItem } from '../order/order-item.entity';
import { ProductStat } from '../product/product-stat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, OrderItem, ProductStat])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
