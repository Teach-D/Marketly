import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { ProductStat } from './product-stat.entity';
import { RedisService } from '../redis/redis.service';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';

const mockProduct: Partial<Product> = {
  id: 'product-id',
  name: '테스트 상품',
  description: '설명',
  price: 10000,
  stock: 10,
  salesCount: 0,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProductRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockProductStatRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

const redisMock = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  delByPattern: jest.fn(),
  zRevRangeWithScores: jest.fn(),
} as unknown as RedisService;

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepository },
        { provide: getRepositoryToken(ProductStat), useValue: mockProductStatRepository },
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('캐시 히트 시 DB 조회 없이 캐시 데이터 반환', async () => {
      const cached = { items: [mockProduct], total: 1, page: 1, limit: 20 };
      (redisMock.get as jest.Mock).mockResolvedValue(cached);

      const result = await service.findAll({ page: 1, limit: 20, sortBy: 'createdAt' });

      expect(result).toEqual(cached);
      expect(mockProductRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('캐시 미스 시 DB 조회 후 캐시 저장 및 결과 반환', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
      };
      (redisMock.get as jest.Mock).mockResolvedValue(null);
      (mockProductRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);
      (redisMock.set as jest.Mock).mockResolvedValue(undefined);

      const result = await service.findAll({ page: 1, limit: 20, sortBy: 'createdAt' });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(redisMock.set).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('캐시 히트 시 상품 반환', async () => {
      (redisMock.get as jest.Mock).mockResolvedValue(mockProduct);

      const result = await service.findById('product-id');

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.findOne).not.toHaveBeenCalled();
    });

    it('캐시 미스 시 DB 조회 후 캐시 저장', async () => {
      (redisMock.get as jest.Mock).mockResolvedValue(null);
      (mockProductRepository.findOne as jest.Mock).mockResolvedValue(mockProduct);
      (redisMock.set as jest.Mock).mockResolvedValue(undefined);

      const result = await service.findById('product-id');

      expect(result).toEqual(mockProduct);
      expect(redisMock.set).toHaveBeenCalledWith('product:product-id', mockProduct, 300);
    });

    it('존재하지 않는 상품이면 PRODUCT_NOT_FOUND 예외 발생', async () => {
      (redisMock.get as jest.Mock).mockResolvedValue(null);
      (mockProductRepository.findOne as jest.Mock).mockResolvedValue(null);

      const error = await service.findById('no-id').catch((e: BusinessException) => e) as BusinessException;
      expect(error.getErrorCode()).toBe(ErrorCode.PRODUCT_NOT_FOUND);
    });
  });

  describe('create', () => {
    it('상품 생성 후 목록 캐시 무효화', async () => {
      (mockProductRepository.create as jest.Mock).mockReturnValue(mockProduct);
      (mockProductRepository.save as jest.Mock).mockResolvedValue(mockProduct);
      (mockProductStatRepository.create as jest.Mock).mockReturnValue({ productId: 'product-id' });
      (mockProductStatRepository.save as jest.Mock).mockResolvedValue({});
      (mockProductRepository.findOne as jest.Mock).mockResolvedValue(mockProduct);
      (redisMock.delByPattern as jest.Mock).mockResolvedValue(undefined);

      const result = await service.create({ name: '테스트 상품', price: 10000, stock: 10 });

      expect(result).toEqual(mockProduct);
      expect(redisMock.delByPattern).toHaveBeenCalledWith('products:list:*');
    });
  });

  describe('adjustStock', () => {
    it('재고 부족이면 INSUFFICIENT_STOCK 예외 발생', async () => {
      (redisMock.get as jest.Mock).mockResolvedValue({ ...mockProduct, stock: 3 });

      const error = await service.adjustStock('product-id', -10).catch((e: BusinessException) => e) as BusinessException;
      expect(error.getErrorCode()).toBe(ErrorCode.INSUFFICIENT_STOCK);
    });
  });
});
