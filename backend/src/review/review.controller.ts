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
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  async findByProduct(@Query() query: ReviewQueryDto) {
    const data = await this.reviewService.findByProduct(query);
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateReviewDto) {
    const data = await this.reviewService.create(user.id, dto);
    return { success: true, data };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
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
  async remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    await this.reviewService.remove(user.id, id);
    return { success: true, data: null };
  }
}
