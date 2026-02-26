import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '장바구니로 주문 생성' })
  @ApiResponse({ status: 201, description: '생성된 주문 반환' })
  @ApiResponse({ status: 400, description: '장바구니가 비어있음' })
  async createFromCart(@CurrentUser() user: { id: string }, @Body() dto: CreateOrderDto) {
    const data = await this.orderService.createFromCart(user.id, dto.couponId);
    return { success: true, data };
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[어드민] 전체 주문 조회' })
  @ApiResponse({ status: 200, description: '전체 주문 목록 반환' })
  async findAllOrders() {
    const data = await this.orderService.findAllOrders();
    return { success: true, data };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '내 주문 목록 조회' })
  @ApiResponse({ status: 200, description: '내 주문 목록 반환' })
  async findMyOrders(@CurrentUser() user: { id: string }) {
    const data = await this.orderService.findMyOrders(user.id);
    return { success: true, data };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '주문 상세 조회 (본인 또는 어드민)' })
  @ApiParam({ name: 'id', description: '주문 ID' })
  @ApiResponse({ status: 200, description: '주문 상세 반환' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  async findById(@CurrentUser() user: { id: string; role: Role }, @Param('id') id: string) {
    const data = await this.orderService.findById(id, user.id, user.role);
    return { success: true, data };
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '주문 취소 (PAID 상태만 가능)' })
  @ApiParam({ name: 'id', description: '주문 ID' })
  @ApiResponse({ status: 200, description: '취소된 주문 반환' })
  async cancel(@CurrentUser() user: { id: string; role: Role }, @Param('id') id: string) {
    const data = await this.orderService.cancel(id, user.id, user.role);
    return { success: true, data };
  }

  @Patch(':id/ship')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[어드민] 배송 시작 (PAID → SHIPPING)' })
  @ApiParam({ name: 'id', description: '주문 ID' })
  @ApiResponse({ status: 200, description: '상태 변경된 주문 반환' })
  async ship(@Param('id') id: string) {
    const data = await this.orderService.ship(id);
    return { success: true, data };
  }

  @Patch(':id/deliver')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[어드민] 배송 완료 (SHIPPING → DELIVERED)' })
  @ApiParam({ name: 'id', description: '주문 ID' })
  @ApiResponse({ status: 200, description: '상태 변경된 주문 반환' })
  async deliver(@Param('id') id: string) {
    const data = await this.orderService.deliver(id);
    return { success: true, data };
  }
}
