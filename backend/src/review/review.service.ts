import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { OrderItem } from '../order/order-item.entity';
import { OrderStatus } from '../order/enums/order-status.enum';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async findByProduct(query: ReviewQueryDto) {
    const { productId, page, limit } = query;
    const [items, total] = await this.reviewRepository.findAndCount({
      where: { productId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async create(userId: string, dto: CreateReviewDto): Promise<Review> {
    await this.assertPurchased(userId, dto.productId);

    const existing = await this.reviewRepository.findOne({
      where: { userId, productId: dto.productId },
    });
    if (existing) {
      throw new BusinessException(ErrorCode.REVIEW_ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    const review = this.reviewRepository.create({ userId, ...dto });
    return this.reviewRepository.save(review);
  }

  async update(userId: string, reviewId: string, dto: UpdateReviewDto): Promise<Review> {
    const review = await this.findMyReview(userId, reviewId);
    Object.assign(review, dto);
    return this.reviewRepository.save(review);
  }

  async remove(userId: string, reviewId: string): Promise<void> {
    await this.findMyReview(userId, reviewId);
    await this.reviewRepository.delete(reviewId);
  }

  private async assertPurchased(userId: string, productId: string): Promise<void> {
    const purchased = await this.orderItemRepository
      .createQueryBuilder('oi')
      .innerJoin('oi.order', 'o')
      .where('oi.product_id = :productId', { productId })
      .andWhere('o.user_id = :userId', { userId })
      .andWhere('o.status = :status', { status: OrderStatus.DELIVERED })
      .getOne();

    if (!purchased) {
      throw new BusinessException(ErrorCode.REVIEW_PURCHASE_REQUIRED, HttpStatus.FORBIDDEN);
    }
  }

  private async findMyReview(userId: string, reviewId: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) throw new BusinessException(ErrorCode.REVIEW_NOT_FOUND, HttpStatus.NOT_FOUND);
    if (review.userId !== userId) {
      throw new BusinessException(ErrorCode.REVIEW_FORBIDDEN, HttpStatus.FORBIDDEN);
    }
    return review;
  }
}
