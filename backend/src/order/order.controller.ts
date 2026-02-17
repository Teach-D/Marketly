import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createFromCart(@CurrentUser() user: { id: string }) {
    const data = await this.orderService.createFromCart(user.id);
    return { success: true, data };
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  async findAllOrders() {
    const data = await this.orderService.findAllOrders();
    return { success: true, data };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findMyOrders(@CurrentUser() user: { id: string }) {
    const data = await this.orderService.findMyOrders(user.id);
    return { success: true, data };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@CurrentUser() user: { id: string; role: Role }, @Param('id') id: string) {
    const data = await this.orderService.findById(id, user.id, user.role);
    return { success: true, data };
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async cancel(@CurrentUser() user: { id: string; role: Role }, @Param('id') id: string) {
    const data = await this.orderService.cancel(id, user.id, user.role);
    return { success: true, data };
  }

  @Patch(':id/ship')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  async ship(@Param('id') id: string) {
    const data = await this.orderService.ship(id);
    return { success: true, data };
  }

  @Patch(':id/deliver')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  async deliver(@Param('id') id: string) {
    const data = await this.orderService.deliver(id);
    return { success: true, data };
  }
}
