# F2 · 페이지 화면 — 목록과 CRUD

← [로드맵으로](../../ROADMAP.md)

| | |
|---|---|
| 기간 | 1주 (약 15시간) |
| 선행 | F1 + **`types/api.ts` 초안을 백엔드 B1 설계와 맞추기** |
| 백엔드 | B2 진행 중 — 기다리지 않습니다 |
| 우선순위 | P0 |

---

## 목표

F1에서 만든 컴포넌트에 **데이터를 꽂습니다.** 데이터의 출처는 아직 localStorage mock입니다.

핵심 흐름의 앞 절반을 완성합니다.

```
진입 → 생성 → 목록 → 열기 → 제목 수정 → 삭제
```

## 만드는 것

- `src/types/api.ts` — 백엔드와의 약속
- `src/api/*` — localStorage mock (느리게 / 실패하게 만드는 스위치 포함)
- TanStack Query 설정과 쿼리 키 규칙
- 사이드바 페이지 트리 (펼침·접힘, 선택 표시)
- 페이지 생성 / 열기 / 제목 수정 / 삭제(휴지통으로 이동)
- 트리 키보드 조작

새 UI 컴포넌트는 만들지 않습니다. F1에서 만든 것을 씁니다.

---

## 할 일

### 1. 백엔드와의 약속 정하기 (2시간) ★ 이 스프린트의 핵심

`src/types/api.ts` 하나에 전부 모읍니다.

판단 기준 하나: **이 파일을 그대로 백엔드 쪽에 넘길 수 있어야 합니다.** mock을 편하게 만들려고 타입을 비틀지 않습니다.

