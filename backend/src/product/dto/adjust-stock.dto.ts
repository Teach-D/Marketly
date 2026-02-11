import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class AdjustStockDto {
  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  delta: number;
}
