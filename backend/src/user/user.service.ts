import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(email: string, hashedPassword: string) {
    return this.prisma.user.create({ data: { email, password: hashedPassword } });
  }

  async updateRefreshToken(id: string, hashedToken: string | null) {
    await this.prisma.user.update({ where: { id }, data: { refreshToken: hashedToken } });
  }

  async findAll(page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        select: { id: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);
    return { items, total, page, limit };
  }
}
