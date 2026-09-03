# F3 §3 — 콜아웃 블록 구현 계획

← [F3 §3 커스텀 블록](../roadmap/sprint-3.md) · [DESIGN.md §7 BlockNote 경계](../../DESIGN.md)

| | |
|---|---|
| 물음 | BlockNote 가 콜아웃을 먼저 주는가. 아니면 어떻게 만드는가 |
| 답 | **안 준다.** 목차에 이어 **두 번째 커스텀 블록**으로 우리가 만듭니다 |
| 확인한 것 | `@blocknote/core` 0.54.0 의 기본 블록 목록 · 패키지 전체 검색 · 자식 블록 구조 · **자식을 넣는 키 넷**(소스맵에서 구현 확인) · 색이 칠해지는 자리 |
| 확인 못 한 것 | 브라우저에서의 아이콘 피커 위치·포커스 (목차와 같은 이유 — [§0](f3-blocknote-surface.md#6-테스트에-영향--메뉴-본체는-유닛으로-못-봅니다)) |
| 새로 여는 것 | 브리지 예외 **두 줄** (자식을 상자 안에 넣는 규칙 — 아래 §3-2) |

---

## 1. BlockNote 는 콜아웃을 안 준다

[`blocknote-schema.ts`](../../src/pages/page-editor/model/blocknote-schema.ts) 가 적어 둔
"콜아웃 · 북마크 — BlockNote 에 없다" 를 설치된 0.54.0 에서 다시 확인했습니다. 그대로입니다.

| 확인한 곳 | 결과 |
|---|---|
| `defaultBlockSpecs` (`core/types/src/blocks/defaultBlocks.d.ts`) | audio · bulletListItem · checkListItem · codeBlock · divider · file · heading · image · numberedListItem · pageBreak · paragraph · quote · toggleListItem · video — **콜아웃 없음** |
| `core/types/src/blocks/` 디렉터리 | Audio · Code · Divider · File · Heading · Image · ListItem · PageBreak · Paragraph · Quote · Table · ToggleWrapper · Video — **콜아웃 폴더 없음** |
| `node_modules/@blocknote/**` 전체 문자열 검색 (`callout`) | **0건.** core · react · mantine · code-block 어디에도 없습니다 |
| 상업 패키지 (`xl-*`) | 컬럼 레이아웃 · AI · 변환기입니다. 콜아웃은 그쪽에도 없습니다 |

BlockNote 문서의 "Alert" 예제는 **커스텀 블록을 만드는 방법을 보여주는 예제**지 패키지가 주는
블록이 아닙니다. 붙여 쓸 수 있는 코드가 아니라 우리가 쓸 코드의 모양만 같습니다.

**그래서 목차와 같은 길입니다** — `createReactBlockSpec` 으로 만들고, 스키마 · 슬래시 메뉴 ·
전환 목록 · 문구를 우리가 채웁니다. 다른 점은 하나입니다. 목차는 **담는 것이 없는** 블록이었고
(`content: "none"`, `propSchema: {}`), 콜아웃은 **글자도 담고 자식 블록도 담습니다.**

---

## 2. Notion 콜아웃의 네 필드 → 우리 스키마

Notion 의 콜아웃은 `rich_text` · `icon` · `color` 세 필드와 `children` 입니다. 넷을 그대로
받되, **셋은 BlockNote 가 이미 가진 것으로 받고 하나만 새로 만듭니다.**

| Notion | 우리 | 새로 만드나 |
|---|---|---|
| `rich_text` | `content: "inline"` | 아니오 — BlockNote 의 인라인 콘텐츠 |
| `icon` (emoji · custom_emoji · external · file) | `propSchema.icon` — **이모지 문자 하나**. 기본 `"💡"` | **예. 이 하나만 우리 것입니다** |
| `color` (21종) | `defaultProps.backgroundColor` — 기본값만 `"gray"` 로 덮습니다 | 아니오 — BlockNote 기본 prop |
| `children` | BlockNote 의 블록 자식 | 아니오 — **스키마는** 공짜입니다. 넣는 키와 상자는 §3 |

### 색을 새 prop 으로 안 만드는 이유

세 가지입니다.

1. **⠿ 메뉴의 「색상」이 이미 그 prop 을 칠합니다.** `BlockColorsItem` 은 블록의
   `backgroundColor` · `textColor` 를 보고 판을 엽니다 ([BlockDragHandleMenu.tsx](../../src/pages/page-editor/ui/ContentEditor/BlockDragHandleMenu.tsx)).
   새 prop 을 만들면 색 스무 칸을 그리는 부품(`ColorPicker` · `ColorIcon`)을 우리가 다시
   그려야 하는데, 그건 `@blocknote/react` 가 밖으로 안 내놓습니다.
2. **Notion 도 콜아웃 색과 블록 색이 같은 메뉴입니다.** 콜아웃 전용 색 목록이 따로 있는 것이
   아니라 모든 블록이 쓰는 색 enum 을 그대로 씁니다.
3. **hex 를 우리가 들지 않게 됩니다.** 여덟 색의 값은 브리지가 이미 SEED 팔레트를 가리키게
   해 뒀습니다 (`--bn-colors-highlights-*-background`, [blocknote-bridge.css](../../src/app/styles/blocknote-bridge.css)).
   색 이름만 저장하고 모드별 매핑은 토큰이 합니다 — 라이트 hex 를 문서에 박으면 다크에서
   눈이 아픕니다.

기본값만 다릅니다. BlockNote 기본은 `"default"`(색 없음)이고, Notion 의 UI 기본은 회색
배경입니다. `propSchema` 에서 **기본값 한 칸만 덮습니다.**

```ts
propSchema: {
  ...defaultProps,
  backgroundColor: { default: "gray" },   // ← BlockNote 는 "default"
  icon: { default: "💡" },
}
```

`"default"` 로 되돌린 콜아웃은 **투명 + 테두리 한 겹**으로 그립니다. Notion 이 API 기본값으로
만든 콜아웃과 같은 모양이고, 색을 지웠을 때 블록 자체가 사라져 보이지 않게 하는 최소 표시입니다.

### 이 한 칸이 안 먹을 수 있습니다 — 첫날 확인

코어의 배경색 속성은 DOM 속성을 달지 말지를 **자기 기본값과 견줘서** 정합니다. 우리 `propSchema`
가 아니라 코어의 `"default"` 가 하드코딩으로 들어 있습니다 (0.54.0 번들).

```js
renderHTML: (t) => t[e] === G.backgroundColor.default ? {} : { "data-background-color": t[e] }
```

블록을 만들 때 `propSchema` 기본값이 채워지는 것은 확인됩니다
(`!(n in a) && r.default !== void 0 && (a[n] = r.default)`). 그래도 두 자리가 갈릴 수 있어서
**새로 넣은 콜아웃에 `data-background-color="gray"` 가 붙는지를 스펙을 꽂자마자 봅니다** —
§3-2 의 예외가 걸 자리가 그 속성이기 때문입니다.

안 붙으면 넣는 자리에서 색을 **적어서** 넘깁니다. 슬래시 메뉴의 `insertOrUpdateBlockForSlashMenu`
와 전환 목록의 `to` 둘 다입니다 — 제목이 `isToggleable: false` 를 적어서 넘기는 것과 같은
방법입니다 ([turn-into-items.ts](../../src/pages/page-editor/model/turn-into-items.ts)).

### 아이콘은 이모지뿐입니다

Notion 의 네 타입 중 `emoji` 하나만 받습니다.

- `external` · `file` 은 이미지입니다. **파일 업로드는 F9 입니다** — 지금 받으면 저장할 곳도
  만료 처리도 없습니다 (Notion 의 `file` URL 은 한 시간이면 만료됩니다).
- `custom_emoji` 는 워크스페이스 자산이라 F5(User) 뒤입니다.
- 문서 아이콘(`PageIcon`)도 지금 이모지뿐입니다. **한 제품 안에서 아이콘을 고르는 두 자리가
  다른 것을 받으면 안 됩니다.**

`propSchema.icon` 은 문자열 하나입니다. 빈 문자열이면 아이콘 없이 글자만 그립니다 — 아이콘을
지울 수 있어야 하고 (Notion 도 됩니다), `undefined` 가 아니라 `""` 인 것은 BlockNote 의
prop 이 문자열 · 숫자 · 불리언만 담기 때문입니다.

---

## 3. 자식 블록 — 담는 것은 공짜, 걸리는 것은 둘

콜아웃의 쓸모는 대부분 **자식**에서 나옵니다. 콜아웃 안의 코드 블록, 접히는 경고(콜아웃 + 토글),
전제조건 체크리스트(콜아웃 + to_do) — 셋 다 콜아웃 **안에 다른 블록이 들어가야** 되는 것들입니다.

그래서 §3 이 묻는 것은 하나입니다. **콜아웃 안에 다른 블록을 넣을 수 있는가.**

답은 셋으로 갈립니다.

| | 답 |
|---|---|
| 담을 수 있나 (문서 구조) | **네. 아무것도 안 해도 됩니다** — 아래 |
| 넣는 키가 Notion 과 같나 | 아니오. 한 동작이 더 듭니다 — [3-1](#3-1-첫째--넣는-키가-notion-과-다릅니다) |
| 넣으면 상자 **안**에 보이나 | **아니오. 여기서 막히면 이 블록을 만들 이유가 없어집니다** — [3-2](#3-2-둘째--자식이-상자-밖에-그려집니다) |

### 담는 것 자체는 스키마로 할 일이 없습니다

BlockNote 의 블록 하나는 DOM 에서 **두 겹**입니다. 그리고 자식은 우리 `render` 가 그리는 곳
**안**이 아니라 그 **옆**에 섭니다.

```html
<div class="bn-block">                                     ← 블록 한 덩어리
  <div class="bn-block-content" data-content-type="callout">   ← 우리 render 는 여기까지만
  <div class="bn-block-group">                                 ← 자식들은 여기. 우리 render 가 못 그린다
```

ProseMirror 쪽 구조가 `blockContent blockGroup?` 이라 **모든 블록이 자식을 가질 수 있습니다.**
콜아웃도 예외가 아니라서, 담을 수 있게 만들려고 우리가 쓸 코드는 없습니다.

**대신 이 그림이 3-2 의 원인입니다.** 자식이 `render` 밖에 있으니, 우리가 React 안에서 무엇을
칠하든 자식에는 닿지 않습니다.

### 3-1. 첫째 — 넣는 키가 Notion 과 다릅니다

콜아웃 글자 끝에서 `Enter` 를 치면 어떻게 되는지가 둘이 다릅니다.

| | Notion | 우리 (BlockNote 그대로) |
|---|---|---|
| `Enter` | 상자 **안**에 새 줄 | 상자 **밖**에 형제 문단 |
| 자식을 넣으려면 | `Enter` | `Enter` → `Tab` **두 번** |

코어에서 확인한 것은 이렇습니다. 다섯 키 다 콜아웃을 특별 취급하지 않습니다.

| 키 | 코어가 하는 일 | 콜아웃에서는 |
|---|---|---|
| `Tab` | `nestBlock` → `sinkItem` | **들어갑니다.** 앞에 형제가 있는지만 보고 **블록 종류는 아예 안 봅니다** |
| `Enter` (글자 끝) | `splitBlockCommand(from, false, false)` | **밖으로.** `keepType: false` 라 형제 **문단**이 생깁니다 |
| `Enter` (빈 콜아웃) | 새 문단을 만들고 자식들을 그리로 옮깁니다 | **자식이 통째로 밖으로 나옵니다.** 글자를 다 지우고 `Enter` 를 치면 빈 상자만 남습니다 |
| `Shift+Enter` | `hardBreak` | 콜아웃 안에서 줄바꿈. 같은 블록입니다 |
| 맨 앞 `Backspace` | `updateBlock({ type: "paragraph" })` | 콜아웃이 문단이 됩니다. **자식은 들여쓴 채로 남습니다** |

즉 **막힌 데는 없고, 키를 한 번 더 눌러야 합니다.** 그래서 두 갈래입니다.

| | |
|---|---|
| **그대로 둔다** | `Enter` → `Tab`. 코어를 안 건드립니다. 대신 콜아웃 안에 코드 블록을 넣는 흔한 일이 두 동작이 됩니다 |
| **`Enter` 를 가로챈다** | 콜아웃일 때만 `Enter` 가 자식을 만들게 합니다. `knocBlockShortcuts` 에 한 줄이고, `runsBefore` 로 코어보다 먼저 서면 됩니다 — `>` 입력 규칙을 덮은 것과 같은 방법입니다 |

**가로채는 쪽으로 기울지만 F3 안에서 정합니다.** Notion 과 키 조합까지 맞춘 자리가 이미
여럿입니다 (숫자키 · `⌘Enter` · `>` 입력).

다만 가로채면 **나가는 길을 같이 봐야 합니다.** 자식으로 들어간 빈 줄에서 `Enter` 를 한 번 더
누르면 밖으로 나와야 하는데, 그건 코어의 "빈 블록이고 들여쓴 상태면 `liftItem`" 갈래가 이미
합니다. **그 갈래가 우리 가로채기보다 먼저 서는지**가 확인거리입니다 — 우리가 먼저 서 버리면
콜아웃 안에서 영영 못 나옵니다.

**표의 셋째 줄(빈 콜아웃에서 `Enter`)도 같이 봐야 합니다.** 자식이 통째로 밖으로 나오는 것은
Notion 에 없는 동작인데, 지금은 고치기로 한 적이 없습니다. `Enter` 를 가로채기로 정하면 그
갈래도 우리 것이 되므로 그때 같이 정합니다.

### 3-2. 둘째 — 자식이 상자 밖에 그려집니다

**여기서 막히면 계획을 고쳐야 합니다** (§10 의 2번). 들어가는 것과 상자 안에 보이는 것은
다른 문제입니다 — `Tab` 으로 자식은 들어가는데, 배경색이 자식에는 안 칠해집니다.

```text
지금 (브리지 그대로)              되어야 하는 것 (Notion)
┌───────────────────────┐        ┌───────────────────────┐
│ 💡 주의하세요          │        │ 💡 주의하세요          │
└───────────────────────┘        │                       │
    npm install              ←   │     npm install       │  ← 자식이 상자 안
    자식에 배경색이 없다          └───────────────────────┘
```

원인은 **배경색을 칠하는 DOM 자리**입니다. BlockNote 는 블록 색을 두 군데에 칠하는데,

```text
.bn-block                  ← ① 바깥 겹. 자식(.bn-block-group)까지 배경이 깔린다
  .bn-block-content        ← ② 안쪽 겹. 글자 줄에만 배경이 깔린다
  .bn-block-group          ← 자식
```

**우리 브리지가 ①을 투명으로 덮어 껐습니다.**

```css
/* blocknote-bridge.css — 지금 */
.bn-container .bn-block:has(> .bn-block-content[data-background-color]) {
  background-color: transparent;   /* 자식까지 칠하는 쪽을 끈다 */
}
```

끈 이유 둘 다 그 파일에 적혀 있고, **일반 블록에서는 맞는 결정입니다.** 둘 다 ①이 자식까지
칠하기 때문에 생기는 일입니다.

1. 색 상자와 블록 **선택** 면이 정확히 같아지면 두 겹이 구분되지 않습니다
2. 부모 색이 자식 뒤로 깔리면, 자식만 색을 지워도 안 지워진 것처럼 보입니다

**그런데 콜아웃은 자식이 상자 안에 들어야 하는 유일한 블록입니다.** 다른 블록에서 문제였던
"자식까지 칠한다" 가 콜아웃에서는 정확히 필요한 동작입니다 — 껐던 ①을 콜아웃에서만 되살려야
합니다.

#### 세 갈래

| | 하는 일 | 결과 |
|---|---|---|
| **A. 브리지에 콜아웃 예외** | 콜아웃일 때만 ①을 되살리고, ②가 상자를 글줄 크기로 줄이는 것도 되돌린다 | 자식이 상자 안. **Notion 과 같다** |
| B. 자식을 안 받는다 | `meta.isolating` 등으로 막는다 | 콜아웃이 "색깔 있는 문단" 이 된다. 그건 ⠿ 메뉴 → 색상으로 이미 된다 |
| C. render 안에서 우리가 칠한다 | 배경을 React 쪽으로 옮긴다 | **안 됩니다.** 자식은 `render` 밖이라(위 그림) 애초에 못 덮습니다 |

**A 를 고릅니다.** C 는 DOM 구조상 불가능하고, B 는 이 블록을 만드는 이유의 절반을 버립니다.

#### 예외는 한 줄이 아니라 두 줄입니다

브리지가 블록 색에 쓰는 규칙이 둘인데, 콜아웃에서는 **둘 다** 어긋납니다.

| 브리지의 규칙 | 일반 블록에서 | 콜아웃에서 |
|---|---|---|
| ① 부모 칠 끄기 | 맞다 — 자식은 자기 색을 따로 갖는다 | **틀리다** — 자식이 상자 안에 들어야 한다 |
| ② `padding-block: 0` — 색 상자를 글줄 높이로 줄인다 | 맞다 — 색이 글줄에 딱 맞아야 한다 | **틀리다** — 위아래 여백이 있어야 상자로 보인다 |

```css
/* 콜아웃 예외 — 브리지의 블록 색 절 "바로 뒤" 에 온다.
 *
 * 명시도로 이기는 것이 아니다. 위 규칙도 이 규칙도 (0,4,0) 으로 같다
 * (:has 는 인자 중 가장 센 것만 센다). **파일에서 뒤에 오는 것으로 이긴다** —
 * 그래서 자리가 규칙의 일부다. 절을 옮기면 조용히 깨진다. */

/* ① 부모 칠을 되살린다. 자식(.bn-block-group)이 이 상자 안에 든다 */
.bn-container .bn-block:has(> .bn-block-content[data-content-type="callout"]) { … }

/* ② 상자를 글줄 크기로 줄이는 것을 끈다 */
.bn-container .bn-block-content[data-content-type="callout"] { … }
```

**②를 빠뜨리면 상자 위아래 여백이 0 이 되어 배경이 글자에 달라붙습니다.** 넣을 값은 §8 의
초안이고 실제 선언은 구현 때 채웁니다 — 지금 적으면 브리지가 쓰는 토큰 이름이 두 곳에 남습니다.

**두 규칙의 선택자는 `[data-content-type="callout"]` 하나로만 씁니다. `[data-background-color]`
를 함께 쓰면 안 됩니다.** 그 속성은 색이 있을 때만 붙고 **색을 지우면 사라지기** 때문입니다
(§2 의 `renderHTML`). 함께 쓰면 「색 없음」 으로 되돌린 콜아웃에서 두 규칙이 아예 안 걸려서,
여백이 사라지고 자식이 도로 상자 밖으로 나갑니다 — 색만 지웠는데 블록이 다른 것이 됩니다.

**예외를 여는 것이므로 DESIGN.md §7 에 같이 적어야 합니다.** 「변수가 안 달린 곳」 목록과 같은
성격입니다 — 규칙을 깨는 것이 아니라, 어디를 왜 깼는지가 한 곳에 적혀 있어야 합니다.

**남는 것 하나.** ①을 되살리면 브리지가 ①을 껐던 첫 번째 이유(색 상자와 블록 선택 면이 정확히
같아진다)가 콜아웃에서는 다시 생깁니다. 콜아웃을 통째로 골랐을 때 두 면이 구분되는지
**브라우저에서 눈으로 봐야 합니다** (§8).

---

## 4. 스펙 초안

목차([toc-block.ts](../../src/pages/page-editor/model/toc-block.ts))와 같은 모양입니다.
`config` 를 밖으로 내보내는 것도 같습니다 — View 가 렌더 props 타입을 그것으로 짓습니다.

```ts
// model/callout-block.ts
import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { CalloutExternalHTML, CalloutView } from "../ui/ContentEditor/CalloutView";

export const calloutConfig = {
  type: "callout",
  propSchema: {
    ...defaultProps,
    backgroundColor: { default: "gray" },
    icon: { default: "💡" },
  },
  content: "inline",
} as const;

export const knocCallout = createReactBlockSpec(calloutConfig, {
  meta: {
    /* 글자를 담는 블록이라 커서가 드나든다. isolating 이면 Backspace 로 못 나온다 */
    isolating: false,
  },
  render: CalloutView,
  /* 안 넘기면 render 가 대신 불려서, 복사·내보내기한 HTML 에 아이콘 피커가
   * 통째로 딸려간다 — 목차 · 코드 블록과 같은 이유다 */
  toExternalHTML: CalloutExternalHTML,
})();
```

`View` 는 세 조각입니다.

```tsx
<div className="…" contentEditable={false}>  ← 아이콘 버튼만 contentEditable={false}
  <button>{block.props.icon}</button>        ← 누르면 이모지 피커
</div>
<div ref={contentRef} />                     ← 글자가 들어갈 자리. 반드시 이 ref 다
```

**`contentRef` 를 아이콘 바깥에만 두는 것이 핵심입니다.** 아이콘 버튼을
`contentEditable={false}` 로 감싸지 않으면 ProseMirror 가 그 DOM 을 문서 내용으로 보고 커서를
들여보냅니다 — 코드 블록 언어 메뉴 · 목차와 같은 자리입니다.

---

## 5. 파일 계획

| 파일 | 새로 | 하는 일 |
|---|---|---|
| `model/callout-block.ts` | 새로 | 스펙. `calloutConfig` 를 내보냅니다 |
| `ui/ContentEditor/CalloutView.tsx` | 새로 | 그리는 모양 + `toExternalHTML` |
| `ui/ContentEditor/CalloutIconButton.tsx` | 새로 | 아이콘 버튼과 피커 열고 닫기 (§6) |
| `model/blocknote-schema.ts` | 고침 | `callout: knocCallout` 한 줄. 주석의 "콜아웃 — 직접 만든다" 도 같이 |
| `model/slash-menu-items.tsx` | 고침 | 항목 하나. 목차와 같은 방법 — 사전에 없으니 이름 · 설명 · 별칭 · 그룹을 우리가. **끼워 넣는 자리가 하나에서 둘이 되므로 그 부분을 헬퍼로 뽑습니다** (지금은 목차 하나를 짚어 넣는 코드입니다) |
| `model/turn-into-items.ts` | 고침 | 전환 목록에 한 줄 (§7) |
| `ui/PageIcon/PageIconPicker.tsx` | 옮김 | → `ui/IconPicker/IconPicker.tsx`. 이름에서 「문서」를 뗍니다 (§6). 판 안은 안 고칩니다 |
| `ui/PageIcon/PageIcon.tsx` · 스토리 | 고침 | 옮긴 판을 부르는 자리의 import |
| `shared/config/messages.ts` | 고침 | `calloutLabels` — 이름 · 설명 · 자리 문구 · 아이콘 버튼 이름. `pageIconLabels` 에서 판 문구를 `iconPickerLabels` 로 가릅니다 (§6) |
| `shared/config/index.ts` | 고침 | 내보내기 두 줄 |
| `app/styles/blocknote-bridge.css` | 고침 | §3-2 의 예외 두 줄. **블록 색 절 바로 뒤**에 옵니다 |
| `app/styles/knocspace.css` | 고침 | 아이콘 칸 폭 · 간격 토큰 (§6) |
| `DESIGN.md` §9 | 고침 | 확정 카피와 수치. 「목차 블록」· 「블록 메뉴」 옆에 같은 꼴로 |
| `docs/roadmap/sprint-3.md` | 고침 | 체크 둘 (`남은 작업` · `3. 커스텀 블록`) |
| `ui/ContentEditor/stories/CalloutBlock.stories.tsx` | 새로 | 다른 블록 스토리와 같은 꼴 |
| `model/sample-pages.ts` | 고침 | 표본 문서에 콜아웃 한 덩어리 (자식 있는 것으로) |

**`lib/` 에는 아무것도 안 생깁니다.** 이모지 목록과 검색은 이미 있습니다 —
[page-icon-emoji.ts](../../src/pages/page-editor/lib/page-icon-emoji.ts) 를 그대로 부릅니다.

---

## 6. 아이콘 피커는 새로 만들지 않습니다 — 이름만 뗍니다

[`PageIconPicker`](../../src/pages/page-editor/ui/PageIcon/PageIconPicker.tsx) 가 이미 있습니다.
목록 · 검색 · 랜덤 · 제거 · 스크롤 성능(`content-visibility`)까지 다 든 판이고, **자기가 데이터를
안 갖고 받아서 부르기만 합니다** — 그래서 두 번째 자리에 그대로 섭니다.

**다만 이름이 「문서」에 묶여 있습니다.** 여는 자리가 문서 아이콘 하나였을 때 지은 이름인데,
콜아웃이 두 번째 자리가 되면 그 이름이 거짓말이 됩니다. 그래서 **이름을 떼는 일이 이 계획에
하나 붙습니다** — 콜아웃이 「문서 아이콘 피커」를 부르게 두지 않습니다.

| 지금 | 바꿔서 | 왜 |
|---|---|---|
| `ui/PageIcon/PageIconPicker.tsx` | `ui/IconPicker/IconPicker.tsx` | 문서 컴포넌트 폴더 안에 있으면 두 번째 자리에서 부를 때 자리가 어색합니다 |
| `pageIconLabels` 의 `search` · `random` · `remove` · `empty` | `iconPickerLabels` 로 가릅니다 | **판 안**의 문구입니다. 문서 것도 콜아웃 것도 아닙니다 |
| `pageIconLabels` 의 `add` · `change` | 그대로 | **여는 쪽**의 문구라 문서 아이콘 것이 맞습니다 (콜아웃은 `calloutLabels` 에서) |

**판 자체는 한 줄도 안 고칩니다.** 옮기는 것과, 부르는 쪽(`PageIcon` · 스토리)의 import 를
따라 고치는 것뿐입니다. 콜아웃 쪽에서 새로 짓는 문구는 `calloutLabels` (아이콘 버튼 이름 ·
슬래시 메뉴 이름 · 설명 · 자리 문구) 하나입니다.

옮기고 나면 같은 슬라이스(`pages/page-editor`) 안이라 상대경로로 가져옵니다.

```tsx
import { IconPicker } from "../IconPicker/IconPicker";
```

`PageIcon` 이 판을 여닫는 방법(바깥 클릭 · `Escape` · 포커스 되돌리기 · 마우스가 지날 때
미리 받기)도 같은 모양으로 씁니다. **다만 세 곳이 다릅니다.**

| | PageIcon | 콜아웃 |
|---|---|---|
| 위치 | 문서 맨 위라 아래로 열 자리가 늘 있습니다 | 본문 아무 데나 있습니다 — **문서 끝의 콜아웃은 아래가 없습니다** |
| 포커스 | 판을 닫으면 트리거로 돌아갑니다 | 판을 닫으면 **에디터 커서**로 돌아가야 합니다 |
| 「제거」 | 아이콘을 없앱니다 | 같습니다 — 다만 값 변환이 하나 낍니다 (아래) |

### 「제거」 는 `undefined` 로 오는데 prop 은 `""` 입니다

`IconPicker` 의 `onPick` 은 `(next: string | undefined) => void` 이고, 「제거」 를 누르면
`undefined` 가 옵니다. **그런데 BlockNote 의 prop 은 문자열 · 숫자 · 불리언만 담습니다**
(§2). 그래서 콜아웃 쪽에서 한 줄로 눕힙니다 — 판을 고치지 않습니다.

```tsx
onPick={(next) => editor.updateBlock(block, { props: { icon: next ?? "" } })}
```

### 판은 닫아도 안 떼어냅니다

`IconPicker` 는 `open` 을 prop 으로 받습니다 — 이모지 1,870개를 열 때마다 다시 그리지
않으려는 것이고, 포커스와 검색어 초기화가 마운트가 아니라 그 값에 매달려 있습니다.
**콜아웃도 같은 방법을 써야 합니다.** 조건부 렌더(`{open && <IconPicker …>}`)로 바꾸면
그 두 가지가 두 번째 열기부터 어긋납니다.

다만 콜아웃은 **한 문서에 여러 개**입니다. 콜아웃마다 판을 하나씩 숨겨 두면 열 개짜리
문서에 판이 열 개 붙습니다. **콜아웃 열 개가 판 하나를 돌려 쓸지, 각자 들지**가 §6 에서
열린 채로 남습니다 — 위치 문제(위)와 같이 브라우저에서 보고 정합니다.

**위치를 어떻게 할지는 열려 있습니다.** `PageIcon` 처럼 `position: absolute` 로 두면 문서
끝에서 판이 화면 밖으로 나갑니다. 세 갈래입니다 — (a) 아래 자리가 모자라면 위로 뒤집는 계산을
직접 쓴다, (b) BlockNote 포털에 얹어 코어의 위치 계산을 빌린다, (c) 문서 맨 아래에 여유
공간이 이미 있으니 그대로 둔다. **구현 첫날 브라우저에서 보고 정합니다.**

---

## 7. 들어가는 길 · 나오는 길

| 길 | 넣나 | 근거 |
|---|---|---|
| 슬래시 메뉴 `/콜아웃` | **예** | 목차와 같은 방법. 별칭 — `콜아웃` · `callout` · `강조` · `노트` · `info` |
| ⠿ 「전환」 목록 | **예** | 글자를 담는 블록이라 오갈 수 있습니다. Notion 의 전환 목록에도 있습니다 |
| 숫자키 (`⌘⌥N`) | 아니오 | Notion 에 콜아웃 번호가 없습니다. 0~8 은 이미 차 있고 9 는 하위 페이지 자리입니다 |
| 마크다운 축약 | 아니오 | Notion 에 없습니다. `>` 는 이미 토글 목록이고 `"` 는 인용입니다 |
| `Backspace` 로 나오기 | 예 | `isolating: false` 면 코어가 합니다. 빈 콜아웃에서 한 번 |
| 숫자키로 **나오기** (`⌘⌥0`) | 예 — 공짜 | 아래 |

**나오는 길은 아무것도 안 붙여도 하나 더 열려 있습니다.** `turnBlocksInto` 가 `content === "inline"`
인 블록만 바꾸는데([block-shortcuts.ts](../../src/pages/page-editor/model/block-shortcuts.ts)),
콜아웃이 `content: "inline"` 이라 그 검사를 통과합니다 — 콜아웃에서 `⌘⌥0` 을 누르면 본문이
됩니다. 들어가는 숫자키는 없고 나오는 숫자키만 있는 것이 이상해 보이지만, 코드 블록이 이미
같은 모양입니다 (`⌘⌥8` 로 들어가고 `Backspace` 로 나옵니다).

**전환 목록은 코드가 조금 더 붙습니다.** `turn-into-items.ts` 는 이름 · 그룹 · 아이콘을 전부
`ko` 사전에서 꺼내는데 **사전에 콜아웃이 없습니다.** 목차가 슬래시 메뉴에서 그랬듯이 이
한 줄만 우리 값입니다.

- 이름 — `calloutLabels.title`
- 그룹 — `editor.dictionary.slash_menu.paragraph.group` (「기본 블록」). 문자열로 안 적습니다
- 아이콘 — seed-icon. 슬래시 메뉴와 **같은 그림**이어야 합니다 (§6 이 닫히기 전까지의 규칙)
- 자리 — 「기본 블록」 묶음 안, 인용 옆. 머리말이 두 번 서지 않게

**아이콘 후보는 구현 때 `@preview` 를 꺼내 Notion 과 나란히 놓고 고릅니다** — 블록 메뉴 넷을
고른 방법 그대로입니다. Notion 의 콜아웃 아이콘은 **말풍선 안의 느낌표**에 가깝고,
`IconInformationCircleLine` 계열이 첫 후보입니다. 이름이 아니라 그림으로 정합니다.

### 내보내기 · 붙여넣기

| | |
|---|---|
| HTML 내보내기 | `<div data-callout data-icon="💡">` + 글자. 피커 버튼은 빼고 아이콘은 글자로 남깁니다 |
| 마크다운 내보내기 | **콜아웃이 인용문으로 뭉개집니다.** Notion 도 같습니다 — 마크다운에 콜아웃이 없습니다 |
| 붙여넣기(`parse`) | **F3 에서는 안 붙입니다.** 문서 가져오기는 F4 자리입니다 (`<h4>` 를 3 으로 누르는 것과 같은 줄) |

마크다운 왕복이 손실이라는 것은 **적어 두기만 합니다.** F4 에서 가져오기를 붙일 때
`> ` 로 시작하는 덩어리를 콜아웃으로 되살릴지 인용으로 둘지가 그때의 결정입니다.

---

## 8. 화면 규격 초안 — DESIGN.md §9 에 들어갈 값

확정이 아니라 **초안**입니다. 목차 블록이 그랬듯 구현하면서 브라우저에서 보고 닫습니다.

| | 초안 | 왜 |
|---|---|---|
| 아이콘 칸 | 22~24px, 글자와 8px 간격 | 이모지 하나가 서는 폭. 본문 16px 과 같은 줄에 앉아야 합니다 |
| 안쪽 여백 | 좌우 `comfy-4`(16px) · 위아래 `comfy-3`(12px) | 상자가 글줄보다 넓어야 상자로 읽힙니다 |
| 모서리 | `r1` | 블록 색 상자 · 선택 면 · 트리 행과 같은 값 (§7) |
| 색 없음(`default`) | 테두리 `stroke-neutral-weak` 한 겹, 배경 투명 | 색을 지워도 블록이 사라져 보이지 않게 |
| 자식 들여쓰기 | BlockNote 기본 24px 그대로 | 아이콘 칸(22px + 8px)과 대충 맞습니다. 굳이 안 맞춥니다 |
| 빈 콜아웃 자리 문구 | `여기에 쓰세요` (`fg-neutral-muted`) | 목차의 빈 안내와 달리 **띠를 안 깝니다** — 상자가 이미 자리를 말합니다 |
| 슬래시 메뉴 이름 | `콜아웃` | 결과의 이름 |
| 슬래시 메뉴 설명 | `강조할 내용을 상자에 담습니다.` | **합니다체** — 사전이 쓴 메뉴 한가운데 앉는 줄이라 (§8 의 유일한 예외, 목차와 같은 자리) |
| 아이콘 버튼 이름 | `콜아웃 아이콘 바꾸기` | 스크린리더가 읽는 이름. 문서 아이콘(`pageIconLabels.change`)과 같은 꼴 |

**빈 콜아웃에 목차 같은 파란 띠를 깔지 않습니다.** 목차가 띠를 까는 이유는 본문 한가운데 끼어
있는 빈 블록이 본문 한 줄과 구별되지 않아서인데, 콜아웃은 **배경 상자 자체가 이미 그 표시**
입니다. 띠를 또 깔면 상자 안의 상자가 됩니다.

---

## 9. 테스트

`slash-menu-items.tsx` · `turn-into-items.ts` 를 컴포넌트 밖에 둔 이유가 여기서도 그대로
살아납니다 — **목록은 순수 함수라 `BlockNoteEditor.create()` 하나로 검사할 수 있고, 메뉴
본체와 피커 판은 jsdom 에서 안 뜹니다** ([§0 §6](f3-blocknote-surface.md)).

| 볼 수 있는 것 (유닛) | 봐야 하는 것 (브라우저·스토리) |
|---|---|
| 슬래시 메뉴에 콜아웃이 있고, 이름 · 별칭 · 그룹이 맞는가 | 아이콘 피커가 뜨는 자리 (문서 끝에서도) |
| 전환 목록에 있고, 콜아웃 위에서 전환 줄이 뜨는가 | 판을 닫았을 때 커서가 콜아웃으로 돌아오는가 |
| `insertOrUpdateBlockForSlashMenu` 뒤 블록 타입 · 기본 props | 자식이 상자 **안**에 그려지는가 (§3 의 예외가 먹는가) |
| `icon: ""` 일 때 아이콘 칸이 없는가 | 콜아웃을 통째로 골랐을 때 색 상자와 선택 면이 겹치는 모양 |
| `toExternalHTML` 에 버튼이 안 들어가는가 | 라이트·다크 여덟 색이 다 읽히는가 |

---

## 10. 순서

```text
1. 스펙 + View 골격 — 스키마에 꽂고, 아이콘은 고정 💡 로 그린다
      ↓
2. §3-2 의 브리지 예외 둘 — 자식이 상자 안에 서는지 본다   ← 여기서 막히면 계획을 고친다
      ↓
2-1. §3-1 의 `Enter` — Tab 두 번으로 둘지 가로챌지 여기서 정한다
      ↓
3. 아이콘 피커 — 이름 떼고 재사용, 위치·포커스·판 공유 결정 (§6)
      ↓
4. 들어가는 길 둘 — 슬래시 메뉴 · 전환 목록
      ↓
5. 문구 · DESIGN.md §9 · 스토리 · 테스트
```

**2 번에서 막히면 계획을 고칩니다.** 자식은 `Tab` 으로 확실히 들어가지만(§3-1), 자식이 상자 안에 안 들어가면 콜아웃은 "색깔 있는 문단" 이 되고, 그건
블록 색(⠿ 메뉴 → 색상)으로 이미 되는 일이라 새 블록을 만들 값이 없어집니다. 1·2 를 먼저
붙여 보고 3 부터 갑니다.

---

## 열린 것 — 구현 때 닫습니다

| | |
|---|---|
| **기본색 `"gray"`** | 스키마의 한 칸이 그대로 먹는지, 넣는 자리마다 `props` 로 적어야 하는지 (§2). 스펙을 꽂자마자 봅니다 |
| **콜아웃에서 `Enter`** | 그대로 두어 `Enter`→`Tab` 두 번인지, 가로채서 자식을 만드는지 (§3-1). 가로채면 **나가는 길**(빈 자식에서 `Enter`)과 **빈 콜아웃에서 `Enter`**(자식이 통째로 밖으로 나오는 갈래)를 같이 봅니다 |
| 브리지 예외의 정확한 값 | 부모에 무엇을 칠하고 `.bn-block-content` 의 축소를 어디까지 되돌리는지. 선택 면과 겹치는 모양을 보고 정합니다 (§3-2) |
| 아이콘 피커 위치 | 아래로 열 자리가 없을 때 (§6). 뒤집기 · 포털 · 그대로 두기 중 하나 |
| 판을 몇 개 들지 | 콜아웃마다 하나씩인지, 문서에 하나를 돌려 쓰는지 (§6) |
| 전환 목록 아이콘 | seed-icon 680개에서 `@preview` 를 꺼내 Notion 과 나란히 놓고 (§7) |
| 표본 문서 | 자식 있는 콜아웃을 넣을지. 넣으면 §3 이 회귀 검사로 남습니다 |
| 마크다운 왕복 | F4 문서 가져오기의 결정입니다. 여기서는 손실이라는 것만 적어 둡니다 |

---

← [F3](../roadmap/sprint-3.md) · [§0 BlockNote 표면](f3-blocknote-surface.md)
