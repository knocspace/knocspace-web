# Sprint 1 · 데이터 다루는 틀 만들기

← [로드맵으로](../../ROADMAP.md)

| | |
|---|---|
| 기간 | 1주 (약 15시간) |
| 선행 | 없음 |
| 우선순위 | P0 |

---

## 목표

화면은 하나도 더 만들지 않습니다. 대신 **앞으로 만들 모든 화면이 똑같이 따를 기본 틀**을 세웁니다.

이 스프린트가 끝나면 "데이터를 가져와서 화면에 붙이는 방법"이 프로젝트에 **정확히 한 가지만** 있어야 합니다.

## 만드는 것

- 라우팅 골격
- TanStack Query 설정과 쿼리 키 규칙
- `src/types/api.ts` — 백엔드와의 약속
- `src/api/*` — localStorage mock (느리게 / 실패하게 만드는 스위치 포함)
- 공통 UI 5개 — Spinner, Skeleton, EmptyState, ErrorState, ErrorBoundary
- 테스트 환경
- 쌓여 있는 정리 3건 (아래 1번)

---

## 할 일

### 1. 준비 (1시간 30분)

**설치**

```bash
npm i react-router @tanstack/react-query nanoid
```

```bash
npm i -D @tanstack/react-query-devtools vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

**정리 ① — Tailwind 유틸리티가 안 만들어져 있습니다**

`DESIGN.md` §4는 `h-grid-row`, `px-dense-4` 같은 클래스를 약속하는데, 그걸 만들어 주는 `@theme inline` 블록이 `knocspace.css`에 없습니다. 그래서 지금 컴포넌트들이 이렇게 쓰고 있습니다.

```tsx
// 지금
className="h-[var(--knoc-tree-row-height)]"
// 되어야 할 모습
className="h-tree-row"
```

- [ ] `knocspace.css` 끝에 `@theme inline` 블록 추가 — `h-tree-row`, `h-grid-row`, `h-topbar`, `px-dense-*`, `p-comfy-*`, `max-w-measure`, `border-grid-line`
- [ ] 기존 컴포넌트 4개(`Sidebar` `TopBar` `DocumentSurface` `AppShell`)의 `h-[var(--knoc-...)]` 를 새 클래스로 교체

**정리 ② — 토큰 이름과 CSS 파일명이 문서와 코드가 다릅니다**

코드를 정답으로 두고 `DESIGN.md`를 고칩니다.

| DESIGN.md | 실제 코드 |
|---|---|
| `--knoc-size-tree-row` | `--knoc-tree-row-height` |
| `--knoc-size-tree-indent` | `--knoc-tree-indent` |
| `--knoc-size-grid-row` | `--knoc-grid-row-height` |
| `src/styles/app.css` | `src/index.css` |

- [ ] `DESIGN.md` §4 표와 §4 설정 파일 항목 수정

**정리 ③ — 경로 별칭**

- [ ] `@/* → src/*` (`tsconfig.app.json` + `vite.config.ts`)

---

### 2. 백엔드와의 약속 정하기 (2시간) ★ 이 스프린트의 핵심

`src/types/api.ts` 하나에 전부 모읍니다.

판단 기준 하나: **이 파일을 그대로 백엔드 쪽에 넘길 수 있어야 합니다.** mock을 편하게 만들려고 타입을 비틀지 않습니다.

```ts
export type ISODate = string;
export type PageId = string;
export type UserId = string;
export type WorkspaceId = string;

export interface User {
  id: UserId;
  name: string;
  /** 커서 색. Sprint 10에서 그대로 씁니다 */
  color: string;
  avatarUrl: string | null;
}

/** 트리·목록용. 본문(content)을 포함하지 않습니다 */
export interface PageSummary {
  id: PageId;
  workspaceId: WorkspaceId;
  parentId: PageId | null;
  title: string;
  icon: string | null;
  /** 형제 사이 순서. 소수를 끼워넣어 재배치합니다 (Sprint 5) */
  position: number;
  hasChildren: boolean;
  updatedAt: ISODate;
  deletedAt: ISODate | null;
}

/** 에디터 말고는 아무도 안 열어보는 값 */
export interface BlockDoc {
  format: 'blocknote';
  schemaVersion: 1;
  blocks: unknown[];
}

export interface Page extends PageSummary {
  content: BlockDoc;
  createdAt: ISODate;
  createdBy: UserId;
  updatedBy: UserId;
  /** 저장 충돌 감지용. 저장할 때마다 1 증가 (Sprint 4) */
  version: number;
}

export interface CreatePageInput {
  parentId: PageId | null;
  title?: string;
  /** id는 클라이언트가 만듭니다. 서버를 기다리지 않습니다 */
  id?: PageId;
}

export interface UpdatePageInput {
  title?: string;
  icon?: string | null;
  content?: BlockDoc;
  parentId?: PageId | null;
  position?: number;
}

export interface UpdatePageOptions {
  /** 서버 version과 다르면 409 */
  baseVersion?: number;
}

