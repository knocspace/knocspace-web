# KnocSpace 디자인 규칙 (D0 확정)

UI 코드를 쓰기 전에 이 파일을 읽습니다. 여기 적힌 값은 D0에서 확정됐고, 4개 스프린트 동안 바뀌지 않습니다.

## ⚠ SEED 스킬보다 이 문서가 우선입니다

이 프로젝트에는 당근 SEED 스킬이 설치돼 있습니다. 그 스킬이 알려주는 값은 **SEED 원본(당근 앱, 모바일, 터치) 기준**이고, KnocSpace가 D0에서 바꾼 것은 전혀 모릅니다.

| SEED 스킬이 말하는 것 | KnocSpace 실제 값 |
|---|---|
| primary = carrot-500 `#ff6f0f` | **purple-600 `#8361E8`** |
| 앱바 56pt | **상단바 44px** |
| 행/리스트 높이 48pt 이상 | **그리드 행 32px, 트리 행 28px** |
| 터치 영역 최소 44pt | **데스크톱 전용, 적용 안 함** |
| 간격 토큰 없음 (2~22pt 관습) | **dense / comfy 두 계열 (아래)** |
| 격자선 divider-2 | **내부 격자선 gray-alpha-100** |

충돌하면 이 문서가 이깁니다. SEED 스킬은 컴포넌트 스펙(패딩, 반경, 상태 규칙)과 토큰 이름을 확인하는 용도로만 씁니다.

---

## 1. 절대 규칙

### SEED 변수를 건드려도 되는 곳

**허용 — 이 목록의 semantic 매핑 재정의 딱 한 군데.** `src/styles/knocspace.css` 안, 아래 코드 블록에 있는 변수들만.

```
--seed-semantic-color-primary
--seed-semantic-color-primary-hover
--seed-semantic-color-primary-pressed
--seed-semantic-color-primary-low
--seed-semantic-color-primary-low-hover
--seed-semantic-color-primary-low-active
--seed-semantic-color-primary-low-pressed
--seed-semantic-color-paper-accent
--seed-semantic-color-text-selection
```

**금지**

- `--seed-scale-color-*` 를 새로 정의하거나 값을 바꾸는 것. 새 색이 필요하면 `--knoc-` 이름으로 만듭니다.
- `--seed-static-*`, `--seed-radius-*`, `--seed-semantic-typography-*` 재정의.
- 위 목록 밖의 semantic 변수 재정의.
- SEED 컴포넌트에 `!important`나 자손 선택자로 스타일을 덮는 것. 스타일이 안 맞으면 컴포넌트를 안 쓰거나 `style` prop으로 넘깁니다.
- 컴포넌트 안에 하드코딩된 hex. 색은 전부 토큰 참조로.

### 새로 만드는 것은 전부 `--knoc-` 접두사

밀도, 레이아웃 치수, 격자선, 강조색 알파 — 새 값은 모두 `--knoc-`로 시작합니다. SEED를 업그레이드했을 때 충돌 지점이 `knocspace.css` 한 파일로 모입니다.

### 색 사용

- 강조색은 purple 계열 **하나만**. 선택 상태, 주 액션, 커서, 삽입선.
- 상태색은 SEED 그대로: green 성공, red 위험, yellow 경고, blue 링크·포커스.
- 배경은 항상 paper 토큰. raw gray 금지 (다크모드가 깨집니다).
- primary 위 텍스트는 라이트·다크 모두 `--seed-static-color-static-white`.
- 그라디언트, 텍스처, 일러스트 없음.

---

## 2. 확정 수치

