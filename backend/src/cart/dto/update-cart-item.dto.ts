import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({ example: 3, description: '변경할 수량 (최소 1)' })
  @IsInt()
  @Min(1)
  quantity: number;
}
