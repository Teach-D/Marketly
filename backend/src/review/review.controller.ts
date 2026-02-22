import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @ApiOperation({ summary: '상품 리뷰 목록 조회 (페이징)' })
  @ApiResponse({ status: 200, description: '리뷰 목록 반환' })
  async findByProduct(@Query() query: ReviewQueryDto) {
    const data = await this.reviewService.findByProduct(query);
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '리뷰 작성 (배송 완료된 상품만 가능)' })
  @ApiResponse({ status: 201, description: '작성된 리뷰 반환' })
  @ApiResponse({ status: 403, description: '구매 이력 없음' })
  @ApiResponse({ status: 409, description: '이미 리뷰 작성됨' })
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateReviewDto) {
    const data = await this.reviewService.create(user.id, dto);
    return { success: true, data };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '리뷰 수정 (본인만 가능)' })
  @ApiParam({ name: 'id', description: '리뷰 ID' })
  @ApiResponse({ status: 200, description: '수정된 리뷰 반환' })
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    const data = await this.reviewService.update(user.id, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '리뷰 삭제 (본인만 가능)' })
  @ApiParam({ name: 'id', description: '리뷰 ID' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  async remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    await this.reviewService.remove(user.id, id);
    return { success: true, data: null };
  }
}
