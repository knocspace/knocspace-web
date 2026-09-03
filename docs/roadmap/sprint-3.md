# F3 · 에디터와 자동 저장

← [로드맵으로](../../ROADMAP.md)

| 항목   | 내용                              |
| ---- | ------------------------------- |
| 기간   | 1주                              |
| 선행   | F2                              |
| 우선순위 | P0                              |
| 결과물  | 에디터 화면 MVP + localStorage 자동 저장 |

---

## 목표

페이지에서 문서를 작성하고 자동 저장할 수 있는 화면 MVP를 완성합니다.

F3에서는 **서버 저장을 구현하지 않습니다.**

* 문서 작성
* 새로고침 후에도 내용 유지
* 저장 상태 표시
* 저장되지 않은 상태에서 이탈 시 경고

서버 연동과 버전 충돌 처리는 F4에서 진행합니다.

---

## 진행 상황

### 완료

* [x] BlockNote 적용 가능 여부 확인
* [x] BlockNote 패키지 설치
* [x] SEED 색상 연결 (`blocknote-bridge.css`)
* [x] 스키마 확정 (`blocknote-schema.ts`)
* [x] 제목 1~3 스타일 적용
* [x] 코드 블록 하이라이트 (Shiki)
* [x] 코드 블록 언어 메뉴 직접 구현
* [x] `useContentEditor` 구현
* [x] `ContentEditor` 구현
* [x] 사이드 메뉴 위치 계산
* [x] 손잡이(⠿)를 눌러 블록 선택 — 고른 동안 포맷 툴바는 안 뜹니다
* [x] 끌어서 여러 블록 선택 — 줄을 넘어가면 블록이 통째로 잡힙니다 (Notion 규격)
* [x] 여백에서 끌어 여러 블록 선택 — 끄는 동안 사각형이 따라옵니다 (Notion 규격)
* [x] 바깥을 클릭하면 고른 블록이 풀립니다 — 빈 판 · 사이드바 · 상단바 · 문서 제목
* [x] 블록 선택 중의 키보드 — `Esc` · `Enter` · `Backspace` · 화살표 · `⌘A` · `⌘D` · `⌘X` · `⌘V`
* [x] `PageUp` · `PageDown` — 고른 블록이 있으면 선택이, 없으면 커서가 한 화면씩
* [x] 블록 전환 숫자키 — Notion 번호 그대로 (`⌘⌥0`~`8` · `Ctrl+Shift+0`~`8`)
* [x] `⌘Enter` — 체크박스 켜고 끄기 · 토글 열고 닫기
* [x] 마크다운 `>` + 공백 → 토글 목록 (Notion 규격)
* [x] 블록 메뉴(⠿) — 전환 · 색상 · 복제 · 삭제. 전환은 서브메뉴 열두 줄
* [x] 블록 색·블록 선택 면의 상자 — 반경 r1, 글줄 밖으로 3px · 6px (DESIGN.md §7)
* [x] `PageTitle` 구현
* [x] `PageIcon` · `PageIconPicker` 구현
* [x] 에디터 lazy loading 적용

### 남은 작업

* [x] 목차 블록
* [ ] SlashMenu 구현 (표면 교체 — 목차 항목은 기본 메뉴에 붙어 있습니다)
* [ ] FormatToolbar 구현
* [ ] 콜아웃 블록
* [x] 제목 ↔ 본문 포커스 이동 — 양방향입니다
* [ ] 자동 저장
* [ ] 저장 상태 표시
* [ ] 이탈 경고
* [ ] 테스트

---

# 1. 에디터

`pages/page-editor/` 안에서 BlockNote 관련 기능을 관리합니다.

문서의 원본은 에디터 하나입니다. 블록을 React state로 복사하지 않습니다.

### 완료

* [x] `model/blocknote-schema.ts` — 스키마가 곧 계약입니다. 여기 없는 블록은 문서에도 없습니다
* [x] `model/content-editor.ts` — 에디터를 만드는 훅. 한국어 로케일 · 표 옵션 · 자리 문구
* [x] `ui/ContentEditor/ContentEditor.tsx`
* [x] `ui/ContentEditor/LazyContentEditor.tsx`
* [x] `lib/blocknote-side-menu.ts` — ＋ · ⠿ 세로 위치
* [x] `lib/block-selection.ts` — ⠿ 를 누르면 그 블록에 NodeSelection 을 놓습니다. 여러 블록의 자리 계산도 여기입니다
* [x] `lib/blocknote-block-selection.ts` — 줄을 넘어간 선택을 블록 경계로 넓히고, 칠하고, 키보드를 답니다
* [x] `lib/block-range-selection.ts` — 구분선처럼 글자가 없는 블록이 가장자리일 때의 선택
* [x] `lib/blocknote-marquee-selection.ts` — 여백에서 시작한 끌기를 듣고, 끄는 동안 사각형을 그립니다
* [x] `ui/ContentEditor/BlockSideMenu.tsx` — 기본 사이드 메뉴 + 손잡이 클릭 선택
* [x] `ui/ContentEditor/BlockDragHandleMenu.tsx` · `TurnIntoMenuItem.tsx` · `model/turn-into-items.ts` — ⠿ 메뉴

