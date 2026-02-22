import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustStockDto {
  @ApiProperty({ example: 10, description: '재고 조정량 (양수: 증가, 음수: 감소)' })
  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  delta: number;
}
