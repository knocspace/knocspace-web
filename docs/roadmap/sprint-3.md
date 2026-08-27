# F3 · 에디터와 자동 저장 — 화면 MVP

← [로드맵으로](../../ROADMAP.md)

| | |
|---|---|
| 기간 | 1주 (약 15시간) |
| 선행 | F2 |
| 백엔드 | B3 진행 중 — 기다리지 않습니다 |
| 우선순위 | P0 |
| 결과물 | **화면 MVP 완성** (데이터는 아직 localStorage) |

---

## 목표

문서에 BlockNote를 얹고, 쓴 게 남게 합니다.

**서버가 있어야 하는 저장 로직은 여기서 안 합니다.** 버전 충돌·재시도·오프라인은 [F4](sprint-4.md)입니다. 여기서는 mock 상대로 "멈추면 저장되고, 새로고침해도 남는다"까지입니다.

## 만드는 것

- BlockNote 통합 + SEED 색 연결
- 블록 8종 — 문단 / 제목1·2·3 / 불릿 / 번호 목록 / 체크박스 / 코드 / 인용 / 구분선
- 슬래시 메뉴 (SEED 스타일, 폭 320px, 행 32px, 마크다운 단축 표기 같이 표시, **10줄** — DESIGN.md §5)
- 포맷 툴바 (SEED 스타일, 높이 34px, 켜진 버튼만 `bg-brand-weak`)
- 마크다운 단축 입력
- 자동 저장 + 저장 상태 표시 + 이탈 경고
- 빈 문서 상태 — 컴포넌트 없이 안내 문구 두 줄

---

## 먼저 읽을 것

