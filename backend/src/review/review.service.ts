import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '../order/enums/order-status.enum';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProduct(query: ReviewQueryDto) {
    const { productId, page, limit } = query;
    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where: { productId } }),
    ]);
    return { items, total, page, limit };
  }

  async create(userId: string, dto: CreateReviewDto) {
    await this.assertPurchased(userId, dto.productId);

    const existing = await this.prisma.review.findUnique({
      where: { userId_productId: { userId, productId: dto.productId } },
    });
    if (existing) {
      throw new BusinessException(ErrorCode.REVIEW_ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    const review = await this.prisma.review.create({ data: { userId, ...dto } });
    await this.refreshProductStat(dto.productId);
    return review;
  }

  async update(userId: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await this.findMyReview(userId, reviewId);
    const updated = await this.prisma.review.update({ where: { id: reviewId }, data: dto });
    await this.refreshProductStat(review.productId);
    return updated;
  }

  async remove(userId: string, reviewId: string) {
    const review = await this.findMyReview(userId, reviewId);
    await this.prisma.review.delete({ where: { id: reviewId } });
    await this.refreshProductStat(review.productId);
  }

  private async assertPurchased(userId: string, productId: string) {
    const purchased = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: OrderStatus.DELIVERED },
      },
    });
    if (!purchased) {
      throw new BusinessException(ErrorCode.REVIEW_PURCHASE_REQUIRED, HttpStatus.FORBIDDEN);
    }
  }

  private async refreshProductStat(productId: string): Promise<void> {
    const result = await this.prisma.review.aggregate({
      where: { productId },
      _count: { id: true },
      _avg: { rating: true },
    });
    await this.prisma.productStat.upsert({
      where: { productId },
      create: { productId, reviewCount: result._count.id, avgRating: result._avg.rating ?? 0 },
      update: { reviewCount: result._count.id, avgRating: result._avg.rating ?? 0 },
    });
  }

  private async findMyReview(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new BusinessException(ErrorCode.REVIEW_NOT_FOUND, HttpStatus.NOT_FOUND);
    if (review.userId !== userId) {
      throw new BusinessException(ErrorCode.REVIEW_FORBIDDEN, HttpStatus.FORBIDDEN);
    }
    return review;
  }
}