export type ApiErrorCode =
  | 'not_found' | 'version_conflict' | 'unauthorized'
  | 'forbidden' | 'network' | 'unknown';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
  ) { super(message); }
}
```

지금 안 쓰는 필드가 두 개 들어 있습니다. 나중에 타입을 다시 고치지 않으려는 것입니다.

| 필드 | 쓰이는 곳 |
|---|---|
| `Page.version` | Sprint 4 — 저장 충돌 감지 |
| `User.color` | Sprint 10 — 협업 커서 색 |

---

### 3. mock 만들기 (4시간)

- [ ] `api/storage.ts` — localStorage 읽기·쓰기. 키에 버전을 붙이고(`knoc.db.v1`), 데이터가 깨져 있으면 안전하게 초기화
- [ ] `api/client.ts` — **모든 호출이 지나가는 곳. Sprint 9에서 여기만 fetch로 바뀝니다**
  - `?slow=1` → 3초 지연 (Skeleton 확인용)
  - `?fail=save` → 저장 실패 (Sprint 4 테스트에 필요)
  - 모든 오류를 `ApiError`로 통일
- [ ] `api/pages.ts` — `getPageTree` / `getPage` / `createPage` / `updatePage` / `deletePage`
- [ ] `api/seed.ts` — 첫 실행 시 샘플 페이지 5개(2단계 중첩). Sprint 9에서 제거

---

### 4. Query 설정 (1시간 30분)

- [ ] `lib/queryClient.ts`
  - `staleTime: 30초`
  - `retry: 1`
  - `refetchOnWindowFocus: false` — 문서 쓰는 중에 다시 불러오면 방해가 됩니다
- [ ] `lib/queryKeys.ts` — [구조 문서](architecture.md#쿼리-키) 참고
- [ ] `main.tsx`에 `QueryClientProvider` + DevTools (개발 모드만)
- [ ] `hooks/usePageTree.ts`, `hooks/usePage.ts` — 두 개만 먼저

---

### 5. 라우팅 (2시간)

- [ ] `routes/router.tsx`
- [ ] `routes/RootLayout.tsx` — `AppShell` + `<Outlet />`
- [ ] `routes/PageRoute.tsx` — 로딩 / 에러 / 성공 세 갈래. 성공하면 제목만 글자로 출력 (에디터는 Sprint 3)
- [ ] `routes/NotFound.tsx`
- [ ] `App.tsx`를 `RouterProvider` 한 줄로 줄이기
- [ ] **`useSidebarResize`를 `RootLayout`으로 옮기기** — 페이지를 옮겨도 사이드바 폭이 유지돼야 합니다

---

### 6. 공통 UI (3시간)

`components/ui/`에 5개. 전부 props만 받습니다.

| 파일 | 내용 |
|---|---|
| `Spinner.tsx` | |
| `Skeleton.tsx` | 치수를 받는 회색 블록. 지금 컴포넌트에 흩어진 자리표시 코드를 여기로 모읍니다 |
| `EmptyState.tsx` | 아이콘 / 제목 / 설명 / 버튼. 문구는 DESIGN.md §9에서 가져와 상수로 |
| `ErrorState.tsx` | 원인 + 다시 시도. 사과하지 않는 문구 |
| `ErrorBoundary.tsx` | 라우트 단위 |

---

### 7. 테스트 환경 (1시간 30분)

- [ ] `vitest.config.ts` — jsdom, setup 파일, `@` 별칭
- [ ] `src/test/setup.ts` — jest-dom, localStorage 초기화
- [ ] `package.json`에 `"test": "vitest"`, `"test:run": "vitest run"`
- [ ] 첫 테스트 3개
  - `createPage` 하면 트리에 나타난다
  - 없는 id로 `getPage` 하면 `not_found`
  - 저장된 데이터가 깨져 있으면 안전하게 초기화된다

---

### 8. 마무리 (1시간)

- [ ] README를 실제 문서로 교체 — 실행 방법, 폴더 구조, mock 규칙
- [ ] `CLAUDE.md`의 구조 트리를 [구조 문서](architecture.md) 기준으로 갱신
- [ ] 커밋 나누기

```
chore: 의존성 추가
refactor: 디자인 토큰 유틸리티 정리
feat: API 타입과 mock 구현
feat: 라우팅 도입
feat: 공통 UI 컴포넌트
test: 테스트 환경 구성
```

---

## 완료 조건

- [ ] `npm run build` · `npm run lint` · `npm run test:run` 세 개 통과
- [ ] `/p/{있는id}` → 제목 표시 / `/p/{없는id}` → 404 / 이상한 경로 → NotFound
- [ ] `?slow=1`로 Skeleton이, `?fail=save`로 ErrorState가 실제로 뜬다
- [ ] `src/api/` 밖에서 `localStorage`를 직접 부르는 곳 0개
- [ ] `src/components/` 안에서 `useQuery`를 import 하는 곳 0개
- [ ] 라우트를 옮겨도 사이드바 폭이 유지된다
- [ ] `src/types/api.ts`를 백엔드에 그대로 공유할 수 있다

[공통 완료 조건](conventions.md)도 함께 확인합니다.

---

## 끝나면 할 수 있는 것

사용자 눈에 보이는 변화는 없습니다. URL을 바꾸면 화면이 바뀌고, 사이드바에 가짜 페이지 목록이 글자로 찍힙니다.

---

← [프론트엔드 구조](architecture.md) · 다음 → [Sprint 2](sprint-2.md)
