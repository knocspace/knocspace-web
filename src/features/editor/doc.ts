import type { KnocPartialBlock } from "./schema";

/**
 * 문서 한 장의 내용.
 *
 * 밖에서 보면 그냥 덩어리다. blocks 안을 features/editor 밖에서 열어보지
 * 않는다 — F10 에서 이 자리가 Yjs 데이터로 바뀌어도 나머지가 안 깨져야 한다
 * (docs/roadmap/architecture.md).
 *
 * 모양은 F2 의 types/api.ts 가 정할 BlockDoc 과 같게 맞춰 뒀다. 그 파일이
 * 생기면 이 타입은 사라지고 import 만 바뀐다.
 */
export interface EditorDoc {
  format: "blocknote";
  schemaVersion: 1;
  blocks: unknown[];
}

/**
 * 새 문서. 블록이 하나도 없는 덩어리다.
 *
 * 빈 문단을 여기서 만들지 않는다. toInitialContent 가 빈 배열을 undefined 로
 * 바꿔서 넘기고, 커서가 앉을 첫 블록은 BlockNote 가 알아서 만든다.
 */
export function emptyDoc(): EditorDoc {
  return { format: "blocknote", schemaVersion: 1, blocks: [] };
}

/**
 * 덩어리를 에디터가 받는 모양으로 편다.
 *
 * blocks 가 비어 있으면 undefined 를 준다. 빈 배열을 그대로 넘기면 BlockNote
 * 가 블록 0개짜리 문서를 만들어서 커서가 앉을 자리가 없다.
 */
export function toInitialContent(doc: EditorDoc | undefined): KnocPartialBlock[] | undefined {
  if (!doc || doc.blocks.length === 0) return undefined;
  return doc.blocks as KnocPartialBlock[];
}

/** 에디터가 들고 있는 것을 저장할 모양으로 담는다. */
export function toEditorDoc(blocks: readonly unknown[]): EditorDoc {
  return { format: "blocknote", schemaVersion: 1, blocks: [...blocks] };
}
