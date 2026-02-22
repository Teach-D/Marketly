import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AdminGuard } from '../common/guards/admin.guard';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

class UserQueryDto {
  @ApiPropertyOptional({ example: 1, description: '페이지 번호', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({ example: 20, description: '페이지당 항목 수', default: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit: number = 20;
}

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(AdminGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '[어드민] 전체 회원 목록 조회' })
  @ApiResponse({ status: 200, description: '회원 목록 반환' })
  async findAll(@Query() query: UserQueryDto) {
    const data = await this.userService.findAll(query.page, query.limit);
    return { success: true, data };
  }
}