| 항목 | 값 | 토큰 |
|---|---|---|
| 사이드바 기본 폭 | 240px | `--knoc-sidebar-default` |
| 사이드바 최소 / 최대 | 200 / 480px | `--knoc-sidebar-min` / `-max` |
| 사이드바 접힘 | 200px 아래로 끌면 0, 40px 아이콘 레일 | — |
| 상단바 높이 | 44px | `--knoc-topbar-height` |
| 문서 본문 최대 폭 | 720px | `--knoc-doc-measure` |
| 문서 좌우 거터 | 56px | `--knoc-doc-gutter` |
| DB 화면 좌우 거터 | 16px (measure 무시, 전체 폭) | — |
| 그리드 행 높이 | 32px | `--knoc-grid-row-height` |
| 그리드 헤더 높이 | 34px | `--knoc-grid-header-height` |
| 그리드 셀 좌우 패딩 | 8px | `--knoc-space-dense-4` |
| 트리 행 높이 | 28px | `--knoc-tree-row-height` |
| 트리 들여쓰기 단위 | 14px | `--knoc-tree-indent` |
| 툴바 높이 | 40px | `--knoc-toolbar-height` |
| 칩 높이 | 26px | `--knoc-chip-height` |
| 필터 팝오버 폭 | 380px 고정 | — |
| 칸반 컬럼 폭 | 260px 고정 | — |
| 문서 아이콘(이모지) | 52px, 제목과 10px 간격 | — |
| 문서 제목 | 34px / 700 / −0.035em | — |

### 강조색

| 역할 | 라이트 | 다크 |
|---|---|---|
| primary | purple-600 `#8361E8` | purple-500 `#987AF0` |
| primary-hover / pressed | purple-500 | purple-600 |
| primary-low | `--knoc-purple-alpha-100` | `--knoc-purple-alpha-50` |
| primary-low hover/active/pressed | `--knoc-purple-alpha-200` | `--knoc-purple-alpha-100` |
| paper-accent / text-selection | purple-50 | purple-50 |

purple 스케일 값은 SEED에 라이트·다크 양쪽 다 이미 있습니다. 새로 정의하는 것은 alpha 3단계뿐이고, 그것도 `--knoc-` 이름으로 만듭니다.

### 격자선

| 위치 | 토큰 | 값 |
|---|---|---|
| 그리드 내부 (셀 경계) | `--knoc-color-grid-line` | `gray-alpha-100` |
| 고정 헤더 하단 | `--knoc-color-grid-frozen` | `divider-3` |
| 표 바깥 경계 | `--knoc-color-grid-edge` | `divider-2` |

내부 격자선은 SEED보다 한 단계 낮춥니다. 모바일 단일 컬럼에서 적절한 divider-2가 8열 26행 그리드에서는 데이터보다 먼저 읽힙니다. alpha 계열이라 행 호버·선택 배경 위에서 색이 어긋나지 않고 다크모드에서 흰색 알파로 자동 반전됩니다.

세로선 없이 가로선만 쓰는 변형은 **읽기 전용 뷰에만** 씁니다. 편집 가능한 그리드에서는 열 리사이즈 손잡이와 셀 경계가 필요합니다.

### 타이포

| 역할 | 크기 | 굵기 | 비고 |
|---|---|---|---|
| 그리드 셀 · 트리 행 | 13px / 1.35 | 400 | SEED label3 |
| 그리드 헤더 | 12.5px | 700 | gray-600 |
| 문서 본문 | 16px / 1.55 | 400 | SEED body-medium |
| 문서 제목1 / 2 / 3 | 26 / 20 / 17px | 700 | −0.03 / −0.025 / −0.02em |
| 토큰명·코드 | 13px | 400 | Roboto Mono |
| 워드마크 | — | **600** | Pretendard SemiBold, −0.035em, 최소 13px |

SEED 토큰 레이어에는 400과 700만 있습니다. **600은 워드마크 전용 예외**이고 본문에는 쓰지 않습니다. 한글은 `word-break: keep-all`.

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

- **SEED 버튼을 그리드 행 안에 넣지 마세요.** BoxButton 최소 높이는 32pt(xsmall)이고 32px 행에 여백 없이 꽉 찹니다. dense 버튼 변형은 아직 미결정입니다(§6).
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

@import "@seed-design/css/base.layered.css";
@import "tailwindcss";
@import "@seed-design/tailwind4-theme";
@import "./styles/knocspace.css";

