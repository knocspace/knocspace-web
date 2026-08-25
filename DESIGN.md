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
| 문서 좌우 거터 | 56px | `--knoc-doc-gutter` |
| DB 화면 좌우 거터 | 16px (measure 무시, 전체 폭) | `--knoc-db-gutter` |
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

alpha 단계(`--knoc-purple-alpha-*`)는 만들지 않습니다. 선택·호버의 옅은 강조는 `bg-brand-weak` 가 맡고, 그 값이 이미 모드별로 갈라져 있습니다.

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
| 문서 본문 | 16px / 1.55 | 400 | SEED `t5-regular` |
| 문서 제목1 / 2 / 3 | 26 / 20 / 17px | 700 | −0.03 / −0.025 / −0.02em |
| 토큰명·코드 | 13px | 400 | Roboto Mono |
| 워드마크 | — | **600** | Pretendard SemiBold, −0.035em, 최소 13px |

SEED 의 `t` 스케일은 11 · 12 · 13 · 14 · 16 · 18 · 20 · 22 · 24px 입니다(`t1`~`t9`). 문서 제목의 26px · 17px 과 문서 제목 34px 은 이 스케일 밖이라 `--knoc-` 로 따로 정해야 합니다 — **아직 만들지 않았습니다.** 에디터가 생기는 F3 에서 추가합니다.

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

- **SEED 버튼을 그리드 행 안에 넣지 마세요.** `ActionButton` 의 최소 높이가 32px(`size="xsmall"`)이라 32px 행에 여백 없이 꽉 찹니다. dense 버튼 변형은 아직 미결정입니다(§6).
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

/* 문서가 CSS 번들에 영향을 주지 않게 한다. 경로는 이 CSS 파일 기준이고
 * 탐지 범위는 프로젝트 루트라 ../ 가 필요하다 */
@source not "../**/*.md";
```

`blocknote-bridge.css` 는 Sprint 3 에서 추가합니다.

### `src/styles/knocspace.css`

**값은 파일이 정답입니다.** 여기 옮겨 적지 않습니다 — 두 벌이 되면 반드시 어긋납니다. 파일은 세 부분입니다.

1. **brand 8개 재매핑** — carrot → purple. §1 의 허용 목록이 곧 이 블록입니다. 라이트·다크 두 벌.
2. **`--knoc-` 변수** — 밀도(dense/comfy 각 7단계), 레이아웃 치수, 격자선.
3. **`@theme inline`** — 위 변수를 Tailwind 유틸리티로 노출.

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

### 에디터 표면 (D1)

- BlockNote CSS를 끄지 않고 변수만 다시 가리킵니다(§7).
- 슬래시 메뉴와 포맷 툴바만 SEED 표면으로 교체. 블록 내부는 손대지 않음.
- 슬래시 메뉴: 폭 320px, 행 높이 32px, 각 항목에 마크다운 단축 표기 표시.
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

`dense 버튼 변형` 하나가 열려 있습니다. 코드에서 마주치면 임의로 값을 넣지 말고 결정을 요청하세요.

### 포커스 링 — F1 에서 확정 (중립 링)

`--seed-color-stroke-focus-ring` 을 **`gray-900`** 으로 덮습니다. SEED 기본값 blue-600 은 라이트에서 흰 배경 대비 2.9:1 이라 비텍스트 3:1 을 못 넘고, purple 과 색상환에서 붙어 있어 강조색 위에서 탁해 보였습니다.

| | 라이트 | 다크 |
|---|---|---|
| 링 | `gray-900` `#2a3038` | `gray-900` `#e9eaec` |
| 배경 대비 | 13.4:1 | 15.9:1 |

**`outline` 이 아니라 `box-shadow` 2겹입니다.** `outline-offset` 은 그 자리에 뒤 배경을 비출 뿐 선을 그리지 않아서, 보라 버튼 위에서는 링이 버튼에 그대로 붙어 보입니다. 안쪽 1px 은 `bg-layer-default` 라 모드에 따라 흰색/`gray-100` 으로 뒤집힙니다.

