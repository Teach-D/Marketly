import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductService } from '../product/product.service';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productService: ProductService,
  ) {}

  async findMyCart(userId: string): Promise<CartItem[]> {
    return this.cartItemRepository.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartItem> {
    await this.productService.findById(dto.productId);

    const existing = await this.cartItemRepository.findOne({
      where: { userId, productId: dto.productId },
    });

    if (existing) {
      existing.quantity += dto.quantity;
      return this.cartItemRepository.save(existing);
    }

    const item = this.cartItemRepository.create({
      userId,
      productId: dto.productId,
      quantity: dto.quantity,
    });
    return this.cartItemRepository.save(item);
  }

  async updateQuantity(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<CartItem> {
    const item = await this.findMyItem(userId, itemId);
    item.quantity = dto.quantity;
    return this.cartItemRepository.save(item);
  }

  async removeItem(userId: string, itemId: string): Promise<void> {
    await this.findMyItem(userId, itemId);
    await this.cartItemRepository.delete(itemId);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartItemRepository.delete({ userId });
  }

  private async findMyItem(userId: string, itemId: string): Promise<CartItem> {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, userId },
    });
    if (!item) throw new BusinessException(ErrorCode.CART_ITEM_NOT_FOUND, HttpStatus.NOT_FOUND);
    return item;
  }
}
