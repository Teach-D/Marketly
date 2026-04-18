import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReviewService } from './review.service';
import { Review } from './review.entity';
import { OrderItem } from '../order/order-item.entity';
import { ProductStat } from '../product/product-stat.entity';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { OrderStatus } from '../order/enums/order-status.enum';

const mockReview: Partial<Review> = {
  id: 'review-id',
  userId: 'user-id',
  productId: 'product-id',
  rating: 5,
  content: '좋은 상품입니다',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockReviewRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockOrderItemRepository = {
  createQueryBuilder: jest.fn(),
};

const mockProductStatRepository = {
  upsert: jest.fn(),
};

describe('ReviewService', () => {
  let service: ReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: getRepositoryToken(Review), useValue: mockReviewRepository },
        { provide: getRepositoryToken(OrderItem), useValue: mockOrderItemRepository },
        { provide: getRepositoryToken(ProductStat), useValue: mockProductStatRepository },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    jest.clearAllMocks();
  });

  describe('findByProduct', () => {
    it('상품 리뷰 목록 페이징 조회 성공', async () => {
      (mockReviewRepository.findAndCount as jest.Mock).mockResolvedValue([[mockReview], 1]);

      const result = await service.findByProduct({ productId: 'product-id', page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('create', () => {
    const buildOrderItemQb = (result: unknown) => ({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(result),
    });

    const buildReviewQb = () => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ count: '1', avg: '5' }),
    });

    it('배송완료 구매 이력이 있으면 리뷰 작성 성공', async () => {
      (mockOrderItemRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        buildOrderItemQb({ id: 'order-item-id' }),
      );
      (mockReviewRepository.findOne as jest.Mock).mockResolvedValue(null);
      (mockReviewRepository.create as jest.Mock).mockReturnValue(mockReview);
      (mockReviewRepository.save as jest.Mock).mockResolvedValue(mockReview);
      (mockReviewRepository.createQueryBuilder as jest.Mock).mockReturnValue(buildReviewQb());
      (mockProductStatRepository.upsert as jest.Mock).mockResolvedValue(undefined);

      const result = await service.create('user-id', {
        productId: 'product-id',
        rating: 5,
        content: '좋은 상품입니다',
      });

      expect(result).toEqual(mockReview);
    });

    it('구매 이력이 없으면 REVIEW_PURCHASE_REQUIRED 예외 발생', async () => {
      (mockOrderItemRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        buildOrderItemQb(null),
      );

      const error = await service
        .create('user-id', { productId: 'product-id', rating: 5, content: '좋아요' })
        .catch((e: BusinessException) => e) as BusinessException;
      expect(error.getErrorCode()).toBe(ErrorCode.REVIEW_PURCHASE_REQUIRED);
    });

    it('이미 리뷰를 작성한 상품이면 REVIEW_ALREADY_EXISTS 예외 발생', async () => {
      (mockOrderItemRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        buildOrderItemQb({ id: 'order-item-id' }),
      );
      (mockReviewRepository.findOne as jest.Mock).mockResolvedValue(mockReview);

      const error = await service
        .create('user-id', { productId: 'product-id', rating: 5, content: '좋아요' })
        .catch((e: BusinessException) => e) as BusinessException;
      expect(error.getErrorCode()).toBe(ErrorCode.REVIEW_ALREADY_EXISTS);
    });

    it('assertPurchased 호출 시 DELIVERED 상태 주문만 확인', async () => {
      const qb = buildOrderItemQb(null);
      (mockOrderItemRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      await service
        .create('user-id', { productId: 'product-id', rating: 5, content: '좋아요' })
        .catch(() => {});

      expect(qb.andWhere).toHaveBeenCalledWith('order.status = :status', {
        status: OrderStatus.DELIVERED,
      });
    });
  });

  describe('update', () => {
    it('본인 리뷰 수정 성공', async () => {
      (mockReviewRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(mockReview)
        .mockResolvedValueOnce({ ...mockReview, rating: 4 });
      (mockReviewRepository.update as jest.Mock).mockResolvedValue(undefined);
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: '1', avg: '4' }),
      };
      (mockReviewRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);
      (mockProductStatRepository.upsert as jest.Mock).mockResolvedValue(undefined);

      const result = await service.update('user-id', 'review-id', { rating: 4 });

      expect(result?.rating).toBe(4);
    });

    it('존재하지 않는 리뷰이면 REVIEW_NOT_FOUND 예외 발생', async () => {
      (mockReviewRepository.findOne as jest.Mock).mockResolvedValue(null);

      const error = await service
        .update('user-id', 'no-review-id', { rating: 3 })
        .catch((e: BusinessException) => e) as BusinessException;
      expect(error.getErrorCode()).toBe(ErrorCode.REVIEW_NOT_FOUND);
    });

    it('다른 사용자의 리뷰이면 REVIEW_FORBIDDEN 예외 발생', async () => {
      (mockReviewRepository.findOne as jest.Mock).mockResolvedValue(mockReview);

      const error = await service
        .update('other-user-id', 'review-id', { rating: 3 })
        .catch((e: BusinessException) => e) as BusinessException;
      expect(error.getErrorCode()).toBe(ErrorCode.REVIEW_FORBIDDEN);
    });
  });

  describe('remove', () => {
    it('본인 리뷰 삭제 성공', async () => {
      (mockReviewRepository.findOne as jest.Mock).mockResolvedValue(mockReview);
      (mockReviewRepository.delete as jest.Mock).mockResolvedValue(undefined);
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: '0', avg: '0' }),
      };
      (mockReviewRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);
      (mockProductStatRepository.upsert as jest.Mock).mockResolvedValue(undefined);

      await service.remove('user-id', 'review-id');

      expect(mockReviewRepository.delete).toHaveBeenCalledWith('review-id');
    });

    it('다른 사용자의 리뷰 삭제 시 REVIEW_FORBIDDEN 예외 발생', async () => {
      (mockReviewRepository.findOne as jest.Mock).mockResolvedValue(mockReview);

      const error = await service.remove('other-user-id', 'review-id').catch((e: BusinessException) => e) as BusinessException;
      expect(error.getErrorCode()).toBe(ErrorCode.REVIEW_FORBIDDEN);
    });
  });
});
