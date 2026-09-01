# F1 · 공통 컴포넌트와 레이아웃

← [로드맵으로](../../ROADMAP.md)

| | |
|---|---|
| 기간 | 1주 (약 15시간) |
| 선행 | 없음 |
| 백엔드 | B1 진행 중 — 기다리지 않습니다 |
| 우선순위 | P0 |

---

## 목표

화면을 조립할 **재료를 전부 만듭니다.** 데이터는 한 줄도 붙이지 않습니다.

이 스프린트가 끝나면, F2~F3에서 새로 만들 UI는 **도메인에 붙은 것만** 남아야 합니다. 로딩·에러·빈 화면·메뉴·토스트를 그때 가서 만들고 있으면 이 스프린트가 실패한 것입니다.

## 만드는 것

- 라우팅 골격과 `RootLayout`
- 공통 UI 10종 (`components/ui/`)
- 레이아웃 컴포넌트 — `Breadcrumb`, `PageTree`, `PageTreeItem` (전부 props만 받습니다)
- 컴포넌트 카탈로그 — 스토리북

**안 만드는 것** — `src/shared/api/`, TanStack Query 설정. 전부 [F2](sprint-2.md)입니다.

자동 테스트도 넣지 않습니다. 스토리북에 더미 데이터를 넣고 눈으로 확인합니다 — 이 스프린트에서 만드는 것이 전부 props 만 받는 순수 UI 라, 스토리 몇 개면 상태를 다 재현할 수 있습니다.

---

## 할 일

### 1. 준비 (1시간)

- [x] `DESIGN.md` 를 SEED 2.5 토큰 이름으로 정합. 옛 이름 대응표는 [DESIGN.md §0](../../DESIGN.md)
- [x] 포커스 링 확정 — [DESIGN.md §6](../../DESIGN.md). 컴포넌트는 `knoc-focus-ring` · `knoc-focus-ring-inset` 두 클래스만 씁니다
- [x] 브랜드 purple 단계 확정 — [DESIGN.md §2](../../DESIGN.md)

---

### 2. 라우팅 골격 (2시간)

데이터가 없어도 화면 사이를 오갈 수 있게 먼저 뚫어 둡니다.

- [x] `routes/router.tsx`
- [x] `routes/RootLayout.tsx` — `AppShell` + `<Outlet />`
- [x] `routes/PageRoute.tsx` — 지금은 URL의 `pageId`만 글자로 출력합니다
- [x] `routes/NotFound.tsx`
- [x] `App.tsx`를 `RouterProvider` 한 줄로 줄이기
- [x] **`useSidebarResize`를 `RootLayout`으로 옮기기** — 페이지를 옮겨도 사이드바 폭이 유지돼야 합니다

| 경로 | 지금 | 채우는 시점 |
|---|---|---|
| `/` | 빈 화면 | F2 |
| `/p/:pageId` | id만 출력 | F2~F3 |
| `*` | 404 | 이번 주 |

---

### 3. 공통 UI 10종 (7시간) ★ 이 스프린트의 핵심

`components/ui/`. **전부 props만 받습니다.** 서버도, Query도, 라우터도 모릅니다.

컴포넌트 하나가 폴더 하나입니다 — 본체와 스토리가 같은 폴더에 있고 배럴은 두지 않습니다. 아래 표의 `Spinner.tsx` 는 `ui/Spinner/Spinner.tsx` 입니다 ([구조 문서](architecture.md)).

- [x] **SEED 대응 6종 규격 대조 (30분).** 결과는 [DESIGN.md §10](../../DESIGN.md) — 직접 만드는 것은 4종, 감싸되 값을 덮는 것이 3종입니다

