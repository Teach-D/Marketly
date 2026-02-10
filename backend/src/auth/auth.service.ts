import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) {
      throw new BusinessException(ErrorCode.USER_ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.userService.create(dto.email, hashedPassword);
    return { id: user.id, email: user.email };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    const tokens = await this.issueTokens({ sub: user.id, email: user.email });
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, SALT_ROUNDS);
    await this.userService.updateRefreshToken(user.id, hashedRefresh);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.userService.updateRefreshToken(userId, null);
  }

  async refresh(userId: string, email: string, rawRefreshToken: string) {
    const user = await this.userService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new BusinessException(ErrorCode.INVALID_TOKEN, HttpStatus.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(rawRefreshToken, user.refreshToken);
    if (!isMatch) {
      throw new BusinessException(ErrorCode.INVALID_TOKEN, HttpStatus.UNAUTHORIZED);
    }

    const tokens = await this.issueTokens({ sub: userId, email });
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, SALT_ROUNDS);
    await this.userService.updateRefreshToken(userId, hashedRefresh);

    return tokens;
  }

  private async issueTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m') as StringValue,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d') as StringValue,
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
