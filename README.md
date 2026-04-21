# Marketly

포인트 룰렛 기반 쇼핑몰 풀스택 프로젝트.  
NestJS 백엔드 + React 프론트엔드 모노레포 구성.

---

## 기술 스택

### 백엔드

| 분류 | 기술 |
|---|---|
| 프레임워크 | NestJS 11 + TypeScript |
| ORM / DB | TypeORM 0.3 + MySQL 8 |
| 인증 | Passport + JWT (Access / Refresh Token) |
| 캐시 | Redis (ioredis) |
| API 문서 | Swagger (`/api-docs`) |
| 보안 | Helmet, Throttler, Cookie-Parser |
| 로깅 | Winston + nest-winston |
| 검증 | class-validator + class-transformer |

### 프론트엔드

| 분류 | 기술 |
|---|---|
| 프레임워크 | React 19 + TypeScript |
| 빌드 | Vite |
| 라우팅 | React Router v7 |
| 서버 상태 | TanStack React Query v5 |
| 클라이언트 상태 | Zustand v5 |
| HTTP | Axios |

---

## 아키텍처

### 시스템 구성

```mermaid
graph TB
  subgraph Client["클라이언트 (port 5173)"]
    FE["React SPA<br/>React Query · Zustand · Axios"]
  end

  subgraph Server["백엔드 (port 3000)"]
    direction TB
    GW["Guards / Pipes / Interceptors"]
    subgraph Modules["도메인 모듈"]
      AUTH["auth"]
      USER["user"]
      PROD["product"]
      CART["cart"]
      ORD["order"]
      CPN["coupon"]
      REV["review"]
      STAT["stats"]
    end
    GW --> Modules
  end

  subgraph Infra["인프라"]
    DB[("MySQL 8")]
    RD[("Redis 7")]
  end

  FE -- "REST / JSON" --> GW
  Modules -- "TypeORM" --> DB
  AUTH -- "세션·토큰 캐시" --> RD
```

### 디렉토리 구조

```
store-nestjs/
├── backend/                  ← NestJS API 서버 (port 3000)
│   └── src/
│       ├── auth/             ← 로그인·회원가입·JWT 토큰
│       ├── user/             ← 유저 프로필·포인트
│       ├── product/          ← 상품 목록·상세·통계
│       ├── cart/             ← 장바구니 CRUD
│       ├── order/            ← 주문 생성·조회·취소
│       ├── coupon/           ← 쿠폰 발급·사용
│       ├── review/           ← 상품 리뷰 CRUD
│       ├── stats/            ← 대시보드 통계
│       ├── redis/            ← Redis 모듈
│       ├── logger/           ← Winston 로거 모듈
│       └── common/           ← 공통 필터·데코레이터·예외
└── frontend/                 ← React SPA (port 5173)
    └── src/
        ├── pages/            ← 라우트 단위 페이지
        │   ├── admin/        ← 관리자 페이지
        │   └── ...
        ├── components/       ← 재사용 UI 컴포넌트
        ├── api/              ← Axios + React Query 훅
        ├── store/            ← Zustand 전역 상태
        └── types/            ← 공유 타입 정의
```

---

## 주요 흐름

### 인증 (JWT Access + Refresh)

```mermaid
sequenceDiagram
  participant C as 클라이언트
  participant A as AuthController
  participant R as Redis

  C->>A: POST /auth/login (email, password)
  A-->>C: AccessToken (15m) + RefreshToken (7d, HttpOnly Cookie)

  Note over C,A: 이후 API 요청
  C->>A: GET /orders (Authorization: Bearer <AccessToken>)
  A-->>C: 200 OK

  Note over C,A: AccessToken 만료 시
  C->>A: POST /auth/refresh (Cookie)
  A->>R: RefreshToken 유효성 확인
  R-->>A: OK
  A-->>C: 새 AccessToken 발급
```

### 주문 생성 흐름

```mermaid
flowchart TD
  A([주문 요청]) --> B{쿠폰 적용?}
  B -- Yes --> C[쿠폰 유효성 검증]
  C --> D{포인트 충분?}
  B -- No --> D
  D -- No --> E([오류 반환])
  D -- Yes --> F[주문 생성 & 재고 차감]
  F --> G[포인트 차감]
  G --> H[쿠폰 사용 처리]
  H --> I([주문 완료])
```

---

## 주요 기능

### 사용자
- 회원가입 / 로그인 / 로그아웃 (JWT Access + Refresh Token)
- 마이페이지 (포인트 잔액, 주문 내역)

### 상품
- 상품 목록 조회 (검색 / 필터 / 정렬)
- 상품 상세 조회 + 리뷰

### 장바구니 & 주문
- 장바구니 담기 / 수정 / 삭제
- 주문 생성 / 목록 / 상세 / 취소

### 쿠폰
- 쿠폰 목록 조회
- 쿠폰 적용 (주문 할인)

### 관리자
- 대시보드 통계 (매출, 주문 수, 신규 회원)
- 상품 / 주문 / 쿠폰 / 유저 관리

---

## 시작하기

### 사전 요구사항

- Node.js 20+
- MySQL 8
- Redis 7

### 백엔드 설치 및 실행

```bash
cd backend
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일을 열어 DATABASE_URL, JWT 시크릿 등을 설정

npm run start:dev
```

서버: `http://localhost:3000`  
API 문서: `http://localhost:3000/api-docs`

### 프론트엔드 설치 및 실행

```bash
cd frontend
npm install
npm run dev
```

앱: `http://localhost:5173`

---

## 환경변수

`backend/.env.example` 참고:

```env
NODE_ENV=development

# MySQL 연결 URL
DATABASE_URL=mysql://root:password@localhost:3306/store

# JWT
JWT_ACCESS_SECRET=your-access-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
FRONTEND_URL=http://localhost:5173
```

---

## API 명세

Swagger UI: `http://localhost:3000/api-docs`

| 도메인 | 엔드포인트 | 설명 |
|---|---|---|
| Auth | `POST /auth/register` | 회원가입 |
| Auth | `POST /auth/login` | 로그인 |
| Auth | `POST /auth/refresh` | 토큰 갱신 |
| Product | `GET /products` | 상품 목록 |
| Product | `GET /products/:id` | 상품 상세 |
| Cart | `GET /cart` | 장바구니 조회 |
| Cart | `POST /cart` | 장바구니 추가 |
| Order | `POST /orders` | 주문 생성 |
| Order | `GET /orders` | 주문 목록 |
| Coupon | `GET /coupons` | 쿠폰 목록 |
| Review | `GET /products/:id/reviews` | 리뷰 목록 |
| Stats | `GET /stats` | 대시보드 통계 |

---

## 배포

Docker Compose 파일(`docker-compose.prod.yml`)을 이용해 컨테이너로 배포한다.

```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## 브랜치 전략

| 브랜치 | 역할 |
|---|---|
| `main` | 프로덕션 배포 |
| `dev` | 개발 통합 |
| `feat/*` | 기능 개발 |
| `fix/*` | 버그 수정 |

커밋 컨벤션: Conventional Commits (`feat: 설명`, `fix: 설명`, …)
