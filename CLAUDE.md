# KnocSpace Web

Notion 형태의 워크스페이스 웹앱. 프론트엔드 전용 레포.
백엔드는 `knocspace/knocspace-api`에 따로 만든다.

React 19 · Vite · TypeScript · Tailwind 4 · SEED
패키지 매니저는 **npm**. (pnpm은 이 환경에서 설치 실패)

## 개발 순서는 ROADMAP.md를 따른다

무엇을 어떤 순서로 만드는지는 `ROADMAP.md`. 스프린트별 할 일은 `docs/roadmap/sprint-1.md` ~ `sprint-5.md`.
새 기능을 시작하기 전에 지금이 어느 스프린트인지 확인한다.

프론트 스프린트는 `F1 F2 …`, 백엔드(`knocspace-api`)는 `B1 B2 …`로 부른다.
F1~F3은 mock으로 화면을 끝내고, F4에서 Page API, F5에서 User API를 붙인다.
백엔드와 맞춰야 할 것은 `docs/roadmap/backend-sync.md`.

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
├── hooks/        공용 훅. 서버 상태는 TanStack Query, 그 외는 화면 동작 훅
├── features/     데이터 로직
├── components/   순수 UI. props만 받는다. 컴포넌트 하나에 폴더 하나
│              (스토리·전용 하위 부품은 그 폴더 안. 배럴 index.ts 는 두지 않는다)
├── routes/       화면. 위의 것들을 조립하는 유일한 자리
├── lib/          어디에도 안 붙는 순수 유틸
├── assets/       정적 파일
└── styles/
```
