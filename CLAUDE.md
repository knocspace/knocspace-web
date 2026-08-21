# KnocSpace Web

Notion 형태의 워크스페이스 웹앱. 프론트엔드 전용 레포.
백엔드는 `knocspace/knocspace-api`에 따로 만든다.

React 19 · Vite · TypeScript · Tailwind 4 · SEED
패키지 매니저는 **npm**. (pnpm은 이 환경에서 설치 실패)

## UI 작업 전에 DESIGN.md를 읽는다

SEED 스킬이 알려주는 값은 SEED 원본(모바일, 터치) 기준이다.
충돌하면 `DESIGN.md`가 이긴다.

## 백엔드 없음 — mock 기반

`src/api/*` 는 localStorage mock. 시그니처와 타입은 실제 API 명세를 따른다.
나중에 내부만 `fetch`로 바뀌고 컴포넌트는 안 바뀌어야 한다.

- 서버 호출은 `src/api/` 안에서만
- 타입의 출처는 `src/types/api.ts` 하나

## 구조

```
src/
├── api/          서버 호출(현재 mock)
├── types/api.ts  백엔드와의 계약
├── hooks/        TanStack Query
├── features/     데이터 로직
├── components/   순수 UI. props만 받는다
└── styles/
```
