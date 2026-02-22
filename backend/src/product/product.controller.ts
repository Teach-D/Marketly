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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { AdminGuard } from '../common/guards/admin.guard';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: '상품 목록 조회 (검색/페이징)' })
  @ApiResponse({ status: 200, description: '상품 목록 반환' })
  async findAll(@Query() query: ProductQueryDto) {
    const data = await this.productService.findAll(query);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: '상품 상세 조회' })
  @ApiParam({ name: 'id', description: '상품 ID' })
  @ApiResponse({ status: 200, description: '상품 정보 반환' })
  @ApiResponse({ status: 404, description: '상품 없음' })
  async findOne(@Param('id') id: string) {
    const data = await this.productService.findById(id);
    return { success: true, data };
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[어드민] 상품 등록' })
  @ApiResponse({ status: 201, description: '상품 등록 성공' })
  async create(@Body() dto: CreateProductDto) {
    const data = await this.productService.create(dto);
    return { success: true, data };
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[어드민] 상품 수정' })
  @ApiParam({ name: 'id', description: '상품 ID' })
  @ApiResponse({ status: 200, description: '수정된 상품 반환' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const data = await this.productService.update(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[어드민] 상품 삭제 (소프트)' })
  @ApiParam({ name: 'id', description: '상품 ID' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  async remove(@Param('id') id: string) {
    await this.productService.remove(id);
    return { success: true, data: null };
  }

  @Patch(':id/stock')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[어드민] 재고 조정 (delta 값만큼 증감)' })
  @ApiParam({ name: 'id', description: '상품 ID' })
  @ApiResponse({ status: 200, description: '조정된 재고 반환' })
  async adjustStock(@Param('id') id: string, @Body() dto: AdjustStockDto) {
    const data = await this.productService.adjustStock(id, dto.delta);
    return { success: true, data };
  }
}
