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
* [x] `PageTitle` 구현
* [x] `PageIcon` · `PageIconPicker` 구현
* [x] 에디터 lazy loading 적용

### 남은 작업

* [ ] SlashMenu 구현
* [ ] FormatToolbar 구현
* [ ] 콜아웃 블록
* [ ] 목차 블록
* [ ] 제목 → 본문 포커스 이동
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

### 남은 구현

* [ ] `model/slash-menu-items.ts`
* [ ] `ui/ContentEditor/SlashMenu.tsx`
* [ ] `ui/ContentEditor/FormatToolbar.tsx`

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
* [ ] 목차

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

제목에서 아래 입력 시 첫 번째 블록으로 이동합니다.

* `Enter`
* `↓`

* [ ] `ContentEditor`가 포커스 핸들만 열기

에디터 인스턴스를 외부에 노출하지 않습니다. 노출하면 F10에서 Yjs로 바꿀 때 밖까지 깨집니다.

### 빈 문서

제목:

> 제목 없음

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
3. 제목 → 본문 포커스 이동
      ↓
4. 자동 저장
      ↓
5. 저장 상태 / 이탈 경고
      ↓
6. 테스트
```

F3가 끝나면 **페이지를 열고 → 작성하고 → 자동 저장하고 → 다시 열어도 내용이 남는 화면 MVP**가 완성됩니다.

서버에 실제 문서를 저장하는 작업은 F4에서 진행합니다.

---

← [F2](sprint-2.md) · 다음 → [F4](sprint-4.md)
