# KnocSpace Web

Notion 형태의 워크스페이스 웹앱. **프론트엔드 전용 레포**입니다.
백엔드는 `knocspace/knocspace-api` 에 따로 있습니다.

React 19 · Vite · TypeScript · Tailwind 4 · [SEED](https://seed-design.io)

---

## 실행

패키지 매니저는 **npm** 입니다.

```bash
npm install
npm run dev          # 앱 — http://localhost:5173
npm run storybook    # 컴포넌트 — http://localhost:6006
```

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입 검사 + 프로덕션 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과를 로컬에서 확인 |
| `npm run lint` | ESLint |
| `npm run storybook` | 스토리북 개발 서버 |
| `npm run build-storybook` | 스토리북 정적 빌드 (`storybook-static/`) |

**아직 서버가 없습니다.** `src/api/` 는 localStorage mock 이고, 시그니처와 타입만
실제 API 명세를 따릅니다. 나중에 그 안쪽만 `fetch` 로 바뀌고 화면은 안 바뀝니다.

---

## 폴더 구조

```
src/
├── api/          서버 호출. 지금은 mock, 나중에 fetch
├── types/        백엔드와의 계약
├── lib/          React 를 모르는 순수 유틸 · 화면 문구(messages.ts)
├── hooks/        화면과 api 사이의 다리 (TanStack Query)
├── features/     도메인 로직
├── components/   순수 UI. props 만 받는다
├── routes/       화면. 위의 것들을 조립하는 유일한 자리
└── styles/
```

**컴포넌트 하나가 폴더 하나입니다.** 본체 · 스토리 · 그 컴포넌트에서만 쓰는
하위 부품이 한 폴더에 모이고, 배럴(`index.ts`)은 두지 않습니다.

```
components/ui/Spinner/Spinner.tsx
components/ui/Spinner/Spinner.stories.tsx
```

import 규칙은 둘뿐입니다 — **같은 폴더 안은 `./`, 폴더를 넘으면 `@/`.**

`ui/` 와 그 밖을 가르는 기준도 하나입니다 — **`ui/` 는 KnocSpace 를 몰라도 되는
것.** `Spinner` 는 다른 앱에 복붙해도 돌지만 `Sidebar` · `PageTree` 는 안 됩니다.

---

## 문서

| 파일 | 무엇 |
|---|---|
| [ROADMAP.md](ROADMAP.md) | 무엇을 어떤 순서로 만드는지 |
| [DESIGN.md](DESIGN.md) | 토큰 · 치수 · 컴포넌트 규격 · 문구. **UI 작업 전에 읽습니다** |
| [docs/roadmap/architecture.md](docs/roadmap/architecture.md) | 파일을 어디에 두고 상태를 어디에 둘지 |
| [docs/roadmap/conventions.md](docs/roadmap/conventions.md) | 커밋 · 브랜치 · 공통 완료 조건 |
| [docs/roadmap/backend-sync.md](docs/roadmap/backend-sync.md) | 백엔드와 맞춰야 할 것 |
| [CLAUDE.md](CLAUDE.md) | 에이전트용 요약 |

스프린트는 프론트가 `F1 F2 …`, 백엔드가 `B1 B2 …` 입니다.
F1~F3 은 mock 으로 화면을 끝내고, F4 에서 Page API, F5 에서 User API 를 붙입니다.
