import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { Product } from '../product/product.entity';
import { ProductService } from '../product/product.service';
import { RedisService } from '../redis/redis.service';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';

const mockProduct: Partial<Product> = {
  id: 'product-id',
  name: '테스트 상품',
  description: null,
  price: 10000,
  stock: 10,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProductRepository = {
  createQueryBuilder: jest.fn(),
};

const mockProductService = {
  findById: jest.fn(),
} as unknown as ProductService;

const mockRedis = {
  hGetAll: jest.fn(),
  hIncrBy: jest.fn(),
  hSet: jest.fn(),
  hGet: jest.fn(),
  hDel: jest.fn(),
  expire: jest.fn(),
  del: jest.fn(),
} as unknown as RedisService;

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepository },
        { provide: ProductService, useValue: mockProductService },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    jest.clearAllMocks();
  });

  describe('findMyCart', () => {
    it('Redis 해시가 비어있으면 빈 배열 반환', async () => {
      (mockRedis.hGetAll as jest.Mock).mockResolvedValue({});

      const result = await service.findMyCart('user-id');

      expect(result).toHaveLength(0);
    });

    it('Redis 해시에서 아이템 조회 후 상품 정보와 합쳐서 반환', async () => {
      (mockRedis.hGetAll as jest.Mock).mockResolvedValue({ 'product-id': '2' });
      const qb = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProduct]),
      };
      (mockProductRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.findMyCart('user-id');

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(2);
      expect(result[0].product).toEqual(mockProduct);
    });
  });

  describe('addItem', () => {
    it('상품 존재 확인 후 Redis에 수량 추가', async () => {
      (mockProductService.findById as jest.Mock).mockResolvedValue(mockProduct);
      (mockRedis.hIncrBy as jest.Mock).mockResolvedValue(2);
      (mockRedis.expire as jest.Mock).mockResolvedValue(1);

      await service.addItem('user-id', { productId: 'product-id', quantity: 2 });

      expect(mockProductService.findById).toHaveBeenCalledWith('product-id');
      expect(mockRedis.hIncrBy).toHaveBeenCalled();
    });

    it('존재하지 않는 상품이면 ProductService에서 예외 전파', async () => {
      (mockProductService.findById as jest.Mock).mockRejectedValue(
        new BusinessException(ErrorCode.PRODUCT_NOT_FOUND),
      );

      await expect(service.addItem('user-id', { productId: 'no-id', quantity: 1 })).rejects.toBeInstanceOf(
        BusinessException,
      );
    });
  });

  describe('updateQuantity', () => {
    it('수량이 0 이하이면 아이템 삭제', async () => {
      (mockRedis.hGet as jest.Mock).mockResolvedValue('2');
      (mockRedis.hDel as jest.Mock).mockResolvedValue(1);
      (mockRedis.expire as jest.Mock).mockResolvedValue(1);

      await service.updateQuantity('user-id', 'product-id', { quantity: 0 });

      expect(mockRedis.hDel).toHaveBeenCalledWith(expect.any(String), 'product-id');
    });

    it('Redis에 없는 아이템이면 CART_ITEM_NOT_FOUND 예외 발생', async () => {
      (mockRedis.hGet as jest.Mock).mockResolvedValue(null);

      const error = await service
        .updateQuantity('user-id', 'no-product-id', { quantity: 1 })
        .catch((e: BusinessException) => e) as BusinessException;
      expect(error.getErrorCode()).toBe(ErrorCode.CART_ITEM_NOT_FOUND);
    });
  });

  describe('removeItem', () => {
    it('Redis에서 아이템 삭제 성공', async () => {
      (mockRedis.hGet as jest.Mock).mockResolvedValue('2');
      (mockRedis.hDel as jest.Mock).mockResolvedValue(1);

      await service.removeItem('user-id', 'product-id');

      expect(mockRedis.hDel).toHaveBeenCalledWith(expect.any(String), 'product-id');
    });

    it('존재하지 않는 아이템이면 CART_ITEM_NOT_FOUND 예외 발생', async () => {
      (mockRedis.hGet as jest.Mock).mockResolvedValue(null);

      const error = await service
        .removeItem('user-id', 'no-product-id')
        .catch((e: BusinessException) => e) as BusinessException;
      expect(error.getErrorCode()).toBe(ErrorCode.CART_ITEM_NOT_FOUND);
    });
  });

  describe('clearCart', () => {
    it('Redis에서 장바구니 키 삭제', async () => {
      (mockRedis.del as jest.Mock).mockResolvedValue(1);

      await service.clearCart('user-id');

      expect(mockRedis.del).toHaveBeenCalled();
    });
  });
});
