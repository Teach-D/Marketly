---
name: backend
description: TypeScript + NestJS 백엔드 개발 규칙 스킬. 백엔드 코드를 작성, 수정, 생성할 때 자동으로 적용한다. 모듈 구조, 엔티티, DTO, 예외 처리, 인증, DB 마이그레이션, 테스트, API 문서화, 로깅, 트랜잭션 규칙을 포함한다.
---

# Backend Rules

TypeScript + NestJS 백엔드 코드 작성 시 아래 규칙을 적용한다.

## 기술 스택

- NestJS + TypeScript
- TypeORM + PostgreSQL
- class-validator + class-transformer
- @nestjs/swagger (Swagger)
- Passport + JWT
- Jest + Supertest
- Winston (JSON 로깅)

## 엔티티 규칙

### BaseEntity

모든 엔티티는 `BaseEntity`를 상속한다:

```typescript
@Entity()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 연관관계

- **단방향 우선**: 양방향은 반드시 필요할 때만 사용
- **fetch 전략**: LAZY 기본. EAGER 금지
- N+1 방지: `QueryBuilder` 또는 `relations` 옵션 사용

```typescript
@Entity()
export class RouletteResult extends BaseEntity {
  @ManyToOne(() => User, { lazy: true })
  @JoinColumn({ name: 'user_id' })
  user: Promise<User>;

  @Column()
  reward: number;
}
```

### 엔티티 작성 규칙

- 직접 프로퍼티 변경 지양 — 변경은 도메인 메서드로
- 기본 생성자 대신 정적 팩토리 메서드 활용

## DTO 전략

`class` + `class-validator` 데코레이터:

```typescript
// Request
export class SpinRequestDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}

// Response
export class SpinResponseDto {
  reward: number;
  remainingPoint: number;

  static from(result: RouletteResult, point: number): SpinResponseDto {
    const dto = new SpinResponseDto();
    dto.reward = result.reward;
    dto.remainingPoint = point;
    return dto;
  }
}
```

## 예외 처리

### 도메인별 에러 enum

```typescript
export enum RouletteErrorCode {
  INSUFFICIENT_POINT = 'ROULETTE_001',
  DAILY_LIMIT_EXCEEDED = 'ROULETTE_002',
  INVALID_PROBABILITY = 'ROULETTE_003',
}

export const RouletteErrors = {
  [RouletteErrorCode.INSUFFICIENT_POINT]: {
    status: HttpStatus.BAD_REQUEST,
    code: RouletteErrorCode.INSUFFICIENT_POINT,
    message: '포인트가 부족합니다',
  },
  // ...
} as const;
```

### BusinessException

```typescript
export class BusinessException extends HttpException {
  constructor(
    readonly errorCode: string,
    message: string,
    status: HttpStatus,
  ) {
    super({ success: false, error: { code: errorCode, message } }, status);
  }
}
```

### GlobalExceptionFilter

API 응답 형식: `{ success, data, error: { code, message } }`

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof BusinessException) {
      response.status(exception.getStatus()).json(exception.getResponse());
    } else {
      response.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } });
    }
  }
}
```

## 인증/인가

- Passport + JWT (stateless)
- Access Token + Refresh Token
- Guard에서 경로별 권한 설정
- `@CurrentUser()` 커스텀 데코레이터로 사용자 정보 주입

## DB 마이그레이션

- **TypeORM Migration** 사용
- 파일 위치: `src/migrations/`
- 네이밍: `{timestamp}-{설명}.ts`

```
1700000000000-CreateUserTable.ts
1700000000001-CreateRouletteTable.ts
1700000000002-AddPointColumn.ts
```

- `synchronize`는 `false`로 설정 (마이그레이션으로만 스키마 변경)

## 테스트 규칙

- **Jest** 사용
- 서비스 계층 필수 테스트
- 한글 서술형 네이밍

```typescript
describe('RouletteService', () => {
  let service: RouletteService;
  let rouletteRepository: jest.Mocked<RouletteRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RouletteService,
        { provide: RouletteRepository, useValue: { findOne: jest.fn() } },
      ],
    }).compile();

    service = module.get(RouletteService);
    rouletteRepository = module.get(RouletteRepository);
  });

  describe('포인트가 부족한 사용자가', () => {
    it('룰렛을 돌리면 BusinessException을 던진다', async () => {
      // ...
      await expect(service.spin(1)).rejects.toThrow(BusinessException);
    });
  });
});
```

## API 문서화

- **@nestjs/swagger** 사용
- 데코레이터는 컨트롤러에만 작성

```typescript
@ApiOperation({ summary: '룰렛 돌리기', description: '포인트를 소모하여 룰렛을 돌린다' })
@ApiResponse({ status: 200, description: '성공' })
@ApiResponse({ status: 400, description: '포인트 부족' })
@Post('spin')
async spin(@Body() dto: SpinRequestDto): Promise<ApiResponseDto<SpinResponseDto>> {
  // ...
}
```

## 로깅

- **Winston + JSON 구조화** 로깅
- 로그 레벨: error (운영) / debug (개발)

```typescript
this.logger.log({
  action: 'spin',
  userId,
  level: 'info',
});
```

## 트랜잭션 규칙

- `@Transaction` 또는 `QueryRunner`는 **서비스 계층에만** 사용
- 조회 전용 메서드는 트랜잭션 불필요
- 컨트롤러, 레포지토리에는 트랜잭션 로직 금지

```typescript
@Injectable()
export class RouletteService {
  async spin(userId: number): Promise<RouletteResult> {
    return this.dataSource.transaction(async (manager) => {
      // ...
    });
  }

  async getHistory(userId: number): Promise<RouletteResult[]> {
    return this.rouletteRepository.findByUserId(userId);
  }
}
```
