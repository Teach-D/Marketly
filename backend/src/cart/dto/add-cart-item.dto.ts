import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCartItemDto {
  @ApiProperty({ example: 'uuid-here', description: '상품 ID (UUID)' })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2, description: '수량 (최소 1)' })
  @IsInt()
  @Min(1)
  quantity: number;
}
