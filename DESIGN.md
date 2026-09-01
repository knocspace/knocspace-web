# KnocSpace 디자인 규칙 (D0 확정)

UI 코드를 쓰기 전에 이 파일을 읽습니다. 여기 적힌 값은 D0에서 확정됐고, 4개 스프린트 동안 바뀌지 않습니다.

## ⚠ SEED 스킬보다 이 문서가 우선입니다

이 프로젝트에는 당근 SEED 스킬이 설치돼 있습니다. 그 스킬이 알려주는 값은 **SEED 원본(당근 앱, 모바일, 터치) 기준**이고, KnocSpace가 D0에서 바꾼 것은 전혀 모릅니다.

| SEED 스킬이 말하는 것 | KnocSpace 실제 값 |
|---|---|
| brand = carrot | **purple** — `--seed-color-*-brand-*` 8개를 재매핑 |
| 앱바 56pt | **상단바 44px** |
| 행/리스트 높이 48pt 이상 | **그리드 행 32px, 트리 행 28px** |
| 터치 영역 최소 44pt | **데스크톱 전용, 적용 안 함** |
| 간격 토큰 없음 (2~22pt 관습) | **dense / comfy 두 계열 (아래)** |
| 격자선 `stroke-neutral-muted` | **내부 격자선 `stroke-neutral-subtle`** |

충돌하면 이 문서가 이깁니다. SEED 스킬은 컴포넌트 스펙(패딩, 반경, 상태 규칙)과 토큰 이름을 확인하는 용도로만 씁니다.

**토큰 이름은 설치된 버전이 정답입니다.** 이 프로젝트는 SEED 2.5 이고, 색 토큰은 `--seed-color-<역할>-<의미>-<강도>` 한 계열입니다. 옛 이름을 쓴 자료(1.x 기준 문서, 오래된 예제)를 만나면 아래로 옮겨 읽습니다.

| 옛 이름 (SEED 1.x) | SEED 2.5 |
|---|---|
| `--seed-semantic-color-primary` 계열 | `--seed-color-*-brand-*` |
| `--seed-scale-color-*` | `--seed-color-palette-*` |
| `--seed-static-color-static-white` | `--seed-color-palette-static-white` |
| `--seed-semantic-color-ink-text` | `--seed-color-fg-neutral` |
| `paper-default` · `paper-floating` · `paper-contents` | `bg-layer-default` · `-floating` · `-basement` |
| `divider-2` · `divider-3` | `stroke-neutral-muted` · `stroke-neutral-subtle` |
| `gray-hover` | `bg-neutral-weak-alpha` |
| `primary-low` | `bg-brand-weak` |
| `label3` · `body-medium` | `t3-regular` · `t5-regular` |
| `BoxButton` | `ActionButton` (`brandSolid` `neutralWeak` `ghost` …) |
| `data-seed-scale-color="dark"` | `data-seed-color-mode="dark-only"` |

팔레트는 **모드마다 값이 뒤집힙니다.** `gray-00` 은 라이트에서 흰색, 다크에서 검정입니다. 단계 번호를 라이트에서 다크로 복사하면 안 됩니다.

---

## 1. 절대 규칙

### SEED 변수를 건드려도 되는 곳

**허용 — 아래 9개 재매핑 딱 한 군데.** `src/styles/knocspace.css` 안, 이 목록만.

```
--seed-color-fg-brand
--seed-color-fg-brand-contrast
--seed-color-bg-brand-solid
--seed-color-bg-brand-solid-pressed
--seed-color-bg-brand-weak
--seed-color-bg-brand-weak-pressed
--seed-color-stroke-brand-solid
--seed-color-stroke-brand-weak
--seed-color-stroke-focus-ring
```

앞의 8개는 SEED 2.5 에서 carrot 을 참조하는 semantic 토큰 **전부**입니다. 컴포넌트는 무수정으로 따라옵니다.

9번째 `stroke-focus-ring` 은 §6 의 포커스 링 결정에 따라 열었습니다. 여기서 안 덮으면 SEED 컴포넌트만 파란 링이 남아 우리 컴포넌트와 갈립니다.

**라이트·다크 블록을 양쪽 다 덮어야 합니다** — 한쪽만 덮으면 반대 모드에서 SEED 기본값이 새어 나옵니다.

**금지**

- `--seed-color-palette-*` 를 새로 정의하거나 값을 바꾸는 것. 새 색이 필요하면 `--knoc-` 이름으로 만듭니다.
- `--seed-dimension-*`, `--seed-radius-*`, `--seed-font-*`, `--seed-line-height-*` 재정의.
- 위 9개 밖의 `--seed-color-*` 재정의.
- SEED 컴포넌트에 `!important`나 자손 선택자로 스타일을 덮는 것. 스타일이 안 맞으면 컴포넌트를 안 쓰거나 `style` prop으로 넘깁니다.
- 컴포넌트 안에 하드코딩된 hex. 색은 전부 토큰 참조로.

### 새로 만드는 것은 전부 `--knoc-` 접두사

밀도, 레이아웃 치수, 격자선 — 새 값은 모두 `--knoc-`로 시작합니다. SEED를 업그레이드했을 때 충돌 지점이 `knocspace.css` 한 파일로 모입니다.

### 색 사용

- 강조색은 purple 계열 **하나만**. 선택 상태, 주 액션, 커서, 삽입선.
  - **글자를 치는 캐럿은 예외입니다 — 중립색(`fg-neutral`)입니다.** 여기서 말하는 커서는
    삽입선(블록을 끌어다 놓을 자리를 가리키는 선)이고, 캐럿까지 보라로 칠하면 보라가
    "선택된 상태" 인지 "여기에 글자가 들어간다" 인지 구별이 안 됩니다. 값은
    `--knoc-color-caret`, 거는 곳은 `index.css` 의 base 레이어 한 곳입니다.
- 상태색은 SEED 그대로: `positive` 성공, `critical` 위험, `warning` 경고, `informative` 링크, `stroke-focus-ring` 포커스.
- 배경은 항상 `bg-layer-*` 토큰. 팔레트 gray 를 배경에 직접 쓰지 않습니다.
- brand-solid 위 텍스트는 라이트·다크 모두 `--seed-color-palette-static-white`.
- 그라디언트, 텍스처, 일러스트 없음.

---

## 2. 확정 수치

| 항목 | 값 | 토큰 |
|---|---|---|
| 사이드바 기본 폭 | 240px | `--knoc-sidebar-default` |
| 사이드바 최소 / 최대 | 200 / 480px | `--knoc-sidebar-min` / `-max` |
| 사이드바 접힘 | 200px 아래로 끌면 40px 아이콘 레일 | `--knoc-sidebar-rail` |
| 상단바 높이 | 44px | `--knoc-topbar-height` |
| 문서 본문 최대 폭 | 720px | `--knoc-doc-measure` |
| 문서 좌우 거터 | 54px | `--knoc-doc-gutter` |
| 문서 위아래 여백 | 64px | — |
| 문서 제목 → 첫 블록 | 16px (+ 첫 블록 자기 여백) | — |
| DB 화면 좌우 거터 | 16px (measure 무시, 전체 폭) | `--knoc-db-gutter` |
| 그리드 행 높이 | 32px | `--knoc-grid-row-height` |
| 그리드 헤더 높이 | 34px | `--knoc-grid-header-height` |
| 그리드 셀 좌우 패딩 | 8px | `--knoc-space-dense-4` |
| 트리 행 높이 | 28px | `--knoc-tree-row-height` |
| 트리 들여쓰기 단위 | 14px | `--knoc-tree-indent` |
| 트리 행 액션 버튼 | 24×24 (아이콘 16px) | `--knoc-tree-action-size` |
| 툴바 높이 | 40px | `--knoc-toolbar-height` |
| 칩 높이 | 26px | `--knoc-chip-height` |
| 필터 팝오버 폭 | 380px 고정 | — |
| 칸반 컬럼 폭 | 260px 고정 | — |
| 문서 아이콘(이모지) | 52px, 제목과 10px 간격 | — |
| 문서 제목 | 40px / 700 / −0.035em / lh 1.2 | `--knoc-text-doc-title` |

### 강조색

carrot 을 참조하던 semantic 토큰 8개를 purple 로 옮기되, **carrot 매핑에서 한 칸 진한 쪽**으로 둡니다. SEED 기본 단계 그대로면 solid 위의 흰 라벨이 라이트에서 2.9:1 로 흐립니다.

| SEED 토큰 | 라이트 | 다크 |
|---|---|---|
| `fg-brand` | purple-700 `#8969ea` | purple-600 `#8e6bee` |
| `fg-brand-contrast` | purple-800 `#6d50cb` | purple-600 `#8e6bee` |
| `bg-brand-solid` | purple-700 | purple-600 |
| `bg-brand-solid-pressed` | purple-800 | purple-700 |
| `bg-brand-weak` | purple-100 `#f5f3fe` | purple-100 `#28213b` |
| `bg-brand-weak-pressed` | purple-200 | purple-200 |
| `stroke-brand-solid` | purple-800 | purple-600 |
| `stroke-brand-weak` | purple-300 | purple-300 |

브랜드 보라는 **`#8969ea`** 입니다. D0 이 적어둔 `#8361E8` 이 가리키던 색이고, 흰 글자 대비 4.0:1 로 기준을 넘습니다.

**단계 번호를 라이트에서 다크로 복사하지 마세요.** 팔레트가 모드마다 뒤집혀서 라이트는 번호가 클수록, 다크는 작을수록 진합니다. 두 모드가 같은 보라로 보이려면 다크 번호가 라이트보다 한 단계 **낮아야** 합니다 — 라이트 purple-700 `#8969ea` ↔ 다크 purple-600 `#8e6bee`.

`weak` 3종(100 / 200 / 300)은 단계를 안 옮겼습니다. 그건 브랜드 색이 아니라 표면 틴트라서, 올리면 트리 선택 배경만 진해집니다.

alpha **단계**(`--knoc-purple-alpha-*`)는 만들지 않습니다. 선택·호버의 옅은 강조는 `bg-brand-weak` 가 맡고, 그 값이 이미 모드별로 갈라져 있습니다.

**예외는 에디터의 선택 오버레이 둘뿐입니다** — `--knoc-color-selection-surface`(8%)와 `--knoc-color-selection-ring`(30%). 단계 한 벌이 아니라 자리가 정해진 semantic 값 둘이고, `bg-brand-weak` 로는 **물리적으로 못 하는** 자리입니다. 그 색이 깔리는 곳이 `:after { inset: 0 }` 으로 블록 위에 덮는 오버레이라, 불투명하면 글자가 가려집니다. 자세한 것은 §7.

`::selection` 색은 **아직 정하지 않았습니다.** SEED 2.5 에 대응 토큰이 없어 새로 정해야 하고, 에디터 표면이 생기는 F3 에서 함께 결정합니다. 그때까지 브라우저 기본값을 둡니다.

### 격자선

| 위치 | KnocSpace 변수 | 참조하는 SEED 토큰 |
|---|---|---|
| 그리드 내부 (셀 경계) | `--knoc-color-grid-line` | `stroke-neutral-subtle` |
| 고정 헤더 하단 · 한 단계 강한 내부선 | `--knoc-color-grid-edge` | `stroke-neutral-muted` |
| 표 바깥 경계 | `--knoc-color-grid-border` | `stroke-neutral-weak` |

앞의 둘은 alpha 계열(라이트 `static-black-alpha`, 다크 `static-white-alpha`)이라 행 호버·선택 배경 위에서 색이 어긋나지 않고 다크모드에서 자동으로 반전됩니다. 바깥 경계만 solid(`gray-400`)로 한 단계 세웁니다.

내부 격자선은 SEED 의 기본 경계보다 한 단계 낮춥니다. 모바일 단일 컬럼에서 적절한 굵기가 8열 26행 그리드에서는 데이터보다 먼저 읽힙니다.

Tailwind 색 유틸리티로 노출된 것은 `grid-line` 과 `grid-edge` 둘뿐입니다. `grid-border` 는 그리드를 실제로 만들 때 추가합니다.

세로선 없이 가로선만 쓰는 변형은 **읽기 전용 뷰에만** 씁니다. 편집 가능한 그리드에서는 열 리사이즈 손잡이와 셀 경계가 필요합니다.

### 타이포

| 역할 | 크기 | 굵기 | 비고 |
|---|---|---|---|
| 그리드 셀 · 트리 행 | 13px / 1.35 | 400 | SEED `t3-regular` |
| 그리드 헤더 | 12.5px | 700 | `fg-neutral-subtle` |
| 문서 본문 | 16px / 1.5 | 400 | BlockNote 기본. `t5` 와 크기는 같고 줄간만 다릅니다 |
| 문서 **안쪽** 제목1 / 2 / 3 | 30 / 24 / 20px / lh 1.3 | 700 | 자간 없음. `--knoc-text-heading-*` |
| 토큰명·코드 | 13px | 400 | `--knoc-font-mono` (시스템 고정폭). Roboto Mono 아닙니다 |
| 워드마크 | — | **600** | Pretendard SemiBold, −0.035em, 최소 13px |

**글꼴은 `--knoc-font-sans` · `--knoc-font-mono` 두 개가 전부이고, 값의 출처는 `knocspace.css` 입니다.**

`SEED 에는 글꼴 토큰이 없습니다.` `base.layered.css` 는 `--seed-font-size-t1`~`t14` 와
`--seed-font-weight-*` 만 주고 `font-family` 는 한 줄도 선언하지 않습니다.
`@seed-design/tailwind4-theme` 도 `--font-sans` 를 안 줍니다. 그래서 안 정하면 Tailwind
preflight 의 기본 스택이 그대로 앱 글꼴이 됩니다 — **정한 적 없는 값이 정답 자리에 앉습니다.**
F3 에서 실제로 그 상태였고(윈도우에서 Segoe UI · 맑은 고딕), 여기서 닫았습니다.

