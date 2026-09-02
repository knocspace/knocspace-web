import { getNearestBlockPos, getNodeById, getNodeId } from "@blocknote/core";
import type { BlockNoteEditor, ExtensionOptions } from "@blocknote/core";
import type { Node } from "@tiptap/pm/model";
import { NodeSelection, TextSelection, type EditorState, type Transaction } from "@tiptap/pm/state";
import { BlockRangeSelection } from "./block-range-selection";

/**
 * 스키마를 안 가리는 에디터 — **BlockNote 가 확장에 건네주는 바로 그 타입이다.**
 *
 * `lib` 은 스키마를 모르는 자리다(`knocSchema` 는 `model` 에 있고, lib 이 그쪽을
 * 향하면 방향이 뒤집힌다). 그래서 좁히지 않고 BlockNote 가 자기 확장에 주는
 * 타입을 그대로 받아 쓴다 — 우리가 `any` 를 적는 것이 아니라 저쪽이 열어 둔
 * 자리를 이름만 붙여 두는 것이다.
 */
export type AnyBlockNoteEditor = ExtensionOptions["editor"];

/**
 * 블록 하나를 통째로 고른다 — ⠿ 를 눌렀을 때 Notion 이 하는 일이다.
 *
 * **선택 상태를 우리가 들지 않는다.** ProseMirror 의 NodeSelection 을 그 블록에
 * 놓는 것이 전부고, 나머지는 전부 딸려 온다.
 *
 *   보이는 것  PM 이 그 블록의 DOM 에 `.ProseMirror-selectednode` 를 붙인다.
 *              칠하는 것은 blocknote-bridge.css 다 (DESIGN.md §7)
 *   지우기     Backspace · Delete 가 블록을 지운다
 *   복사       ⌘C 가 블록을 통째로 담는다
 *   해제       본문 아무 데나 누르면 선택이 그리로 옮겨 간다
 *
 * React state 로 들었으면 이 넷을 손으로 다시 만들어야 하고, 문서의 상태가
 * 에디터 밖에 하나 더 생긴다 (docs/roadmap/architecture.md).
 *
 * **끌기와 같은 자리다.** BlockNote 의 dragStart 도 끌기 시작에 같은 선택을 놓는다
 * (core 의 extensions/SideMenu/dragging.ts). 누르기만 하고 안 끄는 경우가 비어
 * 있었을 뿐이라, 그 빈자리를 같은 방법으로 채운다.
 *
 * 에디터를 통째로 안 받고 `transact` 만 받는 것은 스키마 때문이다. 블록 종류와
 * 무관한 일이라 `KnocEditor` 를 알 필요가 없고, 알면 lib 이 model 을 향하게 된다.
 */
export function selectBlock(editor: Pick<BlockNoteEditor, "transact">, blockId: string) {
  editor.transact((tr) => {
    const found = getNodeById(blockId, tr.doc);
    /* 방금 지운 블록의 손잡이를 누른 경우다 — 드래그 핸들 메뉴의 「삭제」가
     * 이 자리를 지나간다. 없는 자리에 선택을 놓으면 PM 이 던진다. */
    if (!found) {
      return;
    }

    tr.setSelection(NodeSelection.create(tr.doc, found.posBeforeNode));
  });
}

/**
 * 블록이 **한 개** 통째로 골라져 있는지 — ⠿ 나 Esc 로 고른 그 상태다.
 *
 * **이미지·구분선을 직접 눌러 고른 것과 구별해야 한다.** 둘 다 NodeSelection 이지만
 * 앉는 노드가 다르다 — 저쪽은 blockContent(이미지 노드 자체)고, 이쪽은 그것을 담은
 * blockContainer 다. 노드 이름을 보는 이유가 그거다.
 *
 * 쓰는 곳은 포맷 툴바다. 블록을 통째로 골랐을 때 BlockNote 는 툴바를 띄우는데
 * (선택이 비어 있지 않으면 띄운다 — core 의 FormattingToolbar), 굵게·기울임을
 * 걸 자리가 아니라서 Notion 은 안 띄운다. 이미지를 고른 경우는 그대로 둔다 —
 * 그쪽 툴바에는 캡션·바꾸기처럼 그 블록에서 실제로 쓰는 것이 들어 있다.
 *
 * **여러 블록을 고른 경우는 여기 안 걸린다.** 그때는 Notion 도 툴바를 띄우고
 * (굵게가 고른 줄 전부에 걸린다), 우리 선택도 TextSelection 이라 저절로 뜬다 —
 * 아래 「여러 블록」 절을 보라.
 */
export function isWholeBlockSelected(state: EditorState) {
  const { selection } = state;
  return selection instanceof NodeSelection && selection.node.type.name === "blockContainer";
}

