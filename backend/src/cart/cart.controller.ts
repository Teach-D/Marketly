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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth('access-token')
@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: '내 장바구니 조회' })
  @ApiResponse({ status: 200, description: '장바구니 아이템 목록 반환' })
  async findMyCart(@CurrentUser() user: { id: string }) {
    const data = await this.cartService.findMyCart(user.id);
    return { success: true, data };
  }

  @Post()
  @ApiOperation({ summary: '장바구니에 상품 추가 (이미 있으면 수량 증가)' })
  @ApiResponse({ status: 201, description: '추가 성공' })
  async addItem(@CurrentUser() user: { id: string }, @Body() dto: AddCartItemDto) {
    await this.cartService.addItem(user.id, dto);
    return { success: true, data: null };
  }

  @Patch(':productId')
  @ApiOperation({ summary: '장바구니 아이템 수량 변경' })
  @ApiParam({ name: 'productId', description: '상품 ID' })
  @ApiResponse({ status: 200, description: '수정 성공' })
  async updateQuantity(
    @CurrentUser() user: { id: string },
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    await this.cartService.updateQuantity(user.id, productId, dto);
    return { success: true, data: null };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '장바구니 전체 비우기' })
  @ApiResponse({ status: 200, description: '비우기 성공' })
  async clearCart(@CurrentUser() user: { id: string }) {
    await this.cartService.clearCart(user.id);
    return { success: true, data: null };
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '장바구니 아이템 단건 삭제' })
  @ApiParam({ name: 'productId', description: '상품 ID' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  async removeItem(@CurrentUser() user: { id: string }, @Param('productId') productId: string) {
    await this.cartService.removeItem(user.id, productId);
    return { success: true, data: null };
  }
}