⠿ 메뉴는 BlockNote 기본(삭제 · 색깔 · 표 머리글)을 전환 · 색상 · 복제 · 삭제로 바꾼 것입니다. 표면은 BlockNote `Generic.Menu` 그대로고 폭 · 아이콘 · 목록만 우리 것입니다 ([DESIGN.md §9](../../DESIGN.md)).

### 블록 선택 — Notion 규격

**Notion 에는 블록 경계를 걸친 글자 선택이 없습니다.** 끌기가 줄을 넘어가는 순간 두 줄이 통째로
잡히고, 그 뒤로 키보드가 전부 「블록」 단위로 움직입니다. BlockNote 는 여기까지 안 와 있어서
(블록 하나를 고르는 상태만 있고, 그것도 `⠿` 를 눌렀을 때 우리가 놓습니다) 그 차이를 메웠습니다.

Notion 공식 문서([keyboard shortcuts](https://www.notion.com/help/keyboard-shortcuts))를 그대로
옮긴 것이 아래 표입니다. 우리가 정한 것은 `PageUp/PageDown` 한 줄뿐이고, 그건 Notion 에도 적혀
있지 않아서 화살표의 규칙을 한 화면으로 늘린 것입니다.

| 키 | 하는 일 | 출처 |
| --- | --- | --- |
| 글자 위에서 끌기 · `shift`+클릭 | 줄을 넘어가면 블록을 통째로 잡습니다 | Notion |
| 여백에서 끌기 | 사각형이 지나간 줄을 잡습니다 — 한 줄만 훑어도 통째로 | Notion |
| `Esc` | 커서가 있는 블록을 고릅니다 / 한 번 더 누르면 풉니다 | Notion |
| 바깥 클릭 | 고른 블록을 풉니다 — 문서 옆 빈 판 · 사이드바 · 상단바 · 문서 제목 | Notion |
| `Enter` | 고른 블록 **안으로** 커서를 넣습니다 | Notion |
| `Backspace` `Delete` | 고른 블록을 지웁니다 | Notion |
| `↑` `↓` `←` `→` | 선택을 다른 블록으로 옮깁니다 | Notion |
| `shift`+`↑` `↓` | 선택을 한 블록 늘리거나 줄입니다 | Notion |
| `⌘A` | 한 번은 이 블록의 글자, 한 번 더는 문서 전체 | Notion |
| `⌘D` | 고른 블록을 복제합니다 | Notion |
| `⌘C` `⌘X` `⌘V` | 블록 단위로 담고 · 지우고 · 붙입니다 | Notion |
| `PageUp` `PageDown` | 한 화면 위/아래로 — 선택이든 커서든 (`shift` 로 늘립니다) | 우리 |
| `⌘⌥0`~`8` · `Ctrl+Shift+0`~`8` | 블록 종류를 바꿉니다 (9 = 하위 페이지는 백로그) | Notion |
| `⌘Enter` | 체크박스 켜고 끄기 · 토글 열고 닫기 | Notion |
| `>` + 공백 | 토글 목록 (인용은 `"` + 공백) | Notion |
| `⌘`+`shift`+`↑` `↓` | 고른 블록을 위/아래로 옮깁니다 | BlockNote 기본 |
| `Tab` `shift`+`Tab` | 들여쓰기 · 내어쓰기 | BlockNote 기본 |
| `⌘B` `⌘I` `⌘U` `⌘E` `⌘⇧S` | 굵게 · 기울임 · 밑줄 · 인라인 코드 · 취소선 | BlockNote 기본 |

**글자가 없는 블록이 가장자리면 선택 종류가 하나 더 있습니다.** 구분선에는 글자가 없어서
`TextSelection` 의 끝이 될 수 없습니다 — `TextSelection.between` 이 글자를 찾아 안쪽으로
되돌아오고, 그러면 구분선이 선택에서 빠져 `shift`+`↓` 가 거기서 멈춥니다. 그때만
`BlockRangeSelection`(`lib/block-range-selection.ts`)으로 바꿉니다. BlockNote 의
`MultipleNodeSelection` 과 같은 물건인데 밖으로 안 내놔서 짧게 다시 썼습니다.

**선택의 정체는 그 밖에는 그대로 `TextSelection` 입니다.** 새 Selection 종류를 만들지 않았습니다 — BlockNote
안에 `MultipleNodeSelection` 이 있는데 밖으로 안 내놓기도 하고, `TextSelection` 으로 두면 복사 ·
포맷 툴바 · `⠿` 로 끌기 · `getSelection()` 넷이 하나도 안 바뀐 채 그대로 동작합니다. 하는 일은
「줄을 넘어간 선택을 블록 경계까지 밀어 내는 것」 하나고, 끌기 · `shift`+클릭 · `shift`+화살표가
전부 그 코드 한 벌을 지납니다 (`lib/blocknote-block-selection.ts`).

**칠하는 클래스는 `.knoc-selected-block` 입니다 — `.ProseMirror-selectednode` 가 아닙니다.**
처음에는 그쪽을 그대로 얹었는데, **한 번 블록 하나로 골랐던 줄이 여럿 선택으로 넘어가는 순간
그 줄만 안 칠해졌습니다.** ProseMirror 가 그 클래스를 데코레이션이 아니라 DOM 에 직접 붙였다
뗐다 해서(`selectNode` · `deselectNode`), 선택이 풀릴 때의 `classList.remove` 가 우리 데코레이션
까지 걷어 갑니다. `Esc` 뒤에 `shift`+`↓`, 여백에서 아래로 끌기(첫 줄이 잠깐 혼자 잡힙니다)
둘 다 그 길입니다. 칠하는 **값**은 그대로입니다 — blocknote-bridge.css 의 같은 규칙이 `:is()` 로
두 클래스를 같이 짚습니다 ([DESIGN.md §7](../../DESIGN.md)).

**여백에서 시작한 끌기 하나만 그 코드가 못 봅니다.** 브라우저가 만든 선택을 밀어 내는 방식이라
「줄을 넘어갔나」로만 갈리는데, Notion 은 왼쪽 여백에서 **한 줄만** 짧게 훑어도 그 줄이 통째로
잡힙니다. 여백에서 시작했다는 것은 `mousedown` 을 직접 들어야 알 수 있어서, 그 한 갈래만
따로 있습니다 (`lib/blocknote-marquee-selection.ts`).

| | 넓히기 | 여백 끌기 |
| --- | --- | --- |
| 시작한 자리 | 글자 위 | 문서 좌우 빈 판 · 거터 · 블록 사이 |
| 한 블록만 훑었을 때 | 그 블록 **안의 글자 선택** | 그 블록을 **통째로** |
| 끄는 동안 보이는 것 | 잡힌 블록의 면 | 면 **+ 사각형** |

**여백은 문서 좌우의 빈 판까지 전부입니다.** 에디터 자기 거터(54px)만이 아닙니다 — 창이 넓으면
720px 짜리 문서 양옆에 수백 px 이 남고, Notion 은 거기서 끌어도 잡힙니다. 그래서 `mousedown` 을
**문서 전체에서** 듣습니다. `handleDOMEvents` 로는 안 됩니다 — 그건 `view.dom`(`.bn-editor`)
안에서 난 것만 오고, 빈 판은 그 밖입니다. 캡처 단계에서 먼저 서고, ProseMirror 가 자기 끌기를
시작하는 것만 `handleDOMEvents` 로 비껴 갑니다.

**`stopPropagation` 은 쓰지 않습니다.** 처음에 그렇게 썼다가 걸렸습니다 — 캡처 단계에서 끊으면
이벤트가 `document` 까지 못 가서, **열려 있던 `⠿` 메뉴가 거터를 눌러도 안 닫혔습니다.** 그 닫힘은
문서에 걸린 바깥 클릭 감지가 하는 일입니다. ProseMirror 만 비껴가면 되는 자리라 `handleDOMEvents`
가 맞습니다.

**대신 무엇이 눌렸을 때 여백인지를 좁게 정합니다.** 둘 중 하나여야 합니다.

| | 무엇 | 왜 |
| --- | --- | --- |
| 에디터 **바깥** 껍데기 | 눌린 것이 에디터를 **품고 있다**(`contains`) | 스크롤 판 · `<main>` · `.bn-container` 가 다 걸립니다. 글이 아니라 자리를 잡는 상자들입니다 |
| 에디터 **안쪽** 뼈대 | `.bn-block-outer` · `.bn-block` · `.bn-block-group` | 블록 사이 · 목록 들여쓰기. 글이 실린 상자는 `.bn-block-content` 하나뿐입니다 |

이 규칙 하나로 사이드바 · 상단바 · 떠 있는 메뉴가 전부 빠집니다. 위쪽은 **스크롤 판까지만**
올라갑니다 — `<body>` 는 판 밖이라 안 셉니다. 뒤집어(「글 상자 안이 아니면 여백」) 짚지 않은
것은, BlockNote 가 글 상자 밖에 무언가를 그리기로 하는 순간 그것까지 여백이 되기 때문입니다.
스크롤 막대는 뺍니다 — 문서가 놓인 판이 곧 스크롤 상자라, 막대를 끌 때도 `target` 이 그 판으로
옵니다.

**세로 띠로만 잽니다.** 왼쪽 여백만 훑은 사각형은 글 상자와 가로로 한 점도 안 겹치는데 Notion 은
그때도 그 줄을 고릅니다 — 사용자가 재고 있는 것은 높이 하나입니다.

**블록마다 자기 상자를 재서 띠와 겹치는지 봅니다.** 처음에는 띠의 두 끝을 `posAtCoords` 로 물어
자리를 얻었는데 **첫 줄이 빠졌습니다** — 문서 맨 위 여백에서 캐럿을 찾으면 브라우저가 첫 줄을
건너뛰고 그 다음 줄을 집습니다(제목 블록은 위 padding 이 18px 이라 그 구간이 넓습니다). 상자끼리
겹치는지로 재면 좌표를 글자로 옮기는 단계가 아예 없어집니다. 재는 것은 `.bn-block-outer` 가 아니라
**그 블록 자기 줄**(`.bn-block-content`)입니다 — 바깥 상자는 자식까지 품고 있어서, 토글 안쪽 줄만
지나간 띠가 토글 전체를 잡습니다.

겹친 블록들의 안쪽 자리만 모으면 깊이 맞추기와 선택 세우기는 `blockRangeAround` ·
`selectBlockRange` 가 그대로 합니다. 그래서 **끌기와 `shift`+화살표가 만드는 선택과 한 글자도
다르지 않습니다.**

**끌 때 기본 동작을 막습니다.** 안 막으면 브라우저가 자기 글자 선택을 같이 늘려서, 우리가 세운
선택과 번갈아 들어와 선택이 떨립니다. 대신 **에디터 안에서 눌렸을 때만** 브라우저가 하던 일 둘 —
누른 자리에 커서 놓기, 포커스 주기 — 을 우리가 합니다. 거터를 그냥 눌렀다 뗀 것은 전과
똑같습니다. 바깥 빈 판은 원래 눌러도 아무 일이 없던 자리라 그대로 둡니다.

**바깥을 누르면 풀립니다.** `mousedown` 을 문서 전체에서 듣게 되면서 이것도 같이 붙었습니다 —
전에는 `Esc` 와 본문 클릭으로만 풀렸고, 문서 옆 빈 판 · 사이드바 · 상단바 · 문서 제목을 눌러도
블록이 파랗게 남아 있었습니다. 가르는 선은 **`.bn-container`** 하나입니다: `⠿` 사이드 메뉴 ·
슬래시 메뉴 · 포맷 툴바가 전부 그 안에 그려져서, 「그 상자 밖을 눌렀나」로 물으면 **여러 줄을
고른 채 `⠿` 메뉴를 여는 길이 안 끊깁니다.** 안 푸는 것은 셋입니다 — 스크롤 막대(화면을 굴리는
일), 오른쪽 버튼(메뉴를 여는 일), 조합키를 누른 클릭(늘리거나 다르게 여는 일). 창을 옮기거나
탭을 바꾸는 것도 안 풉니다: `blur` 가 아니라 `mousedown` 을 듣기 때문에 저절로 그렇습니다.
내려앉는 자리는 `Esc` 와 같은 마지막 줄 끝이고, 그 함수 하나를 둘이 같이 씁니다
(`releaseBlockRange`).

**끄는 동안에는 포맷 툴바를 접습니다.** 에디터 **안에서** 시작한 끌기라면 BlockNote 가 스스로
접는데(`view.dom` 의 `pointerdown` 을 듣습니다), 빈 판에서 시작한 것은 그 귀에 안 들어와 끌고
있는 내내 툴바가 따라다녔습니다. 끄는 중인지를 플러그인 상태에 담고 화면이 그걸 보고 컨트롤러를
안 그립니다 (`isMarqueeDragging` → `ContentEditor`).

대신 **잘라내기 · 붙여넣기 두 자리만** 우리가 가로챕니다. 선택이 첫 블록의 글자 처음부터 마지막
블록의 글자 끝까지라, ProseMirror 에게 맡기면 지워진 자리에 **빈 문단 하나가 남습니다.** Notion 은
안 남깁니다.

**여러 블록을 골랐을 때는 포맷 툴바가 뜹니다** — Notion 도 그렇고, `⌘B` 가 고른 줄 전부에 걸립니다.
안 띄우는 것은 블록을 **하나** 골랐을 때뿐입니다 (`⠿` · `Esc`).

**숫자키는 OS 마다 조합이 다릅니다.** Notion 이 이 계열만 `Mod` 를 안 쓰고 macOS 는
`Cmd+Option+숫자`, Windows 는 `Ctrl+Shift+숫자` 입니다. 두 벌을 같이 겁니다. **뒤쪽이
BlockNote 기본과 부딪힙니다** — 저쪽의 `Ctrl+Shift+6`~`9` 는 토글 · 번호 · 불릿 · 체크로,
마크다운 편집기 관례지 Notion 번호가 아닙니다. 우리 것이 먼저 서서 덮습니다(`runsBefore`).
9 만 남겨 뒀습니다 — Notion 에서 9 는 하위 페이지고 그건 백로그입니다.

**`⠿` 메뉴가 본문을 눌러도 안 닫힙니다 — 원래 있던 것입니다.** 메뉴를 열어 둔 채 문서 옆 빈 판 ·
사이드바 · 상단바를 누르면 닫히는데, **본문 글자**를 누르면 그대로 열려 있습니다(`Esc` 는 됩니다).
바깥 클릭 감지가 Mantine · floating-ui 쪽에 있고, ProseMirror 가 그 `mousedown` 을 `preventDefault` 하는 것이
원인으로 보입니다 — 이벤트는 `document` 까지 잘 가고 있습니다(측정함). 메뉴 **표면**을 SEED 로
갈아 끼우는 §2 에서 여닫히는 상태를 우리가 들게 되므로, 그때 같이 닫습니다.

**아직 없는 것 몇.** `⌘`+`shift`+클릭으로 블록을 하나씩 **골랐다 뺐다** 하는 것은 ProseMirror 의
선택으로 표현할 수 없습니다(연속하지 않은 선택이 없습니다). `⌘/`(고른 블록의 메뉴 열기)와
`⌘K`(링크 걸기 — BlockNote 에 아예 없습니다), `⌘⇧H`(직전 색 다시 적용)는 메뉴 · 툴바 표면이
우리 것이 된 뒤입니다(F3 §2). `⌘⇧U`(상위 블록으로)와 `@` · `[[` 는 다음 스프린트입니다.
**여백 끌기의 자동 스크롤**도 아직입니다 — 사각형을 화면 끝까지 끌어도 문서가 따라 내려가지
않습니다. 보이는 데까지 고르고 나머지는 `shift`+`↓` 입니다.

**「페이지」(블록을 하위 페이지로 전환)는 백로그입니다** ([빼는 것](mvp.md)). 페이지를 가리키는 블록이 없고, 하위 페이지를 만드는 일이라 `shared/api` 를 부르는 유일한 전환이며, 글자가 문서 밖으로 나가서 되돌리기 범위를 같이 정해야 합니다. 이번 스프린트에서 하지 않습니다.

### 남은 구현

* [x] `model/slash-menu-items.tsx` — 기본 24항목 + 목차. 컴포넌트 밖이라 순수 node 에서 검사됩니다
* [ ] `ui/ContentEditor/SlashMenu.tsx`
* [ ] `ui/ContentEditor/FormatToolbar.tsx`

`ContentEditor` 가 이미 `slashMenu={false}` + `SuggestionMenuController` 로 목록을 넘기고 있습니다. 표면만 BlockNote 기본이라, §2 에서 바뀌는 것은 `suggestionMenuComponent` 한 줄입니다.

포맷 툴바도 `formattingToolbar={false}` + `FormattingToolbarController` 로 이미 갈라 두었습니다. 지금 우리 것은 **언제 뜨는지**(블록 선택 중에는 안 뜸) 하나뿐이고, §2 에서 바뀌는 것은 `formattingToolbar` prop 한 줄입니다.

### SlashMenu

BlockNote 기본 UI 대신 프로젝트 UI를 사용합니다.

* 기본 Slash Menu 비활성화 (`slashMenu={false}`)
* 기본 Formatting Toolbar 비활성화 (`formattingToolbar={false}`)

지원 블록:

* 문단
* 제목 1
* 제목 2
* 제목 3
* 불릿 목록
* 번호 목록
* 체크박스
* 코드
* 인용
* 구분선

항목 선택 기준은 BlockNote의 `title`이 아니라 **`key`를 사용합니다.**

마크다운 단축 표기도 함께 보여줍니다.

예:

`#` · `##` · `###` · `-` · `1.` · `>`

목록을 만드는 부분은 컴포넌트 밖(`slash-menu-items.ts`)에 둡니다. jsdom에서 메뉴가 안 떠서 테스트할 수 있는 자리가 여기뿐입니다.

### FormatToolbar

텍스트 선택 시 표시되는 포맷 툴바입니다.

활성화된 스타일은 `useActiveStyles(editor)`를 기준으로 표시합니다.

### 먼저 정해야 할 것

두 항목 모두 [DESIGN.md §6](../../DESIGN.md#6-미결정과-확정-기록)에 있습니다.

| 항목   | 내용                                                       |
| ---- | -------------------------------------------------------- |
| 아이콘  | BlockNote 기본은 인라인 SVG(§8 위반). seed-icon에 번호 목록·코드 블록이 없음 |
| 줄 수  | §5는 10줄 기준인데 스키마가 14종이라 기본 항목이 17줄                       |

구현 시 주의할 점은 [BlockNote 표면 교체 결정](../decisions/f3-blocknote-surface.md)에 있습니다.

---

# 2. 코드 블록 (완료)

BlockNote 기본 코드 블록은 언어 선택기가 native `<select>`입니다. 펼친 목록을 OS가 그려서 CSS가 닿지 않습니다 ([DESIGN.md §7](../../DESIGN.md)).

스펙에서 `render`만 교체했습니다. `type`과 `propSchema`는 그대로라 저장된 문서는 바뀌지 않습니다.

* [x] `model/code-block.ts` — 스펙 교체
* [x] `ui/ContentEditor/CodeBlockView.tsx`
* [x] `ui/ContentEditor/CodeLanguageMenu.tsx` — 슬래시 메뉴와 같은 표면
* [x] Shiki 하이라이트
* [x] 목록에 없는 언어로 저장된 문서에서 에디터가 죽지 않게 처리
* [x] 내보내기 HTML에서 메뉴 제외

코드 블록 표면은 라이트 모드에서도 어둡게 고정입니다. Shiki 문법색까지 같이 뒤집어야 해서 [DESIGN.md §6](../../DESIGN.md#6-미결정과-확정-기록)에 열려 있습니다.

---

# 3. 커스텀 블록

BlockNote가 제공하지 않는 블록입니다. `createReactBlockSpec`으로 만듭니다.

* [ ] 콜아웃
* [x] 목차 — `model/toc-block.ts` · `model/table-of-contents.ts` · `ui/ContentEditor/TableOfContentsView.tsx`

콜아웃은 [콜아웃 블록 구현 계획](../decisions/f3-callout-block.md)에 있습니다 — 스키마 · 자식을 상자 안에 세우는 브리지 예외 · 아이콘 피커 재사용.

목차는 담는 것이 없는 블록입니다(`content: "none"`, `propSchema: {}`). 저장되는 것은 `{ "type": "tableOfContents" }` 한 줄이고, 목록은 그릴 때 문서에서 다시 셉니다 — 제목 글자를 props 로 복사해 두면 같은 글자가 문서에 두 벌이 됩니다.

데이터베이스 · 뷰는 [F6·F7](later-sprints.md)에서 진행합니다.

---

# 4. 페이지 조립

`PageEditorPage`에서 아이콘 · 제목 · 에디터를 하나의 문서 화면으로 조립합니다.

구조:

```text
EditorSurface
├── PageIcon
├── PageTitle
└── ContentEditor
```

### 제목

BlockNote에는 페이지 제목이 없습니다. 문서가 블록 배열 하나가 전부입니다.
제목은 에디터 밖에 따로 서고 `Page.title`이 됩니다.

* [x] `ui/PageTitle/PageTitle.tsx` — `textarea` 한 겹. `InlineInput`을 쓰지 않습니다
* [x] `ui/PageIcon/PageIcon.tsx` · `PageIconPicker.tsx`
* [x] `ui/EditorSurface/EditorSurface.tsx`
* [x] 빈 문서 문구

### 포커스 이동

**Notion 은 제목과 본문이 한 판입니다.** 커서가 그냥 위아래로 오갑니다. 우리는 제목이
`textarea`(PageTitle)고 본문이 ProseMirror(ContentEditor)라 판이 둘이라, 그 사이를 손으로
이어야 합니다. 잇는 자리는 `PageEditorPage` 한 곳입니다.

| 방향 | 키 | 하는 일 | 조건 |
| --- | --- | --- | --- |
| 제목 → 본문 | `Enter` | 맨 위에 **빈 줄을 만들고** 그 안으로 | 늘 (제목에 줄바꿈은 안 담깁니다) |
| 제목 → 본문 | `↓` | 첫 줄로 **내려갑니다** (문서는 안 바뀝니다) | 커서가 **글 끝**일 때 |
| 본문 → 제목 | `↑` | 제목 끝으로 | 첫 블록의 **첫 줄**일 때 |
| 본문 → 제목 | `Backspace` | 제목 끝으로 | 첫 블록의 **첫 글자 앞**일 때 |

**`Enter` 와 `↓` 가 다릅니다.** Notion 은 제목과 본문이 한 판이라 제목 끝의 `Enter` 가 그냥
「다음 줄」이고, 그 줄은 **없으면 생깁니다** — 아래에 이미 글이 있으면 그 위로 빈 줄이 하나
끼고 있던 글이 밀려 내려갑니다. `↓` 는 있는 줄로 옮겨 갈 뿐이라 문서가 안 바뀝니다.
맨 위가 이미 빈 문단이면 `Enter` 도 안 만듭니다 — 그 줄이 곧 새 줄이라, 안 그러면 새 문서에서
빈 줄이 둘이 됩니다.

* [x] `ContentEditor`가 포커스 핸들만 열기 (`ContentEditorHandle.focusStart`)
* [x] `PageTitle`도 같은 규칙으로 핸들만 (`PageTitleHandle.focusEnd`)
* [x] `lib/document-boundary.ts` — 「본문의 맨 앞인가」 판단
* [x] `ContentEditorHandle.insertStart` — 제목 `Enter` 가 만드는 줄
* [x] `lib/blocknote-document-boundary.ts` — `↑` · `Backspace` 를 키맵 맨 뒤에서 잡습니다

에디터 인스턴스를 외부에 노출하지 않습니다. 노출하면 F10에서 Yjs로 바꿀 때 밖까지 깨집니다.
같은 이유로 `PageTitle`도 `textarea` 자체를 안 내보냅니다.

**`↑` 는 첫 글자가 아니라 첫 줄입니다.** 길어서 접힌 문단이나 여러 줄짜리 코드 블록이 첫
블록이면, 둘째 줄의 `↑` 는 아직 본문 안의 이동입니다. 그 판단은 글자 수로 못 하고 재야 해서
ProseMirror 의 `endOfTextblock("up")` 을 씁니다.

**첫 블록이 제목이나 목록이면 `Backspace` 를 두 번 눌러야 합니다.** 블록 맨 앞의 `Backspace` 는
**먼저 그 블록의 종류를 벗기기** 때문입니다 — 제목1 이 본문이 되고, 그 다음 누름이 제목 줄로
올라갑니다. 모든 블록에 같은 규칙이고 Notion 도 같은 순서라, 첫 블록만 예외로 두지 않았습니다.
예외로 뒀으면 `Backspace` 로 첫 줄의 제목을 되돌리는 길이 없어집니다.

| 첫 블록 | 1번째 | 2번째 |
| --- | --- | --- |
| 문단 · 빈 문단 | 제목으로 | |
| 제목 · 목록 · 인용 | 문단이 됨 | 제목으로 |

견본 문서의 첫 줄이 제목1 이라(`sample-page-content.ts`) 눈으로 확인할 때 이 두 단계를 먼저
만납니다. 한 번 눌렀을 때 글자가 작아지는 것이 「먹혔다」는 신호입니다.

**본문 쪽 두 키는 키맵의 맨 뒤에 섭니다** (`lib/blocknote-document-boundary.ts`).

먼저 서면 안 됩니다 — `Backspace` 로 제목1 을 본문으로 되돌리는 것이 BlockNote 몫이라,
우리가 앞에 서면 되돌리기도 전에 제목 줄로 튀어 나갑니다. 그렇다고 React `onKeyDown` 으로
받아서도 안 됩니다: **ProseMirror 가 문서 맨 앞의 `Backspace` 를 스스로 `preventDefault`
합니다.** 아무 플러그인도 안 가져가면 `captureKeyDown` 이 도는데, 거기서
`stopNativeHorizontalDelete` 가 「글줄 끝이면 브라우저에 안 맡긴다」로 참을 돌려주기
때문입니다. 문서 맨 앞은 정의상 글줄의 끝이라 늘 걸립니다.

`captureKeyDown` 은 `handleKeyDown` 을 **전부 물어본 다음**에만 돕니다. 그러니 그 줄의 맨
뒤에 끼어들면 됩니다 — tiptap 확장 우선순위 `1` 입니다(기본 100, BlockNote 것들이 91~111).

    BlockNote  블록 종류를 먼저 벗긴다 (제목1 → 본문)
    우리       저쪽이 안 가져갔을 때만 — 그때가 제목으로 올라갈 자리다
    PM         여기까지 아무도 안 가져가야 preventDefault 한다 (이제 안 온다)

**처음에는 React `onKeyDown` 이었고, 브라우저에서 한 번도 안 걸렸습니다.** 레이아웃이 없는
테스트에서는 `endOfTextblock` 이 거짓이라 저 경로가 안 돌아 통과했습니다 — 그래서 못 잡았습니다.
지금은 `endOfTextblock` 을 참으로 만들어 두고(브라우저 흉내) 검사합니다.

**한글 조합 중에는 둘 다 손대지 않습니다** (`isComposing`). 제목에서 후보를 확정하는 `Enter`,
본문에서 첫 글자를 지우는 `Backspace` 가 그대로 여기로 들어옵니다.

### 빈 문서

제목:

> 새 페이지

본문:

> 바로 쓰거나, / 를 눌러 블록을 넣으세요

별도 버튼은 만들지 않습니다.

---

# 5. 자동 저장

`pages/page-editor/model/autosave.ts`

현재 단계에서는 서버 대신 localStorage에 저장합니다. F2의 `updatePage` mock이 필요합니다.

### 저장 시점

| 상황     | 동작         |
| ------ | ---------- |
| 입력 중단  | 800ms 후 저장 |
| 계속 입력  | 최대 5초마다 저장 |
| 포커스 이탈 | 즉시 저장      |
| 창 종료   | 즉시 저장      |

### 구현

* [ ] `model/autosave.ts`
* [ ] 마지막 변경 내용만 저장
* [ ] 저장 중에도 계속 입력 가능
* [ ] `model/unsaved-guard.ts`

저장 요청 때문에 에디터 입력이 막히면 안 됩니다.

디바운스는 훅 밖 유틸로 뺍니다. 가짜 타이머로 테스트하기 위해서입니다.

---

# 6. 저장 상태

`app/ui/TopBar/SaveStatus.tsx`는 F1에서 끝났습니다. 연결만 남았습니다.

| 상태       | 표시                |
| -------- | ----------------- |
| `idle`   | 표시 없음             |
| `saving` | 저장 중              |
| `saved`  | 저장됨 (2초 후 사라짐)    |
| `offline` | 오프라인 — 연결되면 저장할게요 |

* [ ] 자동 저장 상태를 `AppLayout` → `TopBar`로 전달

실패 상태는 상단바에 두지 않습니다 ([DESIGN.md §9](../../DESIGN.md)). 재시도까지 실패한 것은 F4에서 본문 위 배너로 올립니다.

---

# 7. 테스트

F3부터 Vitest를 사용합니다.

### 설정

* [ ] `package.json`에 `test: vitest` 추가
* [ ] 불필요한 jsdom / testing-library 의존성 제거

`vite.config.ts`는 건드리지 않습니다.

### Unit Test

* [ ] SlashMenu 항목 종류 확인
* [ ] SlashMenu 순서 확인
* [ ] 마크다운 단축 표기 확인
* [ ] 자동 저장 debounce 확인
* [ ] F2에서 넘어온 `getVisiblePageNavigationNodes`
* [ ] F2에서 넘어온 API mock

브라우저 동작이 필요한 테스트는 F4 E2E에서 진행합니다.

* 마크다운 단축 입력
* SlashMenu 블록 삽입

메뉴가 뜨는 것 자체는 jsdom에서 확인할 수 없습니다. floating-ui가 레이아웃을 필요로 하는데 jsdom은 모든 rect가 0입니다.

---

# 완료 조건

## 에디터

* [ ] 10개 SlashMenu 항목이 정상적으로 표시된다
* [ ] 블록 선택 기준으로 `key`를 사용한다
* [ ] SlashMenu에 마크다운 단축 표기가 표시된다
* [ ] 기본 BlockNote SlashMenu가 표시되지 않는다
* [ ] 기본 BlockNote FormattingToolbar가 표시되지 않는다
* [ ] `SuggestionMenuController` · `FormattingToolbarController`가 해당 파일 밖에 없다
* [ ] 라이트/다크 모드에서 SEED 토큰을 따른다 (코드 블록 표면 제외)
* [ ] BlockNote CSS에 `!important`를 사용하지 않는다

## 저장

* [ ] 입력을 멈추면 1초 안에 `저장됨`으로 변경된다
* [ ] 새로고침해도 작성 내용이 남아 있다
* [ ] 저장 중에도 계속 입력할 수 있다
* [ ] 저장되지 않은 상태에서 페이지를 벗어나면 경고한다

## 구조

* [ ] 블록 내용을 별도 React state에 복사하지 않는다
* [ ] `PageContent` 처리는 `pages/page-editor/` 내부에서만 한다
* [x] 에디터가 별도 번들로 분리되어 있다 (첫 화면 124.2KB · 에디터 368.6KB)

[공통 완료 조건](conventions.md) · [MVP 판정 기준](mvp.md#mvp-판정-기준)도 함께 확인합니다.

---

# 구현 순서

```text
1. SlashMenu / FormatToolbar
      ↓
2. 콜아웃 / 목차 블록
      ↓
3. 자동 저장
      ↓
4. 저장 상태 / 이탈 경고
      ↓
5. 테스트
```

F3가 끝나면 **페이지를 열고 → 작성하고 → 자동 저장하고 → 다시 열어도 내용이 남는 화면 MVP**가 완성됩니다.

서버에 실제 문서를 저장하는 작업은 F4에서 진행합니다.

---

← [F2](sprint-2.md) · 다음 → [F4](sprint-4.md)
