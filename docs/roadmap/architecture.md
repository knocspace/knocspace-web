# 프론트엔드 구조

← [로드맵으로](../../ROADMAP.md)

파일을 어디에 만들지, 상태를 어디에 둘지에 대한 기준입니다.

---

## 폴더 구조

```
src/
├── api/           서버 호출. 지금은 mock, 나중에 fetch
├── types/         백엔드와의 약속
├── lib/           순수 유틸 (React 없음)
├── hooks/         TanStack Query 래퍼
├── features/      도메인 로직 + 조립
├── components/    순수 UI (props만 받음)
├── routes/        화면
└── styles/
```

### 각 폴더에 들어가는 것

**`src/api/`** — 서버 호출. 이 폴더 밖에서 `fetch`나 `localStorage`를 부르지 않습니다.

```
client.ts       모든 호출이 지나가는 곳. F4에서 이 파일만 fetch로 바뀝니다
storage.ts      localStorage 접근
pages.ts        페이지 CRUD
auth.ts         F5
databases.ts    F6
search.ts       F8
files.ts        F9
```

**`src/types/api.ts`** — 타입의 유일한 출처. 백엔드에 그대로 넘길 수 있는 상태로 유지합니다.

**`src/lib/`** — React를 모르는 순수 함수와 상수.

```
messages.ts     화면 문구 한 곳 (DESIGN.md §9·§10 이 출처)
queryClient.ts  queryKeys.ts  id.ts  debounce.ts
```

`messages.ts` 는 컴포넌트가 아니라 여기 있습니다. `"페이지 목록"` · `"저장됨"` 은
KnocSpace 문구라 `ui/` 의 기준("이 앱을 몰라도 되는 것")에 어긋나고, 부르는 쪽도
`components/` 와 `routes/` 양쪽입니다.

**`src/hooks/`** — 화면과 `api/` 사이의 유일한 다리. TanStack Query 래퍼만 둡니다.

```
usePageTree.ts  usePage.ts  useCreatePage.ts  useSavePage.ts
```

**`src/features/`** — 도메인 로직. 상태를 가져도 되는 곳.

```
page-tree/   트리 펼침·평탄화·드래그
editor/      문서 내용을 다루는 유일한 곳
auth/        F5
share/       F5
database/    F6~F7
search/      F8
collab/      F10
```

**`src/components/`** — 순수 UI. props만 받고 서버를 모릅니다.

**컴포넌트 하나가 폴더 하나입니다.** 본체·스토리·그 컴포넌트에서만 쓰는
하위 부품이 한 폴더에 모입니다.

```
ui/Spinner/Spinner.tsx           본체
ui/Spinner/Spinner.stories.tsx   스토리북
```

배럴(`index.ts`)을 두지 않습니다. 배럴이 해 주는 건 경로를 한 마디 줄이는 것과
폴더의 공개 API 를 선언하는 것뿐인데, 앱 안에서는 둘 다 값이 없습니다 —
`@/components/ui/Spinner/Spinner` 는 이미 충분히 짧고, 내부용 파일을 직접
import 하는 걸 막지도 못합니다. 대신 개발 모드에서 배럴이 re-export 하는 모듈을
dev 서버가 전부 로드해 느려지고, 순환 import 가 생기기 쉽고, 컴포넌트를 하나
추가할 때마다 고칠 파일이 하나 늘어납니다.

그래서 import 규칙은 둘뿐입니다 — **같은 폴더 안은 `./`, 폴더를 넘으면 `@/`.**
스토리북은 `src/**/*.stories.tsx` 글로브라 폴더가 깊어져도 그대로 찾습니다.

가르는 기준은 하나입니다 — **`ui/` 는 KnocSpace 를 몰라도 되는 것.** Spinner 는 다른
앱에 복붙해도 돌지만 Sidebar · PageTree 는 안 됩니다. 그래서 트리는 `ui/` 밖 루트입니다.

```
AppShell/  Sidebar/  TopBar/  BrandMark/  DocumentSurface/
Breadcrumb/  SaveStatus/
PageTree/   PageTree.tsx  PageTree.stories.tsx
            PageTreeItem.tsx   ← 행은 목록 밖에서 안 쓰입니다
ui/   Spinner/  Skeleton/  EmptyState/  ErrorState/  ErrorBoundary/
      Menu/  Toast/  Dialog/  IconButton/  InlineInput/
```

`Toast/` 안에 `useToast.tsx` 가 같이 있습니다 — 표면과 띄우는 쪽이 짝입니다.
`PageTreeItem` 처럼 한 컴포넌트에서만 쓰는 부품도 자기 폴더를 만들지 않고
쓰는 쪽 폴더에 들어갑니다. "이건 PageTree 전용" 이 구조로 드러납니다.

