import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export type ProductSortBy = 'createdAt' | 'salesCount';

export class ProductQueryDto {
  @ApiPropertyOptional({ example: 1, description: '페이지 번호', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({ example: 20, description: '페이지당 항목 수', default: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit: number = 20;

  @ApiPropertyOptional({ example: '나이키', description: '상품명 검색어' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: ['createdAt', 'salesCount'], default: 'createdAt', description: '정렬 기준' })
  @IsEnum(['createdAt', 'salesCount'])
  @IsOptional()
  sortBy: ProductSortBy = 'createdAt';

  @ApiPropertyOptional({ example: 4.0, description: '최소 평점 필터 (0~5)', minimum: 0, maximum: 5 })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  @Type(() => Number)
  minRating?: number;
}