| | 값 | 웹폰트 |
|---|---|---|
| 본문 (`--knoc-font-sans`) | **Pretendard Variable** → 시스템 산세리프 | 받습니다 |
| 코드 (`--knoc-font-mono`) | 시스템 고정폭 (윈도우 Consolas) | 안 받습니다 |

`knocspace.css` 의 `@theme inline` 이 이 둘을 Tailwind 의 `--font-sans` · `--font-mono` 로
내보내고, preflight 가 그걸 읽어 `html` 과 `code`·`kbd`·`samp`·`pre` 에 겁니다. 앱 전체가
한 번에 따라오고 `font-sans` · `font-mono` 유틸리티도 같이 생깁니다. 에디터도 같은 값으로
옵니다 — §7 이 `font-family: inherit` 로 되돌려 상속으로 내려받습니다.

**Pretendard 는 dynamic-subset 으로 받습니다.** 통짜 variable 은 2.0MB 한 덩어리라 첫 화면에서
전부 받지만, subset 은 `unicode-range` 로 92 조각이라 화면에 실제로 쓰인 글자가 든 조각만
받습니다(조각당 30KB 안팎). 등록은 `index.css` 한 줄, 이름은 `knocspace.css` 한 곳입니다.

**고정폭은 웹폰트를 안 받습니다.** 코드용 글꼴은 OS 마다 이미 좋은 것이 깔려 있고, 본문용으로
Pretendard 를 받는 마당에 하나 더 받을 값이 크지 않습니다. 한글이 섞였을 때 대체 글꼴로 떨어져
폭이 어긋나는 것도 웹 고정폭 쪽이 더 심합니다.

**문서 제목 40px 과 문서 안쪽 제목은 다른 것입니다.** 40px 은 페이지 한 장의 이름이고
(`PageTitle`), 제목1·2·3 은 본문에 넣는 블록입니다. BlockNote 에는 페이지 제목이 없어서 —
문서가 블록 배열 하나가 전부입니다 — 제목 자리는 우리가 만듭니다. 줄간도 그래서 다릅니다:
제목은 한 줄로 끝나는 일이 많아 1.2, 블록 제목은 1.3 입니다.

**문서 안쪽 제목의 크기는 우리 값입니다.** BlockNote 기본은 48 · 32 · 20.8px 로 본문 16px 의
3 · 2 · 1.3 배입니다 — 문서 한 장에서 제목1 이 너무 크게 섭니다. 30 · 24 · 20px 은 Notion 값이고,
한 번 26 · 20 · 17px 까지 줄여 봤다가 본문과의 위계가 눌려서 되돌린 자리입니다.

값은 `--knoc-text-heading-*` 하나에서 오고 `blocknote-bridge.css` 가 그걸 BlockNote 의
`--level` 로 넘깁니다. **크기를 다시 바꾸면 사이드 메뉴(＋ · ⠿) 자리가 같이 움직입니다** —
BlockNote 는 그 자리를 자기 기본 크기에 맞춘 상수로 갖고 있어서, 크기를 바꾸면 아이콘이
글자와 어긋납니다. `ui/ContentEditor/blocknote-side-menu.ts` 가 첫 줄을 재서 대신 맞추므로 고칠
것은 없지만, 그 자리가 §7 에서 우리 쪽으로 넘어와 있다는 것은 기억해 둡니다.

**H4 · H5 · H6 은 없습니다.** BlockNote 에는 여섯 단계가 있지만 H4 는 본문과 크기가 같고(1em)
H5 · H6 은 본문보다 작아서(0.9em · 0.8em) 위계가 아니라 각주로 읽힙니다. `schema.ts` 의
`levels: [1, 2, 3]` 으로 닫았고 슬래시 메뉴 · 단축키 · 마크다운 셋이 같이 닫혔습니다.
Notion 도 제목1·2·3 뿐입니다.

SEED 의 `t` 스케일은 11 · 12 · 13 · 14 · 16 · 18 · 20 · 22 · 24px 입니다(`t1`~`t9`). 문서 제목 40px 과 제목1 30px 은 이 스케일 밖이라 `--knoc-` 로 따로 정했습니다. 제목3 의 20px 은 `t7` 과 같지만 셋이 한 스케일이라 같이 둡니다 — 하나만 다른 곳에서 오면 고칠 때 하나를 빠뜨립니다. 문서 제목은 에디터 밖이라 `blocknote-bridge.css` 를 안 거칩니다.

우리가 쓰는 굵기는 400과 700 둘입니다. **600은 워드마크 전용 예외**이고 본문에는 쓰지 않습니다. (SEED 토큰 레이어 자체에는 `--seed-font-weight-medium` 도 있습니다 — 안 쓸 뿐입니다. BlockNote 의 메뉴 크롬은 500·600을 쓰는데, 본문이 아니라 그대로 둡니다.) 한글은 `word-break: keep-all`.

---

## 3. dense와 comfy

두 계열을 병렬로 둡니다. **화면 단위가 아니라 표면 단위로** 붙습니다 — 문서 안에 인라인 데이터베이스가 들어가면 그 블록만 dense로 전환합니다.

| | comfy | dense |
|---|---|---|
| 쓰는 표면 | 문서 에디터, 설정 화면, 온보딩, 모달 본문 | 그리드, 칸반, 사이드바 트리, 툴바, 필터 팝오버, 인라인 DB |
| 성격 | 읽고 쓰는 곳 | 훑고 조작하는 곳 |
| 기준 | SEED 기본값에 가까움 | SEED보다 조밀 |

| 토큰 | dense | comfy |
|---|---|---|
| `--knoc-space-*-1` | 2px | 8px |
| `--knoc-space-*-2` | 4px | 12px |
| `--knoc-space-*-3` | 6px | 16px |
| `--knoc-space-*-4` | 8px | 20px |
| `--knoc-space-*-5` | 10px | 24px |
| `--knoc-space-*-6` | 12px | 32px |
| `--knoc-space-*-7` | 16px | 48px |

### dense 표면에서 하지 말 것

- **SEED 버튼을 그리드 행 안에 넣지 마세요.** `ActionButton` 의 최소 높이가 32px(`size="xsmall"`)이라 32px 행에 여백 없이 꽉 찹니다. 트리 행(28px)은 §6 · §10 에서 24px 로 닫혔고, **그리드 행(32px)은 아직 열려 있습니다**(§6).
- 44pt 터치 규칙 적용 금지. 데스크톱 전용입니다.
- 그림자 금지. 떠 있는 것(팝오버, 툴바, FAB)만 그림자를 씁니다.

---

## 4. 설정 파일

### `vite.config.ts`

```ts
import { fileURLToPath } from "node:url";
import { defineConfig, defaultClientConditions } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { seedDesignPlugin } from "@seed-design/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), seedDesignPlugin()],
  resolve: {
    // SEED 컴포넌트가 recipes/*.layered.mjs 를 집게 한다.
    // Vite 6+ 에서 conditions 는 기본값을 덮어쓰므로 반드시 펼쳐서 넣는다.
    conditions: [...defaultClientConditions, "seed-layered"],
    // tsconfig.app.json 의 paths 와 짝을 맞춘다.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
```

### `src/index.css`

순서가 중요합니다. KnocSpace 레이어는 반드시 SEED 다음.

```css
@layer theme, base, seed-base, components, seed-components, utilities;

/* 앱 글꼴 — §2. @font-face 선언뿐이라 layer 와 무관하다 */
@import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";

@import "@seed-design/css/base.layered.css";
@import "tailwindcss";
@import "@seed-design/tailwind4-theme";
@import "./styles/knocspace.css";
@import "./styles/blocknote-bridge.css";

/* 문서가 CSS 번들에 영향을 주지 않게 한다. 경로는 이 CSS 파일 기준이고
 * 탐지 범위는 프로젝트 루트라 ../ 가 필요하다 */
@source not "../**/*.md";
```

Pretendard 는 `-dynamic-subset` 쪽입니다. 통짜 `pretendardvariable.css` 를 넣으면 2.0MB 를 한 번에 받습니다 — §2.

`blocknote-bridge.css` 는 §7 입니다. 라이브러리 CSS 자체(`@blocknote/mantine/style.css`)는
여기가 아니라 에디터 컴포넌트가 부릅니다 — 지연 로드라 청크가 자기 CSS 를 들고 갑니다.

### `src/styles/knocspace.css`

**값은 파일이 정답입니다.** 여기 옮겨 적지 않습니다 — 두 벌이 되면 반드시 어긋납니다. 파일은 세 부분입니다.

1. **brand 8개 재매핑** — carrot → purple. §1 의 허용 목록이 곧 이 블록입니다. 라이트·다크 두 벌.
2. **`--knoc-` 변수** — 글꼴(sans/mono), 밀도(dense/comfy 각 7단계), 레이아웃 치수, 격자선.
3. **`@theme inline`** — 위 변수를 Tailwind 유틸리티로 노출. 글꼴만 성격이 다릅니다 — 유틸리티가 아니라 `--font-sans` · `--font-mono` 에 얹어서 preflight 가 앱 전체에 걸게 합니다(§2).

파일 전체를 `@layer` **밖에** 둡니다. SEED 의 토큰은 `@layer seed-base` 안에 있고, layer 없는 선언은 어떤 layer 보다도 우선하므로 명시도와 무관하게 이깁니다.

`@theme inline` 에 등록한 것만 클래스로 씁니다. `h-[var(--knoc-...)]` 같은 임의값 표기는 쓰지 않습니다 — 새 치수가 필요하면 먼저 유틸리티로 노출합니다.

```
h-tree-row  h-grid-row  h-topbar   w-sidebar   max-w-measure
p-dense-1..7           p-comfy-1..7           px-doc-gutter
border-grid-line       border-grid-edge
```

다크모드는 `<html data-seed-color-mode="dark-only">`, 시스템을 따르게 하려면 `data-seed-color-mode="system"` + `data-seed-user-color-scheme`. 별도 팔레트를 만들지 않습니다.

---

## 5. SEED에 없는 컴포넌트 5종

공통 규칙: **동작만 새로 만들고 표면은 SEED 토큰에서 빌립니다.** 색·반경·모션은 한 값도 새로 정하지 않습니다.

### 데이터 그리드 (D1)

- TanStack Table headless로 열 리사이즈, 가상 스크롤, 고정 헤더 처리. 셀 렌더러만 직접 작성.
- 셀 편집은 별도 입력을 띄우지 않고 셀 자체를 `contenteditable` 표면으로 전환. 행 높이는 편집 중에만 `auto`로 풀림.
- SEED에서 빌리는 것: 셀 포커스 링 = `stroke-focus-ring` / 선택 행 = `bg-brand-weak` / 격자선 = `--knoc-color-grid-*` / 타입 = `t3-regular`

### 리사이즈 가능한 사이드바 (D1)

- 트리는 평탄화한 배열 + `depth` 필드로 렌더. **재귀 컴포넌트 금지** — 가상 스크롤이 안 됩니다.
- drag & drop은 dnd-kit. 드롭 위치는 2px 삽입선과 들여쓰기 미리보기 두 가지로 표시.
- 폭은 포인터 이벤트로 직접 처리, `localStorage`에 저장.
- SEED에서 빌리는 것: 행 호버 = `bg-neutral-weak-alpha` / 선택 = `bg-brand-weak` / 삽입선 = `bg-brand-solid` / 아이콘 = seed-icon 16px

**트리 행 상태 — F1 에서 확정.** 행 자체는 배경만 바뀌고 치수는 어느 상태에서도 안 움직입니다.

| 상태 | 표현 |
|---|---|
| 기본 | 배경 없음. 글자 `fg-neutral-muted` |
| 호버 | `bg-neutral-weak-alpha` + 액션 버튼 등장 |
| 선택 | `bg-brand-weak`, 글자 `fg-neutral`, 문서 아이콘 `fg-brand` |
| 선택 + 호버 | `bg-brand-weak-pressed` |
| 키보드 포커스 | `knoc-focus-ring-inset` (§6) |
| 드래그 중 | 원본을 40% 불투명도로 남김 |
| 드롭 위치 | 2px `bg-brand-solid` 삽입선. 들어갈 깊이만큼 왼쪽을 물림 |
| 불러오는 중 | `Skeleton` 이 28px 행 자리를 그대로 차지 |

행 안쪽 순서는 `펼침 화살표 16px · 문서 아이콘 16px · 제목 · (액션 버튼)`, 간격 `dense-2`(4px), 좌측 패딩 `4px + 14px × depth`.

**문서 아이콘의 16px 은 자리이지 글자 크기가 아닙니다.** 유저가 고른 이모지는 그 16px 상자 안에서 행 글자 크기(`t3` 13px)를 따릅니다 — 이모지만 16px 로 키우면 28px 행에서 제목보다 커져 행의 무게중심이 아이콘으로 갑니다. 16px 로 그려지는 것은 아이콘이 **없는** 페이지에 들어가는 seed-icon 쪽입니다. 문서 헤더의 52px(`--knoc-text-doc-icon`)과는 같은 값의 다른 크기입니다 — 저장되는 것은 이모지 문자열 하나로 같습니다.

### 에디터 표면 (D1)

- BlockNote CSS를 끄지 않고 변수만 다시 가리킵니다(§7).
- 슬래시 메뉴와 포맷 툴바만 SEED 표면으로 교체. 블록 내부는 손대지 않음.
- 슬래시 메뉴: 폭 320px, 행 높이 32px, 각 항목에 마크다운 단축 표기 표시. **10줄** — 제목이 1·2·3 세 줄로 나와서, 전부 펼치면 320px + 패딩입니다. 폭과 같아지므로 잘라야 할지는 실제로 띄워 보고 정합니다.
- 포맷 툴바: 높이 34px, 반경 `r1_5`(6px), FAB 그림자(`0 2px 6px rgba(0,0,0,.16)`), 켜진 버튼만 `bg-brand-weak`.
- SEED에서 빌리는 것: 색·타입·반경 전부 / 메뉴 = `ActionSheet` 스타일 / 툴바 = `bg-layer-floating`