/**
 * ⠿ 메뉴가 다루는 블록들 — **고른 것 안에서 열었으면 고른 것 전부, 아니면 그
 * 블록 하나다.**
 *
 * 손잡이는 마우스가 지나는 블록을 따라다니므로, 여러 줄을 골라 둔 채로도 선택
 * 밖의 블록 옆에 서 있을 수 있다. 그때 고른 것 전부에 걸면 사용자가 안 가리킨
 * 줄까지 지워진다. 반대로 선택 **안**에서 열었으면 고른 것 전부가 맞다 — 그게
 * 그 선택을 만든 이유다.
 *
 * BlockNote 의 「삭제」가 하던 계산이고(RemoveBlockItem), 전환 · 복제 · 삭제 셋이
 * 같은 규칙을 따라야 한 메뉴 안에서 줄마다 대상이 달라지지 않는다.
 */
export function menuTargetBlocks<TBlock extends { id: string }>(
  block: TBlock,
  selected: TBlock[] | undefined,
): TBlock[] {
  return selected?.some((candidate) => candidate.id === block.id) ? selected : [block];
}

/* ────────────────────────────────────────────────────────────────────────────
 * 여러 블록
 *
 * Notion 에는 **블록 경계를 걸친 글자 선택이 없다.** 드래그가 줄을 넘어가는
 * 순간 두 줄이 통째로 잡히고, 그 뒤로는 화살표 · Enter · Backspace 가 전부
 * 「블록」 단위로 움직인다. 여기 있는 것은 그 「걸친 자리」를 블록 경계로
 * 넓히는 계산 한 벌이다 — 실제로 에디터에 붙이는 것은
 * blocknote-block-selection.ts 다.
 *
 * **선택의 정체는 그대로 TextSelection 이다.** 새 Selection 클래스를 만들지
 * 않는다. BlockNote 의 MultipleNodeSelection 이 정확히 그 물건인데 밖으로
 * 안 내놓기도 하고(core 의 SideMenu 안에만 있다), 무엇보다 TextSelection 으로
 * 두면 이미 되는 것들이 그대로 남는다:
 *
 *   복사·잘라내기  BlockNote 의 copyExtension 이 블록 단위로 담는다
 *   포맷 툴바      뜨고, ⌘B 가 고른 줄 전부에 걸린다 (Notion 과 같다)
 *   ⠿ 로 끌기      dragging.ts 가 이 선택을 그대로 읽는다
 *   getSelection() 고른 블록들을 그대로 준다 — ⠿ 메뉴의 복제 · 삭제가 이걸 쓴다
 *
 * 대신 두 가지를 우리가 한다. **칠하는 것**(PM 은 NodeSelection 만 칠해 준다)과
 * **브라우저의 글자 하이라이트를 감추는 것**이다. 둘 다 저쪽 파일에 있다.
 * ──────────────────────────────────────────────────────────────────────────── */

/** 블록 몇 개를 감싸는 자리. `from` 은 첫 블록 바로 **앞**, `to` 는 마지막 블록 바로 **뒤**다. */
export interface BlockRange {
  from: number;
  to: number;
}

/**
 * 두 자리가 걸친 블록들을 통째로 감싸는 자리를 낸다.
 *
 * **from · to 는 블록 안쪽 자리여야 한다.** 블록과 블록 **사이** 자리를 주면
 * `getNearestBlockPos` 가 그 다음 블록을 집어서 한 칸씩 밀린다 — 마지막 블록의
 * 끝을 넘길 때는 늘 `to - 1` 처럼 안쪽으로 한 칸 당겨서 준다.
 *
 * **깊이가 다르면 바깥쪽으로 맞춘다.** 부모 줄에서 시작해 그 자식 줄에서 끝나는
 * 선택은 부모 블록 하나가 된다 — 자식은 부모 안에 있으니 부모를 고르면 같이
 * 잡힌다. 공통 조상의 깊이(`sharedDepth`)에서 형제 몇 개를 잘라 내는 식이라,
 * 어느 쪽이 더 깊든 규칙 하나로 끝난다.
 *
 * BlockNote 의 dragging.ts 가 ⠿ 로 끌 때 하는 계산과 같은 것이다. 저쪽은
 * `Math.min($anchor.depth, $head.depth)` 으로 얕은 쪽에 맞추는데, 결과는 같고
 * 이쪽이 「공통 조상」이라는 뜻을 그대로 적는다.
 */
export function blockRangeAround(doc: Node, from: number, to: number): BlockRange {
  const first = getNearestBlockPos(doc, Math.min(from, to));
  const last = getNearestBlockPos(doc, Math.max(from, to));

  const start = first.posBeforeNode;
  const end = last.posBeforeNode + last.node.nodeSize;

  const $start = doc.resolve(start);
  const $end = doc.resolve(end);
  const depth = $start.sharedDepth(end);

  return {
    from: $start.depth === depth ? start : $start.before(depth + 1),
    to: $end.depth === depth ? end : $end.after(depth + 1),
  };
}

