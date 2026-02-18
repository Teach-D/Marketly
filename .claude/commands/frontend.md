사용자의 프론트엔드 작업 요청을 처리한다.

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
- 컴포넌트: 단일 책임, 100줄 이하 권장
- TypeScript strict + any 금지
- 서버 상태 React Query, 전역 상태 Zustand, 로컬 상태 useState
- 커밋 단위: 하나의 커밋 = 하나의 동작하는 기능

### 3단계: 작업 실행 (frontend 에이전트)

frontend 에이전트에 작업을 위임한다. 에이전트는 아래 규칙을 따른다:
- React + TypeScript, Vite
- pages / components / hooks / api / store 구조
- API 호출은 Axios 인스턴스 + React Query 훅으로 분리
- 에러 처리: React Query onError + Error Boundary
- 사용자 피드백: toast 알림

### 4단계: 완료 후 개선 제안

작업이 완료되면 사용자에게 질문한다:

> 작업이 완료되었습니다. 코드 개선(improve)을 진행할까요?

사용자가 동의하면 improve 스킬의 워크플로우를 실행한다:
1. 작성한 코드를 5개 카테고리(버그 위험, 성능, 가독성, 구조, 보안)로 분석
2. 심각도순으로 방안 제시
3. 사용자 선택 후 수정
4. 검증 (빌드 확인 + before/after 요약)