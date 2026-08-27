import {
  BlockNoteSchema,
  createCodeBlockSpec,
  defaultBlockSpecs,
} from "@blocknote/core";
import { codeBlockOptions } from "@blocknote/code-block";

/**
 * 문서에 들어갈 수 있는 것들의 목록. 스키마가 곧 계약이라, 여기 없는 블록은
 * 저장된 문서에도 없다.
 *
 * BlockNote 기본 블록을 그대로 쓰고 코드 블록만 갈아 끼운다. 기본 코드 블록은
 * 하이라이트가 꺼져 있고 언어 목록이 비어 있다 — 그건 하이라이터(Shiki)가
 * 무거워서 코어에서 빼 뒀기 때문이고, @blocknote/code-block 이 그 한 벌이다.
 * 여기서 언어 목록을, useEditorDoc 에서 하이라이터를 붙인다.
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
    codeBlock: createCodeBlockSpec(codeBlockOptions),
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
