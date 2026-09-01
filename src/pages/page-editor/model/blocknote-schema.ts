import {
  BlockNoteSchema,
  createHeadingBlockSpec,
  createTableBlockSpec,
  defaultBlockSpecs,
} from "@blocknote/core";
import { knocCodeBlock } from "./code-block";
import { knocTableOfContents } from "./toc-block";

/**
 * 문서에 들어갈 수 있는 것들의 목록. 스키마가 곧 계약이라, 여기 없는 블록은
 * 저장된 문서에도 없다.
 *
 * BlockNote 기본 블록을 그대로 쓰고 셋만 갈아 끼운다 — 제목 · 코드 · 표.
 *
 * 제목은 레벨을 1·2·3 으로 좁힌다. BlockNote 기본은 여섯 단계지만 H4 는 본문과
 * 크기가 같고(1em) H5·H6 은 본문보다 **작아서**(0.9em · 0.8em) 위계가 아니라
 * 각주로 읽힌다. Notion 에도 제목1·2·3 뿐이다.
 *
 * `levels` 하나로 셋이 같이 닫히는 것이 이 방법을 고른 이유다 — 슬래시 메뉴는
 * `propSchema.level.values` 를 훑어 항목을 만들고, 단축키(`Mod-Alt-4`)와 마크다운
 * 입력규칙(`#### `)도 같은 배열에서 나온다. 슬래시 메뉴만 걸러 내면 나머지 둘로는
 * 여전히 만들어진다.
 *
 * **붙여넣기는 이걸로 안 걸러진다.** `values` 는 타입 레벨 장치이고 런타임 검증이
 * 없다. 코어의 Heading `parse` 는 `levels` 를 안 받고 태그 이름만 보므로, `<h4>`
 * 가 든 HTML 을 붙여넣으면 level 4 블록이 그대로 들어온다 — 만들 수도 되돌릴
 * 수도 없는데 존재는 한다. 문서 가져오기를 붙이는 F4 에서 3 으로 눌러야 한다.
 *
 * 코드 블록은 기본 것이 하이라이트가 꺼져 있고 언어 목록이 비어 있다 — 그건
 * 하이라이터(Shiki)가 무거워서 코어에서 빼 뒀기 때문이고, @blocknote/code-block
 * 이 그 한 벌이다. 언어 목록은 code-block.ts 가, 하이라이터는 useContentEditor 이 붙인다.
 *
 * codeBlock 이 코어의 createCodeBlockSpec 이 아닌 이유는 하나다 — 언어 선택기가
 * native <select> 라서 펼친 목록을 OS 가 그린다. 스펙에서 render 하나만 바꿔
 * 슬래시 메뉴와 같은 표면으로 돌린 것이 code-block.ts 다. type 과 propSchema 는
 * 코어 것 그대로라 저장된 문서는 안 바뀐다.
 *
 * 표는 기본 블록이 아니라서 따로 넣는다. defaultBlockSpecs 에 table 이 없다 —
 * BlockNote 가 표를 별도 스펙으로 빼 뒀기 때문이고, 안 넣으면 문서에 표를 아예
 * 못 담는다.
 *
 * 표의 헤더 행 · 헤더 열 · 셀 병합 · 셀 색은 여기가 아니라 에디터 옵션(tables)
 * 에서 켠다. 넷 다 BlockNote 기본은 꺼짐이고, 우리는 넷 다 켰다 — useContentEditor.
 *
 * 목차는 BlockNote 에 없어서 우리가 만든 블록이다 — toc-block.ts. 기본 블록
 * 뒤에 더하는 것이라 위 셋(갈아 끼우기)과 성격이 다르다. 슬래시 메뉴 항목도
 * 사전이 아니라 우리가 붙인다 (slash-menu-items.tsx).
 *
 * 넣지 않은 것:
 * - 수식 · 다이어그램 — @blocknote/math-block · @blocknote/diagram-block.
 *   KaTeX 와 mermaid 를 같이 들고 오므로 실제로 쓸 때 붙인다
 * - 컬럼 레이아웃 · AI — @blocknote/xl-* 는 상업 라이선스다. 결제 전에는 못 쓴다
 * - 콜아웃 · 북마크 — BlockNote 에 없다. 목차처럼 커스텀 블록으로 직접 만든다
 */
export const knocSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    heading: createHeadingBlockSpec({ levels: [1, 2, 3] }),
    codeBlock: knocCodeBlock,
    table: createTableBlockSpec(),
    tableOfContents: knocTableOfContents,
  },
});

/**
 * 이 스키마로 만든 문서의 블록. 저장·초기값에 쓰는 느슨한 쪽(PartialBlock)이다.
 *
 * 이 타입이 pages/page-editor 밖으로 나가지 않는다. 밖에서는 문서가 PageContent
 * 이라는 덩어리 하나로 보여야, F10 에서 안쪽이 Yjs 로 바뀌어도 안 깨진다.
 */
export type KnocPartialBlock = typeof knocSchema.PartialBlock;
export type KnocBlock = typeof knocSchema.Block;
export type KnocEditor = typeof knocSchema.BlockNoteEditor;
