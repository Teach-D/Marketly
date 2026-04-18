import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { REDIS_KEYS } from '../common/constants/redis-keys';
import { Product } from './product.entity';
import { ProductStat } from './product-stat.entity';

export type ProductWithStat = Omit<Product, 'stat' | 'orderItems' | 'reviews'> & {
  stat: ProductStat | null;
};

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
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductStat) private readonly productStatRepository: Repository<ProductStat>,
    private readonly redis: RedisService,
  ) {}

  async findAll(query: ProductQueryDto) {
    const { page, limit, search, sortBy, minRating } = query;
    const cacheKey = `products:list:${page}:${limit}:${search ?? ''}:${sortBy}:${minRating ?? ''}`;

    const cached = await this.redis.get<ProductListResult>(cacheKey);
    if (cached) return cached;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.stat', 'stat')
      .orderBy(`product.${sortBy}`, 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('MATCH(product.name) AGAINST (:search IN BOOLEAN MODE)', {
        search: this.formatSearchTerm(search),
      });
    }
    if (minRating !== undefined) {
      qb.andWhere('stat.avgRating >= :minRating', { minRating });
    }

    const [items, total] = await qb.getManyAndCount();
    const result = { items, total, page, limit } as unknown as ProductListResult;
    await this.redis.set(cacheKey, result, PRODUCT_LIST_TTL);
    return result;
  }

  async findById(id: string) {
    const cacheKey = `product:${id}`;

    const cached = await this.redis.get<ProductWithStat>(cacheKey);
    if (cached) return cached;

    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['stat'],
    }) as unknown as ProductWithStat | null;
    if (!product) throw new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, HttpStatus.NOT_FOUND);

    await this.redis.set(cacheKey, product, PRODUCT_DETAIL_TTL);
    return product;
  }

  async create(dto: CreateProductDto) {
    const product = await this.productRepository.save(this.productRepository.create(dto));
    await this.productStatRepository.save(this.productStatRepository.create({ productId: product.id }));
    const result = await this.productRepository.findOne({
      where: { id: product.id },
      relations: ['stat'],
    }) as unknown as ProductWithStat;
    await this.redis.delByPattern('products:list:*');
    return result;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id);
    await this.productRepository.update(id, dto);
    await this.invalidateProduct(id);
    return this.productRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.productRepository.softDelete(id);
    await this.invalidateProduct(id);
  }

  async adjustStock(id: string, delta: number) {
    const product = await this.findById(id);
    const newStock = product.stock + delta;
    if (newStock < 0) {
      throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK, HttpStatus.CONFLICT);
    }
    await this.productRepository.update(id, { stock: newStock });
    await this.invalidateProduct(id);
    return this.productRepository.findOne({ where: { id } });
  }

  async getTopRanking(limit: number) {
    const entries = await this.redis.zRevRangeWithScores(REDIS_KEYS.SALES_RANKING, 0, limit - 1);
    if (!entries.length) return [];

    const ids = entries.map((e) => e.member);
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.stat', 'stat')
      .where('product.id IN (:...ids)', { ids })
      .getMany() as unknown as ProductWithStat[];

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

  private formatSearchTerm(search: string): string {
    return search
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => `+${word}*`)
      .join(' ');
  }
}