### 칸반 보드 (D2)

- 그리드와 **같은 데이터, 같은 셀 렌더러**를 씁니다. 카드는 Grid 행의 다른 배치일 뿐이라는 원칙을 코드 수준에서 지킵니다.
- 컬럼 폭 260px 고정, 카드 간격 `dense-4`. 드래그 중 원본은 사라지지 않고 40% 불투명도로 남김.
- SEED에서 빌리는 것: 카드 = `bg-layer-default` + `stroke-neutral-muted` 1px / 컬럼 배경 = `bg-layer-basement` / 반경 `r1_5` / 드롭 자리 = `bg-brand-weak`

### 필터 편집 팝오버 (D2)

- 필드 → 연산자 → 값을 한 행에 나란히. 값 입력기는 필드 타입이 결정.
- 조건 추가는 행 단위. AND/OR는 두 번째 행부터 왼쪽 열에 나타남.
- 폭 380px 고정, 조건 5개까지 스크롤 없이.
- SEED에서 빌리는 것: `SelectBox` 3개 조합 / 표면 = `bg-layer-floating` / 반경 `r2_5`(10px) / 지우기 = `ActionButton variant="ghost"` + `fg-critical`

---

## 6. 미결정과 확정 기록

열려 있는 것은 **그리드(32px) 행의 dense 버튼** · **슬래시 메뉴 아이콘** · **코드 블록 표면** 셋입니다. 트리 행(28px)은 F1 에서 닫혔습니다. 코드에서 미결정 항목을 마주치면 임의로 값을 넣지 말고 결정을 요청하세요.

### 포커스 링 — F1 에서 확정 (브랜드 링)

`--seed-color-stroke-focus-ring` 을 **`stroke-brand-solid`** 로 덮습니다. **새 색을 만들지 않고** 이미 있는 토큰을 그대로 가리킵니다.

| | 라이트 | 다크 |
|---|---|---|
| 링 | purple-800 `#6d50cb` | purple-600 `#8e6bee` |
| 기본 배경 대비 | 5.7:1 | 5.5:1 |
| `bg-brand-weak` 위 대비 | 5.2:1 | 4.0:1 |

SEED 기본값 blue-600 은 흰 배경 대비 **2.6:1** 이라 비텍스트 3:1 을 못 넘습니다.

**gray-900 을 쓰지 않습니다.** 대비는 13.4:1 로 가장 높지만 브라우저 기본 outline 처럼 시스템 밖에서 붙은 것으로 읽히고, 다크에서는 `#e9eaec` 라 **본문 글자보다 밝습니다.** 포커스 표시가 화면에서 가장 밝은 것이 되면 안 됩니다.

**blue-700 도 쓰지 않습니다.** 대비(3.68:1)는 통과하지만 §1 의 "강조색은 purple 계열 하나만" 을 깨고 세 번째 색을 들입니다.

**선택과 안 섞입니다** — 선택은 **면**(`bg-brand-weak`), 포커스는 **선**(2px). 같은 보라여도 형태가 다릅니다. brand-solid 버튼 위에서는 아래의 halo 1px 이 링을 떼어 놓습니다.

**`outline` 이 아니라 `box-shadow` 2겹입니다.** `outline-offset` 은 그 자리에 뒤 배경을 비출 뿐 선을 그리지 않아서, 보라 버튼 위에서는 링이 버튼에 그대로 붙어 보입니다. 안쪽 1px 은 `bg-layer-default` 라 모드에 따라 흰색/`gray-100` 으로 뒤집힙니다.

```
knoc-focus-ring         기본. 바깥으로 halo 1px + 링 2px
knoc-focus-ring-inset   링이 밖으로 나갈 자리가 없을 때 —
                        레일 버튼, 트리 행, 그리드 셀. halo 없음
```

정의는 `knocspace.css` 의 `@layer components` 에 있습니다. 컴포넌트는 클래스 이름만 붙이고 값을 다시 쓰지 않습니다. **포커스 링을 없애지 마세요** — 접근성 요구사항입니다.

### 슬래시 메뉴 아이콘 — 열려 있음 (F3 §2 전에 닫아야 함)

BlockNote 기본 아이콘은 인라인 SVG 로 박혀 있고 seed-icon 이 아닙니다. §8 을 지키려면 우리가 붙여야 하는데, **seed-icon 680개에 없는 것이 있습니다.**

| 블록 | seed-icon |
|---|---|
| 인용 | `IconQuotationmark2LeftLine` — 별칭에 `인용` |
| 불릿 | `IconDothorizline3VerticalLine` — 별칭에 `bullets` · `목록` |
| 체크박스 | `IconHorizline3VerticalCheckmarkLine` — 별칭에 `체크` · `목록` |
| 본문 | `IconHorizline3VerticalLine` — 모양은 맞지만 별칭이 `더보기` 쪽 |
| 구분선 | `IconMinusLine` — 별칭이 `빼기` · `제거` |
| 제목1·2·3 | `IconHashLine` 하나뿐. **1·2·3 을 구분할 수 없습니다** |
| 번호 목록 | **없음** |
| 코드 블록 | **없음** |

§8 은 "필요한 아이콘이 없으면 가져오고, 직접 그리지 않습니다" 입니다. 어디서 가져올지가 안 정해져 있어 후보 셋을 남깁니다.

- **A. 아이콘 없이 글자만.** 320px 폭에 제목과 마크다운 표기면 행이 비어 보이지 않습니다. 가장 싸고 §8 을 어기지 않습니다
- **B. 마크다운 표기를 왼쪽 자리에.** `#` · `##` · `-` · `1.` 을 모노스페이스로 세웁니다. 아이콘이 아니라 글자라 §8 밖이고, 배지 자리는 비웁니다
- **C. 없는 다섯을 SEED 팀에 요청.** 이번 주 안에는 안 옵니다

근거는 [F3 §0 확인 결과](docs/decisions/f3-blocknote-surface.md)에 있습니다.

### 코드 블록 표면 — 열려 있음 (F3 밖으로 미뤄도 됩니다)

코드 블록은 라이트 모드에서도 **항상 검정**입니다 — `rgb(22 22 22)` 가 CSS 에 박혀 있고,
그게 BlockNote 의 의도입니다. Shiki 문법색도 `.shiki { color: var(--shiki-dark) }` 로
다크에 고정돼 있습니다. §7 의 예외에서는 **반경만** 가져오고 배경은 그대로 뒀습니다.

뒤집으려면 둘을 같이 해야 합니다 — 표면을 SEED 토큰으로, 문법색을 라이트에서
`--shiki-light` 로. 후보 둘입니다.

