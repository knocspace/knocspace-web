# Sprint 2 · 페이지 만들기와 목록

← [로드맵으로](../../ROADMAP.md)

| | |
|---|---|
| 기간 | 1주 |
| 선행 | Sprint 1 + **포커스 링 색 결정** (DESIGN.md §6) |
| 우선순위 | P0 |

---

## 목표

핵심 흐름의 앞 절반을 완성합니다.

```
진입 → 생성 → 목록 → 열기 → 제목 수정 → 삭제
```

본문은 아직 비어 있어도 됩니다.

## 만드는 것

- 사이드바 페이지 트리 (펼침·접힘, 선택 표시)
- 페이지 생성 — 사이드바 `+`, 빈 화면 버튼, 하위 페이지
- 페이지 열기 → `/p/:pageId`, 상단바에 경로 표시
- 제목 편집
- 삭제 → 휴지통으로 이동 (실제로 지우지 않음)
- 행 우클릭 메뉴 — 하위 페이지 추가 / 이름 바꾸기 / 삭제
- "페이지가 아직 없어요" 빈 화면

---

## 할 일

### 1. 데이터 (`api/` · `hooks/`)

- [ ] `api/pages.ts`에 `createPage` / `updatePage` / `deletePage` 구현. 삭제는 `deletedAt`만 채웁니다
- [ ] `hooks/useCreatePage.ts` · `useRenamePage.ts` · `useDeletePage.ts`
- [ ] 세 개 모두 **낙관적 업데이트** — 서버 응답을 기다리지 않고 화면부터 바꾸고, 실패하면 되돌리고 토스트

### 2. 트리 로직 (`features/page-tree/`)

- [ ] `flattenTree.ts` — 페이지 목록 + 펼쳐진 id 집합 → 평평한 배열

  ```ts
  interface FlatRow {
    page: PageSummary;
    depth: number;
    isExpanded: boolean;
    hasChildren: boolean;
  }
  ```

  **중첩을 재귀 컴포넌트로 그리지 않습니다.** 평평한 배열이어야 Sprint 5에서 가상 스크롤이 붙습니다 (DESIGN.md §5).

- [ ] `useExpandedIds.ts` — 펼침 상태를 localStorage에 유지

### 3. 화면 (`components/`)

- [ ] `tree/TreeRow.tsx` — 높이 28px, 들여쓰기 14px × depth, 호버하면 액션 버튼, 선택되면 `bg-brand-weak`
- [ ] `tree/PageTree.tsx` — 순수 UI. `rows` · `selectedId` · 콜백만 받습니다
- [ ] `Breadcrumb.tsx` — 조상 경로. 4단계가 넘으면 가운데를 `…`로 접습니다
- [ ] `ui/Menu.tsx` — 우클릭 메뉴. 키보드로도 열고 닫힙니다
- [ ] `EmptyState`에 "첫 실행" 종류 추가

  > 페이지가 아직 없어요
  > 첫 페이지를 만들면 왼쪽 목록에 쌓여요.
  > `[페이지 만들기]`

### 4. 문서 화면 (`routes/` · `features/editor/`)

- [ ] `PageRoute.tsx` — 로딩 / 404 / 에러 / 성공 갈래 처리
- [ ] `features/editor/PageTitle.tsx` — 한 줄 편집. 34px / 700 / −0.035em, 비어 있으면 `제목 없음`
  - Enter나 ↓를 누르면 본문으로 포커스가 넘어갑니다 (본문은 Sprint 3에서 연결)

### 5. 키보드 조작

- [ ] 트리에 `role="tree"`
- [ ] ↑ ↓ 행 이동 / → ← 펼침·접힘 / Enter 열기 / Delete 삭제

### 6. 테스트

- [ ] `flattenTree` 유닛 테스트
- [ ] "만들기 → 목록에 나타남 → 클릭 → 열림" 통합 테스트 1개

---

## 완료 조건

- [ ] 새로고침해도 방금 만든 페이지가 남아 있고, URL로 바로 열린다
- [ ] 페이지가 0개면 빈 화면이 뜨고, 버튼으로 첫 페이지가 만들어진다
- [ ] 만들기·이름변경·삭제가 즉시 반영되고, 실패하면 되돌아가고 토스트가 뜬다
- [ ] 마우스 없이 트리를 끝까지 조작할 수 있다
- [ ] 샘플 300개를 넣어도 트리가 눈에 띄게 안 밀린다 (가상 스크롤은 Sprint 5)
- [ ] 다크 모드에서 선택·호버 색이 깨지지 않는다

[공통 완료 조건](conventions.md)도 함께 확인합니다.

---

## 끝나면 할 수 있는 것

페이지를 만들고, 제목을 붙이고, 목록에서 찾아 열고, 지울 수 있습니다.
**본문이 없는 노션**이 됩니다.

---

← [Sprint 1](sprint-1.md) · 다음 → [Sprint 3](sprint-3.md)
