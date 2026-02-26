import { IsDateString, IsInt, IsNumber, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty({ example: '여름 특가 10%', description: '쿠폰 이름' })
  @IsString()
  name: string;

  @ApiProperty({ example: 10, description: '할인율 (1~100)', minimum: 1, maximum: 100 })
  @IsNumber()
  @Min(1)
  @Max(100)
  discountRate: number;

  @ApiProperty({ example: 30000, description: '최소 주문 금액 (0이면 제한 없음)', minimum: 0 })
  @IsInt()
  @Min(0)
  minOrderAmount: number;

  @ApiProperty({ example: 100, description: '총 발급 가능 수량', minimum: 1 })
  @IsInt()
  @Min(1)
  maxIssueCount: number;

  @ApiProperty({ example: '2026-03-01T00:00:00Z', description: '유효 시작일 (ISO 8601)' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ example: '2026-12-31T23:59:59Z', description: '유효 만료일 (ISO 8601)' })
  @IsDateString()
  validUntil: string;
}
