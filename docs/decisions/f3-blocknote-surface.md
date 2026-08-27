# F3 §0 — BlockNote 표면을 SEED 로 갈아 끼울 수 있는가

← [F3](../roadmap/sprint-3.md#0-첫날--사전-확인-3시간)

| | |
|---|---|
| 물음 | 슬래시 메뉴와 포맷 툴바를 SEED 스타일로 교체할 수 있는가 |
| 답 | **된다.** 이번 주 계획을 바꾸지 않습니다 |
| 확인한 것 | BlockNote 0.54.0 · 타입 · 빌드 · 번들 분리 · 항목 파이프라인 |
| 확인 못 한 것 | 브라우저에서의 위치·키보드 동작 (§6 참고) |
| 버린 코드 | 확인용 스파이크는 지웠습니다. 남은 것은 이 문서입니다 |

---

## 결론

`SuggestionMenuController` 와 `FormattingToolbarController` 로 표면이 통째로 바뀝니다.
BlockNote CSS 를 끄거나 덮지 않고, **우리 마크업을 대신 그려 넣는** 방식이라 [DESIGN.md §7](../../DESIGN.md) 의 금지에 걸리지 않습니다.

```tsx
<BlockNoteView editor={editor} slashMenu={false} formattingToolbar={false}>
  <SlashMenu />
  <FormatToolbar />
</BlockNoteView>
```

`slashMenu={false}` 를 준 뒤 실제로 DOM 에 `.bn-suggestion-menu` 도 `.bn-formatting-toolbar` 도 남지 않는 것을 확인했습니다. 트리거 자체는 살아 있습니다 — `/` 를 치면 ProseMirror 가 `.bn-suggestion-decorator` 를 붙입니다.

**둘의 난이도가 다릅니다.** 슬래시 메뉴는 Controller 가 필터링·키보드 이동·선택 상태를 다 넘겨주지만, 포맷 툴바는 아무것도 넘겨주지 않습니다. §2 의 4시간은 툴바 쪽으로 더 배분해야 합니다.

| | 슬래시 메뉴 | 포맷 툴바 |
|---|---|---|
| Controller 가 주는 것 | `items` · `selectedIndex` · `onItemClick` · `loadingState` | `blockTypeSelectItems?` 하나뿐 |
| 우리가 읽어야 하는 것 | 없음 | 켜짐 여부 — `useActiveStyles(editor)` |
| 목록의 출처 | `getDefaultSlashMenuItems(editor)` | `useSelectedBlocks` · `editor.toggleStyles` |

---

## 막힐 뻔한 것 넷

### 1. `key` 가 React 쪽 타입에서 잘려 있습니다

`getDefaultReactSlashMenuItems` 가 돌려주는 타입이 이렇습니다.

```ts
type DefaultReactSuggestionItem = Omit<DefaultSuggestionItem, "key"> & { icon?; size? }
//                                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ key 가 없다
```

런타임에는 `key` 가 그대로 들어 있습니다(`{...item, icon}` 로 만들 뿐입니다). **타입에만 없습니다.**

`key` 가 필요한 이유는 **항목을 고르고 정렬하는 기준이 title 이면 안 되기 때문**입니다. 우리는 `dictionary: ko` 를 쓰고 있어서 title 이 `"인용"` · `"코드 블록"` 입니다. title 로 거르면 BlockNote 가 번역을 다듬는 순간 메뉴에서 항목이 조용히 사라집니다.

**core 쪽 목록을 씁니다.**

```ts
import { getDefaultSlashMenuItems, filterSuggestionItems } from "@blocknote/core/extensions";
//                                    ↑ "@blocknote/core" 가 아니라 /extensions 입니다
```

이쪽은 `key` 를 그대로 들고 있습니다. 잃는 것은 BlockNote 가 붙여 주는 아이콘 하나뿐인데, 그건 **어차피 버려야 합니다** — 아래 3번.

### 2. 제네릭이 `getItems` 에서 추론되지 않습니다

`SuggestionMenuController` 의 props 가 조건부 타입이라, `getItems` 만 넘기면 타입 인자가 기본값으로 떨어집니다. 그러면 `suggestionMenuComponent` 가 안 맞는다는 긴 에러가 납니다.

```tsx
<SuggestionMenuController<(query: string) => Promise<SlashItem[]>>
  triggerCharacter="/"
  suggestionMenuComponent={SlashMenuList}
  onItemClick={(item) => item.onItemClick()}
  getItems={async (query) => filterSuggestionItems(slashItems(editor), query)}
/>
```

타입 인자를 손으로 적으면 통과합니다. `onItemClick` 도 같이 넘겨야 합니다 — 기본 항목 타입에서 벗어나는 순간 optional 이 아니게 됩니다.

### 3. `badge` 는 마크다운 단축 표기가 아닙니다

[DESIGN.md §5](../../DESIGN.md) 는 각 항목에 마크다운 단축 표기를 같이 보이라고 합니다. `badge` 가 그 자리처럼 보이지만, BlockNote 가 넣는 값은 **키보드 단축키**입니다.

| key | BlockNote 기본 badge | 우리가 넣어야 하는 것 |
|---|---|---|
| `heading` | `Ctrl+Alt+1` | `# ` |
| `heading_2` | `Ctrl+Alt+2` | `## ` |
| `bullet_list` | `Ctrl+Shift+8` | `- ` |
| `numbered_list` | `Ctrl+Shift+7` | `1. ` |
| `check_list` | `Ctrl+Shift+9` | `[] ` |
| `code_block` | `Ctrl+Alt+C` | ` ``` ` |
| `paragraph` | `Ctrl+Alt+0` | (없음) |
| `quote` · `divider` | 없음 | `> ` · `--- ` |

마크다운 표기는 사전에도 없습니다. **우리가 표를 들고 있어야 합니다.** `subtext` 도 아닙니다 — ko 사전에서 `subtext` 는 `"섹션 제목(대)"` 같은 설명문입니다.

### 4. 기본 순서가 우리 순서가 아닙니다

`getDefaultSlashMenuItems` 는 24개를 **BlockNote 순서**로 줍니다. 제목1·2·3 → 인용 → 접을 수 있는 목록 → 번호 → 불릿 → 체크 → **본문** → 코드 → 구분선 → 표 → 이미지 … 본문이 한가운데 있습니다.

우리 순서로 다시 세워야 합니다. `key` 를 순서 배열로 두고 그 인덱스로 정렬하면, 고르기와 정렬이 표 하나로 끝납니다.

```ts
const ORDER = new Map(
  ["paragraph", "heading", "heading_2", "heading_3", "bullet_list",
   "numbered_list", "check_list", "code_block", "quote", "divider"]
    .map((key, index) => [key, index]),
);

getDefaultSlashMenuItems(editor)
  .filter((item) => ORDER.has(item.key))
  .sort((a, b) => ORDER.get(a.key)! - ORDER.get(b.key)!)
```

**메뉴는 8줄이 아니라 10줄입니다.** 로드맵의 "블록 8종" 은 블록 종류를 센 것이고(문단 · 제목 · 불릿 · 번호 · 체크 · 코드 · 인용 · 구분선), 제목은 메뉴에서 1·2·3 세 줄로 나옵니다. 폭 320px · 행 32px 은 그대로 두되 세로 스크롤이 붙는 높이를 정해야 합니다.

---

## 결정이 필요한 것 — 슬래시 메뉴 아이콘

**BlockNote 기본 아이콘을 쓸 수 없습니다.** 인라인 SVG 로 박혀 있고 seed-icon 이 아닙니다. [DESIGN.md §8](../../DESIGN.md) 은 "아이콘은 seed-icon만" 입니다.

`@karrotmarket/react-monochrome-icon` 680개를 이름과 `@alias` 양쪽으로 뒤진 결과입니다.

| 블록 | seed-icon | |
|---|---|---|
| 인용 | `IconQuotationmark2LeftLine` | 별칭에 `인용` 이 있습니다 |
| 불릿 | `IconDothorizline3VerticalLine` | 별칭 `bullets` · `목록` |
| 체크박스 | `IconHorizline3VerticalCheckmarkLine` | 별칭 `체크` · `목록` |
| 본문 | `IconHorizline3VerticalLine` | 모양은 맞지만 별칭이 `더보기` · `메뉴` 쪽입니다 |
| 구분선 | `IconMinusLine` | 별칭이 `빼기` · `제거` 입니다 |
| 제목1·2·3 | `IconHashLine` | `#` 하나뿐 — **1·2·3 을 구분할 수 없습니다** |
| 번호 목록 | **없음** | |
| 코드 블록 | **없음** | |

§8 은 "필요한 아이콘이 없으면 가져오고, 직접 그리지 않습니다" 라고 합니다. **어디서 가져올지가 정해져 있지 않습니다.** 후보 셋입니다.

- **A. 아이콘을 빼고 글자만.** 320px 폭에 제목 + 마크다운 표기면 행이 비어 보이지 않습니다. 노션도 아이콘 없이 쓰던 시절이 있었습니다. 가장 싸고, §8 을 어기지 않습니다
- **B. 마크다운 표기를 아이콘 자리로.** `#` · `##` · `-` · `1.` 을 왼쪽에 모노스페이스로 세웁니다. 아이콘이 아니라 글자라 §8 밖입니다. 배지 자리는 비웁니다
- **C. seed-icon 에 없는 것만 요청.** 번호 목록 · 코드 블록 · 제목1·2·3 다섯을 SEED 팀에 올립니다. 이번 주 안에는 안 옵니다

§0 은 여기까지입니다. **§2 를 시작하기 전에 하나를 골라야 합니다.**

---

## §6 테스트에 영향 — 메뉴 본체는 유닛으로 못 봅니다

메뉴 본체를 jsdom 에서 띄우지 못했습니다. 원인은 BlockNote 가 아니라 **레이아웃이 없다는 것**입니다.

- floating-ui 가 `size` 미들웨어로 `maxHeight` 를 계산하는데, jsdom 의 모든 rect 가 0 입니다
- `document.elementFromPoint` · `elementsFromPoint` 가 jsdom 에 아예 없습니다. 드래그 핸들(마우스 위치로 블록 찾기)과 클릭 캐럿 배치가 이걸 부릅니다
- `window.matchMedia` · `ResizeObserver` · `Range.getClientRects` 도 없고, jsdom 의 `getBoundingClientRect` 는 `toJSON` 이 없는 평평한 객체를 줍니다 (BlockNote 가 `toJSON` 을 부릅니다)

폴리필을 다 채워도 `maxHeight: 0px` 는 남습니다. **jsdom 을 더 손볼 문제가 아니라 검사를 가를 문제입니다.** §6 을 이렇게 갈랐습니다 ([테스트 정책](../roadmap/architecture.md#테스트)).

| 검사 | 어디서 | 왜 |
|---|---|---|
| 슬래시 메뉴 **목록** — 고르기 · 정렬 · 배지 | F3 유닛 | 순수 함수. 뜨는 것이 없습니다 |
| 슬래시 메뉴로 제목 블록 **삽입** | F4 Playwright | 메뉴가 실제로 떠야 합니다 |

**위험한 쪽이 유닛에 남습니다.** 고르기·정렬·배지 갈아 끼우기를 순수 함수로 떼어내면 그대로 검사됩니다. 스파이크에서 이렇게 4개를 통과시켰습니다.

```ts
const items = slashItems(BlockNoteEditor.create({ schema: knocSchema, dictionary: ko }));

expect(items.map((i) => i.key)).toEqual([...ORDER]);  // 우리 것만, 우리 순서로
expect(byKey.get("quote")).toBe("인용");               // 제목은 ko 사전에서
expect(byKey.get("heading")).toBe("# ");              // 배지는 마크다운 표기로
```

**이 4개는 jsdom 조차 필요 없습니다.** `typeof document === "undefined"` 인 순수 node 에서 `BlockNoteEditor.create()` · `ko` 사전 · `getDefaultSlashMenuItems` · `filterSuggestionItems` 가 전부 돕니다 — 따로 확인했습니다. vitest `environment` 는 기본값 `node` 로 둡니다.

§2 에서 `SlashMenu.tsx` 를 쓸 때 **목록을 만드는 부분을 컴포넌트 밖으로 빼 두세요.** 그 자리가 §6 에서 테스트할 수 있는 유일한 자리입니다.

---

## 덤으로 확인한 것 — 번들

교체를 얹은 채로 빌드했습니다. [F3 완료 조건](../roadmap/sprint-3.md#완료-조건)의 두 줄이 이미 통과합니다.

| | gzip | 기준 |
|---|---|---|
| 첫 화면 (`index.js` + `index.css`) | **124.2 KB** | 300 KB 이하 ✅ |
| 에디터 청크 (`BlockEditor.js` + `.css`) | 368.6 KB | 별도 번들 ✅ |

에디터 CSS 36.5 KB 가 `BlockEditor` 청크로 따라간 것도 확인했습니다 — `BlockEditor.tsx` 안에서 `@blocknote/mantine/style.css` 를 부르는 이유입니다.

코드 블록 하이라이터(Shiki)가 언어별로 잘게 쪼개져서 `cpp` 81 KB · `typescript` 17 KB 처럼 따로 떨어집니다. 첫 화면에도 에디터 청크에도 안 얹힙니다.
