import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReviewQueryDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit: number = 20;
}
