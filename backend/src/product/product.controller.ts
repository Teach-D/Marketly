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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(@Query() query: ProductQueryDto) {
    const data = await this.productService.findAll(query);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.productService.findById(id);
    return { success: true, data };
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() dto: CreateProductDto) {
    const data = await this.productService.create(dto);
    return { success: true, data };
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const data = await this.productService.update(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string) {
    await this.productService.remove(id);
    return { success: true, data: null };
  }

  @Patch(':id/stock')
  @UseGuards(AdminGuard)
  async adjustStock(@Param('id') id: string, @Body() dto: AdjustStockDto) {
    const data = await this.productService.adjustStock(id, dto.delta);
    return { success: true, data };
  }
}
