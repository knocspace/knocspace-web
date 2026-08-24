# Sprint 3 · 블록 에디터

← [로드맵으로](../../ROADMAP.md)

| | |
|---|---|
| 기간 | 1주 |
| 선행 | Sprint 2 |
| 우선순위 | P0 |

---

## 목표

문서에 BlockNote를 얹고 블록을 쓸 수 있게 합니다.

**저장은 아직 안 붙입니다.** 이 스프린트가 끝나도 새로고침하면 내용이 날아갑니다. 그게 정상입니다.

## 만드는 것

- BlockNote 통합 + SEED 색 연결
- 블록 8종 — 문단 / 제목1·2·3 / 불릿 / 번호 목록 / 체크박스 / 코드 / 인용 / 구분선
- 슬래시 메뉴 (SEED 스타일, 폭 320px, 행 32px, 마크다운 단축키 같이 표시)
- 포맷 툴바 (SEED 스타일, 높이 34px, 켜진 버튼만 `primary-low`)
- 마크다운 단축 입력
- 제목 ↔ 본문 포커스 연결
- 빈 문서 상태 — 컴포넌트 없이 안내 문구 두 줄

---

## 먼저 읽을 것

이 스프린트의 설계 결정이 Sprint 10(실시간 협업)의 난이도를 정합니다.
**[프론트엔드 구조 — 에디터 구조](architecture.md#에디터-구조--나중에-yjs를-붙이기-위한-준비)를 먼저 읽고 시작하세요.**

요약하면 네 가지입니다.

1. 문서의 원본은 에디터 하나뿐 — 블록을 React state로 복사하지 않습니다
2. 블록 id는 클라이언트가 만듭니다
3. 문서 내용은 `features/editor/` 밖에서 열어보지 않습니다
4. `useEditorDoc` 훅 하나로 감싸서, Sprint 10에서 훅 안쪽만 바꿉니다

---

## 할 일

### 0. 첫날 — 사전 확인 (반나절)

BlockNote의 슬래시 메뉴를 SEED 스타일로 교체할 수 있는지 **작은 예제로 먼저 확인합니다.** 여기가 막히면 이번 스프린트 계획을 바꿔야 하므로, 다른 작업보다 먼저 합니다.

### 1. 설치와 색 연결

```bash
npm i @blocknote/core @blocknote/react @blocknote/mantine
```

- [ ] `src/styles/blocknote-bridge.css` 작성 — DESIGN.md §7의 변수 표를 그대로 옮깁니다
- [ ] `index.css`에 import
- [ ] 하이라이트 8색을 SEED 스케일 500단계로 교체

**BlockNote CSS를 끄거나, `!important`나 자손 선택자로 덮지 않습니다.** 변수만 SEED 쪽을 가리키게 바꿉니다. 이걸 어기면 BlockNote를 올릴 때마다 깨집니다.

### 2. 에디터 (`features/editor/`)

- [ ] `useEditorDoc.ts` — 지금은 초기 블록 배열을 받아 로컬 에디터를 만듭니다. 시그니처에 `collaboration?` 자리를 optional로 미리 열어둡니다
- [ ] `BlockEditor.tsx` — `onChange`를 밖으로 넘겨주기만 하고 저장은 하지 않습니다 (저장은 Sprint 4)
- [ ] `SlashMenu.tsx` — `SuggestionMenuController`로 표면 교체
- [ ] `FormatToolbar.tsx` — `FormattingToolbarController`로 표면 교체

### 3. 조립

- [ ] `PageRoute`에서 `DocumentSurface` 안에 `PageTitle` + `BlockEditor` 배치
- [ ] 제목에서 Enter/↓ → 첫 블록으로 포커스
- [ ] 빈 문서 문구 (DESIGN.md §9)

  > 제목 자리: `제목 없음`
  > 첫 줄: `바로 쓰거나, / 를 눌러 블록을 넣으세요`
  > 버튼 없음 — 다음 행동이 클릭이 아니라 타이핑입니다

- [ ] 에디터를 `React.lazy`로 분리해서 첫 화면 로딩에 안 얹히게

### 4. 테스트

- [ ] 슬래시 메뉴로 제목 블록 삽입
- [ ] 마크다운 단축 입력 (`# `, `- `, `1. `, `> `)

---

## 완료 조건

- [ ] 블록 8종을 슬래시 메뉴와 마크다운 단축 양쪽으로 만들 수 있다
- [ ] BlockNote 기본 CSS를 `!important`나 자손 선택자로 덮은 곳 0개
- [ ] 라이트·다크 모두에서 에디터 색이 SEED 토큰을 따른다
- [ ] 제목에서 본문으로 키보드 이동이 자연스럽다
- [ ] 에디터가 별도 번들로 분리된다
- [ ] 블록 내용이 React state에 복사돼 있는 곳 0개
- [ ] `Page.content`를 다루는 코드가 `features/editor/` 밖에 0개

[공통 완료 조건](conventions.md)도 함께 확인합니다.

---

## 끝나면 할 수 있는 것

문서를 실제로 쓸 수 있습니다. 아직 안 남습니다.

---

← [Sprint 2](sprint-2.md) · 다음 → [Sprint 4](sprint-4.md)
