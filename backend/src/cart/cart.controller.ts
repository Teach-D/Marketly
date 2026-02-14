import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async findMyCart(@CurrentUser() user: { id: string }) {
    const data = await this.cartService.findMyCart(user.id);
    return { success: true, data };
  }

  @Post()
  async addItem(@CurrentUser() user: { id: string }, @Body() dto: AddCartItemDto) {
    const data = await this.cartService.addItem(user.id, dto);
    return { success: true, data };
  }

  @Patch(':itemId')
  async updateQuantity(
    @CurrentUser() user: { id: string },
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const data = await this.cartService.updateQuantity(user.id, itemId, dto);
    return { success: true, data };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearCart(@CurrentUser() user: { id: string }) {
    await this.cartService.clearCart(user.id);
    return { success: true, data: null };
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.OK)
  async removeItem(@CurrentUser() user: { id: string }, @Param('itemId') itemId: string) {
    await this.cartService.removeItem(user.id, itemId);
    return { success: true, data: null };
  }
}
