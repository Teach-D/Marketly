# CLAUDE.md

## 프로젝트 개요

- **서비스**: 포인트 룰렛 서비스
- **구성**: 백엔드 + 프론트엔드 (2개 앱)
- **개발**: 1인 개발, 모노레포

## 기술 스택

### 백엔드
- NestJS + TypeScript
- TypeORM + PostgreSQL
- class-validator + class-transformer
- @nestjs/swagger
- Passport + JWT
- Jest

### 프론트엔드
- React + TypeScript
- Vite
- React Router
- React Query (서버 상태)
- Zustand (클라이언트 상태)
- Axios

## 디렉토리 구조

```
store-nestjs/
├── apps/
│   ├── backend/          ← NestJS 백엔드
│   │   └── src/
│   │       ├── roulette/
│   │       ├── user/
│   │       ├── point/
│   │       └── common/
│   └── frontend/         ← React 프론트엔드
│       └── src/
│           ├── pages/
│           ├── components/
│           ├── hooks/
│           ├── api/
│           └── store/
├── packages/             ← 공유 코드 (타입 등)
├── CLAUDE.md
└── package.json          ← 루트 (모노레포)
```

## Git 전략

### 브랜치 전략
- main: 배포용
- dev: 개발 통합
- feature/*: 기능 개발

### 브랜치 네이밍
- `type/설명` 형식 (kebab-case)
- type: feat, fix, refactor, chore
- 예: `feat/roulette-api`, `fix/point-calculation`

### 커밋 메시지
- Conventional Commits + 한글 본문
- 형식: `type: 설명`
- type: feat, fix, docs, refactor, chore, test, style
- 예: `feat: 룰렛 확률 계산 로직 추가`

### 자동 git add
- 작업 완료 후 항상 관련 파일을 `git add`한다.

### 주석
- 주석은 작성하지 않는다.

### 머지 전략
- Squash Merge (feature → dev, dev → main)

### 버전 관리
- 통합 SemVer (프로젝트 전체 단일 버전)
- 태그 형식: `v0.1.0`



## 문서 규칙

### 공통
- 모든 문서는 **한국어**로 작성
- 문서 업데이트는 **코드 변경과 같은 커밋**에 포함

### 문서 목록 & 역할
| 문서 | 역할 |
|---|---|
| README.md | 프로젝트 소개, 실행 방법, 기술 스택 |
| CLAUDE.md | AI 협업용 프로젝트 컨벤션 |
| PROMPT.md | AI 대화 주요 결정 기록 |
| CHANGELOG.md | 버전별 변경 사항 |
| Swagger | API 명세 (코드 기반 자동 생성) |

### README.md 구조
1. 프로젝트 소개 (한 줄)
2. 기술 스택
3. 프로젝트 구조 (모노레포 디렉토리 트리)
4. 시작하기 (설치 & 실행)
5. 환경변수 (.env.example 안내)
6. 배포

### PROMPT.md 작성 형식
```
## YYYY-MM-DD | 제목
- 결정: 무엇을 정했는지
- 이유: 왜 그렇게 정했는지
- 관련 파일: 영향받는 파일
```

### 코드 주석
- 공개 API (서비스/컨트롤러 공개 메서드): Doc 주석 필수
- 내부 로직: **왜(Why)** 그렇게 했는지만 주석
- 이름만으로 알 수 있는 코드에는 주석 금지

## 코드 컨벤션

### 네이밍
| 대상 | 규칙 | 예시 |
|---|---|---|
| 변수/함수 | camelCase | `getUserPoint` |
| 클래스/타입 | PascalCase | `RouletteService` |
| 상수 | UPPER_SNAKE | `MAX_SPIN_COUNT` |
| 파일/디렉토리 | kebab-case | `roulette-service.ts` |
| React 컴포넌트 파일 | PascalCase | `SpinButton.tsx` |
| DB 테이블/컬럼 | snake_case | `user_point` |
| API 경로 | kebab-case | `/api/roulette-result` |

### 디렉토리 구조 규칙
- **기능별 (Feature/Domain)** 구조
- 백엔드: 도메인 단위 모듈
- 프론트엔드: 페이지 단위 + 공유 컴포넌트 분리

### 포맷팅
- EditorConfig + Prettier 병행
- 들여쓰기: 스페이스 2칸
- 세미콜론: 사용
- 따옴표: 작은따옴표
- 줄 길이: 100자
- 후행 콤마: all

### 린터
- ESLint + Prettier 통합 (`eslint-config-prettier`)
- strict 모드 (no-any, no-unused-vars 등 엄격하게)

### 코드 품질 자동화
- husky + lint-staged + commitlint
- pre-commit: lint-staged (포맷팅 + 린트)
- commit-msg: Conventional Commits 검증

### 에러 처리

#### 백엔드
- 비즈니스 에러: 커스텀 에러 클래스 (`BusinessException`)
- 시스템 에러: 프레임워크 기본 처리
- API 응답 형식: `{ success, data, error: { code, message } }`

#### 프론트엔드
- API 에러: React Query의 `onError` + 공통 에러 핸들러
- UI 에러: Error Boundary
- 사용자 피드백: toast 알림

## 프론트엔드 규칙

### 컴포넌트 구조
- `pages/`: 라우트 단위 페이지 컴포넌트
- `components/`: 재사용 가능한 UI 컴포넌트
- `hooks/`: 커스텀 훅 (비즈니스 로직 분리)
- `api/`: API 호출 함수 (React Query 훅 포함)
- `store/`: Zustand 전역 상태

### 상태 관리 원칙
- 서버 데이터: React Query
- 전역 UI 상태: Zustand
- 로컬 상태: useState/useReducer

### API 호출
- Axios 인스턴스 공통 설정 (baseURL, interceptor)
- React Query로 캐싱 및 로딩/에러 상태 관리
- API 함수는 `api/` 디렉토리에 도메인별로 분리