/* 문서가 CSS 번들에 영향을 주지 않게 한다 */
@source not "**/*.md";
```

`blocknote-bridge.css` 는 Sprint 3 에서 추가합니다.

### `src/styles/knocspace.css`

```css
/* 1. 강조색 알파 — KnocSpace 이름으로 신규 정의 */
:root {
  --knoc-purple-alpha-50:  #8361e80d;
  --knoc-purple-alpha-100: #8361e824;
  --knoc-purple-alpha-200: #8361e833;
}
[data-seed-scale-color="dark"] {
  --knoc-purple-alpha-50:  #987af014;
  --knoc-purple-alpha-100: #987af024;
  --knoc-purple-alpha-200: #987af033;
}

/* 2. semantic primary 재매핑 — SEED 변수를 건드리는 유일한 지점 */
:root, [data-seed-scale-color="light"] {
  --seed-semantic-color-primary:             var(--seed-scale-color-purple-600);
  --seed-semantic-color-primary-hover:       var(--seed-scale-color-purple-500);
  --seed-semantic-color-primary-pressed:     var(--seed-scale-color-purple-500);
  --seed-semantic-color-primary-low:         var(--knoc-purple-alpha-100);
  --seed-semantic-color-primary-low-hover:   var(--knoc-purple-alpha-200);
  --seed-semantic-color-primary-low-active:  var(--knoc-purple-alpha-200);
  --seed-semantic-color-primary-low-pressed: var(--knoc-purple-alpha-200);
  --seed-semantic-color-paper-accent:        var(--seed-scale-color-purple-50);
  --seed-semantic-color-text-selection:      var(--seed-scale-color-purple-50);
}
[data-seed-scale-color="dark"] {
  --seed-semantic-color-primary:             var(--seed-scale-color-purple-500);
  --seed-semantic-color-primary-hover:       var(--seed-scale-color-purple-600);
  --seed-semantic-color-primary-pressed:     var(--seed-scale-color-purple-600);
  --seed-semantic-color-primary-low:         var(--knoc-purple-alpha-50);
  --seed-semantic-color-primary-low-hover:   var(--knoc-purple-alpha-100);
  --seed-semantic-color-primary-low-active:  var(--knoc-purple-alpha-100);
  --seed-semantic-color-primary-low-pressed: var(--knoc-purple-alpha-100);
  --seed-semantic-color-paper-accent:        var(--seed-scale-color-purple-50);
  --seed-semantic-color-text-selection:      var(--seed-scale-color-purple-50);
}

/* 3. 밀도·치수·격자선·레이아웃 — 전부 신규 이름 */
:root {
  --knoc-space-dense-1: 2px;
  --knoc-space-dense-2: 4px;
  --knoc-space-dense-3: 6px;
  --knoc-space-dense-4: 8px;
  --knoc-space-dense-5: 10px;
  --knoc-space-dense-6: 12px;
  --knoc-space-dense-7: 16px;

  --knoc-space-comfy-1: 8px;
  --knoc-space-comfy-2: 12px;
  --knoc-space-comfy-3: 16px;
  --knoc-space-comfy-4: 20px;
  --knoc-space-comfy-5: 24px;
  --knoc-space-comfy-6: 32px;
  --knoc-space-comfy-7: 48px;

  --knoc-grid-row-height:    32px;
  --knoc-grid-header-height: 34px;
  --knoc-tree-row-height:    28px;
  --knoc-tree-indent:        14px;
  --knoc-toolbar-height:     40px;
  --knoc-chip-height:        26px;

  --knoc-type-grid-size: 13px;
  --knoc-type-grid-line: 1.35;

  --knoc-color-grid-line:   var(--seed-scale-color-gray-alpha-100);
  --knoc-color-grid-edge:   var(--seed-semantic-color-divider-2);
  --knoc-color-grid-frozen: var(--seed-semantic-color-divider-3);

  --knoc-sidebar-default: 240px;
  --knoc-sidebar-min:     200px;
  --knoc-sidebar-max:     480px;
  --knoc-topbar-height:   44px;
  --knoc-doc-measure:     720px;
  --knoc-doc-gutter:      56px;
}