/**
 * 지금 **블록 단위로** 골라져 있나. 골라져 있으면 그 자리, 아니면 undefined.
 *
 * 셋 중 하나다.
 *
 *   블록 하나   NodeSelection — ⠿ · Esc · 화살표로 고른 것
 *   여러 블록   두 끝이 서로 다른 블록에 있는 선택
 *   아님        한 블록 안의 글자 선택 · 커서 · 표 셀 선택
 *
 * **표 셀 선택이 여기 안 걸리는 것이 중요하다.** 셀 여러 개를 골라도 그건 표
 * 블록 **하나** 안이라 두 끝의 블록이 같고, 그래서 Backspace 가 표를 통째로
 * 지우지 않는다. prosemirror-tables 를 알 필요 없이 「두 끝이 같은 블록인가」
 * 하나로 갈린다.
 */
export function selectedBlockRange(state: EditorState): BlockRange | undefined {
  const { selection, doc } = state;

  /* 글자가 없는 블록이 가장자리에 온 선택 — 자리가 곧 범위다
   * (block-range-selection.ts). */
  if (selection instanceof BlockRangeSelection) {
    return { from: selection.from, to: selection.to };
  }

  if (selection instanceof NodeSelection) {
    return selection.node.type.name === "blockContainer"
      ? { from: selection.from, to: selection.to }
      : undefined;
  }

  if (selection.empty) {
    return undefined;
  }

  const start = getNearestBlockPos(doc, selection.from);
  const end = getNearestBlockPos(doc, selection.to);
  if (start.posBeforeNode === end.posBeforeNode) {
    return undefined;
  }

  return blockRangeAround(doc, selection.from, selection.to);
}

/**
 * 그 자리에 든 블록들 — 형제 몇 개다.
 *
 * `blockRangeAround` 가 두 끝을 같은 깊이로 맞춰 두었으므로 여기서는 부모의
 * 자식 목록을 인덱스로 자르기만 하면 된다. 자리(`pos`)를 같이 내는 것은 칠할
 * 때 필요해서다 — Decoration 은 노드가 아니라 자리로 건다.
 */
export function blocksInRange(doc: Node, range: BlockRange): { node: Node; pos: number }[] {
  const $from = doc.resolve(range.from);
  const parent = $from.parent;
  const endIndex = doc.resolve(range.to).index();

  const blocks: { node: Node; pos: number }[] = [];
  let pos = range.from;
  for (let index = $from.index(); index < endIndex; index++) {
    const node = parent.child(index);
    blocks.push({ node, pos });
    pos += node.nodeSize;
  }

  return blocks;
}

/**
 * 지금 골라져 있는 블록들 — 없으면 undefined.
 *
 * `editor.getSelection()` 을 안 쓴다. 저쪽은 선택의 `to` 를 다시 블록으로
 * 되돌리는데, 글자에 안 매이는 선택(block-range-selection.ts)에서는 그 자리가
 * **다음 블록 바로 앞**이라 한 칸 더 집는다. 범위를 이미 우리가 갖고 있으므로
 * 그대로 쓴다.
 */
export function selectedBlocks(editor: AnyBlockNoteEditor) {
  const state = editor.prosemirrorState;
  const range = selectedBlockRange(state);
  if (!range) {
    return undefined;
  }

  return blockIdsInRange(state.doc, range)
    .map((id) => editor.getBlock(id))
    .filter((block) => block !== undefined);
}

/** 그 자리에 든 블록들의 id — 삭제 · 복제가 BlockNote 에 넘기는 값이다. */
export function blockIdsInRange(doc: Node, range: BlockRange): string[] {
  return blocksInRange(doc, range).map(({ node }) => getNodeId(node, doc));
}

/**
 * 그 자리의 블록들을 고른다.
 *
 * **한 개면 NodeSelection, 여러 개면 TextSelection 이다.** 한 개짜리를 굳이
 * 갈라 두는 것은 그게 ⠿ 로 고른 것과 같은 상태여야 하기 때문이다 — 칠하는 것도
 * 포맷 툴바를 감추는 것도 그쪽 규칙 하나로 끝난다(`isWholeBlockSelected`).
 *
 * 여러 개일 때 `TextSelection.between` 을 쓰는 이유는 두 가지다. 블록 사이 자리는
 * 글자 선택의 끝이 될 수 없어서 안쪽의 유효한 자리를 찾아 줘야 하고(첫 블록이
 * 이미지면 그 안에 글자 자리가 없다), **끌던 방향을 지켜 줘야** 하기 때문이다 —
 * 아래로 끌다가 위로 되돌리면 선택이 줄어야지 반대쪽으로 자라면 안 된다.
 */