- **A. 지금처럼 다크 고정.** 코드는 문서 표면과 다른 규칙을 갖는다고 선언합니다. 0줄.
  대신 [F3 완료 조건](docs/roadmap/sprint-3.md#완료-조건)의 "라이트·다크 모두 SEED 토큰"
  에 코드 블록을 예외로 적어야 합니다
- **B. 모드를 따라가게.** 2~3줄이지만, github-light 문법색이 SEED 표면 위에서 읽히는지
  **브라우저에서 봐야** 정해집니다. jsdom 으로는 확인이 안 됩니다

F3 은 A 로 두고, D1 에서 코드 블록을 다시 볼 때 닫는 것을 권합니다.

**`<select>` 언어 선택기는 여기서 빠졌습니다 — 먼저 닫았습니다.** 스펙의 `render` 만 바꿔
BlockNote 의 메뉴 표면으로 돌렸습니다 (§7). 이 결정과 묶여 있던 것은 **트리거**뿐이라,
트리거를 BlockNote 값 그대로 두는 것으로 갈라 냈습니다. 표면이 모드를 따라가게 되면
(B) 트리거도 SEED 토큰으로 같이 갑니다.

### dense 버튼 변형 — 트리 행은 F1 에서 확정, 그리드는 열려 있음

SEED `ActionButton` 은 `xsmall` 이 32px 이라 28px 트리 행에도 32px 그리드 행에도 안 들어갑니다.

**트리 행(28px) — 확정.** 호버 액션은 **24×24, 라운드 `r1`(4px), 아이콘 16px** 입니다. `--knoc-tree-action-size`.

| | |
|---|---|
| 평상시 | 배경 없음. 아이콘만 (`fg-neutral-subtle`) |
| 버튼 호버 | `bg-neutral-weak-alpha`, 아이콘 `fg-neutral-muted` |
| 행 안 위치 | 우측 정렬, 버튼 사이 `dense-2`(4px), 행 우측 패딩 4px |

**평상시 배경을 지우는 것이 핵심입니다.** 행 호버 배경 위에 버튼 배경을 겹쳐 얹으면 28px 안에서 회색이 두 겹으로 보입니다. 배경을 빼면 위아래 2px 여백도 문제가 되지 않습니다.

22 · 20px 도 그려봤지만 24 를 씁니다. 데스크톱이라 44pt 규칙은 적용하지 않지만, 28px 행에서 조준 실패를 줄이는 것은 결국 표적 크기입니다.

**그리드 행(32px) — 아직 열려 있습니다.**

- 후보 A: `ActionButton` 에 26px `size="xxsmall"` 을 프로젝트 레시피로 추가
- 후보 B: 그리드 전용 별도 컴포넌트로 분리

그리드 스펙과 함께 D1에서 결정합니다. **그때까지 그리드 안에 버튼을 넣지 말고**, 필요하면 아이콘 버튼(26×26 정사각, 배경 없음, 호버 시 `bg-neutral-weak-alpha`)으로 대체하세요.

---

## 7. BlockNote 경계

BlockNote CSS를 끄거나 덮지 않습니다. 변수만 SEED로 되돌려 가리킵니다.

**그런데 변수가 안 달린 곳이 있습니다.** F3 §0 에서 전수 조사했습니다. 아래 「예외 열두 줄」과
「브라우저가 그리는 것」 두 절이 그 전부입니다. **목록에 없는 것은 덮지 마세요.**
근거는 [F3 §0 확인 결과](docs/decisions/f3-blocknote-surface.md) 에 있습니다.

### `src/styles/blocknote-bridge.css`

```css
.bn-mantine.bn-root[data-color-scheme] {
  --bn-colors-editor-text:         var(--seed-color-fg-neutral);
  --bn-colors-editor-background:   var(--seed-color-bg-layer-default);
  --bn-colors-menu-text:           var(--seed-color-fg-neutral);
  --bn-colors-menu-background:     var(--seed-color-bg-layer-floating);
  --bn-colors-tooltip-text:        var(--seed-color-fg-neutral);
  --bn-colors-tooltip-background:  var(--seed-color-bg-neutral-weak);
  --bn-colors-hovered-text:        var(--seed-color-fg-neutral);
  --bn-colors-hovered-background:  var(--seed-color-bg-neutral-weak-alpha);
  --bn-colors-selected-text:       var(--seed-color-palette-static-white);
  --bn-colors-selected-background: var(--seed-color-bg-brand-solid);
  --bn-colors-disabled-text:       var(--seed-color-fg-disabled);
  --bn-colors-border:              var(--seed-color-stroke-neutral-muted);
  --bn-colors-side-menu:           var(--seed-color-fg-neutral-subtle);
  --bn-font-family:                inherit;
  --bn-border-radius:              var(--seed-radius-r1_5);

  /* --bn- 가 아닙니다 — 아래 「mantine 변수 둘」 */
  --mantine-color-text:            var(--seed-color-fg-neutral);
  --mantine-color-dimmed:          var(--seed-color-fg-neutral-subtle);

  /* 하이라이트 — 글자 500 · 배경 200. 라이트/다크를 여기서 가르지 않습니다.
     SEED 팔레트가 모드에 따라 스스로 뒤집혀서 한 벌로 양쪽이 맞습니다.
     orange 는 SEED 의 carrot 입니다 — 이름만 다르고 같은 자리의 색입니다. */
  --bn-colors-highlights-gray-text:         var(--seed-color-palette-gray-500);
  --bn-colors-highlights-gray-background:   var(--seed-color-palette-gray-200);
  --bn-colors-highlights-red-text:          var(--seed-color-palette-red-500);
  --bn-colors-highlights-red-background:    var(--seed-color-palette-red-200);
  --bn-colors-highlights-orange-text:       var(--seed-color-palette-carrot-500);
  --bn-colors-highlights-orange-background: var(--seed-color-palette-carrot-200);
  --bn-colors-highlights-yellow-text:       var(--seed-color-palette-yellow-500);
  --bn-colors-highlights-yellow-background: var(--seed-color-palette-yellow-200);
  --bn-colors-highlights-green-text:        var(--seed-color-palette-green-500);
  --bn-colors-highlights-green-background:  var(--seed-color-palette-green-200);
  --bn-colors-highlights-blue-text:         var(--seed-color-palette-blue-500);
  --bn-colors-highlights-blue-background:   var(--seed-color-palette-blue-200);
  --bn-colors-highlights-purple-text:       var(--seed-color-palette-purple-500);
  --bn-colors-highlights-purple-background: var(--seed-color-palette-purple-200);

  /* 변수가 아니라 속성입니다 — 아래 「브라우저가 그리는 것」 */
  accent-color: var(--seed-color-bg-brand-solid);
}
```

**선택자가 한 겹이 아닌 이유.** BlockNote 기본값은 `.bn-root`(0,1,0)와
`.bn-root[data-color-scheme="dark"]`(0,2,0) 두 벌로 오고 다크 쪽이 더 셉니다.
한 겹(0,1,0)으로는 다크에서 집니다. 세 겹으로 짚어 (0,3,0)으로 올립니다 —
여전히 변수 선언뿐이라 아래의 금지에 걸리지 않고, 에디터 CSS 가 지연 로드로
나중에 붙는 순서에도 흔들리지 않습니다. `data-color-scheme` 은 값을 보지
않습니다. 라이트/다크는 오른쪽 SEED 토큰이 이미 스스로 뒤집습니다.

**세 겹 중 하나가 `.bn-container` 이면 안 됩니다.** F3 에서 `bn-root` 와 `bn-container` 가
같은 엘리먼트에 붙는 것만 보고 `.bn-container` 로 짚었는데, `bn-root` 를 단 엘리먼트가
**하나가 아니라 둘**이었습니다.

```
bn-root bn-container light bn-mantine   ← 에디터 컨테이너
bn-root             light bn-mantine   ← 포털 (컨테이너 안에 있습니다)
```

포털은 코어가 `document.createElement` 로 만들어 컨테이너 안에 붙이는 div 이고
(`BlockNoteEditor.mount` → `portalTarget ?? e.parentElement`), **슬래시 메뉴 · 포맷 툴바 ·
링크 툴바 · 사이드 메뉴 · 테이블 손잡이가 전부 거기 그려집니다.**

안에 있으니 상속으로 닿을 것 같지만 안 닿습니다. 코어가 그 div 에도 `bn-root` 클래스와
`data-color-scheme` 을 **다시 달아서**, BlockNote 기본값이 그 몸에 직접 걸립니다. 직접 선언은
상속을 언제나 이깁니다. `.bn-container` 로 짚으면 포털은 안 잡히고, 메뉴와 툴바는 계속
BlockNote 기본색으로 남습니다 — `hovered-text` 를 아무리 잘 매핑해도 그렇습니다.

`.bn-mantine` 은 둘 다에 붙습니다. mantine 래퍼가 `className` 으로 내려보내고 코어가 포털
div 의 `className` 에 그대로 복사합니다. 그래서 이걸로 짚습니다. mantine 이 `--mantine-*` 를
거는 곳도 `.bn-mantine[data-mantine-color-scheme]`(0,2,0) 이라 위의 두 줄까지 한 선택자로
같이 이깁니다.

아래 자손 선택자들은 `.bn-container` 그대로 둡니다. 포털에는 본문 블록이 없고, 포털 자체가
컨테이너 **안**이라 필요하면 어차피 닿습니다.

**`tooltip` 은 이름이 잘못된 변수입니다 — 반전시키지 마세요.** 툴팁만 쓰는 게 아니라 셋이 씁니다.

```
.bn-tooltip                                ← 진짜 툴팁
.mantine-Badge-root                        ← 슬래시 메뉴 단축키 배지
.bn-mt-suggestion-menu-item-section[left]  ← 슬래시 메뉴 아이콘 칩
```

BlockNote 기본값이 `#efefef` / `#3f3f3f` 인 것을 보면 이건 반전된 말풍선이 아니라 **옅은 중립
칩**입니다. 처음에 이름만 보고 `bg`/`fg-neutral-inverted` 로 뒀다가 되돌렸습니다 — 라이트에서
흰 메뉴 안에 **검은 칩과 검은 배지**가 박힙니다. 포털이 브리지에 안 닿던 동안에는 안 보이다가,
위의 선택자를 고치면서 드러났습니다.

`bg-neutral-weak` 는 아래 표 머리글과 같은 값이고 고른 이유도 같습니다 — SEED 자신이 중립 버튼 ·
칩 · 배지 · 콜아웃의 면으로 씁니다. 진짜 툴팁도 이걸로 갑니다. BlockNote 의 기본 툴팁이 원래
옅은 회색이고, 이 문서에 툴팁 규격을 정해 둔 적이 없습니다(§10).

**`hovered-text` 를 빠뜨리지 마세요.** F3 에서 빠져 있던 것을 나중에 찾았습니다. `menu-text` 만
옮기고 이걸 두면 BlockNote 기본값이 남아서 — 라이트 `#3f3f3f` · 다크 `#cfcfcf` — 메뉴 항목에
마우스를 올릴 때 글자가 **되레 흐려집니다.** 호버는 강조인데 대비가 떨어지는 방향입니다.
mantine 쪽 다섯 자리가 이 변수를 읽습니다(메뉴 항목 호버·선택, 탭 호버, 툴바 버튼·아이콘 호버).
값은 `menu-text` 와 같은 `fg-neutral` 입니다 — 호버에서 바뀌는 것은 면이지 글자가 아닙니다.

**mantine 변수 둘 — `--bn-` 로 안 빠진 색입니다.** 슬래시 메뉴 표면은 BlockNote 가 mantine 의
Menu 를 베껴 온 자리라, 두 군데가 mantine 팔레트를 그대로 읽습니다.

```css
.bn-suggestion-menu-item                { color: var(--menu-item-color, var(--mantine-color-text)) }
.bn-suggestion-menu-item[data-disabled] { color: var(--mantine-color-dimmed) }
```

안 걸면 항목 글자가 라이트에서 순검정 `#000` 으로, disabled 항목이 mantine `gray-6`(라이트) ·
`dark-2`(다크) 로 나옵니다. **우리 검정도 우리 회색도 아닙니다.**

**그룹 라벨은 여기 안 듭니다.** `.bn-suggestion-menu-label` 도 `dimmed` 로 한 번 칠해지지만,
같은 파일 뒤쪽에서 **같은 선택자**가 `--bn-colors-hovered-text` 로 다시 칠합니다. 명시도가 같아
뒤엣것이 이기므로 라벨의 색은 `hovered-text` 입니다 — 지금은 `fg-neutral` 이라 항목 제목과 같은
세기입니다. 라벨을 낮추려면 변수로는 안 되고 자손 선택자가 하나 더 필요합니다. **아직 안 열었습니다.**

자손 선택자가 아니라 위 뭉치에서 변수로 잡는 것이 맞습니다. mantine 이 이 둘을 거는 곳이
`.bn-mantine[data-mantine-color-scheme="light"|"dark"]`(0,2,0) 인데, `.bn-mantine` 은
`.bn-mantine.bn-root[data-color-scheme]` 과 **같은 엘리먼트**에 걸려서 (0,3,0) 이 그냥 이깁니다. 컨테이너와 포털 양쪽 모두에서 그렇습니다.

`dimmed` 가 실제로 닿는 곳은 disabled 항목 하나입니다. `fg-neutral-subtle` 로 두고, 그 위에
`opacity: 0.6` 이 더 얹혀서 충분히 갈라 보입니다.

메뉴 테두리의 `--mantine-color-gray-2`(`.bn-suggestion-menu`)는 **그대로 둡니다.** 그건 semantic
토큰이 아니라 팔레트 눈금이라, 재정의하면 그 눈금을 읽는 다른 자리까지 같이 끌려갑니다.

**문서 거터는 BlockNote 가 그립니다.** `.bn-editor` 는 좌우 54px 을 자기 몫으로
잡습니다. `DocumentSurface` 의 거터와 겹치면 본문 폭이 절반 가까이 줄어들므로,
에디터를 감싼 자리에서 거터를 도로 물립니다(`-mx-doc-gutter`). 남기는 쪽이
BlockNote 인 이유는 그 자리가 드래그 핸들의 히트 영역이기 때문입니다 — 아래 표의
오른쪽 열입니다.

**그래서 `--knoc-doc-gutter` 가 54px 입니다.** 한때 56px 이었는데, 그러면 에디터
밖에 서는 것(문서 제목)은 56px 에, 본문은 54px 에 서서 왼쪽 끝이 2px 어긋났습니다.
남기기로 한 값이 BlockNote 쪽이므로 우리 토큰을 그쪽에 맞춥니다.

### 예외 열두 줄 — 변수가 안 달린 곳

BlockNote 가 색과 글꼴을 전부 변수로 뺀 것은 아닙니다. 아래 **열두 규칙만** 자손 선택자를 씁니다.

아래 표의 순서가 곧 이어지는 절의 순서입니다.

| 묶음 | 개수 | 성격 |
|---|---|---|
| 색 — 인용 · 구분선 · 코드 블록 · 표 격자선 | 4 | 박힌 값을 SEED 로 되돌리기 |
| 글꼴 — 본문 · 인라인 코드 | 2 | 박힌 값을 되돌리기 |
| 배경 — 표 머리글 칸 | 1 | **없던 선언을 새로 얹기** |
| **선택 — 노드 링 · 셀 선택 · 열 손잡이 · 드롭 커서** | 4 | 박힌 값을 되돌리기 (§1) |
| **글자색 — 슬래시 메뉴 그룹 라벨** | 1 | 뒤 규칙에 눌린 앞 규칙의 의도 되살리기 |

「배경」과 「글자색」만 성격이 다르니 해당 절을 따로 읽으세요.

(위의 `--mantine-` 둘은 여기 안 셉니다. 그건 변수 선언이라 자손 선택자를 안 씁니다.)

#### 색 넷 — 인용 · 구분선 · 코드 블록 · 표 격자선

값이 CSS 에 박혀 있습니다. 앞의 셋은 하필 F3 의 블록 8종 안에 있습니다.

| 블록 | 박혀 있는 값 |
|---|---|
| 인용 | `color: #7d797a` · `border-left: 2px solid #7d797a` |
| 구분선 | `border-top: 1px solid #7d797a` |
| 코드 블록 | `background: rgb(22 22 22)` · `color: white` · `border-radius: 8px` |
| 표 격자선 | `border: 1px solid #ddd` |

하이라이트 8색은 다릅니다. Block.css 에 같은 hex 가 있긴 하지만 `@blocknote/react` 쪽
변수 버전이 번들에서 **뒤에** 와서 이깁니다. 변수로 안 닿는 것은 위 넷뿐입니다.

**표 격자선은 F3 §0 조사에서 빠졌던 것입니다.** 표가 기본 블록이 아니라 `createTableBlockSpec`
으로 따로 붙는 블록이라 8종 밖에 있었습니다. 나중에 표 옵션을 켜면서 찾았습니다.

닿는 길이 자손 선택자 하나뿐이라, **딱 이 네 규칙만 엽니다.**

```css
/* blocknote-bridge.css 맨 아래. 여기 없는 자손 선택자는 쓰지 않습니다. */
.bn-container [data-content-type="quote"] blockquote {
  color:             var(--seed-color-fg-neutral-muted);
  border-left-color: var(--seed-color-fg-neutral-muted);
}

.bn-container [data-content-type="divider"] hr {
  border-top-color: var(--seed-color-stroke-neutral-muted);
}

.bn-container .bn-block-content[data-content-type="codeBlock"] {
  border-radius: var(--seed-radius-r1_5);
}

.bn-container .bn-block-content[data-content-type="table"] :is(th, td) {
  border-color: var(--seed-color-stroke-neutral-weak);
}
```

**색만 덮고 굵기는 남깁니다.** `border-left` 가 아니라 `border-left-color` 를 쓰는 이유입니다.
BlockNote 가 2px 을 3px 로 바꾸면 그 변경이 그대로 따라옵니다. 인용의 막대를 글자와 같은
색으로 두는 것도 BlockNote 의 선택을 그대로 옮긴 것입니다.

**`!important` 는 쓰지 않습니다.** 명시도로 이깁니다 — 인용·구분선은 (0,2,1) 대 (0,1,1).
코드 블록과 표 격자선만 `.bn-block-content` 를 한 겹 더 붙여 올립니다. 안 붙이면 코드 블록은
(0,2,0) 대 (0,2,0), 표는 (0,2,1) 대 (0,2,1) 로 **동점**이 되는데, 에디터 CSS 가 지연 로드라
나중에 붙어서 동점이면 집니다. `:is(th, td)` 는 인자 중 가장 센 것만 세므로 (0,0,1) 이고,
합쳐서 (0,3,1) 이 됩니다.

**코드 블록은 배경을 안 건드리고 반경만 가져옵니다.** 표면을 뒤집으려면 Shiki 문법색까지
같이 뒤집어야 해서(`.shiki` 가 `--shiki-dark` 에 고정) §6 으로 넘겼습니다.

**표 격자선은 다크에서 고장이었습니다.** `#ddd` 대 문서 바탕 `#16171b` 이 **13.2:1** 이라
거의 흰 선이 그어집니다. 라이트에서도 격자선(1.36)이 머리글 면(1.10)보다 진해서, 머리글을
갈라 보이게 하는 것이 우리 색이 아니라 이 선이었습니다.

**`stroke-neutral-weak` 입니다. `muted` 가 아닙니다.** 처음에 `muted` 로 썼다가 되돌렸습니다.
`--bn-colors-border` 가 이미 `muted` 를 가리키니 표도 같은 것을 가리켜야 한다고 봤는데, 그건
**토큰이 같은 것**을 챙긴 것이지 이 선이 하는 일을 챙긴 것이 아니었습니다.

| 격자선 | vs 바탕 | **vs 머리글 면** |
|---|---|---|
| BlockNote `#ddd` | 라이트 1.36 · 다크 **13.19** | 1.23 · 10.01 |
| `stroke-neutral-muted` | 라이트 **1.15** · 다크 1.28 | **1.04 · 1.03** |
| **`stroke-neutral-weak`** | 라이트 1.35 · 다크 1.65 | 1.22 · 1.25 |

`muted` 는 합성하면 바로 위 규칙이 깐 머리글 면과 거의 같은 색이 됩니다 — 라이트 `#efefef`
대 `#f3f4f5`, 다크 `#2b2c30` 대 `#2b2e35`. **격자가 가장 필요한 자리에서 격자가 사라집니다.**
라이트는 `#ddd` 이던 시절보다 되레 흐려지기까지 했습니다.

`weak` 는 라이트·다크 모두 gray-400 입니다. 라이트는 BlockNote 가 주던 진하기를 그대로
지키고(1.36 → 1.35), 다크는 흰 선이 아니면서 보이고, 머리글 위에서도 살아남습니다.

**SEED 가 쓰는 자리로 봐도 `weak` 입니다.** `weak` 는 text-input · select-trigger ·
checkmark · radiomark 처럼 **내용이 들어가는 것의 테두리**고, `muted` 는 menu · dialog ·
action-sheet · accordion 처럼 **띄운 면의 가장자리와 구분선**입니다. 표 칸은 앞쪽입니다.
그래서 `--bn-colors-border` 와 다른 토큰인 것이 맞습니다 — 메뉴 가장자리와 표 격자는 같은
일을 하지 않습니다.

**솔리드라 선이 겹쳐 진해질 걱정도 없습니다.** 알파였다면 맞닿은 두 칸의 선이 겹치는 자리만
진해졌을 텐데, 그걸 막는 `border-collapse: collapse` 를 BlockNote 도 prosemirror-tables 도
안 걸고 **Tailwind preflight** 가 걸고 있습니다. 지금 값은 거기 안 기댑니다.

#### 글꼴 둘 — 본문 서체와 인라인 코드

**`--bn-font-family` 는 본문에 닿지 않습니다.** 그 변수를 읽는 규칙은 `.bn-root` 하나인데,
`.bn-default-styles` 가 그 안쪽 `.bn-editor` 에 같이 붙어서 자기 선언으로 상속을 끊습니다.

```css
.bn-default-styles { font-family: Inter, SF Pro Display, …; font-size: 16px }
```

안 고치면 사이드바는 시스템 글꼴인데 **본문만 Inter · Open Sans** 로 나옵니다. 스택이 달라서
한글 대체 글꼴도 같이 갈립니다 — 문서만 따로 노는 이유입니다.

```css
.bn-container .bn-default-styles {
  font-family: inherit;   /* 글꼴 이름을 여기 적지 않습니다 */
}
```

**`inherit` 로 되돌리고 글꼴 이름은 적지 않습니다.** 적는 순간 앱 글꼴이 바뀔 때 여기만
남습니다.

**크기와 줄간은 안 건드립니다.** `font-size: 16px` 는 §2 의 문서 본문과 같은 값이고, 제목
크기(48 · 32 · 20.8px)와 줄간(1.5)은 BlockNote 것을 따르기로 했습니다 — §2.

되돌아가려면 `--level` 만 바꾸면 됩니다. BlockNote 가 이미 읽는 변수라 `font-size` 를 새로
쓸 일이 없습니다. 줄간은 `.bn-default-styles` 가 아니라 `.bn-block-outer` 에 걸어야 합니다 —
앞엣것은 블록의 **조상**이라 BlockNote 가 그 아래에 다시 선언한 1.5 에 상속이 끊깁니다.
그때 이 절과 §2 의 표를 함께 고칩니다.

**인라인 코드는 생짜 `monospace` 입니다.** F3 §0 조사에서 빠져 있던 두 번째 글꼴입니다.

```css
.bn-inline-content code { font-family: monospace }
```

변수가 아니라 위 뭉치로는 안 닿고, 이 선언이 layer 밖이라 Tailwind preflight 가
`code`·`kbd`·`samp`·`pre` 에 거는 `--default-mono-font-family` 를 **명시도와 무관하게**
눌러 버립니다 — preflight 는 `@layer base` 안입니다. 그래서 여기서 되돌립니다.

```css
.bn-container .bn-inline-content code {
  font-family: var(--knoc-font-mono);   /* 여기서도 글꼴 이름은 안 적습니다 */
}
```

(0,2,1) 대 (0,1,1) 로 이깁니다. 본문과 달리 `inherit` 이 아닌 것은 고정폭이어야 하기
때문이고, 그래도 이름이 아니라 §2 의 토큰을 가리킵니다.

**코드 블록(`codeBlock`)은 여기 없습니다.** 그쪽 `<pre>` 에는 BlockNote 가 글꼴을 안 걸어서
preflight 가 그대로 닿고, 그게 이미 같은 토큰입니다.

#### 배경 하나 — 표 머리글 칸

**앞의 여섯과 성격이 다릅니다.** 저것들은 BlockNote 가 박아 둔 값을 SEED 로 되돌리는
일이지만, 이것은 **없던 선언을 새로 얹는 일**입니다. 그래서 「덮지 않는다」 원칙에 걸리지
않습니다 — 덮을 것이 애초에 없습니다. `accent-color` 와 같은 종류이고, 다만 배경은
상속이 안 돼서 컨테이너 한 겹으로는 못 하고 자손 선택자가 필요합니다.

머리글 칸에 BlockNote 가 거는 것은 이게 전부입니다.

```css
.bn-editor [data-content-type="table"] th { font-weight: bold; text-align: left }
```

**배경이 없습니다.** mantine 테마에도 없습니다. 그래서 헤더를 켜도 글자만 굵어지고, 표가
조금만 커지면 어디까지가 머리글인지 안 보입니다. Notion 은 머리글에 옅은 회색을 깝니다.
그 자리를 메웁니다.

```css
.bn-container [data-content-type="table"] th:not([data-background-color]) {
  background-color: var(--seed-color-bg-neutral-weak);
}
```

**행과 열을 안 가릅니다.** 헤더 행도 헤더 열도 같은 `th` 라 규칙 하나로 둘 다 덮이고, 둘을
다르게 칠할 이유도 없습니다.

**`:not([data-background-color])` 이 이 규칙의 핵심입니다.** 사용자가 칸 색을 직접 고르면
BlockNote 가 그 속성을 붙입니다(안 고르면 아예 안 붙습니다). 그쪽 규칙은 (0,1,0) 이라 이
규칙 (0,3,1) 에 그냥 집니다. 빼 두지 않으면 **머리글 칸에서만 사용자가 고른 색이 안
먹습니다.** 셀 색은 `tables.cellBackgroundColor` 로 켜 둔 기능이라 이건 그냥 버그가 됩니다.

**한 벌로 라이트·다크가 맞습니다.** `bg-neutral-weak` 는 라이트에서 gray-200 · 다크에서
gray-300 인데, 문서 바탕(`bg-layer-default`)이 각각 gray-00 · gray-100 이라 양쪽 모두
바탕보다 **팔레트 두 칸** 진합니다.

**왜 이 토큰인지 — 후보 넷을 견줬습니다.** SEED 자신이 `bg-neutral-weak` 를 중립 버튼 ·
칩 · 배지 · 콜아웃의 면으로 씁니다. 표면 위에 얹는 옅은 중립 면이라는 자리가 표 머리글과
같습니다.

| 후보 | 라이트 / 다크 | 왜 아닌지 |
|---|---|---|
| **`bg-neutral-weak`** | gray-200 / gray-300 | **고른 것.** 양쪽 두 칸 |
| `bg-layer-fill` | gray-100 / gray-200 | 한 칸뿐. 라이트 대비 1.05 로 사실상 안 보입니다 |
| `bg-layer-basement` | gray-200 / gray-00 | 다크에서 `#000` — 머리글이 바탕보다 **어두워집니다** |
| `bg-neutral-weak-alpha` | 검정/흰색 알파 | 위에서 `hovered-background` 로 이미 쓰는 값. 머리글이 늘 hover 로 보입니다 |

대비는 라이트 1.10 · 다크 1.32 로 완전히 같지는 않습니다. 라이트가 옅은 쪽인데, Notion 도
그 정도라 그대로 뒀습니다.

**표 안쪽 구조는 여전히 BlockNote 것입니다.** 여기서 가져오는 것은 색 하나뿐이고, 격자선
굵기·칸 여백·열 너비 손잡이는 안 건드립니다 — 아래 표의 오른쪽 열입니다.

#### 선택 넷 — 노드 링 · 셀 선택 · 열 손잡이 · 드롭 커서

F3 §0 조사에서 빠져 있던 것들입니다. 넷 다 **파란색**이 hex 로 박혀 있었는데, §1 은
「강조색은 purple 계열 하나만. 선택 상태, 주 액션, **커서, 삽입선**」이라고 못 박아 두었습니다.
정확히 그 자리라 우리 색이어야 합니다.

**§1 이 가른 대로 둘로 나뉩니다.**

| | 자리 | 값 |
|---|---|---|
| 선택 = **면** | 노드 선택 링 · 표 셀 선택 | `--knoc-color-selection-surface` · `-ring` |
| 커서·삽입선 = **선** | 열 리사이즈 손잡이 · 드롭 커서 | `bg-brand-solid` (솔리드) |

```css
.bn-container .bn-block-content.ProseMirror-selectednode > *::after,
.bn-container .ProseMirror-selectednode > .bn-block-content > *::after,
.bn-container .bn-block-content .ProseMirror-selectednode::after,
.bn-container .bn-inline-content .ProseMirror-selectednode::after {
  background-color: var(--knoc-color-selection-surface);
  box-shadow: inset 0 0 0 4px var(--knoc-color-selection-ring);
}

.bn-container .ProseMirror .selectedCell::after { background: var(--knoc-color-selection-surface) }
.bn-container .ProseMirror .column-resize-handle { background-color: var(--seed-color-bg-brand-solid) }
.bn-container .bn-table-drop-cursor      { background-color: var(--seed-color-bg-brand-solid) }
```

**앞의 둘이 반투명인 것은 취향이 아니라 구조입니다.** 그 색이 깔리는 곳이 `:after { inset: 0 }`
으로 블록 **위에** 덮는 오버레이라, 불투명하면 글자가 가려집니다. `bg-brand-weak` 는 솔리드라
여기 못 씁니다 — §2 의 alpha 예외가 이것입니다.

**8% · 30% 는 BlockNote 값을 그대로 옮긴 것입니다.** `#64a0ff14`(8%) · `#64a0ff4d`(30%). 색만
바꾸고 세기는 남깁니다 — 인용의 `border-left-color` 와 같은 원칙입니다. `box-shadow` 는 색만
못 덮어서 통째로 다시 쓰지만 4px 은 BlockNote 값 그대로입니다.

**뒤의 둘은 솔리드입니다.** 4px 막대가 어디에 놓이는지가 정보의 전부라, 옅으면 그 일을 못 합니다.

**선택자가 오히려 안정적입니다.** `.ProseMirror-selectednode` 는 ProseMirror 코어,
`.selectedCell` · `.column-resize-handle` 은 prosemirror-tables 기본 클래스입니다. BlockNote 것이
아니라 그 아래 계층이고, 수년째 안 바뀐 이름입니다. 실패해도 색이 파랑으로 되돌아갈 뿐
레이아웃이 깨지지 않습니다.

#### 글자색 하나 — 슬래시 메뉴 그룹 라벨

「제목」·「기본 블록」처럼 항목을 묶는 작은 글자입니다. BlockNote 가 이걸 **두 번** 칠합니다.

```css
.bn-mantine .bn-suggestion-menu-label { color: var(--mantine-color-dimmed); … }  /* 먼저 */
.bn-mantine .bn-suggestion-menu-label { color: var(--bn-colors-hovered-text) }    /* 나중 — 이김 */
```

명시도가 같아 뒤엣것이 이기고, 그래서 라벨이 항목 제목과 같은 세기가 됩니다. 앞 규칙(`dimmed`)이
원래 의도로 보입니다 — 묶음 이름이 항목보다 크게 읽힐 이유가 없습니다.

`hovered-text` 를 낮춰서 풀 수는 없습니다. 그건 메뉴 항목 호버 글자색이라 `fg-neutral` 이어야
합니다. 한 변수가 두 일을 겸해서 자손 선택자가 필요합니다.

```css
.bn-mantine.bn-root .bn-suggestion-menu-label { color: var(--seed-color-fg-neutral-subtle) }
```

`.bn-container` 가 아니라 `.bn-mantine.bn-root` 인 것에 주의 — 이 라벨은 포털 안에 있습니다.

### 브라우저가 그리는 것 — 네 군데

React 가 아니라 코어가 `document.createElement` 로 직접 그리는 DOM 입니다. 슬래시 메뉴처럼
컴포넌트를 갈아 끼우는 방법이 통하지 않습니다.

| 어디 | 무엇 | 어떻게 |
|---|---|---|
| 코드 블록 언어 선택기 | `<select>` + `<option>` 46개 | **걷어냈습니다** — 아래 |
| 체크박스 | `<input type="checkbox">` | `accent-color` 한 줄로 브랜드색이 됩니다 |
| 토글 블록 버튼 | `<button>` ×2 | `bn-` 변수로 칠해져서 브리지가 닿습니다 |
| 동영상·오디오 | `<video controls>` · `<audio controls>` | OS 플레이어. F3 밖입니다 |

**언어 선택기만 넷 중에서 빠져나왔습니다.** 나머지 셋과 달리 CSS 로 손볼 여지가 아예
없어서입니다 — 트리거는 BlockNote 가 이미 `appearance: none` 으로 지워 놨고, 어긋나는 것은
**펼친 목록**인데 그건 OS 가 그립니다. 브리지로 닿는 선언이 하나도 없습니다.

그래서 **코드 블록 스펙에서 `render` 하나만 우리 것으로 바꿨습니다** (`ui/ContentEditor/code-block.ts`).
`config` · 파싱 · 단축키 · 하이라이트는 전부 코어 것을 그대로 씁니다. `type` 도 `propSchema` 도
안 바뀌어서 저장된 문서는 그대로입니다.

**SEED `Select` 가 아니라 BlockNote 의 `Generic.Menu` 입니다.** 코드 블록 표면이 아래 §6 에서
아직 다크 고정이라, SEED 트리거를 올리면 검은 면 위에 밝은 트리거가 앉습니다. 그 결정을
끌어들이지 않으려고 **트리거는 BlockNote 값 그대로 두고 목록만** 갈아 끼웠습니다. `Generic.Menu`
는 이미 위의 `--bn-colors-menu-*` 로 칠해지므로 슬래시 메뉴 · 드래그 핸들 메뉴와 같은 표면입니다.
§6 의 표면 결정이 닫히면 그때 SEED 컴포넌트로 한 번 더 갑니다.

**`accent-color` 는 변수가 아닌데도 브리지에 넣습니다.** BlockNote 가 이 속성을 선언한 적이
없어서 덮는 것이 아니고, 컨테이너 한 겹에 걸어 상속으로 내려보내므로 자손 선택자도 아닙니다.
안 걸면 체크 표시가 SEED 보라가 아니라 **OS 기본 파랑**입니다.

라이트/다크는 걱정하지 않아도 됩니다. mantine 이 `.bn-mantine` 에 `color-scheme` 을 걸어
두어서 native 컨트롤이 모드를 따라갑니다. 어긋나는 것은 **모양과 강조색이지 명암이 아닙니다.**

| SEED가 가져가는 것 | BlockNote에 남기는 것 |
|---|---|
| 모든 색 — 예외 열두 줄과 `--mantine-` 둘 포함 | 블록 상하 간격과 들여쓰기 계단 |
| 서체 — 본문과 인라인 코드 둘 다 (§2) | 블록 상하 여백 · 드래그 핸들의 생김새와 히트 영역 |
| 반경 — 코드 블록 포함 | 커서·선택 동작 |
| 슬래시 메뉴·포맷 툴바 표면 | 테이블 블록 내부 구조 |
| 하이라이트 팔레트 (글자 500 · 배경 200) | brown · pink — SEED 팔레트에 없어서 기본값 그대로 |
| 체크박스 강조색 (`accent-color`) | 코드 블록 다크 표면과 Shiki 문법색 |
| 선택·커서·삽입선 (§1 · 예외 넷) | 선택의 **동작** — 무엇이 선택되는지 |
| 코드 블록 언어 선택기 — 스펙의 `render` 만 (§7) | |
| 제목 크기 · 줄간 (§2) — `--level` 로 넘깁니다 | |
| 사이드 메뉴의 **세로 위치** — 첫 줄을 재서 맞춥니다 | |
| | 파일·이미지 블록 계열 색 (F3 밖) |

오른쪽 열에 손대면 BlockNote 업그레이드마다 깨집니다.

---

## 8. 카피 톤

- 시스템 용어가 아니라 유저가 인식하는 이름으로. `제출` 아니라 `저장`.
- 버튼 이름과 결과 메시지를 일치시킬 것. `발행` → `발행됨`.
- 에러는 사과하지 않고, 뭐가 잘못됐고 어떻게 고치는지 말할 것.
- 문장형 대소문자, 군더더기 없이. 느낌표 없음.
- 해요체. 합니다체·반말 금지. (이 문서 같은 스펙 산문은 합니다체.)
- **이모지**: UI 크롬에 금지. 유저가 고르는 문서 아이콘은 예외 — 그건 콘텐츠입니다.
- 아이콘은 seed-icon만. 유니코드나 이모지를 아이콘 대신 쓰지 않습니다. 필요한 아이콘이 없으면 가져오고, 직접 그리지 않습니다.
  - **패키지는 `@karrotmarket/react-monochrome-icon`(seed-icon v3)입니다.** 339종 × `Fill`·`Line` 두 두께. 개별 경로로 집습니다 — `@karrotmarket/react-monochrome-icon/IconPlusLine`
  - `@seed-design/icon`(v2, `Fill`·`Regular`·`Thin`)은 **쓰지 않습니다.** `@seed-design/react-icon`이 npm에서 deprecated 됐고 저장소도 2025-03에 멈췄습니다
  - **이름이 뜻이 아니라 모양입니다.** 빈 페이지는 `IconVertrectangleFoldedLine`(세로 사각형 + 접힌 모서리)이고, `file`로 찾으면 안 나옵니다. 뜻으로 찾을 때는 [seed-design.io](https://seed-design.io) 검색을 쓰거나 패키지의 `.d.ts` 안 `@alias` 주석을 grep 합니다 — 별칭에 `문서 · 파일 · paper` 가 걸려 있습니다
  - 이름으로 없다고 판단하지 마세요. `daangn/seed-icon`(v2) 저장소를 뒤지고 "없다"고 결론 내린 적이 있습니다

### 설명은 버튼이 못 담는 것만

다음 행동은 이미 버튼에 적혀 있습니다. 설명이 얹을 것은 **언제**(`잠시 뒤`), **어떤 순서로**(`연결을 확인하고`), **다른 길은 없는지**(`또는 다른 단어로`) 셋뿐입니다. 아무것도 안 얹으면 그 문장은 뺍니다.

- ✕ `새로 고치면 다시 열려요.` + `새로 고치기` 버튼 — 버튼을 소리 내어 읽는 것입니다
- ○ `서버가 응답하지 않았어요. 잠시 뒤 다시 시도해 주세요.` + `다시 시도` 버튼 — `잠시 뒤` 가 버튼에 없습니다

원인 문장은 겹치지 않으니 거의 항상 남깁니다. `서버가 응답하지 않았어요` 가 없으면 사용자가 자기 공유기부터 봅니다.

### 줄바꿈은 문장이 정합니다, 폭이 아니라

`word-break: keep-all` 은 **어절 안쪽만** 지킵니다. 어절 *사이* 가 끊기는 건 못 막아서 `잠시 뒤 다시 / 시도해 주세요` 처럼 구가 갈립니다.

1. 어절은 `word-break: keep-all`
2. 제목은 `text-wrap: balance`, 설명은 `text-wrap: pretty`
3. **문장이 둘이면 사이를 `<br>` 로 직접 끊습니다**

`messages.ts` 는 문구를 **문장 배열**로 들고 컴포넌트가 사이를 끊습니다. 문자열 하나에 `\n` 을 박으면 한 줄로 붙여야 하는 compact 에서 못 풉니다.

```ts
description: ["서버가 응답하지 않았어요.", "잠시 뒤 다시 시도해 주세요."]
```

---

## 9. 빈 화면과 에러 화면 — 확정 카피

일러스트나 안내 카드를 두지 않습니다. 아이콘은 seed-icon 24px, `fg-neutral-subtle`.

**아이콘을 원 배경 안에 넣지 않습니다.** 원은 존재감을 만드는 대신 화면에 상자를 하나 더 얹습니다. 크기를 키우고 싶어도 컨테이너를 더하지 않습니다.

### 공통 규격 — `default`

F1 의 `EmptyState` 가 이대로 구현합니다.

| | |
|---|---|
| 배치 | 표면의 가로·세로 중앙. 문서 measure 를 따르지 않습니다 |
| 제목 | `t5-bold` (16px), `fg-neutral` |
| 설명 | `t4-regular` (14px), `fg-neutral-muted` |
| 간격 | 아이콘→제목 8px, 제목→설명 4px, 설명→버튼 16px |
| 최대 폭 | 320px |

### 공통 규격 — `compact`

좁은 자리 — 사이드바 240px, 검색 팝오버, 목록 안 — 에서는 `default` 를 쓰지 않습니다. 240px 폭에 아이콘·제목·설명·버튼을 다 넣으면 사이드바를 다 먹습니다.

| | |
|---|---|
| 아이콘 | 없음 |
| 문구 | 한 줄. `t3-regular` (13px), `fg-neutral-subtle` |
| 버튼 | 텍스트 버튼 하나까지. 없어도 됩니다 |

**같은 상태라도 자리가 바뀌면 문구도 바뀝니다.** 검색 팝오버에서는 검색어가 바로 위 입력창에 이미 보이므로 제목에서 되풀이하지 않습니다.

### 첫 실행 (페이지가 하나도 없음)

| | |
|---|---|
| 아이콘 | `icon_write_regular` |
| 제목 | 페이지가 아직 없어요 |
| 설명 | 첫 페이지를 만들면 왼쪽 목록에 쌓여요. |
| 버튼 | `페이지 만들기` — `ActionButton size="small" variant="brandSolid"` |

### 검색 결과 없음

| | |
|---|---|
| 아이콘 | `icon_search_regular` |
| 제목 | ‘{검색어}’와 맞는 페이지가 없어요 |
| 설명 | 제목만 찾고 있어요. 본문까지 넓히거나 다른 단어로 찾아보세요. |
| 버튼 | `본문까지 찾기` — `ActionButton size="small" variant="neutralWeak"` |

`compact` (Cmd+K 팝오버 안) — 문구 `제목에서는 못 찾았어요`, 우측에 텍스트 버튼 `본문까지 찾기`.

설명의 `본문까지 넓히거나` 는 버튼과 겹치지만 그대로 둡니다. `A거나 B` 는 두 선택지를 나란히 놓는 문장이라 A 를 빼면 B 가 붕 뜹니다. 겹침보다 문장이 온전한 것이 낫습니다.

### 휴지통 비어있음

| | |
|---|---|
| 아이콘 | `icon_trash_regular` |
| 제목 | 휴지통이 비어 있어요 |
| 설명 | 삭제한 페이지는 30일 동안 여기 머물러요. 그 뒤에는 사라져요. |
| 버튼 | 없음 |

### 없는 페이지 (404)

| | |
|---|---|
| 아이콘 | `icon_search_regular` |
| 제목 | 없는 페이지예요 |
| 설명 | 주소가 바뀌었거나 삭제됐어요. 왼쪽 목록에서 찾아보세요. |
| 버튼 | `홈으로` — `ActionButton size="small" variant="neutralWeak"` |

셸 안에 그립니다. 사이드바는 남습니다 — 주소를 잘못 짚었을 뿐 워크스페이스 밖으로 나간 게 아닙니다.

### 빈 문서 (에디터)

빈 화면 컴포넌트를 쓰지 않습니다. 커서는 제목에 있고, 아래 한 줄만 둡니다.

- 제목 자리: `제목 없음` (`fg-neutral-subtle`, 40px)
- 첫 줄: `바로 쓰거나, / 를 눌러 블록을 넣으세요` (`fg-neutral-muted`, 16px)
- 버튼 없음 — 다음 행동이 클릭이 아니라 타이핑입니다.

**버튼을 두는 기준**: 다음 행동이 그 화면 안에 있을 때만. 검색 결과 없음과 휴지통은 다음 행동이 화면 밖(검색창, 페이지 삭제)에 있어서 첫 실행에만 `brandSolid` 버튼이 있습니다.

---

### ErrorState — 골격은 빈 화면과 같습니다

`EmptyState` 와 같은 규격을 씁니다. 다른 것은 아이콘 모양과 버튼뿐입니다.

**빨간 아이콘을 쓰지 않습니다.** 목록을 못 불러온 건 망가진 것도 잃은 것도 아닙니다. 빈 화면과 구별되는 건 색이 아니라 **아이콘 모양과 `다시 시도` 버튼**이고, 그 둘로 충분합니다 — 색으로만 나르지 않으니 색각 이상 사용자에게도 같은 정보가 갑니다. 빨강은 **되돌릴 수 없는 것**에 남겨 둡니다(삭제 확인 다이얼로그).

**버튼은 `neutralWeak`.** 실패한 동작을 `brandSolid` 로 강조하지 않습니다.

#### 원인별 문구 — 하나로 뭉치지 않습니다

`다시 시도` 가 답이 아닌 경우가 있습니다. 권한이 없으면 백 번 눌러도 같습니다.

| 원인 | 제목 | 설명 | 버튼 |
|---|---|---|---|
| `offline` | 인터넷에 연결되어 있지 않아요 | 연결을 확인하고 다시 시도해 주세요. | `다시 시도` |
| `5xx` · `timeout` | {무엇}을 불러오지 못했어요 | 서버가 응답하지 않았어요. 잠시 뒤 다시 시도해 주세요. | `다시 시도` |
| 재시도 후에도 실패 | 여전히 안 되네요 | 지금은 서버 쪽 문제로 보여요. 조금 뒤에 다시 열어 주세요. | `홈으로` |
| `403` | 이 페이지를 볼 수 없어요 | 접근 권한이 없어요. 소유자에게 요청해 보세요. | `홈으로` |
| `404` | — | — | 위의 **없는 페이지 (404)** 를 씁니다 |

`{무엇}` 은 호출하는 쪽이 넘깁니다 — 트리면 `목록`, 문서면 `페이지`, 표면 `표`.

**재시도 후에도 실패한 줄이 중요합니다.** 눌렀는데 똑같은 화면이 다시 뜨면 사용자는 자기가 뭘 잘못했나 싶어집니다. 두 번째부터는 문구가 바뀌고 `다시 시도` 를 **접습니다.** 안 되는 걸 계속 권하지 않습니다.

`다시 시도` 를 누르는 동안 버튼은 `Spinner` 로 바뀝니다. 눌렀는데 아무 반응이 없으면 안 눌린 줄 압니다.

#### `inline` — 영역 하나만 실패했을 때

화면을 비우지 않고 그 자리에만 표시합니다. SEED **`PageBanner`** 를 그대로 씁니다 — `variant="weak" tone="critical"`. (`InlineBanner` 는 **deprecated** 이고 SEED 가 `PageBanner` 로 안내합니다.)

- 문구: `표를 불러오지 못했어요` + 우측 텍스트 버튼 `다시 시도`
- **여기서는 색을 씁니다.** 주변이 멀쩡하기 때문에 이 영역만 실패했다는 걸 눈이 먼저 잡아야 합니다. 전면 `ErrorState` 는 화면 전체가 그 상태라 색이 필요 없습니다.

#### 좁은 폭 — 사이드바 240px

`PageBanner` 를 쓰지 않는 유일한 자리입니다. 좌우 패딩만 16px 씩이라 240px 안에서 글자 폭이 190px 도 안 남습니다. §1 의 "스타일이 안 맞으면 컴포넌트를 안 쓴다" 를 적용합니다.

- 아이콘 없음. `목록을 불러오지 못했어요` 한 줄(13px, `fg-neutral-muted`) + 아래 텍스트 버튼 `다시 시도`

### ErrorBoundary — 라우트 단위

`Outlet` 안쪽만 감쌉니다. 사이드바와 상단바는 살아 있어야 합니다.

| | |
|---|---|
| 아이콘 | **없음** — `ErrorState` 보다 한 단계 큰 상태라는 신호 |
| 제목 | `이 페이지를 열지 못했어요` — 18px / 700 / −0.02em |
| 설명 | **없음** |
| 버튼 | `새로 고치기` (`brandSolid`) · `홈으로` (`neutralWeak`) |
| 기술 정보 | `기술 정보 보기` 텍스트 버튼. 기본 접힘, **개발 빌드에서만** |

**설명이 없는 것이 확정입니다.** 제목이 무슨 일인지 말했고 버튼이 뭘 할 수 있는지 말합니다. 그 사이에 `새로 고치면 다시 열려요` 를 끼우면 버튼을 소리 내어 읽는 것입니다.

**원인을 쓰지 않습니다.** 컴포넌트가 죽은 이유는 알아도 사용자가 할 수 있는 게 없습니다.

**저장 상태를 약속하지 않습니다.** `저장된 내용은 그대로 있어요` 는 지킬 수 없는 약속입니다 — 렌더가 죽은 순간 저장 안 된 편집은 실제로 없어졌을 수 있습니다. `마지막으로 저장된 내용까지는` 도 쓰지 않습니다. 안심시키려다 "그럼 뒤는 날아갔네" 로 읽힙니다. **다룰 수단이 없으면 안 다룹니다.**

> 이건 문구로 못 푸는 문제입니다. 진짜 해결은 **에디터가 로컬에 초안을 남기는 것**이고, 그래야 새로 고침이 복구가 됩니다. F3 에서 다룹니다.

`새로 고치기` 가 `brandSolid` 입니다. 권하는 행동이 하나뿐이면 그게 주 버튼입니다.

---

## 10. 공통 UI 규격 — F1 에서 확정

`components/ui/` 와 `components/tree/` 의 값입니다. 빈 화면·에러 화면은 §9 에 있습니다.

### SEED 대응 대조 결과

설치된 `@seed-design/css` recipe 의 실제 값과 대조했습니다. **SEED 값은 모바일·터치 기준이라 그대로 얹으면 데스크톱에서 깨지는 것이 있습니다.**

| 파일 | SEED | 결론 |
|---|---|---|
| `Spinner` | ~~`LoadingIndicator`~~ → **`ProgressCircle`** | 감싸되 **크기와 brand 트랙을 덮습니다.** `LoadingIndicator` 는 **버튼 pending 전용**입니다 |
| `Skeleton` | `Skeleton` | 감쌉니다. `gray-200` + shimmer 1.5s 그대로 |
| `Toast` | `Snackbar` | 감쌉니다. 위치는 SEED 그대로(하단 가운데)고 **여백·폭·비침만** 우리가 정합니다 |
| `Menu` | `Menu` | 감싸되 **반경·밀도를 덮습니다** |
| `Dialog` | `Dialog` | 감싸되 **폭을 덮습니다** (SEED `max-width: 272px`) |
| `IconButton` | `ActionButton` | 32 · 40 은 그대로. **24 만 SEED 밖** |
| `EmptyState` | `ContentPlaceholder` | **직접 만듭니다.** 일러스트 슬롯이 골격에 있어 §9 와 전제가 다릅니다 |
| `ErrorState` · `ErrorBoundary` · `InlineInput` | — | 대응 없음. 직접 만듭니다 |

덮는 것도 §1 을 지킵니다 — `!important` 나 자손 선택자를 쓰지 않고 `style` prop 으로 넘깁니다. 24px `IconButton` 만 SEED 를 **안 씁니다**. 32px 을 24px 로 줄이는 건 값 하나가 아니라 패딩·아이콘·반경이 전부 걸려서, 덮는 게 아니라 다른 컴포넌트입니다.

### Spinner

**SEED 대응은 `LoadingIndicator` 가 아니라 `ProgressCircle` 입니다.** `LoadingIndicator` 는 `usePendingButtonContext` 를 읽어 children 을 투명하게 겹쳐 버튼 폭을 유지하는 **버튼 pending 전용** 컴포넌트입니다. 버튼 안 로딩은 SEED `ActionButton` 이 알아서 하므로 우리가 다루지 않습니다.

- 크기 2종 — `small` **16px**(글자 옆·저장 상태) · `medium` **24px**(영역 하나)
- SEED 기본은 `24` · `40` 입니다. **둘 다 모바일 기준이라 한 단계씩 내립니다.** 이 앱은 트리 행 28px · 본문 13px 이라, 13px 글자 옆에 24px 스피너를 두면 스피너가 글자보다 큽니다. §7 의 저장 상태가 요구하는 것도 16px 입니다
- **다시 만드는 게 아닙니다.** SEED 의 size variant 가 하는 일은 `--size` · `--thickness` 두 개를 채우는 것이 전부고(`24`→3px, `40`→5px), 반경·`cx`·`cy`·`width`·`height` 는 전부 그 둘에서 계산됩니다. `size="inherit"` 로 두고 두 값을 `style` prop 으로 넘깁니다 — §1 이 허용하는 자리입니다. 굵기는 24:3 = 16:2 로 비율을 맞춥니다. `medium` 24 는 SEED 조합을 그대로 씁니다
- `tone` 은 `neutral` · `brand` · `staticWhite`(오버레이 위)
- **`tone="brand"` 의 바탕 링은 우리가 덮습니다.** SEED recipe 가 `--track-color` 에 `--seed-color-palette-carrot-200` 을 **semantic 을 안 거치고 직접** 박아 둬서, §1 의 brand 재매핑 9개로는 안 따라옵니다. 팔레트 재정의는 §1 금지라 `style` prop 으로 넘깁니다.<br>같은 참조가 `action-button`(버튼 pending 트랙) · `checkmark` · `reaction-button` 에도 있습니다 — 셋 다 쓰기 시작할 때 같이 덮어야 합니다
- **0.5초 안에 끝나는 로딩에는 붙이지 않습니다.** 스쳐 지나가는 스피너는 화면이 튀는 것으로만 보입니다
- **스켈레톤을 쓸 수 있는 자리에는 스피너를 쓰지 않습니다.** 스켈레톤은 다음에 올 모양까지 알려줍니다

### Skeleton

- `width` · `height` · `radius`(기본 4px) 를 받는 회색 블록 하나
- `gray-200` 바탕 + shimmer 1.5s. `prefers-reduced-motion: reduce` 에서는 바탕색만
- **실제 콘텐츠와 같은 높이·줄수를 씁니다.** 로드 후 레이아웃이 흔들리면 스켈레톤 값이 틀린 것입니다
- 지금 `Sidebar` · `DocumentSurface` 에 흩어진 자리표시 코드를 전부 여기로 모읍니다

### IconButton

| size | 반경 | 아이콘 | 쓰는 자리 | SEED |
|---|---|---|---|---|
| 24 | `r1` 4px | 16px | 트리 행 | **안 씀** |
| 32 | `r1_5` 6px | 20px | 툴바 | `ActionButton size="xsmall" layout="iconOnly"` |
| 40 | `r1_5` 6px | 24px | 헤더 | `ActionButton size="medium" layout="iconOnly"` |

- 평상시 배경 없음, 자기 호버에서만 `bg-neutral-weak-alpha` (§6)
- `selected` — `bg-brand-weak` + `fg-brand` + `aria-pressed="true"`
- **`aria-label` 없이는 렌더하지 않습니다.** 개발 빌드에서 경고를 띄웁니다 — 아이콘만 있는 버튼은 이름이 없으면 스크린리더에서 존재하지 않는 것과 같습니다

### Menu

SEED 값은 반경 `r5` 20px · 항목 폰트 `t5` 16px · 세로 패딩 12px 입니다. **터치 시트 기준이라 안 맞습니다.** 28px 트리 행 옆에 뜨는 메뉴가 다이얼로그만큼 둥글면 떠 있는 무게가 어긋납니다.

| | |
|---|---|
| 폭 | 200px (내용에 따라 최대 280px) |
| 반경 | `r2` 8px — SEED 20px 에서 내림 |
| 패딩 | 4px |
| 항목 | 높이 30px · 좌우 8px · 반경 `r1` 4px · gap 8px · `t3` 13px · 아이콘 16px |
| 표면 | `bg-layer-floating` + 그림자 `s3` (SEED 그대로) |
| 구분선 | 1px `stroke-neutral-muted`, `margin: 4px` |

**파괴적 항목은 구분선 아래에 하나만.** 색은 `fg-critical`, 호버 배경 `bg-critical-weak`. 손이 미끄러져 닿는 자리에서 떨어뜨립니다.

| 키 | 동작 |
|---|---|
| 우클릭 · 메뉴 키 | 엽니다. 포커스는 첫 항목으로 |
| `↑` `↓` | 항목 이동. 끝에서 순환합니다 |
| `Enter` | 실행하고 닫습니다 |
| `Esc` | 닫고 **트리거로 포커스를 되돌립니다** |
| `Tab` | 닫고 다음 요소로. 메뉴 안에 가두지 않습니다 |

### Toast

- SEED `Snackbar` 그대로 — `min-height` 44px · `r2` 8px
- **위치는 하단 가운데.** 아래에서 16px
- **기준은 뷰포트입니다.** 사이드바 폭을 따라가지 않습니다 — 사이드바 위에 겹쳐 뜹니다
- **폭은 내용을 따릅니다.** 짧은 문구는 짧게 뜹니다. `max-width` 560px 에서 줄을 늘립니다
- **표면은 살짝 비칩니다** — `bg-neutral-inverted` 에 알파 88%, 뒤는 8px 흐림
- **되돌리기가 있으면 여백을 넓힙니다** — 문구와 20px, 오른쪽 끝에서 20px. 없으면 SEED 기본값 그대로(10px · 16px)
- **동시에 하나만.** 3초, 되돌리기가 있으면 5초. 동작은 하나까지
- **머무는 동안 세지 않습니다.** 포인터가 올라가 있거나 키보드 포커스가 안에 있으면 타이머를 멈추고, 벗어나면 다시 셉니다
- **되돌리기가 떠 있는 동안에는 교체하지 않습니다.** 다음 토스트는 그것이 사라진 뒤에 뜹니다
- **완료된 사실로 씁니다** — `삭제하시겠습니까` 가 아니라 `삭제했어요`
- **조회 실패에는 쓰지 않습니다.** 그건 `ErrorState` 나 `PageBanner` 자리입니다 — 토스트는 사라지는데 실패는 사라지면 안 됩니다

하단 가운데인 이유: **노션이 그 자리입니다.** 처음에는 하단 왼쪽으로 잡았습니다 — 번들의 `insetInlineStart: 12px` 만 보고 왼쪽이라고 읽었고, 그 값이 앱 환경에서 어떻게 계산되는지는 밝히지 못한 채로 뒀습니다(아래 대조표). 실제 화면을 보면 가운데입니다. 되돌리기를 트리 근처에 두려던 이유는 폭이 고정이던 시절의 계산이라, 폭을 푼 지금은 남지 않습니다.

되돌리기를 지키는 이유: **되돌리기는 지금 이 토스트에만 있습니다.** 삭제를 연달아 하면 앞의 것이 조용히 교체되면서 되돌릴 방법이 같이 사라집니다. 3초·5초는 읽고 손을 옮기기에 짧아서, 멈춤이 없으면 버튼에 닿기 전에 닫히기도 합니다.

폭을 고정하지 않는 이유: **노션도 고정이 아닙니다.** 짧은 문구에 280px 상자를 깔면 `저장했어요` 네 글자가 빈칸을 절반 넘게 데리고 뜹니다. 토스트는 화면 가운데를 가로막는 물건이라 필요한 만큼만 차지하는 편이 낫습니다.

폭을 고정해서 지키려던 것(**되돌리기 버튼 자리**)은 가운데 정렬이 대신 지킵니다. 폭이 내용을 따라도 **같은 문구면 폭이 같고, 가운데 정렬이면 자리도 같습니다.** 연타가 문제되는 경우는 같은 삭제를 연달아 할 때인데 그때 문구는 한 종류입니다. 문구가 바뀌면 버튼도 움직이지만, 그건 애초에 연타하는 상황이 아닙니다.

`max-width` 는 SEED recipe 의 560px 을 그대로 둡니다. t4 14px 로 한글 30자 남짓이고, 우리 문구는 대부분 그 안에서 한 줄입니다.

되돌리기에만 여백을 더 주는 이유: SEED 기본값(문구 사이 10px)은 **버튼을 문장 끝에 붙은 낱말처럼 보이게 합니다.** 게다가 `actionButton` 의 히트 영역은 `:after` 로 좌우 8px 씩 더 나가서, 눈에 보이는 여백보다 실제로 눌리는 범위가 넓습니다 — 10px 이면 메시지 글자에 2px까지 다가옵니다. 글자만 있는 토스트는 그럴 이유가 없으므로 건드리지 않습니다.

비침을 넣는 이유: 노션이 그렇습니다. 다만 **흐림 없이 알파만 주면 안 됩니다.** 문서 본문 위에 뜨는 자리라, 88% 만으로는 뒤의 검은 글자가 토스트의 흰 글자와 겹쳐 읽힙니다. 뒤를 8px 흐리면 형태만 남고 글자는 뭉갭니다.

사이드바를 따라가지 않습니다. 사이드바는 200~480px 로 **사용자가 끕니다.** 앱 영역 기준으로 가운데를 잡으면 사이드바를 끌 때마다 토스트가 같이 움직입니다. 뷰포트 가운데는 움직이지 않습니다.

`--knoc-sidebar-*` 를 토스트에서 읽지 않습니다. 읽는 순간 `components/ui/` 가 레이아웃을 알게 됩니다.

구현은 SEED 가 이미 반은 해 둡니다.

| 규칙 | 어디서 |
|---|---|
| 멈춤 | SEED `pauseOnInteraction` 기본값 `true`. `pointerenter`·`pointerleave` 와 `:focus-visible` 을 봅니다 — **우리가 할 일이 없습니다** |
| 교체 안 함 | `create({ strategy })`. 되돌리기가 살아 있으면 `"queued"`, 아니면 `"immediate"` |
| 폭 | `SnackbarRoot` 에 `w-auto`. recipe 의 `width: 100%` 만 덮고 `max-width: 560px` 는 둡니다. region 이 화면 폭을 다 차지해서 안 덮으면 짧은 문구도 560px 로 늘어납니다 |
| 비침 | `bg-toast-surface`(`--knoc-color-toast-surface`) + `backdrop-blur-toast`. 알파는 색 토큰 안에서 섞습니다 — `bg-neutral-inverted` 가 이미 테마별로 뒤집히므로 그 위에 알파만 얹으면 한 곳에서 끝납니다 |
| 간격 | **`Snackbar.Content` 를 반드시 씌웁니다.** 이걸 빼면 `root` 가 그냥 flex 라 메시지와 버튼이 붙습니다. 최상위 export 가 없어 네임스페이스로 집습니다 |
| 되돌리기 여백 | 되돌리기가 있을 때만 `Snackbar.Content` 에 `gap-x5 pr-x2_5`. 오른쪽은 `root` 의 `x2_5` 와 합쳐 20px 입니다 |
| 위치 | SEED region 의 `left: 0` · `right: 0` · `align-items: center` 를 **그대로 씁니다.** 우리가 더한 것은 `fixed` 와 padding 16px 뿐입니다 |

`strategy` 를 매번 넘기는 것에 주의합니다. `"immediate"` 는 대기 중인 큐까지 **한 개로 덮어씁니다**(`queue: [option]`). 되돌리기가 살아 있는지는 `useToast` 가 셉니다.

### Toast — Notion 대조 (2026-08)

노션 웹앱 번들의 `Toaster` 청크를 읽고 맞춰 봤습니다. **번들만 읽고 틀린 항목이 셋 있어 실제 화면으로 고쳤습니다**(아래 ✎ 표시).

| | Notion | KnocSpace |
|---|---|---|
| 위치 | `position: fixed · bottom: 0`, 12px | 같음. **16px** |
| 가로 ✎ | **하단 가운데.** 번들의 `insetInlineStart` 를 왼쪽으로 읽었지만 실제로 뜨는 자리는 가운데였습니다 | 같음. 뷰포트 가운데 |
| 폭 ✎ | **고정이 아닙니다.** 문구에 따라 달라집니다. 번들에서 본 280 이 무엇이었는지는 다시 파지 않았습니다 | 같음. 상한은 SEED 의 560 |
| 표면 ✎ | **비칩니다.** 다크 표면에 알파, 뒤를 흐립니다 | 같음. 알파 88% · 흐림 8px |
| 지속 | 전부 5초 (`dismissTimeoutMs ?? 5000`) | 3초 · 되돌리기 5초 |
| 멈춤 | 호버로 멈춤 | 같음. **키보드 포커스도** |
| 여러 개 | **쌓습니다.** 최신순으로 밀어 올리고 뒤의 것은 `scale(0.96)`, 화면 높이를 넘으면 떨굽니다 | 하나만. 대신 되돌리기를 큐로 지킵니다 |
| 테마 | 앱 테마와 무관하게 항상 다크 | `bg-neutral-inverted` — 다크 모드에서 밝게 뒤집힙니다 |
| 크기 | `min-height` 40 · `r` 8 | `min-height` 44 · `r2` 8 |

**갈리는 건 쌓느냐 하나입니다.** 쌓지 않는 쪽을 고른 이유는 §9 와 같습니다 — 토스트는 방금 무슨 일이 있었는지를 알리는 자리지 읽어야 할 목록이 아닙니다. 대신 쌓기가 막아 주던 것(되돌리기 유실)은 큐 규칙이 대신 막습니다.

**번들 읽기를 화면 확인으로 대신하지 않습니다.** 위 셋은 CSS 값 자체는 맞게 읽고도 결론이 틀렸습니다 — `insetInlineStart` 는 런타임에 계산되는 값이었고, 표면 색은 청크 안에서 끝나지 않았습니다. 노션을 참고할 때는 값을 읽은 다음 실제로 띄워 봅니다.

### Dialog

SEED `max-width` 는 **272px** — 모바일 폭입니다. 그 안에서는 `하위 페이지 4개도 함께 삭제돼요` 가 네 줄이 됩니다.

| | |
|---|---|
| 폭 | **400px**, `max-width: calc(100vw - 48px)` |
| 반경 | `r5` 20px (SEED 그대로 — 다이얼로그는 커서 어울립니다) |
| 패딩 | 20px |
| 제목 | `t6-bold` 18px / −0.02em |
| 설명 | `t4-regular` 14px `fg-neutral-muted`, 제목과 8px |
| 액션 | 상단 20px, **오른쪽 정렬**, gap 8px, 취소가 왼쪽. `ActionButton size="medium"` |
| 딤 | `bg-overlay` |

- **제목은 질문, 설명은 결과.** 되돌릴 수 없으면 그 말을 문장으로 적습니다
- **초기 포커스는 상황에 따라 갈립니다** — `tone="danger"` 면 **취소**, 아니면 **확인**. 늘 취소로 두면 저장 확인 같은 흔한 경우에 `Tab` 이 한 번 더 듭니다
- 포커스를 가둡니다. `Esc` · 딤 클릭으로 닫히고, 닫히면 트리거로 포커스가 돌아갑니다
- `role="dialog"` · `aria-modal="true"` · `aria-labelledby` · `aria-describedby`

### InlineInput

- **높이를 고정하지 않습니다.** 맥락의 행 높이와 글자 크기를 따릅니다 — 트리 28px/13px, 폼 32px/14px. F2 에서 처음 쓰이는 자리가 28px 트리 행입니다
- **세 상태 모두 같은 박스 크기.** 평상시에 `1px solid transparent` 테두리를 미리 잡아 두면 편집으로 넘어갈 때 글자가 1px 도 안 움직입니다
- `idle` 테두리 투명 · 배경 없음 / `hover` 배경만 / `editing` 테두리 `fg-brand`
- **전체 선택은 이름 바꾸기에서만.** 문서 제목은 뒤에 덧붙이는 일이 많아 클릭한 자리에 캐럿을 둡니다
- **문서 제목에는 테두리를 두르지 않습니다.** 40px 글자는 자기 영역이 뚜렷해서, 상자를 더하면 문서가 양식처럼 보입니다. 편집 중에도 테두리도 배경도 없이 캐럿만 섭니다. (`InlineInput` 의 `variant="bare"` 를 쓰지 않습니다 — `PageTitle` 은 접지 않고 줄바꿈해야 해서 따로 만들었습니다)
- 빈 값 확정은 **에러로 잡습니다** — `이름을 비워 둘 수 없어요`. 편집 상태를 유지하고 값을 되돌리지 않습니다

### PageTree

- `role="tree"`, 평평한 배열 + `depth` (§5)
- **탭 정지점은 하나** (roving tabindex). 행마다 액션 버튼 둘을 탭 순서에 넣으면 페이지 50개에서 사이드바를 벗어나는 데 `Tab` 100번입니다
- **액션 버튼은 `tabindex="-1"`.** 포커스가 갈 일이 없으므로 **포커스 링도 없습니다.** 키보드로는 메뉴 키가 같은 `Menu` 를 열고, 이름 바꾸기·하위 페이지 추가·삭제가 전부 그 안에 있어 막히는 기능이 없습니다

| 키 | 동작 |
|---|---|
| `Tab` | 트리 전체를 한 번에 지나갑니다. 들어오면 마지막 위치로 |
| `↑` `↓` | 보이는 행 사이. 접힌 자식은 건너뜁니다 |
| `→` | 접혀 있으면 펼치고, 펼쳐져 있으면 첫 자식으로 |
| `←` | 펼쳐져 있으면 접고, 접혀 있으면 부모로 |
| `Enter` | 그 페이지를 엽니다 |
| `F2` | 제자리에서 이름 바꾸기 |
| 메뉴 키 · `Shift+F10` | 행 메뉴 — 우클릭과 같은 것 |

### 문서 아이콘

`Page.icon` 이모지 하나가 **세 자리**에 나옵니다. 값은 같고 크기와 「없을 때」가 다릅니다.

| 자리 | 컴포넌트 | 있으면 | **없으면** |
|---|---|---|---|
| 문서 헤더 | `PageIcon` | 52px 이모지 | **안 그립니다.** 호버하면 「아이콘 추가」 |
| 사이드바 트리 | `PageTreeItem` | 16px 이모지 | **문서 모양 seed-icon** |
| 상단바 경로 | `Breadcrumb` | 16px 이모지 | **안 그립니다.** 자리도 없습니다 |

**기본은 「안 그린다」이고, 채우는 것은 트리 하나뿐입니다.** 유저가 안 고른 것을 그리지 않는 것이 기본이기 때문입니다. 트리만 예외인 이유는 **세로로 줄 서는 목록**이라서입니다 — 거기서 아이콘은 그림이 아니라 제목 시작점을 맞추는 격자라, 빈 칸이 생기면 눈이 왼쪽 세로선을 잃습니다. 경로는 가로로 이어지는 자리라 메울 이유가 없습니다.

**채우는 것이 seed-icon 인 것도 규칙입니다.** 기본 *이모지* 를 넣으면 유저가 안 고른 것을 그리는 셈이지만, §8 이 「이모지는 콘텐츠, seed-icon 은 크롬」 으로 갈라 뒀고 채우는 쪽은 크롬입니다.

**공용 컴포넌트로 빼지 않습니다.** 두 자리가 나눠 쓰는 것은 16px 상자 네 줄뿐이고, 「없을 때」 라는 절반이 서로 다릅니다. 한 컴포넌트가 불리언으로 두 동작을 갖는 것보다 각자 갖는 편이 낫고, 어긋나지 않게 지키는 것은 이 표입니다.

**16px 은 자리이지 글자 크기가 아닙니다** (§5). 이모지는 그 안에서 둘러싼 글자 크기(13px)를 따르고, 16px 로 그려지는 것은 대체 seed-icon 쪽입니다.

### Breadcrumb

- 상단바 44px 안. `t3-regular` 13px, 조상은 `fg-neutral-subtle`, 마지막은 `fg-neutral`
- 구분자는 **chevron 16px**. 슬래시는 제목 안의 `/` 와 구별이 안 됩니다
- 4단계를 넘으면 **첫 항목 + `…` + 마지막 둘**
- **마지막 항목만 줄입니다.** 조상은 안 줄입니다 — 접기가 이미 폭을 벌어 줍니다
- **고른 아이콘만 그립니다. 없으면 자리도 없습니다** — 바로 위 「문서 아이콘」 절을 따릅니다

### SaveStatus

상단바 오른쪽. 상태 문자열만 받아 그립니다. `aria-live="polite"`.

상태는 **넷**입니다. 상단바 오른쪽은 글을 쓰는 동안 아무도 안 보는 자리라, 여기서 답하는 질문은 하나뿐입니다 — **"내 글이 저장됐나."**

| status | 뜻 | 표시 |
|---|---|---|
| `idle` | 변경 없음 | **아무것도 안 그립니다** |
| `saving` | 저장하는 중 | `Spinner` 16px + `저장 중` — `fg-neutral-subtle` |
| `saved` | 저장됨 | `저장됨` — `fg-neutral-subtle`. 2초 뒤 사라집니다 |
| `offline` | 연결이 없어 대기 | `오프라인 — 연결되면 저장할게요` — `fg-neutral-subtle` |

**넷 다 조용한 회색 한 줄입니다. 색도 굵기도 버튼도 쓰지 않습니다.**

**재시도는 상태가 아닙니다.** 저장이 한 번 실패해서 앱이 다시 걸고 있는 동안은 여전히 `saving` 입니다 — 저장은 아직 끝나지 않았고, 사용자가 할 일도 달라지지 않습니다. 시도 횟수는 사용자가 쓸 정보가 아닙니다.

**실패는 여기서 다루지 않습니다.** 자동 재시도까지 실패해서 사람이 손대야 하는 상황은 **§9 의 `PageBanner`**(본문 위, `ErrorState variant="inline"`)로 올립니다. 이유는 두 가지입니다.

- 손이 필요한 알림을 아무도 안 보는 자리에 두면, 그 자리를 억지로 키워야 합니다. 빨간 글자와 버튼으로 상단바를 시끄럽게 만들고도 정작 눈에 안 들어옵니다.
- 실패는 원인별로 할 말이 다릅니다(권한 · 충돌 · 서버 · 재시도 실패 — §9). 상단바 한 줄에 그걸 다 담을 수 없습니다.

그래서 상단바는 **알림이 아니라 상태 표시**로만 남습니다. 저장 실패 배너의 문구와 동작은 F3 에서 §9 의 `errorMessages` 로 붙입니다.

**변경이 없으면 아무것도 안 그립니다.** `저장됨` 을 계속 띄워 두면 글자가 배경이 되어 정작 바뀔 때 눈에 안 들어옵니다.

`aria-live` 는 **결과만** 읽습니다. `저장 중` 까지 읽으면 타이핑할 때마다 스크린리더가 말합니다.

## 11. 브랜드

| | |
|---|---|
| 워드마크 | `KnocSpace` — 카멜 케이스 유지. 소문자로 붙이지 마세요 |
| 서체 | Pretendard SemiBold(600), −0.035em |
| 최소 크기 | 13px. 그 아래로는 심볼만 |
| 심볼 | 24×24 그리드, inset 1.5, radius 6, stroke 2.0 round cap |
| 심볼 색 | `fg-brand` 하나. 라이트/다크는 토큰이 알아서 뒤집습니다 — 다크 전용 파일을 쓰지 않습니다 |
| 파비콘 | 16px과 18px은 stroke 2.4 / 2.2로 굵힌 **별도 파일**. 하나를 축소하면 흐려집니다 |
| 금지 | 회전, 그라디언트, 그림자, 획 굵기 임의 변경 |
| 사이드바 락업 | 심볼 18px + 워드마크 14px, 간격 8px |
| 여백 | 사방 최소 심볼 높이의 25% |

---

## 12. 성공 기준

- SEED 컴포넌트와 새로 만든 컴포넌트가 같은 시스템처럼 보인다.
- 문서 화면과 Grid 화면이 밀도가 다른데도 한 제품으로 읽힌다.
- 4개 스프린트 동안 토큰을 다시 안 건드린다.
