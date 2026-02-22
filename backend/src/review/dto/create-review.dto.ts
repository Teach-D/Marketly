import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'uuid-here', description: '상품 ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 5, description: '평점 (1~5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: '정말 좋은 상품입니다!', description: '리뷰 내용' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