export function selectBlockRange(tr: Transaction, range: BlockRange, backward = false) {
  const blocks = blocksInRange(tr.doc, range);

  if (blocks.length === 1) {
    tr.setSelection(NodeSelection.create(tr.doc, range.from));
    return;
  }

  const anchor = tr.doc.resolve(backward ? range.to : range.from);
  const head = tr.doc.resolve(backward ? range.from : range.to);
  const text = TextSelection.between(anchor, head);

  /* **두 끝이 제자리에 갔는지 확인한다.** `between` 은 글자 자리를 찾아 주는데,
   * 구분선처럼 글자가 없는 블록이 가장자리면 안쪽으로 되돌아와서 그 블록이
   * 선택에서 빠진다 — shift+↓ 가 거기서 멈추는 이유다.
   *
   * 되돌아왔으면 글자에 안 매이는 선택으로 바꾼다 (block-range-selection.ts).
   * 그 경우가 드물어서 기본은 TextSelection 으로 남긴다 — 복사 · 포맷 툴바 ·
   * ⠿ 로 끌기가 저쪽에 얹혀 있다. */
  const reached = blockRangeAround(tr.doc, text.from, text.to);
  if (reached.from === range.from && reached.to === range.to) {
    tr.setSelection(text);
    return;
  }

  tr.setSelection(BlockRangeSelection.create(tr.doc, range.from, range.to, backward));
}

/**
 * 블록 선택을 **푼다** — 마지막 줄 **끝**에 커서를 놓는다.
 *
 * 그 자리인 이유는 고르기를 끝낸 자리가 거기라서다. `Esc` 도, 에디터 밖을
 * 클릭하는 것도 같은 자리로 내려앉아야 손이 헷갈리지 않는다.
 *
 * **커서를 놓는 것이 곧 푸는 것이다.** 블록 선택은 따로 켜고 끄는 상태가 아니라
 * 「선택이 블록 경계에 맞아 있나」로만 갈리기 때문이다 (`selectedBlockRange`).
 */
export function releaseBlockRange(tr: Transaction, range: BlockRange) {
  tr.setSelection(TextSelection.near(tr.doc.resolve(range.to), -1));
}

/** 선택이 거꾸로 잡혀 있나 — 아래에서 위로 끌었나. */
export function isBackwardSelection(state: EditorState) {
  return state.selection.anchor > state.selection.head;
}

/**
 * 문서 순서로 **바로 위** 블록의 자리.
 *
 * `pos - 1` 한 칸이 전부다. 그 한 칸이 앞 형제의 닫는 자리 안쪽이라, 앞 형제에
 * 자식이 있으면 `getNearestBlockPos` 가 **가장 깊은 마지막 자손**을 집어 준다 —
 * 화면에서 바로 위에 있는 줄이 그거다. 앞 형제가 없으면(내가 첫 자식이면) 같은
 * 자리가 부모 안쪽이라 부모를 집는다. 그것도 화면에서 바로 위다.
 *
 * `pos <= 1` 은 문서의 첫 블록이다. 거기서 한 칸 더 가면 블록이 아닌 자리라
 * BlockNote 가 문서를 통째로 훑으며 경고를 찍는다 — 그 앞에서 끊는다.
 */
export function blockPosBefore(doc: Node, pos: number): number | undefined {
  if (pos <= 1) {
    return undefined;
  }
  return getNearestBlockPos(doc, pos - 1).posBeforeNode;
}

/**
 * 문서 순서로 **바로 아래** 블록의 자리.
 *
 * 이쪽은 한 칸으로 안 된다. 마지막 자식이면 `to + 1` 이 부모 안쪽이라 부모를
 * 집는데, 부모는 화면에서 **위**에 있다. 그래서 다음 형제가 나올 때까지 조상을
 * 타고 올라간다 — 자리가 매번 커지므로 문서 끝에서 반드시 멈춘다.
 */
export function blockPosAfter(doc: Node, pos: number): number | undefined {
  let at = pos;
  for (;;) {
    const $at = doc.resolve(at);
    if ($at.nodeAfter?.type.isInGroup("bnBlock")) {
      return at;
    }
    if ($at.depth === 0) {
      return undefined;
    }
    at = $at.after($at.depth);
  }
}

/** 그 자리에서 시작하는 블록 하나를 감싸는 자리. */
export function blockRangeAt(doc: Node, pos: number): BlockRange | undefined {
  const node = doc.resolve(pos).nodeAfter;
  return node ? { from: pos, to: pos + node.nodeSize } : undefined;
}

/** 문서의 맨 위 블록 전부 — ⌘A 두 번째 누름이 고르는 자리다. */
export function wholeDocumentBlockRange(doc: Node): BlockRange {
  return { from: 1, to: doc.content.size - 1 };
}
