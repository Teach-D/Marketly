import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiPropertyOptional({ example: 4, description: '평점 (1~5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ example: '생각보다 괜찮네요.', description: '리뷰 내용' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  content?: string;
}