**시작하기 전에 B1의 Page 도메인 설계와 필드 이름·널 여부·id 타입을 맞춥니다.** 여기서 어긋나면 F4에서 전부 다시 씁니다. 맞춰야 할 항목은 [백엔드 연동 계약](backend-sync.md#f2-시작-전-합의할-것)에 있습니다.

```ts
export type ISODate = string;
export type PageId = string;
export type UserId = string;
export type WorkspaceId = string;

export interface User {
  id: UserId;
  name: string;
  /** 커서 색. F10에서 그대로 씁니다 */
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
  /** 형제 사이 순서. 소수를 끼워넣어 재배치합니다 (F6) */
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
  /** 저장 충돌 감지용. 저장할 때마다 1 증가 (F4) */
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

지금 안 쓰는 필드가 셋 들어 있습니다. 나중에 타입을 다시 고치지 않으려는 것입니다.

| 필드 | 쓰이는 곳 |
|---|---|
| `Page.version` | F4 — 저장 충돌 감지 |
| `Page.createdBy` · `updatedBy` | F5 — 사용자 표시 |
| `User.color` | F10 — 협업 커서 색 |

---

### 2. mock 만들기 (4시간)

- [ ] `api/storage.ts` — localStorage 읽기·쓰기. 키에 버전을 붙이고(`knoc.db.v1`), 데이터가 깨져 있으면 안전하게 초기화
- [ ] `api/client.ts` — **모든 호출이 지나가는 곳. F4에서 여기만 fetch로 바뀝니다**
  - `?slow=1` → 3초 지연 (Skeleton 확인용)
  - `?fail=save` → 저장 실패 (F3~F4 테스트에 필요)
  - 모든 오류를 `ApiError`로 통일
- [ ] `api/pages.ts` — `getPageTree` / `getPage` / `createPage` / `updatePage` / `deletePage`. 삭제는 `deletedAt`만 채웁니다
- [ ] `api/seed.ts` — 첫 실행 시 샘플 페이지 5개(2단계 중첩). F4에서 제거

**mock의 응답 모양을 실제 API 응답과 똑같이 맞춥니다.** 껍데기(`{ data: ... }`)를 씌울지 말지도 지금 정합니다.

---

### 3. Query 설정 (1시간 30분)

- [ ] `lib/queryClient.ts`
  - `staleTime: 30초`
  - `retry: 1`
  - `refetchOnWindowFocus: false` — 문서 쓰는 중에 다시 불러오면 방해가 됩니다
- [ ] `lib/queryKeys.ts` — [구조 문서](architecture.md#쿼리-키) 참고
- [ ] `main.tsx`에 `QueryClientProvider` + DevTools (개발 모드만)
- [ ] `hooks/usePageTree.ts` · `usePage.ts` · `useCreatePage.ts` · `useRenamePage.ts` · `useDeletePage.ts`
- [ ] 변경 훅 세 개는 **낙관적 업데이트** — 서버 응답을 기다리지 않고 화면부터 바꾸고, 실패하면 되돌리고 토스트

---

### 4. 트리 로직 (`features/page-tree/`) (2시간)

- [ ] `flattenTree.ts` — 페이지 목록 + 펼쳐진 id 집합 → F1에서 정한 평평한 배열

  ```ts
  interface FlatRow {
    page: PageSummary;
    depth: number;
    isExpanded: boolean;
    hasChildren: boolean;
  }
  ```

- [ ] `useExpandedIds.ts` — 펼침 상태를 localStorage에 유지
- [ ] `PageTreeContainer.tsx` — 훅과 `components/tree/PageTree`를 잇는 유일한 곳

---

### 5. 화면 조립 (3시간)

- [ ] `Sidebar`에 트리 연결 + `+` 버튼으로 페이지 생성
- [ ] 행 우클릭 메뉴 — 하위 페이지 추가 / 이름 바꾸기 / 삭제 (F1의 `Menu`)
- [ ] `TopBar`에 `Breadcrumb` 연결
- [ ] `PageRoute` — 로딩(Skeleton) / 404 / 에러 / 성공 갈래 처리
- [ ] `features/editor/PageTitle.tsx` — 한 줄 편집. 34px / 700 / −0.035em, 비어 있으면 `제목 없음`
  - Enter나 ↓를 누르면 본문으로 포커스가 넘어갑니다 (본문은 F3에서 연결)
- [ ] 첫 실행 빈 화면 (F1의 `EmptyState`)

  > 페이지가 아직 없어요
  > 첫 페이지를 만들면 왼쪽 목록에 쌓여요.
  > `[페이지 만들기]`

---

### 6. 키보드 조작 (1시간 30분)

- [ ] ↑ ↓ 행 이동 / → ← 펼침·접힘 / Enter 열기 / Delete 삭제
- [ ] 삭제 후 포커스가 사라지지 않게 다음 행으로 옮깁니다

---

### 7. 테스트 (1시간)

- [ ] `flattenTree` 유닛 테스트
- [ ] `createPage` 하면 트리에 나타난다 / 없는 id로 `getPage` 하면 `not_found` / 저장 데이터가 깨져 있으면 안전하게 초기화된다
- [ ] "만들기 → 목록에 나타남 → 클릭 → 열림" 통합 테스트 1개

---

## 완료 조건

- [ ] 새로고침해도 방금 만든 페이지가 남아 있고, URL로 바로 열린다
- [ ] 페이지가 0개면 빈 화면이 뜨고, 버튼으로 첫 페이지가 만들어진다
- [ ] 만들기·이름변경·삭제가 즉시 반영되고, 실패하면 되돌아가고 토스트가 뜬다
- [ ] `?slow=1`로 Skeleton이, `?fail=save`로 ErrorState가 실제로 뜬다
- [ ] 마우스 없이 트리를 끝까지 조작할 수 있다
- [ ] 샘플 300개를 넣어도 트리가 눈에 띄게 안 밀린다 (가상 스크롤은 F6)
- [ ] `src/api/` 밖에서 `localStorage`를 직접 부르는 곳 0개 (`useSidebarResize`·`useExpandedIds`는 UI 상태라 예외)
- [ ] `src/components/` 안에서 `useQuery`를 import 하는 곳 0개
- [ ] `src/types/api.ts`를 백엔드에 그대로 공유할 수 있다

[공통 완료 조건](conventions.md)도 함께 확인합니다.

---

## 끝나면 할 수 있는 것

페이지를 만들고, 제목을 붙이고, 목록에서 찾아 열고, 지울 수 있습니다.
**본문이 없는 노션**이 됩니다.

---

← [F1](sprint-1.md) · 다음 → [F3](sprint-3.md)
