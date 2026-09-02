import type { BlockIdentifier } from "@blocknote/core";
import type { AnyBlockNoteEditor } from "./block-selection";

/**
 * 블록을 붙일 수 있는 사본으로 만든다 — 「복제」가 부르는 유일한 계산이다.
 *
 * **하는 일은 id 를 떼는 것 하나다.** 문서에서 꺼낸 블록을 그대로 다시 넣으면
 * 코어가 그 id 를 그대로 쓴다 — `blockToNode` 는 `block.id` 가 `undefined` 일
 * 때만 새로 만든다. 그러면 같은 문서에 같은 id 가 둘이 되고, 그 순간 id 로
 * 블록을 찾는 것이 전부 흔들린다: 목차의 스크롤(table-of-contents.ts), 블록
 * 선택(block-selection.ts), 협업(F10)까지.
 *
 * 자식까지 내려가는 것도 같은 이유다. 접힌 목록 하나를 복제하면 그 안의 줄이
 * 통째로 딸려 오는데, 겉의 id 만 떼면 안쪽이 전부 겹친다.
 *
 * 나머지는 손대지 않는다. 종류 · props · 글자는 원본 그대로여야 "복제" 다.
 */
export function copyForInsert<TBlock extends { id?: string; children?: TBlock[] }>(
  block: TBlock,
): TBlock {
  return {
    ...block,
    id: undefined,
    children: block.children?.map(copyForInsert),
  };
}

/**
 * 블록 몇 개를 그 아래에 복제한다 — ⠿ 메뉴의 「복제」와 `⌘D` 가 같이 부른다.
 *
 * **마지막 블록 뒤에 붙인다.** 여러 줄을 복제하면 원본 다음에 사본이 통째로
 * 오는 것이 Notion 이고, 한 줄씩 사이에 끼우면 순서가 섞인다.
 *
 * id 로도 블록으로도 받는다(`BlockIdentifier`). 메뉴는 사이드 메뉴가 들고 있던
 * 블록을 그대로 넘기고, `⌘D` 는 선택에서 꺼낸 id 를 넘긴다 — `getBlock` 이 둘
 * 다 받아 주므로 부르는 쪽에서 모양을 맞출 필요가 없다.
 *
 * 사이 어딘가에서 사라진 블록은 조용히 뺀다. 메뉴가 열려 있는 동안 문서가
 * 바뀔 수 있고(협업 · 되돌리기), 없는 블록을 넣으라고 하면 코어가 던진다.
 */
export function duplicateBlocks(
  editor: AnyBlockNoteEditor,
  blocks: BlockIdentifier[],
) {
  const found = blocks
    .map((block) => editor.getBlock(block))
    .filter((block) => block !== undefined);

  if (found.length === 0) {
    return;
  }

  editor.insertBlocks(found.map(copyForInsert), found[found.length - 1], "after");
}
