import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@ApiTags('Admin Stats')
@ApiBearerAuth('access-token')
@Controller('admin/stats')
@UseGuards(JwtAuthGuard, AdminGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('summary')
  @ApiOperation({ summary: '오늘/이번달 매출·주문·신규유저 요약' })
  @ApiResponse({ status: 200 })
  async getSummary() {
    const data = await this.statsService.getSummary();
    return { success: true, data };
  }

  @Get('daily')
  @ApiOperation({ summary: '일별 매출·주문 통계' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  @ApiResponse({ status: 200 })
  async getDailyStats(@Query('days') days = '30') {
    const data = await this.statsService.getDailyStats(parseInt(days, 10));
    return { success: true, data };
  }

  @Get('monthly')
  @ApiOperation({ summary: '월별 매출·주문 통계' })
  @ApiQuery({ name: 'months', required: false, example: 12 })
  @ApiResponse({ status: 200 })
  async getMonthlyStats(@Query('months') months = '12') {
    const data = await this.statsService.getMonthlyStats(parseInt(months, 10));
    return { success: true, data };
  }
}
