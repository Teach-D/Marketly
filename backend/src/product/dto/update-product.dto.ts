import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: '나이키 에어맥스 2024', description: '상품명' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '업데이트된 상품 설명', description: '상품 설명' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 119000, description: '가격 (원)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 30, description: '재고 수량' })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;
}
