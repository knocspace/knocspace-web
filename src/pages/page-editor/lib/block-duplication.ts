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