/* 4. Tailwind 유틸리티 노출 */
@theme inline {
  --spacing-dense-1: var(--knoc-space-dense-1);
  --spacing-dense-2: var(--knoc-space-dense-2);
  --spacing-dense-3: var(--knoc-space-dense-3);
  --spacing-dense-4: var(--knoc-space-dense-4);
  --spacing-dense-5: var(--knoc-space-dense-5);
  --spacing-dense-6: var(--knoc-space-dense-6);
  --spacing-dense-7: var(--knoc-space-dense-7);

  --spacing-comfy-1: var(--knoc-space-comfy-1);
  --spacing-comfy-2: var(--knoc-space-comfy-2);
  --spacing-comfy-3: var(--knoc-space-comfy-3);
  --spacing-comfy-4: var(--knoc-space-comfy-4);
  --spacing-comfy-5: var(--knoc-space-comfy-5);
  --spacing-comfy-6: var(--knoc-space-comfy-6);
  --spacing-comfy-7: var(--knoc-space-comfy-7);

  --spacing-doc-gutter: var(--knoc-doc-gutter);

  --height-tree-row:   var(--knoc-tree-row-height);
  --height-grid-row:   var(--knoc-grid-row-height);
  --height-topbar:     var(--knoc-topbar-height);

  --width-sidebar:     var(--knoc-sidebar-default);
  --max-width-measure: var(--knoc-doc-measure);

  --color-grid-line: var(--knoc-color-grid-line);
  --color-grid-edge: var(--knoc-color-grid-edge);
}
/* 사용: class="h-grid-row px-dense-4 border-grid-line max-w-measure" */
```

다크모드는 `<html data-seed-scale-color="dark">`. 별도 팔레트를 만들지 않습니다.

---

## 5. SEED에 없는 컴포넌트 5종

공통 규칙: **동작만 새로 만들고 표면은 SEED 토큰에서 빌립니다.** 색·반경·모션은 한 값도 새로 정하지 않습니다.

### 데이터 그리드 (D1)

- TanStack Table headless로 열 리사이즈, 가상 스크롤, 고정 헤더 처리. 셀 렌더러만 직접 작성.
- 셀 편집은 별도 입력을 띄우지 않고 셀 자체를 `contenteditable` 표면으로 전환. 행 높이는 편집 중에만 `auto`로 풀림.
- SEED에서 빌리는 것: 셀 포커스 링 = TextField focus / 선택 행 = `primary-low` / 격자선 = `--knoc-color-grid-*` / 타입 = label3

### 리사이즈 가능한 사이드바 (D1)

- 트리는 평탄화한 배열 + `depth` 필드로 렌더. **재귀 컴포넌트 금지** — 가상 스크롤이 안 됩니다.
- drag & drop은 dnd-kit. 드롭 위치는 2px 삽입선과 들여쓰기 미리보기 두 가지로 표시.
- 폭은 포인터 이벤트로 직접 처리, `localStorage`에 저장.
- SEED에서 빌리는 것: 행 호버 = `gray-hover` / 선택 = `primary-low` / 삽입선 = `primary` / 아이콘 = seed-icon 16pt

### 에디터 표면 (D1)

- BlockNote CSS를 끄지 않고 변수만 다시 가리킵니다(§7).
- 슬래시 메뉴와 포맷 툴바만 SEED 표면으로 교체. 블록 내부는 손대지 않음.
- 슬래시 메뉴: 폭 320px, 행 높이 32px, 각 항목에 마크다운 단축 표기 표시.
- 포맷 툴바: 높이 34px, 반경 6pt, FAB 그림자(`0 2px 6px rgba(0,0,0,.16)`), 켜진 버튼만 `primary-low`.
- SEED에서 빌리는 것: 색·타입·반경 전부 / 메뉴 = ActionSheet 스타일 / 툴바 = `paper-floating`

### 칸반 보드 (D2)

- 그리드와 **같은 데이터, 같은 셀 렌더러**를 씁니다. 카드는 Grid 행의 다른 배치일 뿐이라는 원칙을 코드 수준에서 지킵니다.
- 컬럼 폭 260px 고정, 카드 간격 `dense-4`. 드래그 중 원본은 사라지지 않고 40% 불투명도로 남김.
- SEED에서 빌리는 것: 카드 = `paper-default` + `divider-2` 1px / 컬럼 배경 = `paper-contents` / 반경 6pt / 드롭 자리 = `primary-low`

### 필터 편집 팝오버 (D2)

- 필드 → 연산자 → 값을 한 행에 나란히. 값 입력기는 필드 타입이 결정.
- 조건 추가는 행 단위. AND/OR는 두 번째 행부터 왼쪽 열에 나타남.
- 폭 380px 고정, 조건 5개까지 스크롤 없이.
- SEED에서 빌리는 것: SelectBox 3개 조합 / 표면 = `paper-floating` / 반경 10pt / 지우기 = TextButton danger

---

## 6. 미결정 — 임의로 정하지 마세요

아래 두 항목은 D0에서 **의도적으로 열어둔** 것입니다. 코드에서 마주치면 임의로 값을 넣지 말고 결정을 요청하세요.

### 포커스 링

SEED 기본값은 blue-600 2pt이고, 그게 blue-600을 쓰는 유일한 자리입니다. purple primary 위에서는 두 색이 색상환에서 붙어 있어 링이 탁해 보입니다.

- 후보 A: SEED 그대로 blue-600 2pt 유지
- 후보 B: `gray-900` 2pt + 1pt 흰 오프셋

D1에서 나란히 놓고 결정합니다. **그때까지 SEED 기본값(blue-600)을 그대로 두세요.** 접근성 요구사항이라 없애면 안 됩니다.

### dense 버튼 변형

32px 그리드 행에 SEED BoxButton이 들어가지 않습니다(xsmall이 32pt).

- 후보 A: SEED BoxButton에 26px `size="xxsmall"` 추가
- 후보 B: 그리드 전용 별도 컴포넌트로 분리

그리드 스펙과 함께 D1에서 결정합니다. **그때까지 그리드 안에 버튼을 넣지 말고**, 필요하면 아이콘 버튼(26×26 정사각, 배경 없음, 호버 시 `gray-hover`)으로 대체하세요.

---

## 7. BlockNote 경계

BlockNote CSS를 끄거나 덮지 않습니다. 변수만 SEED로 되돌려 가리킵니다.

### `src/styles/blocknote-bridge.css`

```css
.bn-container {
  --bn-colors-editor-text:         var(--seed-semantic-color-ink-text);
  --bn-colors-editor-background:   var(--seed-semantic-color-paper-default);
  --bn-colors-menu-text:           var(--seed-semantic-color-ink-text);
  --bn-colors-menu-background:     var(--seed-semantic-color-paper-floating);
  --bn-colors-tooltip-text:        var(--seed-static-color-static-white);
  --bn-colors-tooltip-background:  var(--seed-scale-color-gray-900);
  --bn-colors-hovered-background:  var(--seed-semantic-color-gray-hover);
  --bn-colors-selected-text:       var(--seed-static-color-static-white);
  --bn-colors-selected-background: var(--seed-semantic-color-primary);
  --bn-colors-disabled-text:       var(--seed-scale-color-gray-500);
  --bn-colors-border:              var(--seed-semantic-color-divider-2);
  --bn-colors-side-menu:           var(--seed-scale-color-gray-500);
  --bn-font-family:                var(--seed-font-family-default);
  --bn-border-radius:              6px;
}
```

| SEED가 가져가는 것 | BlockNote에 남기는 것 |
|---|---|
| 모든 색 | 블록 상하 간격과 들여쓰기 계단 |
| 서체와 크기 | 드래그 핸들 위치와 히트 영역 |
| 반경 | 커서·선택 동작 |
| 슬래시 메뉴·포맷 툴바 표면 | 테이블 블록 내부 구조 |
| 하이라이트 팔레트 8색 (SEED 스케일 500단계로 교체) | |

오른쪽 열에 손대면 BlockNote 업그레이드마다 깨집니다.

---

## 8. 카피 톤

- 시스템 용어가 아니라 유저가 인식하는 이름으로. `제출` 아니라 `저장`.
- 버튼 이름과 결과 메시지를 일치시킬 것. `발행` → `발행됨`.
- 에러는 사과하지 않고, 뭐가 잘못됐고 어떻게 고치는지 말할 것.
- 문장형 대소문자, 군더더기 없이. 느낌표 없음.
- 해요체. 합니다체·반말 금지. (이 문서 같은 스펙 산문은 합니다체.)
- **이모지**: UI 크롬에 금지. 유저가 고르는 문서 아이콘은 예외 — 그건 콘텐츠입니다.
- 아이콘은 seed-icon만. 유니코드나 이모지를 아이콘 대신 쓰지 않습니다. 필요한 아이콘이 없으면 `daangn/seed-icon`에서 가져오고, 직접 그리지 않습니다.

---

## 9. 빈 화면 3종 — 확정 카피

일러스트나 안내 카드를 두지 않습니다. 아이콘은 seed-icon 24pt, `gray-400`.

### 첫 실행 (페이지가 하나도 없음)

| | |
|---|---|
| 아이콘 | `icon_write_regular` |
| 제목 | 페이지가 아직 없어요 |
| 설명 | 첫 페이지를 만들면 왼쪽 목록에 쌓여요. |
| 버튼 | `페이지 만들기` — BoxButton small primary |

### 검색 결과 없음

| | |
|---|---|
| 아이콘 | `icon_search_regular` |
| 제목 | ‘{검색어}’와 맞는 페이지가 없어요 |
| 설명 | 제목만 찾고 있어요. 본문까지 넓히거나 다른 단어로 찾아보세요. |
| 버튼 | `본문까지 찾기` — BoxButton small primary-low |

### 휴지통 비어있음

| | |
|---|---|
| 아이콘 | `icon_trash_regular` |
| 제목 | 휴지통이 비어 있어요 |
| 설명 | 삭제한 페이지는 30일 동안 여기 머물러요. 그 뒤에는 사라져요. |
| 버튼 | 없음 |

### 빈 문서 (에디터)

빈 화면 컴포넌트를 쓰지 않습니다. 커서는 제목에 있고, 아래 한 줄만 둡니다.

- 제목 자리: `제목 없음` (`gray-400`, 34px)
- 첫 줄: `바로 쓰거나, / 를 눌러 블록을 넣으세요` (`gray-500`, 16px)
- 버튼 없음 — 다음 행동이 클릭이 아니라 타이핑입니다.

**버튼을 두는 기준**: 다음 행동이 그 화면 안에 있을 때만. 검색 결과 없음과 휴지통은 다음 행동이 화면 밖(검색창, 페이지 삭제)에 있어서 첫 실행에만 primary 버튼이 있습니다.

---

## 10. 브랜드

| | |
|---|---|
| 워드마크 | `KnocSpace` — 카멜 케이스 유지. 소문자로 붙이지 마세요 |
| 서체 | Pretendard SemiBold(600), −0.035em |
| 최소 크기 | 13px. 그 아래로는 심볼만 |
| 심볼 | 24×24 그리드, inset 1.5, radius 6, stroke 2.0 round cap |
| 심볼 색 | 라이트 primary / 다크 purple-500 + gray-00 글리프 |
| 파비콘 | 16px과 18px은 stroke 2.4 / 2.2로 굵힌 **별도 파일**. 하나를 축소하면 흐려집니다 |
| 금지 | 회전, 그라디언트, 그림자, 획 굵기 임의 변경 |
| 사이드바 락업 | 심볼 18px + 워드마크 14px, 간격 8px |
| 여백 | 사방 최소 심볼 높이의 25% |

---

## 11. 성공 기준

- SEED 컴포넌트와 새로 만든 컴포넌트가 같은 시스템처럼 보인다.
- 문서 화면과 Grid 화면이 밀도가 다른데도 한 제품으로 읽힌다.
- 4개 스프린트 동안 토큰을 다시 안 건드린다.
