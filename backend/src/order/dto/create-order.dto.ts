import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiPropertyOptional({ description: '사용할 쿠폰 ID' })
  @IsString()
  @IsOptional()
  couponId?: string;
}
