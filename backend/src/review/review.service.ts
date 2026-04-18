import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from '../order/enums/order-status.enum';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { Review } from './review.entity';
import { OrderItem } from '../order/order-item.entity';
import { ProductStat } from '../product/product-stat.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private readonly reviewRepository: Repository<Review>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(ProductStat) private readonly productStatRepository: Repository<ProductStat>,
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

  async create(userId: string, dto: CreateReviewDto) {
    await this.assertPurchased(userId, dto.productId);

    const existing = await this.reviewRepository.findOne({
      where: { userId, productId: dto.productId },
    });
    if (existing) {
      throw new BusinessException(ErrorCode.REVIEW_ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    const review = await this.reviewRepository.save(
      this.reviewRepository.create({ userId, ...dto }),
    );
    await this.refreshProductStat(dto.productId);
    return review;
  }

  async update(userId: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await this.findMyReview(userId, reviewId);
    await this.reviewRepository.update(reviewId, dto);
    await this.refreshProductStat(review.productId);
    return this.reviewRepository.findOne({ where: { id: reviewId } });
  }

  async remove(userId: string, reviewId: string) {
    const review = await this.findMyReview(userId, reviewId);
    await this.reviewRepository.delete(reviewId);
    await this.refreshProductStat(review.productId);
  }

  private async assertPurchased(userId: string, productId: string) {
    const purchased = await this.orderItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.order', 'order')
      .where('item.productId = :productId', { productId })
      .andWhere('order.userId = :userId', { userId })
      .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
      .getOne();
    if (!purchased) {
      throw new BusinessException(ErrorCode.REVIEW_PURCHASE_REQUIRED, HttpStatus.FORBIDDEN);
    }
  }

  private async refreshProductStat(productId: string): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('COUNT(review.id)', 'count')
      .addSelect('AVG(review.rating)', 'avg')
      .where('review.productId = :productId', { productId })
      .getRawOne<{ count: string; avg: string }>();

    const reviewCount = parseInt(result?.count ?? '0', 10);
    const avgRating = parseFloat(result?.avg ?? '0');

    await this.productStatRepository.upsert({ productId, reviewCount, avgRating }, ['productId']);
  }

  private async findMyReview(userId: string, reviewId: string) {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) throw new BusinessException(ErrorCode.REVIEW_NOT_FOUND, HttpStatus.NOT_FOUND);
    if (review.userId !== userId) {
      throw new BusinessException(ErrorCode.REVIEW_FORBIDDEN, HttpStatus.FORBIDDEN);
    }
    return review;
  }
}
