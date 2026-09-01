import type { PageContent } from "./page-content";

/**
 * 화면을 확인하려고 두는 견본 문서.
 *
 * TODO(F2): `usePage(pageId).content` 로 바뀌면서 이 파일은 통째로 사라진다.
 * 서버(지금은 mock)가 문서를 주기 전까지, 에디터가 실제로 붙었는지 눈으로
 * 확인할 것이 필요해서만 있다. 그래서 features/editor 안에 둔다 — 밖에서
 * 문서 내용을 만드는 코드가 생기면 그게 두 번째 원본이 된다.
 *
 * 블록은 mvp.md 의 8종(문단 · 제목1·2·3 · 불릿 · 번호 · 체크박스 · 코드 ·
 * 인용 · 구분선)에 토글 하나를 더한 것이다. 토글은 8종 밖이지만 BlockNote
 * 기본 스키마에 있어서 같이 확인한다. 콜아웃 · 목차 · 컬럼은 여기 없다 —
 * 아직 만들지 않았다.
 */
export function samplePageContent(): PageContent {
  return {
    format: "blocknote",
    schemaVersion: 1,
    blocks: [
      { type: "heading", props: { level: 1 }, content: "에디터가 붙었어요" },
      {
        type: "paragraph",
        content:
          "빈 줄에서 / 를 누르면 블록 목록이 열려요. 마크다운도 그대로 통해요 — # 뒤에 공백, - 뒤에 공백, 1. 뒤에 공백.",
      },
      { type: "heading", props: { level: 2 }, content: "쓸 수 있는 블록" },
      { type: "bulletListItem", content: "글머리 목록 — Tab 으로 한 단 들어가요" },
      { type: "numberedListItem", content: "번호 목록" },
      { type: "checkListItem", props: { checked: false }, content: "체크박스" },
      {
        type: "toggleListItem",
        content: "토글 — 눌러서 펼쳐요",
        children: [
          { type: "paragraph", content: "접힌 자리에는 아무 블록이나 들어가요." },
        ],
      },
      { type: "quote", content: "인용은 > 뒤에 공백." },
      {
        type: "codeBlock",
        props: { language: "typescript" },
        content: "const 인사 = (이름: string) => `${이름}, 반가워요`;",
      },
      { type: "divider" },
      {
        type: "paragraph",
        content:
          "이건 견본이에요. 아직 저장은 안 돼요 — 새로고침하면 이 문서로 되돌아와요.",
      },
    ],
  };
}
