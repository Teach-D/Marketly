import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(email: string, hashedPassword: string): Promise<UserEntity> {
    const user = this.userRepository.create({ email, password: hashedPassword });
    return this.userRepository.save(user);
  }

  async updateRefreshToken(id: string, hashedToken: string | null): Promise<void> {
    await this.userRepository.update(id, { refreshToken: hashedToken });
  }

  async findAll(page: number, limit: number) {
    const [items, total] = await this.userRepository.findAndCount({
      select: ['id', 'email', 'role', 'createdAt'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }
}
