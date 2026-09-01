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

## 구조는 FSD(Feature-Sliced Design) v2.1 을 따른다

레이어 판단이 필요하면 `feature-sliced-design` 스킬을 먼저 부른다.
스킬과 이 문서가 충돌하면 이 문서가 이긴다.

```
src/
├── app/      앱 초기화 — main·App·router·styles·전역 레이아웃
│             (슬라이스 없음. 세그먼트로 바로 나눈다)
├── pages/    화면 단위 슬라이스. 그 화면에만 쓰는 UI·로직은 전부 여기
└── shared/   업무 로직 없는 인프라 — ui·api·config·lib·assets
              (슬라이스 없음. 세그먼트별로 public API 를 둔다)
```

`features/` `entities/` 는 **지금 없다.** 같은 코드가 실제로 두 곳 이상에서
쓰이고 경계가 굳었을 때만 만든다. 그 전에는 `pages/` 안에 둔다.
`widgets/` 는 쓰지 않는다.

세그먼트는 `ui/` `model/` `api/` `lib/` `config/` 다.
파일 이름은 역할이 아니라 도메인으로 짓는다 — `types.ts` `utils.ts` 말고
`page-content.ts` `fetch-page.ts`.

### import 규칙

- 아래 레이어에서만 가져온다: `app → pages → shared`
- 같은 레이어의 다른 슬라이스끼리는 import 하지 않는다
- 슬라이스 밖에서는 `index.ts`(public API)로만 가져온다
  ```ts
  import { PageEditorPage } from "@/pages/page-editor";      // ✅
  import { PageEditorPage } from "@/pages/page-editor/ui/…";  // ❌
  ```
- `shared` 는 세그먼트마다 public API 를 둔다 (`@/shared/ui`, `@/shared/config`).
  최상위 `shared/index.ts` 는 두지 않는다
- 경로 별칭은 `@/*` → `src/*`. `vite.config.ts` 와 `tsconfig.app.json`
  양쪽을 같이 고쳐야 한다

규칙을 깨야 하면 의도적인 선택이어야 하고, 이유를 주석으로 남긴다.

## 백엔드 없음 — mock 기반

`src/shared/api/*` 는 localStorage mock. 시그니처와 타입은 실제 API 명세를 따른다.
나중에 내부만 `fetch`로 바뀌고 화면은 안 바뀌어야 한다.

- 서버 호출은 `src/shared/api/` 안에서만
- 백엔드와의 계약 타입도 `src/shared/api/` 하나에서 나온다
- CRUD 는 인프라다. entity 로 올리지 않는다