**`src/routes/`** — 화면 단위.

```
router.tsx  RootLayout.tsx  PageRoute.tsx  LoginRoute.tsx  TrashRoute.tsx  NotFound.tsx
```

---

## 지켜야 할 경계

이 표가 지켜지면 F4(Page API 연결)와 F5(User API 연결)에서 화면 코드를 한 줄도 안 고칩니다.

| 폴더 | 아는 것 | 몰라야 하는 것 |
|---|---|---|
| `components/` | props, 디자인 토큰 | 서버, Query, 라우터 |
| `features/` | hooks, components, 도메인 규칙 | fetch, localStorage |
| `hooks/` | api, 쿼리 키, 캐시 전략 | DOM |
| `api/` | 전송 방식, 저장소 | React |

**확인 방법** — 스프린트가 끝날 때 이 두 개가 0이어야 합니다.

- `src/components/` 안의 `useQuery` import
- `src/api/` 밖의 `localStorage` 직접 호출 (`useSidebarResize`는 UI 상태라 예외)

---

## 라우팅

React Router v7. 라우트마다 `React.lazy`로 나눠서, 에디터와 표가 첫 화면 로딩을 무겁게 만들지 않게 합니다.

| 경로 | 화면 | 생기는 시점 |
|---|---|---|
| `/` | 마지막 방문 페이지로 이동 (없으면 빈 화면) | F1 (틀) → F2 |
| `/p/:pageId` | 문서 | F1 (틀) → F2~F3 (내용) |
| `/login` | 로그인 | F5 |
| `/db/:dbId` | 데이터베이스 | F6 |
| `/trash` | 휴지통 | F8 |
| `*` | 404 | F1 |

---

## 상태를 어디에 둘까

| 종류 | 도구 | 예 |
|---|---|---|
| 서버 데이터 | **TanStack Query** | 페이지 목록, 문서 내용, 검색 결과 |
| URL에 담기는 것 | **React Router** | 현재 페이지 id, 검색어, 뷰 종류 |
| 화면 상태 | **useState + localStorage** | 사이드바 폭, 트리 펼침, 다크 모드 |
| 문서 편집 중인 내용 | **에디터가 직접 가짐** | 블록, 커서, 선택 영역 |

**Zustand 같은 전역 스토어는 처음부터 넣지 않습니다.** 위 네 가지로 안 풀리는 문제가 실제로 나타나면 그때 넣습니다.

### 쿼리 키

문자열을 여기저기 적지 않고 한 곳에서 만듭니다.

```ts
// src/lib/queryKeys.ts
export const qk = {
  pages:  ()           => ['pages'] as const,
  tree:   ()           => ['pages', 'tree'] as const,
  page:   (id: PageId) => ['pages', id] as const,
  trash:  ()           => ['pages', 'trash'] as const,
  search: (q: string, scope: SearchScope) => ['search', scope, q] as const,
};
```

---

## 에디터 구조 — 나중에 Yjs를 붙이기 위한 준비

F10에서 실시간 협업을 붙입니다. 그때 에디터를 다시 만들지 않으려면 F3에서 아래를 지켜야 합니다.

**1. 문서의 원본은 에디터 하나뿐입니다.**
블록 내용을 React state로 복사해 두지 않습니다. 복사본이 생기는 순간 협업에서 어느 쪽이 맞는지 알 수 없게 됩니다.

**2. 블록 id는 클라이언트가 만듭니다.**
서버가 번호를 주기를 기다리지 않습니다. 여러 명이 동시에 편집할 때 id가 먼저 정해져 있어야 병합이 됩니다.

**3. 문서 내용은 `features/editor/` 밖에서 열어보지 않습니다.**
`Page.content`는 다른 코드 입장에서 그냥 덩어리입니다. F10에서 이 필드가 Yjs 데이터로 바뀌어도 나머지가 안 깨집니다.

**4. 훅 하나로 감쌉니다.**

```ts
// F3
const editor = useEditorDoc({ pageId, initialContent });

// F10 — 이 훅 안쪽만 바뀌고, 쓰는 쪽은 그대로
const editor = useEditorDoc({ pageId, initialContent, collaboration });
```

**5. 사용자 정보에 `color`를 미리 넣어둡니다.**
F10의 커서 색으로 그대로 씁니다. 나중에 타입을 고치지 않기 위해서입니다.

---

## 로딩과 에러

세 가지 상황을 구분합니다.