이 스프린트의 설계 결정이 F10(실시간 협업)의 난이도를 정합니다.
**[프론트엔드 구조 — 에디터 구조](architecture.md#에디터-구조--나중에-yjs를-붙이기-위한-준비)를 먼저 읽고 시작하세요.**

요약하면 네 가지입니다.

1. 문서의 원본은 에디터 하나뿐 — 블록을 React state로 복사하지 않습니다
2. 블록 id는 클라이언트가 만듭니다
3. 문서 내용은 `features/editor/` 밖에서 열어보지 않습니다
4. `useEditorDoc` 훅 하나로 감싸서, F10에서 훅 안쪽만 바꿉니다

---

## 할 일

### 0. 첫날 — 사전 확인 (3시간) — 끝

BlockNote의 슬래시 메뉴를 SEED 스타일로 교체할 수 있는지 **작은 예제로 먼저 확인합니다.** 여기가 막히면 이번 주 계획을 바꿔야 하므로, 다른 작업보다 먼저 합니다.

**[결과 — BlockNote 표면 교체](../decisions/f3-blocknote-surface.md). 됩니다. 계획을 바꾸지 않습니다.**

BlockNote CSS 를 끄거나 덮지 않고 **우리 마크업을 대신 그려 넣는** 방식이라 §7 의 금지에 걸리지 않습니다. `slashMenu={false}` 를 준 뒤 DOM 에 기본 표면이 남지 않는 것까지 확인했습니다.

확인 중에 나온 것들은 **§2 · §6 · 완료 조건에 각각 반영했습니다.** 여기서 다시 읽을 필요는 없습니다.

#### 이름 — 우리 것과 BlockNote 것

**BlockNote 에 `SlashMenuController` 는 없습니다.** 슬래시 메뉴는 `/` 를 트리거로 받는
suggestion 메뉴의 한 경우라서, 실제 export 이름이 `SuggestionMenuController` 입니다.
`GridSuggestionMenuController`(이모지)도 같은 계열입니다.

그래서 **우리 이름으로 한 겹 감쌉니다.** 이 프로젝트에서 부르는 이름은 `SlashMenu` ·
`FormatToolbar` 이고, 파일 이름과 export 이름이 같습니다 (`PageTree.tsx` → `PageTree` 와
같은 규칙).

| 우리 이름 | 파일 | 그 안에서만 쓰는 BlockNote 이름 |
|---|---|---|
| `SlashMenu` | `features/editor/SlashMenu.tsx` | `SuggestionMenuController` |
| `SlashMenuList` | 〃 (같은 폴더의 표면 부품) | — |
| `FormatToolbar` | `features/editor/FormatToolbar.tsx` | `FormattingToolbarController` |

**`SuggestionMenuController` 가 `SlashMenu.tsx` 밖에 나오면 안 됩니다.** 다른 규칙이 아니라
`useEditorDoc` 과 같은 이유입니다 — 라이브러리 이름이 화면 코드까지 퍼지면 F10 에서 안쪽을
바꿀 때 바꿔야 할 자리가 늘어납니다.

**다만 §2 를 시작하기 전에 닫아야 할 결정이 하나 생겼습니다 — 슬래시 메뉴 아이콘.**
BlockNote 기본 아이콘은 seed-icon 이 아니라 §8 위반이고, seed-icon 에는 번호 목록과 코드 블록이 없으며 제목1·2·3 을 구분할 아이콘도 없습니다. 후보 셋을 [DESIGN.md §6](../../DESIGN.md#6-미결정과-확정-기록) 에 올려 뒀습니다. **고르기 전에는 아이콘 자리를 임의로 채우지 마세요.**

### 1. 설치와 색 연결 (2시간)

- [x] 설치 — `@blocknote/core` · `@blocknote/react` · `@blocknote/mantine` · `@blocknote/code-block`

  코드 블록의 하이라이트(Shiki)와 언어 목록이 `code-block` 에 따로 있습니다. 코어의 기본
  코드 블록은 하이라이트가 꺼져 있고 언어 목록이 비어 있습니다 — `schema.ts` 참고.

- [x] `src/styles/blocknote-bridge.css` 작성 — DESIGN.md §7의 변수 표를 그대로 옮깁니다
- [x] `index.css`에 import
- [x] 하이라이트 8색을 SEED 스케일로 — 글자 500 · 배경 200
- [x] 체크박스 `accent-color` — 안 걸면 체크 표시가 SEED 보라가 아니라 OS 기본 파랑입니다
- [ ] `knocspace.css` 에 문서 제목 토큰 — `--knoc-text-doc-title` · `--knoc-tracking-doc-title`. 에디터 밖이라 브리지를 안 거칩니다. `PageTitle` 을 만드는 §3 에서 같이 넣습니다 (DESIGN.md §2)
- [x] **예외 네 줄** — 색 셋(인용 · 구분선 · 코드 블록 반경) + 글꼴 하나(본문 서체). 변수가 안 달려 있어서 자손 선택자로만 닿습니다 (DESIGN.md §7)

**BlockNote CSS를 끄거나, `!important`로 덮지 않습니다.** 변수만 SEED 쪽을 가리키게 바꿉니다. 이걸 어기면 BlockNote를 올릴 때마다 깨집니다.

**자손 선택자는 DESIGN.md §7 이 연 네 줄만 씁니다.** 그 밖에 새로 여는 것은 §7 을 고친 다음입니다. `!important` 없이 명시도로 이깁니다.

**`--bn-font-family` 는 본문에 안 닿습니다.** 그 변수를 읽는 규칙은 `.bn-root` 하나인데, `.bn-default-styles` 가 안쪽 `.bn-editor` 에 같이 붙어서 Inter 스택을 직접 선언하고 상속을 끊습니다. 변수만 걸어 두면 **사이드바는 시스템 글꼴인데 본문만 Inter · Open Sans** 로 나옵니다. 스택이 달라서 한글 대체 글꼴도 같이 갈립니다 — 문서만 따로 노는 이유입니다.

**문서 안쪽 제목 크기와 줄간은 BlockNote 것을 따릅니다.** 26 · 20 · 17px 로 줄여 봤지만 본문과의 위계가 눌려서 되돌렸습니다 (DESIGN.md §2). 34px 짜리 문서 제목은 이것과 다른 것이고, `PageTitle` 이 §3 에서 맡습니다.

**코드 블록은 배경을 안 건드리고 반경만 가져옵니다.** 라이트에서도 검정으로 남습니다 — 표면을 뒤집으려면 Shiki 문법색까지 같이 뒤집어야 해서 [DESIGN.md §6](../../DESIGN.md#6-미결정과-확정-기록) 에 열려 있습니다. **F3 밖으로 미뤄도 됩니다.**

### 2. 에디터 (`features/editor/`) (4시간)

**시간을 반씩 나누지 마세요.** 훅은 이미 있고, 남은 무게는 툴바 쪽입니다 (§0).

| | 시간 | Controller 가 주는 것 | 우리가 읽어야 하는 것 |
|---|---|---|---|
| `BlockEditor` 손보기 | 0.5h | — | — |
| `slashItems` | 1h | — | — |
| `SlashMenu` | 1h | `items` · `selectedIndex` · `onItemClick` · `loadingState` | 없음 |
| `FormatToolbar` | 1.5h | `blockTypeSelectItems?` 하나뿐 | 켜짐 여부 — `useActiveStyles(editor)` |

- [x] `useEditorDoc.ts` — 초기 블록 배열을 받아 로컬 에디터를 만듭니다. `collaboration?` 자리를 optional 로 열어 뒀습니다
- [ ] `BlockEditor.tsx` — `onChange`를 밖으로 넘겨주기만 합니다. `slashMenu={false}` · `formattingToolbar={false}` 를 주고 `SlashMenu` · `FormatToolbar` 를 자식으로 넣습니다
- [ ] `slashItems.ts` — **목록을 만드는 부분을 컴포넌트 밖에 둡니다.** jsdom 에서 메뉴가 안 떠서, §6 이 검사할 수 있는 자리가 여기뿐입니다
- [ ] `SlashMenu.tsx` — `SlashMenu` 와 표면 부품 `SlashMenuList`
- [ ] `FormatToolbar.tsx` — 버튼 상태는 `useActiveStyles` 로 직접 읽습니다

`slashItems.ts` 에서 지킬 것 셋입니다.

- **목록은 `@blocknote/core/extensions` 의 `getDefaultSlashMenuItems` 로 가져옵니다.** React 쪽 `getDefaultReactSlashMenuItems` 는 타입에서 `key` 를 지워 버려서, 항목을 고를 기준이 `title` 밖에 안 남습니다. 우리는 `dictionary: ko` 라 title 이 `"인용"` 이고, BlockNote 가 번역을 다듬으면 메뉴에서 항목이 조용히 사라집니다
- **고르기와 정렬을 `key` 순서 배열 하나로 합칩니다.** 기본 순서는 우리 순서가 아닙니다 — 본문이 한가운데 있습니다

  ```ts
  const ORDER = new Map(
    ["paragraph", "heading", "heading_2", "heading_3", "bullet_list",
     "numbered_list", "check_list", "code_block", "quote", "divider"]
      .map((key, index) => [key, index]),
  );
  ```

- **마크다운 단축 표기는 우리 표에서 옵니다.** BlockNote 의 `badge` 는 키보드 단축키(`heading` → `Ctrl+Alt+1`)이고, `subtext` 는 `"섹션 제목(대)"` 같은 설명문입니다. `# ` · `- ` · `1. ` 은 사전 어디에도 없습니다

`SlashMenu.tsx` 는 이렇게 생깁니다. **`SuggestionMenuController` 가 보이는 유일한 파일입니다.**

```tsx
// features/editor/SlashMenu.tsx
export function SlashMenu({ editor }: { editor: KnocEditor }) {
  return (
    <SuggestionMenuController<(query: string) => Promise<SlashItem[]>>
      triggerCharacter="/"
      suggestionMenuComponent={SlashMenuList}
      onItemClick={(item) => item.onItemClick()}
      getItems={async (query) => filterSuggestionItems(slashItems(editor), query)}
    />
  );
}
```

**타입 인자를 손으로 적어야 합니다.** props 가 조건부 타입이라 `getItems` 만으로는 추론이 기본값(`DefaultReactSuggestionItem`)으로 떨어지고, `suggestionMenuComponent` 가 안 맞는다는 긴 에러가 납니다. 같은 이유로 `onItemClick` 도 optional 이 아니게 되니 같이 넘깁니다.

### 3. 조립 (2시간)

- [ ] `components/PageTitle/PageTitle.tsx` — `InlineInput` 을 `variant="bare"` 로 감쌉니다
- [ ] `PageRoute`에서 `DocumentSurface` 안에 `PageTitle` + `BlockEditor` 배치
- [ ] 제목에서 Enter/↓ → 첫 블록으로 포커스
- [ ] 빈 문서 문구 (DESIGN.md §9)

  > 제목 자리: `제목 없음`
  > 첫 줄: `바로 쓰거나, / 를 눌러 블록을 넣으세요`
  > 버튼 없음 — 다음 행동이 클릭이 아니라 타이핑입니다

- [x] 에디터를 `React.lazy`로 분리해서 첫 화면 로딩에 안 얹히게

**BlockNote 에는 페이지 제목이 없습니다.** 문서가 블록 배열 하나가 전부입니다. 지금 `sampleDoc` 의 첫 블록이 제목1 로 제목인 척하고 있는데, F2 에서 `Page.title` 이 오는 순간 둘을 갈라야 합니다.

`InlineInput` 을 그대로 쓸 수 있는지 한 번 붙여 봤습니다. **되지만 세 군데가 걸립니다** — 만들 때 참고하세요.

- **평상시가 더블클릭입니다.** 트리 행에서는 한 번 누르는 것이 "그 페이지 열기" 라 맞지만, 이미 열려 있는 문서 제목은 한 번에 들어가야 합니다. 감싼 쪽 `onClick` 으로 열면 됩니다
- **`↓` 를 `stopPropagation` 으로 막습니다.** 트리에서 행이 같이 움직이지 않게 하는 것인데, 제목에서 본문으로 내려가는 키가 그거라 `onKeyDownCapture` 로 먼저 잡아야 합니다
- **`truncate` 가 박혀 있습니다.** 28px 트리 행에는 맞지만 34px 제목이 잘리면 뒷부분을 영영 못 봅니다. 접으려면 편집 중에도 `textarea` 여야 합니다 — `input` 은 CSS 로 뭘 해도 한 줄이라, 평상시만 접히면 상태마다 박스 크기가 달라져서 이 컴포넌트가 지키기로 한 것을 깹니다

**그리고 `InlineInput` 에 버그가 하나 있습니다.** `selectOnEdit={false}` 일 때 캐럿이 끝이 아니라 **맨 앞**에 섭니다 — `select()` 를 안 하면 브라우저가 0 에 세우기 때문입니다. DESIGN.md §10 이 "문서 제목은 뒤에 덧붙이는 일이 많아" 라고 한 동작이 지금 반대로 납니다. `setSelectionRange(끝, 끝)` 한 줄이면 됩니다.

**포커스 이동은 `BlockEditor` 가 핸들로 열어야 합니다.** 에디터 인스턴스 자체를 내보내면 안 됩니다 — 문서 내용을 밖에서 열어볼 수 있게 되고, F10 에서 안쪽을 Yjs 로 바꿀 때 밖까지 깨집니다 ([architecture.md](architecture.md#에디터-구조--나중에-yjs를-붙이기-위한-준비)).

### 4. 자동 저장 (`features/editor/useAutosave.ts`) (3시간)

언제 저장할지:

| 시점 | 동작 |
|---|---|
| 타이핑이 멈추고 800ms | 저장 |
| 계속 타이핑해도 5초마다 | 강제 저장 |
| 포커스가 빠지거나 창을 닫을 때 | 즉시 저장 |

- [ ] 저장이 진행 중일 때 새 저장 요청이 오면, 앞의 것을 취소하고 **마지막 것만** 보냅니다
- [ ] 저장 중에도 타이핑은 막지 않습니다
- [ ] `hooks/useSavePage.ts` — 낙관적 업데이트. 목록의 제목과 수정 시각이 바로 반영됩니다
- [ ] `features/editor/useUnsavedGuard.ts` — 저장 안 된 상태에서 페이지를 벗어나려 하면 경고

### 5. 저장 상태 표시 (1시간)

F1에서 만든 `SaveStatus`에 실제 상태를 연결합니다. 문구는 사과하지 않습니다 (DESIGN.md §8).

| 상태 | 문구 |
|---|---|
| 저장 중 | 저장 중 |
| 완료 | 저장됨 |
| 실패 | 저장 실패 · 다시 시도 |

### 6. 테스트 (1시간)

**여기서 vitest 를 처음 켭니다.** F1·F2 에는 러너가 없었습니다.

- [ ] `package.json` 에 `"test": "vitest"` 한 줄. **`vite.config.ts` 는 안 건드립니다** —
      `BlockNoteEditor.create()` · `getDefaultSlashMenuItems` 가 `document` 없이 돕니다(확인함).
      기본 `environment: "node"` 로 충분합니다
- [ ] devDependencies 에서 `jsdom` 과 `@testing-library/*` 3종 제거 — 쓸 자리가 없습니다

유닛 — 컴포넌트를 띄우지 않고 도는 것만:

- [ ] 슬래시 메뉴 목록 — 정한 것만, 정한 순서로, 배지가 마크다운 표기다 (`slashItems.ts`)
- [ ] 타이핑을 멈추면 `updatePage`가 한 번만 불린다 — **디바운스를 훅 밖 유틸로 빼 두면** 가짜 타이머로 검사됩니다
- [ ] [F2 §7](sprint-2.md#7-테스트-1시간--f3-으로-넘어갔습니다) 에서 넘어온 둘 — `visibleItems` · api mock

F4 의 E2E 로 넘기는 것:

- [ ] 마크다운 단축 입력 (`# `, `- `, `1. `, `> `) — 키 입력이라 살아 있는 뷰가 필요합니다
- [ ] 슬래시 메뉴로 제목 블록 삽입

**메뉴가 뜨는 것 자체는 jsdom 으로 못 봅니다** (§0 결과). floating-ui 가 레이아웃을 필요로 하는데 jsdom 은 모든 rect 가 0 이고, `elementFromPoint` 도 없습니다. 폴리필로도 안 됩니다. 그래서 위처럼 **목록 검사와 삽입 검사를 갈라 놓았습니다** — 목록을 만드는 함수를 컴포넌트 밖에 두면 에디터 인스턴스 하나로 검사되고, 삽입은 브라우저가 있는 F4 로 갑니다 ([테스트 정책](architecture.md#테스트)).

---

## 완료 조건

- [ ] 블록 8종을 슬래시 메뉴와 마크다운 단축 양쪽으로 만들 수 있다 (메뉴는 10줄)
- [ ] 슬래시 메뉴 항목을 `title` 로 고르는 코드 0개 — 기준은 `key` 다
- [ ] 슬래시 메뉴 배지가 마크다운 표기다. `Ctrl+Alt+1` 이 보이는 곳 0개
- [ ] 슬래시 메뉴 아이콘이 [DESIGN.md §6](../../DESIGN.md#6-미결정과-확정-기록) 에서 고른 방식을 따른다
- [ ] `SuggestionMenuController` · `FormattingToolbarController` 가 `SlashMenu.tsx` · `FormatToolbar.tsx` 밖에 나오는 곳 0개
- [ ] 타이핑을 멈추면 1초 안에 `저장됨`으로 바뀌고, 새로고침해도 내용이 남는다
- [ ] mock 지연을 3초로 올려도(`?slow=1`) 타이핑이 끊기지 않는다
- [ ] `?fail=save`로 실패를 넣으면 `저장 실패`가 뜬다
- [ ] BlockNote 기본 CSS를 `!important` 로 덮은 곳 0개
- [ ] 자손 선택자가 DESIGN.md §7 이 연 네 줄 말고 0개
- [ ] BlockNote 기본 슬래시 메뉴·툴바가 DOM 에 남아 있지 않다
- [ ] 라이트·다크 모두에서 에디터 색이 SEED 토큰을 따른다
      — **코드 블록 표면과 Shiki 문법색은 예외.** 다크 고정입니다 ([DESIGN.md §6](../../DESIGN.md#6-미결정과-확정-기록))
- [x] 에디터가 별도 번들로 분리되고, 첫 화면 번들이 300KB(gzip) 이하
      — §0 에서 확인. 첫 화면 124.2KB, 에디터 청크 368.6KB. §2·§3 이 끝나면 다시 잽니다
- [ ] 블록 내용이 React state에 복사돼 있는 곳 0개
- [ ] `Page.content`를 다루는 코드가 `features/editor/` 밖에 0개
- [ ] [MVP 판정 기준](mvp.md#mvp-판정-기준) 7개 전부 통과

[공통 완료 조건](conventions.md)도 함께 확인합니다.

---

## 끝나면 할 수 있는 것

**화면이 전부 완성됩니다.** 만들고, 쓰고, 저장되고, 다시 엽니다.
다만 데이터가 브라우저 안에만 있어서, 다른 기기에서는 안 보입니다. 그건 [F4](sprint-4.md)입니다.

---

## 다음을 위해 하나만 더

F4를 시작하기 전에 **백엔드와 엔드포인트·에러 코드·페이로드를 최종 확인**합니다. 확인할 목록은 [백엔드 연동 계약](backend-sync.md#f4-시작-전-확인할-것)에 있습니다.

---

← [F2](sprint-2.md) · 다음 → [F4](sprint-4.md)
