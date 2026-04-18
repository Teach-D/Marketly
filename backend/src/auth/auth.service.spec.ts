import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-value'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RedisService } from '../redis/redis.service';
import { User } from '../user/user.entity';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { Role } from '../common/enums/role.enum';

const mockUser = {
  id: 'user-id',
  email: 'test@example.com',
  password: 'hashed-password',
  role: Role.USER,
  refreshToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  orders: Promise.resolve([]),
  reviews: Promise.resolve([]),
  userCoupons: Promise.resolve([]),
} as unknown as User;

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateRefreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
            get: jest.fn().mockReturnValue('15m'),
          },
        },
        {
          provide: RedisService,
          useValue: {
            incrBy: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('신규 이메일로 회원가입 성공', async () => {
      userService.findByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue(mockUser);

      const result = await service.register({ email: mockUser.email, password: 'password123' });

      expect(result).toEqual({ id: mockUser.id, email: mockUser.email });
      expect(userService.create).toHaveBeenCalledTimes(1);
    });

    it('이미 존재하는 이메일이면 USER_ALREADY_EXISTS 예외 발생', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);

      const error = await service
        .register({ email: mockUser.email, password: 'password123' })
        .catch((e: BusinessException) => e) as BusinessException;
      expect(error.getErrorCode()).toBe(ErrorCode.USER_ALREADY_EXISTS);
    });
  });

  describe('login', () => {
    it('올바른 자격증명으로 로그인 성공 후 토큰 반환', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.login({ email: mockUser.email, password: 'password123' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('존재하지 않는 이메일이면 INVALID_CREDENTIALS 예외 발생', async () => {
      userService.findByEmail.mockResolvedValue(null);

      const error = await service
        .login({ email: 'none@example.com', password: 'password123' })
        .catch((e: BusinessException) => e) as BusinessException;
      expect(error.getErrorCode()).toBe(ErrorCode.INVALID_CREDENTIALS);
    });

    it('비밀번호 불일치이면 INVALID_CREDENTIALS 예외 발생', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const error = await service
        .login({ email: mockUser.email, password: 'wrong-password' })
        .catch((e: BusinessException) => e) as BusinessException;
      expect(error.getErrorCode()).toBe(ErrorCode.INVALID_CREDENTIALS);
    });
  });

  describe('logout', () => {
    it('로그아웃 시 refreshToken을 null로 업데이트', async () => {
      userService.updateRefreshToken.mockResolvedValue(undefined);

      await service.logout('user-id');

      expect(userService.updateRefreshToken).toHaveBeenCalledWith('user-id', null);
    });
  });

  describe('refresh', () => {
    it('유효한 refreshToken으로 토큰 재발급 성공', async () => {
      const userWithRefresh = { ...mockUser, refreshToken: 'hashed-refresh' };
      userService.findById.mockResolvedValue(userWithRefresh);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.refresh('user-id', 'test@example.com', 'raw-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('refreshToken이 없는 사용자이면 INVALID_TOKEN 예외 발생', async () => {
      userService.findById.mockResolvedValue(mockUser);

      const error = await service
        .refresh('user-id', 'test@example.com', 'raw-token')
        .catch((e: BusinessException) => e) as BusinessException;
      expect(error.getErrorCode()).toBe(ErrorCode.INVALID_TOKEN);
    });

    it('refreshToken 불일치이면 INVALID_TOKEN 예외 발생', async () => {
      userService.findById.mockResolvedValue({ ...mockUser, refreshToken: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const error = await service
        .refresh('user-id', 'test@example.com', 'wrong-token')
        .catch((e: BusinessException) => e) as BusinessException;
      expect(error.getErrorCode()).toBe(ErrorCode.INVALID_TOKEN);
    });
  });
});