| 상황 | 보여줄 것 |
|---|---|
| 처음 불러오는 중 | Skeleton. 레이아웃이 안 흔들리게 실제 치수로 |
| 이미 데이터가 있고 다시 불러오는 중 | 기존 화면 유지 + 상단바에 작은 표시. **화면을 비우지 않습니다** |
| 실패 | `ErrorState` — 원인 + 다시 시도 버튼 |
| 예상 못한 오류 | 라우트 단위 `ErrorBoundary` |

토스트는 **사용자가 뭔가 한 결과에만** 씁니다. 삭제됨, 복구됨, 저장 실패. 조회 실패에는 안 씁니다.

에러 문구는 사과하지 않고, 뭐가 잘못됐고 어떻게 고치는지 말합니다 (DESIGN.md §8).

---

## 테스트

**컴포넌트 테스트는 두지 않습니다.** F1 에서 스토리북으로 갈음하기로 했고
([F1 §5](sprint-1.md#5-컴포넌트-카탈로그--스토리북-1시간)) 그대로 갑니다. RTL · user-event 는
쓰지 않습니다 — `role` · 이름 · 대비는 스토리마다 도는 `addon-a11y` 의 axe 가 봅니다.

| 종류 | 도구 | 대상 | 시작 |
|---|---|---|---|
| 컴포넌트 | 스토리북 + addon-a11y | 공통 UI, 트리 조작, 셀 편집 | F1 ✅ |
| 유닛 | Vitest | 순수 함수 — `visibleItems` · `slashItems` · api mock | F3 |
| E2E | Playwright | 핵심 흐름, **에디터 위에 뜨는 것 전부** | F4 |

**커버리지 목표는 두지 않습니다.** 규칙은 둘입니다 — **새 컴포넌트에 스토리 1개**,
그리고 **F4 부터 스프린트마다 E2E 1개.**

### 렌더링이 필요하면 유닛으로 쓰지 않습니다

유닛은 **DOM 없이 도는 것만** 맡습니다. 화면에 뜨는 것을 jsdom 으로 확인하려 들면 안 됩니다 —
슬래시 메뉴 · 포맷 툴바 · 드래그 핸들은 floating-ui 가 위치를 계산해서 띄우는데, jsdom 은
레이아웃이 없어서 모든 rect 가 0 이고 `elementFromPoint` 도 없습니다. 폴리필을 다 채워도
메뉴 높이가 `0px` 로 남습니다 ([F3 §0 확인 결과](../decisions/f3-blocknote-surface.md)).

그래서 **목록 · 상태를 만드는 부분을 컴포넌트 밖으로 빼 두고, 그 함수만 검사합니다.**
뜨는 것 자체는 F4 의 Playwright 로 넘깁니다.

> **아직 러너가 없습니다.** `package.json` 에 `test` 스크립트가 없습니다. F3 §6 에서 켭니다 —
> **`vite.config.ts` 는 안 건드립니다.** vitest 기본 `environment: "node"` 로 충분합니다.
> `BlockNoteEditor.create()` 도 `getDefaultSlashMenuItems` 도 `document` 없이 돕니다 (확인함).
> 컴포넌트를 안 띄우기로 한 이상 jsdom 이 필요한 자리가 없어서, `jsdom` 과
> `@testing-library/*` 는 devDependencies 에서 빼도 됩니다.

---

## 성능

- 라우트 · 에디터 · 표를 각각 별도 번들로 분리
- 트리와 표는 **중첩 컴포넌트를 재귀로 그리지 않습니다.** 평평한 배열 + `depth` 값으로 그려야 가상 스크롤이 붙습니다
- 자동 저장은 입력을 막지 않습니다

| 항목 | 목표 |
|---|---|
| 첫 화면 번들 | 300KB (gzip) 이하 |
| 문서 열기 | 1초 이내 |
| 트리 1000행 스크롤 | 60fps |
| 표 5000행 스크롤 | 60fps |

---

## 접근성

- 포커스 링은 `knoc-focus-ring` · `knoc-focus-ring-inset` 두 클래스로만 붙입니다. 값을 다시 쓰거나 **없애지 않습니다** (DESIGN.md §6)
- 트리는 `role="tree"`, 표는 `role="grid"`, 메뉴는 `role="menu"` + 키보드로 전부 조작 가능
- 아이콘 버튼에는 전부 `aria-label`. 아이콘은 seed-icon만 씁니다
- 저장 상태 변화는 `aria-live="polite"`
- 모든 스프린트 완료 조건에 "키보드만으로 완주" 항목이 들어갑니다

---

← [MVP 범위](mvp.md) · 다음 → [F1](sprint-1.md)
