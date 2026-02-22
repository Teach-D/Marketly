import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: '나이키 에어맥스', description: '상품명' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '편안한 러닝화', description: '상품 설명' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 129000, description: '가격 (원)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ example: 50, description: '재고 수량' })
  @IsInt()
  @Min(0)
  stock: number;
}
