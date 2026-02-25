import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { REDIS_KEYS } from '../common/constants/redis-keys';
import type { Product, ProductStat } from '@prisma/client';

export type ProductWithStat = Product & { stat: ProductStat | null };

const PRODUCT_DETAIL_TTL = 300;
const PRODUCT_LIST_TTL = 60;

export interface ProductListResult {
  items: ProductWithStat[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(query: ProductQueryDto) {
    const { page, limit, search, sortBy, minRating } = query;
    const cacheKey = `products:list:${page}:${limit}:${search ?? ''}:${sortBy}:${minRating ?? ''}`;

    const cached = await this.redis.get<ProductListResult>(cacheKey);
    if (cached) return cached;

    const where = {
      deletedAt: null,
      ...(search && { name: { contains: search } }),
      ...(minRating !== undefined && { stat: { avgRating: { gte: minRating } } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { stat: true },
        orderBy: { [sortBy]: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    const result = { items, total, page, limit };
    await this.redis.set(cacheKey, result, PRODUCT_LIST_TTL);
    return result;
  }

  async findById(id: string) {
    const cacheKey = `product:${id}`;

    const cached = await this.redis.get<ProductWithStat>(cacheKey);
    if (cached) return cached;

    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { stat: true },
    });
    if (!product) throw new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, HttpStatus.NOT_FOUND);

    await this.redis.set(cacheKey, product, PRODUCT_DETAIL_TTL);
    return product;
  }

  async create(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        ...dto,
        stat: { create: {} },
      },
      include: { stat: true },
    });
    await this.redis.delByPattern('products:list:*');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id);
    const product = await this.prisma.product.update({ where: { id }, data: dto });
    await this.invalidateProduct(id);
    return product;
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.invalidateProduct(id);
  }

  async adjustStock(id: string, delta: number) {
    const product = await this.findById(id);
    const newStock = product.stock + delta;
    if (newStock < 0) {
      throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK, HttpStatus.CONFLICT);
    }
    const updated = await this.prisma.product.update({ where: { id }, data: { stock: newStock } });
    await this.invalidateProduct(id);
    return updated;
  }

  async getTopRanking(limit: number) {
    const entries = await this.redis.zRevRangeWithScores(REDIS_KEYS.SALES_RANKING, 0, limit - 1);
    if (!entries.length) return [];

    const ids = entries.map((e) => e.member);
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids }, deletedAt: null },
      include: { stat: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    return entries
      .map((entry, index) => ({
        rank: index + 1,
        salesCount: entry.score,
        product: productMap.get(entry.member) ?? null,
      }))
      .filter((item) => item.product !== null);
  }

  private async invalidateProduct(id: string): Promise<void> {
    await Promise.all([
      this.redis.del(`product:${id}`),
      this.redis.delByPattern('products:list:*'),
    ]);
  }
}
