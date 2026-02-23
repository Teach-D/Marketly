import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import type { Product } from '@prisma/client';

const mockProduct: Product = {
  id: 'product-id',
  name: '테스트 상품',
  description: '설명',
  price: 10000,
  stock: 10,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const prismaMock = {
  product: {
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
} as unknown as PrismaService;

const redisMock = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  delByPattern: jest.fn(),
} as unknown as RedisService;

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: prismaMock },
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

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).toEqual(cached);
      expect(prismaMock.product.findMany).not.toHaveBeenCalled();
    });

    it('캐시 미스 시 DB 조회 후 캐시 저장 및 결과 반환', async () => {
      (redisMock.get as jest.Mock).mockResolvedValue(null);
      (prismaMock.product.findMany as jest.Mock).mockResolvedValue([mockProduct]);
      (prismaMock.product.count as jest.Mock).mockResolvedValue(1);
      (redisMock.set as jest.Mock).mockResolvedValue(undefined);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(redisMock.set).toHaveBeenCalledTimes(1);
    });

    it('검색어가 있으면 캐시 키에 search 포함', async () => {
      (redisMock.get as jest.Mock).mockResolvedValue(null);
      (prismaMock.product.findMany as jest.Mock).mockResolvedValue([]);
      (prismaMock.product.count as jest.Mock).mockResolvedValue(0);
      (redisMock.set as jest.Mock).mockResolvedValue(undefined);

      await service.findAll({ page: 1, limit: 20, search: '나이키' });

      expect(redisMock.get).toHaveBeenCalledWith('products:list:1:20:나이키');
    });
  });

  describe('findById', () => {
    it('캐시 히트 시 상품 반환', async () => {
      (redisMock.get as jest.Mock).mockResolvedValue(mockProduct);

      const result = await service.findById('product-id');

      expect(result).toEqual(mockProduct);
      expect(prismaMock.product.findFirst).not.toHaveBeenCalled();
    });

    it('캐시 미스 시 DB 조회 후 캐시 저장', async () => {
      (redisMock.get as jest.Mock).mockResolvedValue(null);
      (prismaMock.product.findFirst as jest.Mock).mockResolvedValue(mockProduct);
      (redisMock.set as jest.Mock).mockResolvedValue(undefined);

      const result = await service.findById('product-id');

      expect(result).toEqual(mockProduct);
      expect(redisMock.set).toHaveBeenCalledWith('product:product-id', mockProduct, 300);
    });

    it('존재하지 않는 상품이면 PRODUCT_NOT_FOUND 예외 발생', async () => {
      (redisMock.get as jest.Mock).mockResolvedValue(null);
      (prismaMock.product.findFirst as jest.Mock).mockResolvedValue(null);

      const error = await service.findById('no-id').catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.PRODUCT_NOT_FOUND);
    });
  });

  describe('create', () => {
    it('상품 생성 후 목록 캐시 무효화', async () => {
      (prismaMock.product.create as jest.Mock).mockResolvedValue(mockProduct);
      (redisMock.delByPattern as jest.Mock).mockResolvedValue(undefined);

      const result = await service.create({ name: '테스트 상품', price: 10000, stock: 10 });

      expect(result).toEqual(mockProduct);
      expect(redisMock.delByPattern).toHaveBeenCalledWith('products:list:*');
    });
  });

  describe('update', () => {
    it('상품 수정 후 상세 및 목록 캐시 무효화', async () => {
      (redisMock.get as jest.Mock).mockResolvedValue(mockProduct);
      (prismaMock.product.update as jest.Mock).mockResolvedValue({ ...mockProduct, name: '수정된 상품' });
      (redisMock.del as jest.Mock).mockResolvedValue(undefined);
      (redisMock.delByPattern as jest.Mock).mockResolvedValue(undefined);

      await service.update('product-id', { name: '수정된 상품' });

      expect(redisMock.del).toHaveBeenCalledWith('product:product-id');
      expect(redisMock.delByPattern).toHaveBeenCalledWith('products:list:*');
    });
  });

  describe('adjustStock', () => {
    it('재고 조정 성공 후 캐시 무효화', async () => {
      (redisMock.get as jest.Mock).mockResolvedValue(mockProduct);
      (prismaMock.product.update as jest.Mock).mockResolvedValue({ ...mockProduct, stock: 5 });
      (redisMock.del as jest.Mock).mockResolvedValue(undefined);
      (redisMock.delByPattern as jest.Mock).mockResolvedValue(undefined);

      const result = await service.adjustStock('product-id', -5);

      expect(result.stock).toBe(5);
    });

    it('재고 부족이면 INSUFFICIENT_STOCK 예외 발생', async () => {
      (redisMock.get as jest.Mock).mockResolvedValue({ ...mockProduct, stock: 3 });

      const error = await service.adjustStock('product-id', -10).catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.INSUFFICIENT_STOCK);
    });
  });
});
