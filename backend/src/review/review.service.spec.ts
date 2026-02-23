import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { OrderStatus } from '../order/enums/order-status.enum';

const mockReview = {
  id: 'review-id',
  userId: 'user-id',
  productId: 'product-id',
  rating: 5,
  content: '좋은 상품입니다',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const prismaMock = {
  review: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  orderItem: {
    findFirst: jest.fn(),
  },
} as unknown as PrismaService;

describe('ReviewService', () => {
  let service: ReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    jest.clearAllMocks();
  });

  describe('findByProduct', () => {
    it('상품 리뷰 목록 페이징 조회 성공', async () => {
      (prismaMock.review.findMany as jest.Mock).mockResolvedValue([mockReview]);
      (prismaMock.review.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findByProduct({ productId: 'product-id', page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('create', () => {
    it('배송완료 구매 이력이 있으면 리뷰 작성 성공', async () => {
      (prismaMock.orderItem.findFirst as jest.Mock).mockResolvedValue({ id: 'order-item-id' });
      (prismaMock.review.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaMock.review.create as jest.Mock).mockResolvedValue(mockReview);

      const result = await service.create('user-id', {
        productId: 'product-id',
        rating: 5,
        content: '좋은 상품입니다',
      });

      expect(result).toEqual(mockReview);
    });

    it('구매 이력이 없으면 REVIEW_PURCHASE_REQUIRED 예외 발생', async () => {
      (prismaMock.orderItem.findFirst as jest.Mock).mockResolvedValue(null);

      const error = await service
        .create('user-id', { productId: 'product-id', rating: 5, content: '좋아요' })
        .catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.REVIEW_PURCHASE_REQUIRED);
    });

    it('이미 리뷰를 작성한 상품이면 REVIEW_ALREADY_EXISTS 예외 발생', async () => {
      (prismaMock.orderItem.findFirst as jest.Mock).mockResolvedValue({ id: 'order-item-id' });
      (prismaMock.review.findUnique as jest.Mock).mockResolvedValue(mockReview);

      const error = await service
        .create('user-id', { productId: 'product-id', rating: 5, content: '좋아요' })
        .catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.REVIEW_ALREADY_EXISTS);
    });

    it('assertPurchased 호출 시 DELIVERED 상태 주문만 확인', async () => {
      (prismaMock.orderItem.findFirst as jest.Mock).mockResolvedValue(null);

      await service
        .create('user-id', { productId: 'product-id', rating: 5, content: '좋아요' })
        .catch(() => {});

      expect(prismaMock.orderItem.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            order: expect.objectContaining({ status: OrderStatus.DELIVERED }),
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('본인 리뷰 수정 성공', async () => {
      (prismaMock.review.findUnique as jest.Mock).mockResolvedValue(mockReview);
      (prismaMock.review.update as jest.Mock).mockResolvedValue({ ...mockReview, rating: 4 });

      const result = await service.update('user-id', 'review-id', { rating: 4 });

      expect(result.rating).toBe(4);
    });

    it('존재하지 않는 리뷰이면 REVIEW_NOT_FOUND 예외 발생', async () => {
      (prismaMock.review.findUnique as jest.Mock).mockResolvedValue(null);

      const error = await service
        .update('user-id', 'no-review-id', { rating: 3 })
        .catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.REVIEW_NOT_FOUND);
    });

    it('다른 사용자의 리뷰이면 REVIEW_FORBIDDEN 예외 발생', async () => {
      (prismaMock.review.findUnique as jest.Mock).mockResolvedValue(mockReview);

      const error = await service
        .update('other-user-id', 'review-id', { rating: 3 })
        .catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.REVIEW_FORBIDDEN);
    });
  });

  describe('remove', () => {
    it('본인 리뷰 삭제 성공', async () => {
      (prismaMock.review.findUnique as jest.Mock).mockResolvedValue(mockReview);
      (prismaMock.review.delete as jest.Mock).mockResolvedValue(mockReview);

      await service.remove('user-id', 'review-id');

      expect(prismaMock.review.delete).toHaveBeenCalledWith({ where: { id: 'review-id' } });
    });

    it('다른 사용자의 리뷰 삭제 시 REVIEW_FORBIDDEN 예외 발생', async () => {
      (prismaMock.review.findUnique as jest.Mock).mockResolvedValue(mockReview);

      const error = await service.remove('other-user-id', 'review-id').catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.REVIEW_FORBIDDEN);
    });
  });
});
