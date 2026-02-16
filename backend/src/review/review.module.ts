import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { OrderItem } from '../order/order-item.entity';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Review, OrderItem])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
