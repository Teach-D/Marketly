사용자의 백엔드 작업 요청을 처리한다.

## 입력

$ARGUMENTS

## 실행 흐름

### 1단계: 프롬프트 분석 (prompt 스킬)

입력을 아래 6개 차원으로 분석한다.
- 목적(Goal), 맥락(Context), 출력 형식(Format), 톤/스타일(Tone), 성공 기준(Criteria), 예시(Examples)

이미 명확한 항목은 건너뛴다. 부족한 항목이 있으면 최대 3회까지 질문하여 보완한다.
부족한 항목이 없으면 질문 없이 다음 단계로 진행한다.

### 2단계: 코딩 규칙 확인 (coding 스킬)

작업 시 아래 규칙을 적용한다.
- KISS + YAGNI 원칙
- 함수: 30줄 이하, 파라미터 3개 이하, 중첩 2단계 이하
- TypeScript strict + any 금지
- try-catch 최소 범위, 빈 catch 금지, 구조화 로깅
- 커밋 단위: 하나의 커밋 = 하나의 동작하는 기능

### 3단계: 작업 실행 (backend 에이전트)

backend 에이전트에 작업을 위임한다. 에이전트는 아래 규칙을 따른다:
- NestJS + TypeScript, TypeORM, MySQL
- 도메인별 모듈 구조
- BaseEntity 상속, LAZY 로딩
- class-validator DTO + 정적 팩토리 메서드
- 도메인별 에러 enum + BusinessException
- 트랜잭션은 서비스 계층에만
- Jest + 한글 네이밍 테스트

### 4단계: 완료 후 개선 제안

작업이 완료되면 사용자에게 질문한다:

> 작업이 완료되었습니다. 코드 개선(improve)을 진행할까요?

사용자가 동의하면 improve 스킬의 워크플로우를 실행한다:
1. 작성한 코드를 5개 카테고리(버그 위험, 성능, 가독성, 구조, 보안)로 분석
2. 심각도순으로 방안 제시
3. 사용자 선택 후 수정
4. 검증 (테스트 실행 + before/after 요약)
