import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { UserEntity } from '../user/user.entity';

const mockUserService = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateRefreshToken: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue('test-secret'),
  get: jest.fn().mockReturnValue('15m'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('새로운 사용자를 정상적으로 등록한다', async () => {
      const dto = { email: 'test@test.com', password: 'password123' };
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue({ id: 'uuid', email: dto.email });

      const result = await service.register(dto);

      expect(result).toEqual({ id: 'uuid', email: dto.email });
      expect(mockUserService.create).toHaveBeenCalledTimes(1);
    });

    it('이미 존재하는 이메일로 등록 시 USER_ALREADY_EXISTS 예외를 던진다', async () => {
      const dto = { email: 'exists@test.com', password: 'password123' };
      mockUserService.findByEmail.mockResolvedValue({ id: 'uuid', email: dto.email } as UserEntity);

      await expect(service.register(dto)).rejects.toThrow(BusinessException);

      try {
        await service.register(dto);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).getErrorCode()).toBe(ErrorCode.USER_ALREADY_EXISTS);
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.CONFLICT);
      }
    });
  });

  describe('login', () => {
    it('올바른 자격증명으로 로그인 시 토큰을 반환한다', async () => {
      const dto = { email: 'test@test.com', password: 'password123' };
      const hashedPw = await bcrypt.hash(dto.password, 10);
      const mockUser = { id: 'uuid', email: dto.email, password: hashedPw } as UserEntity;

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-token');
      mockUserService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.login(dto);

      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
    });

    it('존재하지 않는 이메일로 로그인 시 INVALID_CREDENTIALS 예외를 던진다', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(service.login({ email: 'no@test.com', password: 'pw' })).rejects.toThrow(
        BusinessException,
      );
    });

    it('잘못된 비밀번호로 로그인 시 INVALID_CREDENTIALS 예외를 던진다', async () => {
      const hashedPw = await bcrypt.hash('correct-password', 10);
      mockUserService.findByEmail.mockResolvedValue({
        id: 'uuid',
        email: 'test@test.com',
        password: hashedPw,
      } as UserEntity);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong-password' }),
      ).rejects.toThrow(BusinessException);
    });
  });

  describe('logout', () => {
    it('로그아웃 시 refreshToken을 null로 업데이트한다', async () => {
      mockUserService.updateRefreshToken.mockResolvedValue(undefined);

      await service.logout('uuid');

      expect(mockUserService.updateRefreshToken).toHaveBeenCalledWith('uuid', null);
    });
  });

  describe('refresh', () => {
    it('유효한 refreshToken으로 새 토큰을 발급한다', async () => {
      const rawToken = 'raw-refresh-token';
      const hashedToken = await bcrypt.hash(rawToken, 10);
      mockUserService.findById.mockResolvedValue({
        id: 'uuid',
        email: 'test@test.com',
        refreshToken: hashedToken,
      } as UserEntity);
      mockJwtService.signAsync.mockResolvedValue('new-token');
      mockUserService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.refresh('uuid', 'test@test.com', rawToken);

      expect(result.accessToken).toBe('new-token');
    });

    it('refreshToken이 없는 사용자에 대해 INVALID_TOKEN 예외를 던진다', async () => {
      mockUserService.findById.mockResolvedValue({
        id: 'uuid',
        refreshToken: null,
      } as UserEntity);

      await expect(service.refresh('uuid', 'email', 'token')).rejects.toThrow(BusinessException);
    });

    it('refreshToken 불일치 시 INVALID_TOKEN 예외를 던진다', async () => {
      const hashedToken = await bcrypt.hash('correct-token', 10);
      mockUserService.findById.mockResolvedValue({
        id: 'uuid',
        refreshToken: hashedToken,
      } as UserEntity);

      await expect(service.refresh('uuid', 'email', 'wrong-token')).rejects.toThrow(
        BusinessException,
      );
    });
  });
});
