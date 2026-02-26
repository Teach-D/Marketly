import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[어드민] 쿠폰 생성' })
  @ApiResponse({ status: 201, description: '생성된 쿠폰 반환' })
  async create(@Body() dto: CreateCouponDto) {
    const data = await this.couponService.create(dto);
    return { success: true, data };
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[어드민] 쿠폰 목록 조회' })
  @ApiResponse({ status: 200, description: '쿠폰 목록 반환' })
  async findAll() {
    const data = await this.couponService.findAll();
    return { success: true, data };
  }

  @Post(':id/issue')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '쿠폰 선착순 발급' })
  @ApiParam({ name: 'id', description: '쿠폰 ID' })
  @ApiResponse({ status: 201, description: '발급된 쿠폰 반환' })
  @ApiResponse({ status: 409, description: '수량 소진 또는 이미 발급됨' })
  async issue(@CurrentUser() user: { id: string }, @Param('id') couponId: string) {
    const data = await this.couponService.issue(user.id, couponId);
    return { success: true, data };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '내 쿠폰 목록 조회 (미사용)' })
  @ApiResponse({ status: 200, description: '내 쿠폰 목록 반환' })
  async findMyCoupons(@CurrentUser() user: { id: string }) {
    const data = await this.couponService.findMyCoupons(user.id);
    return { success: true, data };
  }
}
