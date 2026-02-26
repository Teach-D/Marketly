import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductService } from '../product/product.service';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { REDIS_KEYS } from '../common/constants/redis-keys';
import type { Product } from '@prisma/client';

const CART_TTL = 60 * 60 * 24 * 7;

export interface CartItemResult {
  productId: string;
  quantity: number;
  product: Product;
}

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly productService: ProductService,
  ) {}

  async findMyCart(userId: string): Promise<CartItemResult[]> {
    const hash = await this.redis.hGetAll(REDIS_KEYS.cart(userId));
    const entries = Object.entries(hash ?? {});
    if (!entries.length) return [];

    const productIds = entries.map(([productId]) => productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, deletedAt: null },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return entries
      .map(([productId, qty]) => ({
        productId,
        quantity: parseInt(qty, 10),
        product: productMap.get(productId),
      }))
      .filter((item): item is CartItemResult => item.product !== undefined);
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<void> {
    await this.productService.findById(dto.productId);
    await this.redis.hIncrBy(REDIS_KEYS.cart(userId), dto.productId, dto.quantity);
    await this.redis.expire(REDIS_KEYS.cart(userId), CART_TTL);
  }

  async updateQuantity(userId: string, productId: string, dto: UpdateCartItemDto): Promise<void> {
    await this.assertItemExists(userId, productId);
    if (dto.quantity <= 0) {
      await this.redis.hDel(REDIS_KEYS.cart(userId), productId);
    } else {
      await this.redis.hSet(REDIS_KEYS.cart(userId), productId, String(dto.quantity));
    }
    await this.redis.expire(REDIS_KEYS.cart(userId), CART_TTL);
  }

  async removeItem(userId: string, productId: string): Promise<void> {
    await this.assertItemExists(userId, productId);
    await this.redis.hDel(REDIS_KEYS.cart(userId), productId);
  }

  async clearCart(userId: string): Promise<void> {
    await this.redis.del(REDIS_KEYS.cart(userId));
  }

  private async assertItemExists(userId: string, productId: string): Promise<void> {
    const qty = await this.redis.hGet(REDIS_KEYS.cart(userId), productId);
    if (!qty) throw new BusinessException(ErrorCode.CART_ITEM_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}
