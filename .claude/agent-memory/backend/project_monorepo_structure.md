---
name: 모노레포 루트 구조
description: store-nestjs 프로젝트의 루트 설정 파일 구성 및 모노레포 구조
type: project
---

npm workspaces 기반 모노레포로 구성됨.

**Why:** 백엔드(NestJS) + 웹 2개(web-admin, web-client) + 공유 패키지를 단일 레포에서 관리하기 위해 npm workspaces 선택.

**How to apply:** 앱 추가 시 apps/ 하위에, 공유 라이브러리는 packages/ 하위에 생성한다. 루트 package.json의 workspaces 배열은 ["apps/*", "packages/*"]로 설정되어 있어 자동으로 인식됨.

## 루트 설정 파일 목록
- `package.json` - npm workspaces 모노레포, 공통 devDependencies
- `tsconfig.base.json` - 공통 TS 설정 (strict, ES2022, moduleResolution: bundler)
- `.prettierrc` - printWidth:100, singleQuote, semi, trailingComma:all
- `.editorconfig` - space 2칸, lf, utf-8
- `eslint.config.js` - flat config, no-explicit-any 에러, no-unused-vars 에러
- `commitlint.config.js` - type: feat|fix|docs|refactor|chore|test|style
- `lint-staged.config.js` - ts/tsx: eslint --fix + prettier, 기타: prettier
- `.gitignore` - node_modules, dist, .env 등
- `.husky/pre-commit` - lint-staged 실행
- `.husky/commit-msg` - commitlint 실행

## 앱 디렉토리 구조
```
apps/
  backend/     (NestJS - 아직 빈 상태)
  frontend/   (React - 아직 빈 상태)
```

## ESLint flat config 주의사항
eslint.config.js는 ES module(export default) 방식이므로 package.json에 "type": "module"이 설정되거나
파일 확장자를 .mjs로 변경해야 할 수 있음. npm install 후 확인 필요.
