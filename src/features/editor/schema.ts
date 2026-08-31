import {
  BlockNoteSchema,
  createTableBlockSpec,
  defaultBlockSpecs,
} from "@blocknote/core";
import { knocCodeBlock } from "./codeBlock";

/**
 * 문서에 들어갈 수 있는 것들의 목록. 스키마가 곧 계약이라, 여기 없는 블록은
 * 저장된 문서에도 없다.
 *
 * BlockNote 기본 블록을 그대로 쓰고 코드 블록만 갈아 끼운다. 기본 코드 블록은
 * 하이라이트가 꺼져 있고 언어 목록이 비어 있다 — 그건 하이라이터(Shiki)가
 * 무거워서 코어에서 빼 뒀기 때문이고, @blocknote/code-block 이 그 한 벌이다.
 * 언어 목록은 codeBlock.ts 가, 하이라이터는 useEditorDoc 이 붙인다.
 *
 * codeBlock 이 코어의 createCodeBlockSpec 이 아닌 이유는 하나다 — 언어 선택기가
 * native <select> 라서 펼친 목록을 OS 가 그린다. 스펙에서 render 하나만 바꿔
 * 슬래시 메뉴와 같은 표면으로 돌린 것이 codeBlock.ts 다. type 과 propSchema 는
 * 코어 것 그대로라 저장된 문서는 안 바뀐다.
 *
 * 표는 기본 블록이 아니라서 따로 넣는다. defaultBlockSpecs 에 table 이 없다 —
 * BlockNote 가 표를 별도 스펙으로 빼 뒀기 때문이고, 안 넣으면 문서에 표를 아예
 * 못 담는다.
 *
 * 표의 헤더 행 · 헤더 열 · 셀 병합 · 셀 색은 여기가 아니라 에디터 옵션(tables)
 * 에서 켠다. 넷 다 BlockNote 기본은 꺼짐이고, 우리는 넷 다 켰다 — useEditorDoc.
 *
 * 넣지 않은 것:
 * - 수식 · 다이어그램 — @blocknote/math-block · @blocknote/diagram-block.
 *   KaTeX 와 mermaid 를 같이 들고 오므로 실제로 쓸 때 붙인다
 * - 컬럼 레이아웃 · AI — @blocknote/xl-* 는 상업 라이선스다. 결제 전에는 못 쓴다
 * - 콜아웃 · 목차 · 북마크 — BlockNote 에 없다. 커스텀 블록으로 직접 만든다
 */
export const knocSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    codeBlock: knocCodeBlock,
    table: createTableBlockSpec(),
  },
});

/**
 * 이 스키마로 만든 문서의 블록. 저장·초기값에 쓰는 느슨한 쪽(PartialBlock)이다.
 *
 * 이 타입이 features/editor 밖으로 나가지 않는다. 밖에서는 문서가 EditorDoc
 * 이라는 덩어리 하나로 보여야, F10 에서 안쪽이 Yjs 로 바뀌어도 안 깨진다.
 */
export type KnocPartialBlock = typeof knocSchema.PartialBlock;
export type KnocBlock = typeof knocSchema.Block;
export type KnocEditor = typeof knocSchema.BlockNoteEditor;