```
knoc-focus-ring         기본. 바깥으로 halo 1px + 링 2px
knoc-focus-ring-inset   링이 밖으로 나갈 자리가 없을 때 —
                        레일 버튼, 트리 행, 그리드 셀. halo 없음
```

정의는 `knocspace.css` 의 `@layer components` 에 있습니다. 컴포넌트는 클래스 이름만 붙이고 값을 다시 쓰지 않습니다. **포커스 링을 없애지 마세요** — 접근성 요구사항입니다.

### dense 버튼 변형

32px 그리드 행에 SEED `ActionButton` 이 들어가지 않습니다(`xsmall` 이 32px).

- 후보 A: `ActionButton` 에 26px `size="xxsmall"` 을 프로젝트 레시피로 추가
- 후보 B: 그리드 전용 별도 컴포넌트로 분리

그리드 스펙과 함께 D1에서 결정합니다. **그때까지 그리드 안에 버튼을 넣지 말고**, 필요하면 아이콘 버튼(26×26 정사각, 배경 없음, 호버 시 `bg-neutral-weak-alpha`)으로 대체하세요.

---

## 7. BlockNote 경계

BlockNote CSS를 끄거나 덮지 않습니다. 변수만 SEED로 되돌려 가리킵니다.

### `src/styles/blocknote-bridge.css`

```css
.bn-container {
  --bn-colors-editor-text:         var(--seed-color-fg-neutral);
  --bn-colors-editor-background:   var(--seed-color-bg-layer-default);
  --bn-colors-menu-text:           var(--seed-color-fg-neutral);
  --bn-colors-menu-background:     var(--seed-color-bg-layer-floating);
  --bn-colors-tooltip-text:        var(--seed-color-fg-neutral-inverted);
  --bn-colors-tooltip-background:  var(--seed-color-bg-neutral-inverted);
  --bn-colors-hovered-background:  var(--seed-color-bg-neutral-weak-alpha);
  --bn-colors-selected-text:       var(--seed-color-palette-static-white);
  --bn-colors-selected-background: var(--seed-color-bg-brand-solid);
  --bn-colors-disabled-text:       var(--seed-color-fg-disabled);
  --bn-colors-border:              var(--seed-color-stroke-neutral-muted);
  --bn-colors-side-menu:           var(--seed-color-fg-neutral-subtle);
  --bn-font-family:                inherit;
  --bn-border-radius:              var(--seed-radius-r1_5);
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

일러스트나 안내 카드를 두지 않습니다. 아이콘은 seed-icon 24px, `fg-neutral-subtle`.

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

### 휴지통 비어있음

| | |
|---|---|
| 아이콘 | `icon_trash_regular` |
| 제목 | 휴지통이 비어 있어요 |
| 설명 | 삭제한 페이지는 30일 동안 여기 머물러요. 그 뒤에는 사라져요. |
| 버튼 | 없음 |

### 빈 문서 (에디터)

빈 화면 컴포넌트를 쓰지 않습니다. 커서는 제목에 있고, 아래 한 줄만 둡니다.

- 제목 자리: `제목 없음` (`fg-neutral-subtle`, 34px)
- 첫 줄: `바로 쓰거나, / 를 눌러 블록을 넣으세요` (`fg-neutral-muted`, 16px)
- 버튼 없음 — 다음 행동이 클릭이 아니라 타이핑입니다.

**버튼을 두는 기준**: 다음 행동이 그 화면 안에 있을 때만. 검색 결과 없음과 휴지통은 다음 행동이 화면 밖(검색창, 페이지 삭제)에 있어서 첫 실행에만 `brandSolid` 버튼이 있습니다.

---

## 10. 브랜드

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

## 11. 성공 기준

- SEED 컴포넌트와 새로 만든 컴포넌트가 같은 시스템처럼 보인다.
- 문서 화면과 Grid 화면이 밀도가 다른데도 한 제품으로 읽힌다.
- 4개 스프린트 동안 토큰을 다시 안 건드린다.
