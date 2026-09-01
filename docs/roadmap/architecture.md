# 프론트엔드 구조

← [로드맵으로](../../ROADMAP.md)

파일을 어디에 만들지, 상태를 어디에 둘지에 대한 기준입니다.

구조는 Feature-Sliced Design(FSD) v2.1 의 **pages-first** 방식입니다.

---

## 도메인 용어

셋을 구분해서 씁니다. 이름이 흔들리면 폴더도 같이 흔들립니다.

| 용어 | 뜻 |
|---|---|
| **Page** | 사용자가 만드는 Notion 형태의 문서 한 장 |
| **Page content** | Page 안에서 편집하는 본문. block 목록으로 저장됩니다 |
| **Page navigation** | Sidebar 에서 Page 계층을 오가는 UI |

`Document` · `Doc` 는 이 개념에 쓰지 않습니다.

---

## 레이어 셋

```
app     앱을 켜고 전역으로 조립하는 자리 — 라우터, 셸, 전역 스타일
pages   URL 하나 = 화면 하나
shared  KnocSpace 를 몰라도 되는 기반 코드
```

FSD 의 나머지 레이어(`entities` · `features` · `widgets`)는 **일부러 비워 뒀습니다.**
지금은 에디터도 Page navigation 도 주인이 하나뿐이라, 만들면 파일 개수만 늘고 소유자는
그대로입니다. 만드는 기준은 [아래](#언제-레이어를-더-만드나)에 적었습니다.

### 구조 한눈에 보기

```text
src/
├─ app/                         앱 시작과 전역 조립
│  ├─ main.tsx  App.tsx         진입점
│  ├─ routes/                   URL 과 화면의 대응표
│  ├─ styles/                   전역 CSS 와 외부 라이브러리 스타일 연결
│  └─ layout/                   모든 화면을 감싸는 프레임
│     ├─ model/                 Sidebar 폭, Page navigation · 상단바 경로 계산
│     └─ ui/
│        ├─ AppLayout.tsx       셸을 조립하는 자리
│        ├─ Sidebar/            폭과 접힘만 아는 프레임. 안은 children 으로 받음
│        ├─ PageNavigation/     그 children 으로 들어가는 트리 (Sidebar 와 형제)
│        ├─ TopBar/             + Breadcrumb · SaveStatus
│        └─ ErrorBoundary/      전역 렌더링 오류 화면
│
├─ pages/                       URL 단위 화면
│  ├─ page-editor/              / 와 /p/:pageId
│  │  ├─ ui/                    화면과 편집 UI (에디터 스토리는 stories/)
│  │  ├─ model/                 PageContent 와 BlockNote 연동
│  │  ├─ lib/                   이 화면 전용 순수 보조
│  │  └─ index.ts               공개 API
│  └─ not-found/                알 수 없는 URL
│
└─ shared/                      도메인을 모르는 공용 기반
   ├─ ui/                       BrandMark · Dialog · Menu · Spinner · Toast …
   ├─ config/                   화면 문구
   └─ assets/                   브랜드 자산
```

트리는 **컴포넌트 폴더까지만** 보여 줍니다. 폴더 안의 `Sidebar.tsx` · `Sidebar.stories.tsx`
까지 적으면 이름만 한 번 더 반복되고 소유 관계는 하나도 더 드러나지 않습니다.

---

## 슬라이스 안을 무엇으로 가르나

세그먼트 이름은 FSD 규약을 그대로 씁니다. **폴더 이름이 곧 "이게 어떤 종류의 코드인지"** 입니다.

| 세그먼트 | 들어가는 것 | 예 |
|---|---|---|
| `ui/` | React 컴포넌트와 스토리 | `ContentEditor.tsx` · `PageNavigation/` |
| `model/` | 상태와 계산. 그 슬라이스의 데이터 로직 | `page-content.ts` · `page-navigation.ts` · `breadcrumb.ts` |
| `lib/` | 그 슬라이스 전용 순수 함수 | `page-icon-emoji.ts` · `blocknote-side-menu.ts` |
| `config/` | 문구와 설정 | `shared/config/messages.ts` |
| `assets/` | 정적 파일 | `shared/assets/brand/` |
| `api/` | 서버 호출 | 아직 없음 — [F2 에서 생깁니다](#서버가-붙는-자리-f2f4) |

### 컴포넌트를 파일로 둘지 폴더로 둘지

**여러 곳에서 쓰이는 컴포넌트는 폴더 하나.** 본체 · 스토리 · 그 컴포넌트에서만 쓰는
하위 부품이 한 폴더에 모입니다. `shared/ui/` 와 `app/layout/ui/` 가 이 모양입니다.

**폴더 중첩은 곧 import 소유입니다.** 안에 넣는 기준은 "그 컴포넌트가 직접 import 하는가"
하나뿐입니다. 화면에서 나란히 보이는 것은 기준이 아닙니다.

```
shared/ui/Toast/Toast.tsx  Toast.stories.tsx  useToast.tsx   ← 표면과 띄우는 쪽은 짝
app/layout/ui/PageNavigation/PageNavigation.tsx
                             PageNavigationItem.tsx          ← 행은 목록 밖에서 안 쓰임
app/layout/ui/TopBar/TopBar.tsx  Breadcrumb.tsx  SaveStatus.tsx
                                                             ← 상단바가 직접 그리는 둘
```

그래서 `PageNavigation` 은 `Sidebar/` 안이 아니라 **옆**에 있습니다. 사이드바는 트리를
import 하지 않고 `children` 자리만 열어 두며, 둘을 붙이는 것은 `AppLayout` 입니다.
폴더로 감싸면 없는 소유 관계를 그리는 셈이고, 실제로 `../../../model/` 같은 경로가
따라옵니다.

`Breadcrumb` 처럼 폴더 안에 든 부품의 타입이 밖에서 필요하면 **부모가 re-export** 합니다
(`TopBar` 가 `BreadcrumbItem` 을 내놓습니다). 바깥에서 폴더 안쪽 파일을 직접 가리키지
않습니다.

**화면 하나 안에서만 사는 컴포넌트는 파일로 둡니다.** `pages/page-editor/ui/` 가 그렇습니다 —
`PageTitle.tsx` 와 `PageTitle.stories.tsx` 가 나란히 있고 폴더를 한 겹 더 만들지 않습니다.
슬라이스 자체가 이미 문맥이라, 폴더를 더 파도 "누구 것인지" 가 더 분명해지지 않습니다.
블록 타입별 스토리처럼 **컴포넌트가 아니라 에디터 동작을 보여 주는 묶음**만 `ui/stories/` 로 모읍니다.

### 배럴은 경계에만

배럴(`index.ts`)은 **레이어 경계에만** 둡니다. 안쪽에서는 파일을 직접 import 합니다.

- `pages/<슬라이스>/index.ts` — 그 화면이 밖에 내놓는 것 (`PageEditorPage` · `EditorSurface`)
- `shared/<세그먼트>/index.ts` — `shared` 는 슬라이스가 없어서 세그먼트가 공개 단위입니다

여기 없는 배럴은 만들지 않습니다. 슬라이스 안에서 배럴은 경로를 한 마디 줄여 줄 뿐인데,
대신 dev 서버가 re-export 대상을 전부 로드해 느려지고 순환 import 가 생기기 쉽습니다.

import 규칙은 둘입니다 — **같은 슬라이스 안은 `./`, 슬라이스를 넘으면 `@/`.**

---

## 의존 방향

```text
app  →  pages  →  shared
```

- 위 레이어는 아래 레이어만 import 합니다. 반대 방향은 없습니다.
- **같은 레이어끼리도 import 하지 않습니다.** `pages/page-editor` 가 `pages/not-found` 를 부르지 않습니다.
- 슬라이스 밖에서 슬라이스를 쓸 때는 `index.ts` 만 지나갑니다. 안쪽 파일을 직접 가리키지 않습니다.

이 표가 지켜지면 F2(mock 연결)와 F4(Page API 연결)에서 화면 코드를 거의 안 고칩니다.

| 자리 | 아는 것 | 몰라야 하는 것 |
|---|---|---|
| `shared/ui` | props, 디자인 토큰 | KnocSpace 문구, 서버, Query, 라우터 |
| `shared/config` | 화면 문구 | 컴포넌트 |
| `pages/*/ui` | props, 같은 슬라이스의 `model` | fetch, localStorage |
| `pages/*/model` | 도메인 규칙, 서버 훅 | DOM 치수 |
| `app/layout` | 라우터, 슬라이스 공개 API | 슬라이스 내부 |
| `shared/api` (F2~) | 전송 방식, 저장소 | React |

**확인 방법** — 스프린트가 끝날 때 아래가 전부 0 이어야 합니다.

- `src/shared/ui/` 안의 `useQuery` import
- `src/shared/ui/` 안의 KnocSpace 문구 (`Message` **타입** import 는 문구가 아니라 props 모양이라 괜찮습니다)
- `src/shared/api/` 밖의 `localStorage` 직접 호출 — `app/layout/model/sidebar-resize.ts` 는
  서버 데이터가 아니라 화면 상태라 예외입니다

### 언제 레이어를 더 만드나

`entities` · `features` · `widgets` 는 **두 화면 이상이 실제로 같은 것을 쓰게 될 때** 만듭니다.
"나중에 쓸 것 같아서" 는 기준이 아닙니다.

| 새로 생기면 | 가는 곳 |
|---|---|
| Page 라는 **모델**(타입 · 조회 훅)을 여러 화면이 씀 | `entities/page` |
| Page 를 **바꾸는 동작**(이름 바꾸기 · 옮기기 · 삭제)을 여러 화면이 씀 | `features/rename-page` 처럼 동작 이름으로 |
| 여러 슬라이스를 엮은 **덩어리 UI** 를 여러 화면이 씀 | `widgets/*` |

지금은 셋 다 해당 없음입니다. Page navigation 은 셸 하나만 쓰므로 `app/layout` 에,
에디터는 화면 하나만 쓰므로 `pages/page-editor` 에 있습니다.

---

## 서버가 붙는 자리 (F2~F4)

지금은 서버 호출이 하나도 없습니다. 생길 때 아래 자리에 만듭니다.

```
shared/api/
  client.ts        모든 호출이 지나가는 곳. F4 에서 이 파일만 mock → fetch
  types.ts         백엔드와의 계약. 타입의 유일한 출처
  query-client.ts  query-keys.ts
```

- **전송은 `shared/api/` 안에서만.** 이 폴더 밖에서 `fetch` 나 `localStorage` 를 부르지 않습니다.
- **Page CRUD 훅은 쓰는 화면이 하나인 동안 `pages/page-editor/api/` 에 둡니다.**
  두 번째 화면이 같은 훅을 부르는 순간 `entities/page/api` 로 올립니다 — 위의 승격 기준 그대로입니다.
- 훅 이름은 `usePage` · `usePageTree` · `useCreatePage` · `useSavePage`.
- **자리표시 데이터는 `model/` 에 파일 하나로 둡니다** — `app/layout/model/sample-page-navigation.ts` ·
  `pages/page-editor/model/sample-page-content.ts`. F2 에서 이 파일들만 지우면 됩니다.
  화면 컴포넌트 안에 상수로 박아 두면 지울 때 화면 코드를 같이 건드리게 됩니다.

---

## 네이밍 규칙

- **구현 방식보다 제품 용어.** `PageContent` · `ContentEditor` · `PageNavigation`.
- **폴더가 문맥을 주면 이름은 짧게.** `TopBar/Breadcrumb` 이지 `TopBarBreadcrumb` 이 아닙니다.
- **외부 라이브러리와 맞물리는 어댑터는 경계를 이름에 드러냅니다.** `blocknote-schema.ts` · `blocknote-side-menu.ts`.
- `CodeBlock` 은 `PageContent` 전체가 아니라 그 안의 block 한 종류라 그대로 둡니다.

---

## 라우팅

React Router v7. URL 과 화면의 대응은 `app/routes/router.tsx` 한 곳에만 적습니다.
라우트별 `React.lazy` 는 화면이 무거워지는 시점에 붙입니다.

| 경로 | 화면 | 생기는 시점 |
|---|---|---|
| `/` | 마지막 방문 Page 로 이동 (없으면 빈 화면) | F1 (틀) → F2 |
| `/p/:pageId` | `pages/page-editor` | F1 (틀) → F2~F3 (내용) |
| `*` | `pages/not-found` | F1 |
| `/login` | 로그인 | F5 |
| `/db/:dbId` | 데이터베이스 | F6 |
| `/trash` | 휴지통 | F8 |

셸(Sidebar · TopBar)은 `path` 없는 레이아웃 라우트라 화면이 바뀌어도 유지됩니다.
문서가 아닌 화면은 `handle.crumb` 으로 상단바에 이름을 내놓고, 문서 화면의 경로는
서버에서 오므로 라우터에 적지 않습니다.

---

## 상태를 어디에 둘까

| 종류 | 도구 | 예 |
|---|---|---|
| 서버 데이터 | **TanStack Query** | Page 목록, Page content, 검색 결과 |
| URL 에 담기는 것 | **React Router** | 현재 Page id, 검색어, 뷰 종류 |
| 화면 상태 | **useState + localStorage** | 사이드바 폭, 트리 펼침, 다크 모드 |
| 편집 중인 본문 | **에디터가 직접 가짐** | 블록, 커서, 선택 영역 |

**Zustand 같은 전역 스토어는 처음부터 넣지 않습니다.** 위 넷으로 안 풀리는 문제가
실제로 나타나면 그때 넣습니다.

### 쿼리 키

문자열을 여기저기 적지 않고 한 곳에서 만듭니다.

```ts
// src/shared/api/query-keys.ts
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

F10 에서 실시간 협업을 붙입니다. 그때 에디터를 다시 만들지 않으려면 아래를 지켜야 합니다.

**1. 본문의 원본은 에디터 하나뿐입니다.**
블록 내용을 React state 로 복사해 두지 않습니다. 복사본이 생기는 순간 협업에서 어느 쪽이 맞는지 알 수 없게 됩니다.

**2. 블록 id 는 클라이언트가 만듭니다.**
서버가 번호를 주기를 기다리지 않습니다. 여러 명이 동시에 편집할 때 id 가 먼저 정해져 있어야 병합이 됩니다.

**3. 본문 안은 `pages/page-editor/model/` 밖에서 열어보지 않습니다.**
`PageContent` 는 다른 코드 입장에서 그냥 덩어리입니다. F10 에서 이 자리가 Yjs 데이터로 바뀌어도 나머지가 안 깨집니다.
에디터 인스턴스도 밖으로 내보내지 않습니다 — 제목에서 본문으로 포커스를 옮기는 것 같은 일은 훅이 핸들로 열어 줍니다.

**4. 훅 하나로 감쌉니다.** `model/content-editor.ts` 의 `useContentEditor` 가 그 자리입니다.

```ts
// 지금
const editor = useContentEditor({ pageId, content });

// F10 — 이 훅 안쪽만 바뀌고, 쓰는 쪽은 그대로
const editor = useContentEditor({ pageId, content, collaboration });
```

**5. 사용자 정보에 `color` 를 미리 넣어둡니다.**
F10 의 커서 색으로 그대로 씁니다. 나중에 타입을 고치지 않기 위해서입니다.

---

## 로딩과 에러

| 상황 | 보여줄 것 |
|---|---|
| 처음 불러오는 중 | `Skeleton`. 레이아웃이 안 흔들리게 실제 치수로 |
| 이미 데이터가 있고 다시 불러오는 중 | 기존 화면 유지 + 상단바에 작은 표시. **화면을 비우지 않습니다** |
| 실패 | `ErrorState` — 원인 + 다시 시도 버튼 |
| 예상 못한 오류 | `app/layout/ui/ErrorBoundary` |

토스트는 **사용자가 뭔가 한 결과에만** 씁니다. 삭제됨, 복구됨, 저장 실패. 조회 실패에는 안 씁니다.

에러 문구는 사과하지 않고, 뭐가 잘못됐고 어떻게 고치는지 말합니다 (DESIGN.md §8).

---

## 테스트

**컴포넌트 테스트는 두지 않습니다.** F1 에서 스토리북으로 갈음하기로 했고
([F1 §5](sprint-1.md#5-컴포넌트-카탈로그--스토리북-1시간)) 그대로 갑니다. RTL · user-event 는
쓰지 않습니다 — `role` · 이름 · 대비는 스토리마다 도는 `addon-a11y` 의 axe 가 봅니다.

| 종류 | 도구 | 대상 | 시작 |
|---|---|---|---|
| 컴포넌트 | 스토리북 + addon-a11y | `shared/ui`, Page navigation, 에디터 블록 | F1 ✅ |
| 유닛 | Vitest | 순수 함수 — `getVisiblePageNavigationNodes` · `firstLineOffset` · api mock | F3 |
| E2E | Playwright | 핵심 흐름, **에디터 위에 뜨는 것 전부** | F4 |

**커버리지 목표는 두지 않습니다.** 규칙은 둘입니다 — **새 컴포넌트에 스토리 1개**,
그리고 **F4 부터 스프린트마다 E2E 1개.**

### 렌더링이 필요하면 유닛으로 쓰지 않습니다

유닛은 **DOM 없이 도는 것만** 맡습니다. 화면에 뜨는 것을 jsdom 으로 확인하려 들면 안 됩니다 —
슬래시 메뉴 · 포맷 툴바 · 드래그 핸들은 floating-ui 가 위치를 계산해서 띄우는데, jsdom 은
레이아웃이 없어서 모든 rect 가 0 이고 `elementFromPoint` 도 없습니다. 폴리필을 다 채워도
메뉴 높이가 `0px` 로 남습니다 ([F3 §0 확인 결과](../decisions/f3-blocknote-surface.md)).

그래서 **목록 · 상태를 만드는 부분을 컴포넌트 밖(`model/` · `lib/`)으로 빼 두고, 그 함수만 검사합니다.**
뜨는 것 자체는 F4 의 Playwright 로 넘깁니다.

> **아직 러너를 안 켰습니다.** vitest 는 설치돼 있지만 `package.json` 에 `test` 스크립트가 없습니다.
> F3 §6 에서 켭니다 — **`vite.config.ts` 는 안 건드립니다.** vitest 기본 `environment: "node"` 로
> 충분합니다. `BlockNoteEditor.create()` 도 `getDefaultSlashMenuItems` 도 `document` 없이 돕니다 (확인함).
> 컴포넌트를 안 띄우기로 한 이상 jsdom 이 필요한 자리가 없어서, `jsdom` 과
> `@testing-library/*` 는 devDependencies 에서 빼도 됩니다.

---

## 성능

- 라우트 · 에디터 · 표를 각각 별도 번들로 분리
- Page navigation 과 표는 **중첩 컴포넌트를 재귀로 그리지 않습니다.** 평평한 배열 + `depth` 값으로
  그려야 가상 스크롤이 붙습니다 — `getVisiblePageNavigationNodes` 가 접힌 자손을 미리 걸러서
  컴포넌트에 **보이는 행만** 넘기는 이유입니다
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
- 아이콘 버튼에는 전부 `aria-label`. 아이콘은 seed-icon 만 씁니다
- 저장 상태 변화는 `aria-live="polite"`
- 모든 스프린트 완료 조건에 "키보드만으로 완주" 항목이 들어갑니다

---

← [MVP 범위](mvp.md) · 다음 → [F1](sprint-1.md)