| 파일 | SEED | 내용 | 처음 쓰이는 곳 |
|---|---|---|---|
| `Spinner.tsx` | `LoadingIndicator` | 크기 2종 | 어디나 |
| `Skeleton.tsx` | `Skeleton` | 치수를 받는 회색 블록. 지금 컴포넌트에 흩어진 자리표시 코드를 여기로 모읍니다 | F2 트리 |
| `EmptyState.tsx` | `ContentPlaceholder` | 아이콘 / 제목 / 설명 / 버튼. 문구는 DESIGN.md §9에서 가져와 상수로 | F2 첫 실행 |
| `ErrorState.tsx` | — | 원인 + 다시 시도. 사과하지 않는 문구 | F2 |
| `ErrorBoundary.tsx` | — | 라우트 단위 | 이번 주 |
| `Menu.tsx` | `Menu` | 우클릭·드롭다운 메뉴. `role="menu"`, 키보드로 열고 닫고 이동 | F2 행 메뉴 |
| `Toast.tsx` | `Snackbar` | 사용자가 한 행동의 결과에만. 조회 실패에는 안 씁니다 | F2 삭제 |
| `Dialog.tsx` | `Dialog` | 확인·취소. 포커스 가둠, Esc 닫기 | F4 저장 충돌 |
| `IconButton.tsx` | `ActionButton` | `aria-label` 필수. 아이콘은 seed-icon만 | F2 트리 행 |
| `InlineInput.tsx` | — | 제자리 편집 — Enter 확정 / Esc 취소 / 포커스 아웃 확정 | F2 제목·이름 변경 |

SEED 칸이 찬 7종은 **직접 만들지 않습니다.** 7시간은 6종을 직접 만든다고 잡은 값이라, 대조 결과에 따라 줄어듭니다.

**규칙 세 가지**

1. SEED에 있는 컴포넌트는 새로 만들지 않고 감쌉니다 (위 표의 SEED 칸)
2. `!important`나 자손 선택자로 SEED를 덮지 않습니다 (DESIGN.md §1)
3. 문구를 컴포넌트 안에 하드코딩하지 않습니다. `lib/messages.ts` 한 곳에 모읍니다

---

### 4. 레이아웃 컴포넌트 (2시간 30분)

도메인 화면이지만 **아직 데이터를 모릅니다.** 더미 배열을 props로 받아 그립니다.

- [x] `components/PageTree/PageTree.tsx` — `items` · `selectedId` · 콜백만 받습니다. `role="tree"`
- [x] `components/PageTree/PageTreeItem.tsx` — `role="treeitem"`. 높이 28px, 들여쓰기 14px × depth, 호버하면 액션 버튼, 선택되면 `bg-brand-weak`
- [x] `components/Breadcrumb/` — 조상 경로. 4단계가 넘으면 가운데를 `…`로 접습니다
- [x] `components/SaveStatus/` — 상태 문자열만 받아 그립니다. `aria-live="polite"` (실제 저장은 F3)

**기다릴 것이 없습니다.** 백엔드는 트리를 주지 않습니다 — `GET /pages` 가 `PageSummary[]` 평평한 배열을 주고, 트리로 조립하는 것은 프론트입니다 (`knocspace-api` 의 `docs/roadmap/api-contract.md`). `depth` 와 `isExpanded` 는 서버에 없는 화면 상태이고, 서버와 겹치는 것은 `hasChildren` 하나인데 그 뜻도 이미 확정입니다 — "삭제되지 않은 자식이 1개 이상".

항목 데이터의 모양을 먼저 정합니다. F2에서 `visibleItems` 가 `PageSummary` + 펼친 id 집합으로 같은 이름의 타입을 만듭니다.

```ts
// components/PageTree/PageTreeItem.tsx
export interface TreeItemData {
  id: string;
  title: string;
  icon: string | null;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
}
```

**이름 규칙** — 컴포넌트에는 `Page` 를 붙이고(`PageTree` · `PageTreeItem`), 타입에는 안 붙입니다. F2에서 모양이 `{ page: PageSummary, depth, … }` 가 되면 `page` 가 이름과 필드에 두 번 나옵니다.

