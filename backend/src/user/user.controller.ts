import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AdminGuard } from '../common/guards/admin.guard';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

class UserQueryDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit: number = 20;
}

@Controller('users')
@UseGuards(AdminGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query() query: UserQueryDto) {
    const data = await this.userService.findAll(query.page, query.limit);
    return { success: true, data };
  }
}