`Row` 는 쓰지 않습니다. `role="tree"` 의 자식은 `treeitem` 이고 `row` 는 `grid` · `treegrid` 안에만 있는 role 인데 이 트리에는 열이 없습니다. 게다가 `Row` 는 F6에서 **데이터베이스 행**이라는 실제 타입으로 들어옵니다.

**중첩을 재귀 컴포넌트로 그리지 않습니다.** 평평한 배열이어야 F6에서 가상 스크롤이 붙습니다 (DESIGN.md §5).

---

### 5. 컴포넌트 카탈로그 — 스토리북 (1시간)

- [x] `.storybook/main.ts` — `vite.config.ts` 를 그대로 물려받습니다. 별칭·Tailwind·SEED 의 `seed-layered` 조건을 여기 다시 적지 않습니다
- [x] `.storybook/preview.tsx` — `ToastProvider` 전역 데코레이터, 라이트/다크 툴바(`data-seed-color-mode` 를 `<html>` 에)
- [x] `@storybook/addon-a11y` — 스토리마다 axe 를 돌립니다
- [x] 스토리 13개 — 공통 UI 10종 + `PageTree` · `Breadcrumb` · `SaveStatus`
- [x] `package.json` 에 `"storybook"`, `"build-storybook"`

처음에는 `/dev/ui` 라우트 하나로 갔습니다. 635줄짜리 한 화면이 되면서
`Section` · `Slot` · 상단바/사이드바 흉내 · 테마 토글을 직접 들고 있었는데,
그게 스토리북이 기본으로 주는 것들이었습니다. F6~F7 에서 셀 렌더러 7종이
들어오면 손으로 늘어놓을 수 없어서 여기서 바꿉니다.

격리로 얻은 것 하나 — `ErrorBoundary` 를 실제로 터뜨려 볼 수 있습니다.
한 화면 카탈로그에서는 일부러 throw 하면 카탈로그가 통째로 죽었습니다.

---

### 6. 마무리 (30분)

- [x] README를 실제 문서로 교체 — 실행 방법, 폴더 구조
- [x] `CLAUDE.md`의 구조 트리를 [구조 문서](architecture.md) 기준으로 갱신
- [x] 커밋 나누기

```
docs:  토큰 이름 정합
feat:  라우팅 도입
feat:  공통 UI 컴포넌트
feat:  트리·경로 표시 컴포넌트
chore: 컴포넌트 카탈로그를 스토리북으로
```

---

## 완료 조건

- [x] `npm run build` · `npm run lint` 두 개 통과
- [ ] `npm run storybook` 에서 10종이 라이트·다크 양쪽에서 정상으로 보인다 — **눈으로 확인할 것만 남았습니다**
- [x] 10종 전부 마우스 없이 조작된다 — 누르는 것은 전부 `<button>` 이거나 SEED 파트이고,
      직접 키를 다루는 넷(`Menu` · `Dialog` · `InlineInput` · `PageTree`)은 각자 핸들러를 갖습니다
- [x] `src/pages/` · `src/shared/ui/` 안에서 `useQuery`·`fetch`·`localStorage`를 import 하는 곳 0개
- [x] 이상한 경로 → NotFound, 라우트를 옮겨도 사이드바 폭이 유지된다 — `path: "*"` 와
      `RootLayout` 의 `useSidebarResize`
- [x] UI 문구가 `messages.ts` 밖에 하드코딩된 곳 0개 — 사이드바 라벨과 문서 자리표시를
      `lib/messages.ts` 로 옮겼습니다 (`RootLayout` 의 더미 트리는 문구가 아니라 F2 까지 쓸 가짜 데이터입니다)

[공통 완료 조건](conventions.md)도 함께 확인합니다.

---

## 끝나면 할 수 있는 것

사용자 눈에 보이는 변화는 없습니다. 대신 F2에서 만들 화면의 재료가 전부 준비돼 있습니다.

---

← [프론트엔드 구조](architecture.md) · 다음 → [F2](sprint-2.md)
