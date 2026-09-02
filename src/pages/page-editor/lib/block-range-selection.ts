import { Fragment, Slice } from "@tiptap/pm/model";
import type { Node, ResolvedPos } from "@tiptap/pm/model";
import { Selection } from "@tiptap/pm/state";
import type { Mappable } from "@tiptap/pm/transform";

/**
 * 블록 몇 개를 고른 선택 — **글자가 없는 블록이 가장자리에 올 때만 쓴다.**
 *
 * 여러 블록 선택의 기본은 `TextSelection` 이다(block-selection.ts). 그래야
 * 복사 · 포맷 툴바 · `⠿` 로 끌기가 하나도 안 바뀐 채 그대로 동작한다. 그런데
 * `TextSelection` 은 **두 끝이 글자 자리여야 한다.**
 *
 * 구분선에는 글자가 없다. 그래서 선택의 끝이 구분선에 닿으면
 * `TextSelection.between` 이 글자를 찾아 **안쪽으로 되돌아오고**, 그 구분선이
 * 선택에서 빠진다. `shift`+`↓` 를 눌러도 범위가 그대로라 거기서 멈춘다 —
 * 구분선 하나만 고르는 것은 `NodeSelection` 이라 잘 되는데 여럿이 안 된다.
 *
 * 밀어서 지나가게 하는 우회는 안 된다. 아래로는 한 칸 더 가면 되지만 위쪽
 * 가장자리가 구분선이면(구분선을 고른 채 `shift`+`↓`) 위로 한 칸 더 갈 데가
 * 없다 — 안 고른 줄이 딸려 온다.
 *
 * **BlockNote 에 같은 물건이 있다** (`MultipleNodeSelection`, core 의 SideMenu
 * 안). `⠿` 로 여러 줄을 끌 때 저쪽이 쓰는 것인데 밖으로 안 내놓아서 가져다
 * 쓸 수가 없다. 그래서 같은 것을 짧게 다시 쓴다. 저쪽과 다른 점은 하나,
 * **거꾸로 잡힌 선택을 제대로 다룬다** — 담는 블록을 `anchor`~`head` 가 아니라
 * `from`~`to` 로 훑어서, 아래에서 위로 고른 선택에서도 비지 않는다.
 */
export class BlockRangeSelection extends Selection {
  /** 고른 블록들. 형제 몇 개다. */
  readonly blocks: Node[];

  constructor($anchor: ResolvedPos, $head: ResolvedPos) {
    super($anchor, $head);

    const parent = $anchor.node();
    const blocks: Node[] = [];

    $anchor.doc.nodesBetween(this.from, this.to, (node, _pos, at) => {
      if (at && at.eq(parent)) {
        blocks.push(node);
        return false;
      }
      return undefined;
    });

    this.blocks = blocks;
  }

  /**
   * `from` 은 첫 블록 바로 앞, `to` 는 마지막 블록 바로 뒤 — `BlockRange` 그대로다.
   *
   * `backward` 는 아래에서 위로 골랐다는 뜻이다. 방향을 지켜야 `shift`+화살표가
   * 늘리던 쪽을 계속 늘린다.
   */
  static create(doc: Node, from: number, to: number, backward = false) {
    return backward
      ? new BlockRangeSelection(doc.resolve(to), doc.resolve(from))
      : new BlockRangeSelection(doc.resolve(from), doc.resolve(to));
  }

  /**
   * 클립보드에 담기는 것 — **블록을 통째로** 담는다.
   *
   * 열린 데가 없는 조각(`openStart` · `openEnd` 가 0)이라 붙여 넣으면 블록이
   * 블록으로 들어간다. `⌘C` 도 `⌘X` 도 이 값을 쓴다 (BlockNote 의 copyExtension).
   */
  content() {
    return new Slice(Fragment.from(this.blocks), 0, 0);
  }

  eq(other: Selection) {
    return (
      other instanceof BlockRangeSelection &&
      other.anchor === this.anchor &&
      other.head === this.head
    );
  }

  /** 문서가 바뀌면 자리를 따라 옮긴다. 고른 블록이 사라졌으면 근처 커서로 내려앉는다. */
  map(doc: Node, mapping: Mappable): Selection {
    const from = mapping.mapResult(this.from);
    const to = mapping.mapResult(this.to);

    if (to.deleted) {
      return Selection.near(doc.resolve(from.pos));
    }
    if (from.deleted) {
      return Selection.near(doc.resolve(to.pos));
    }

    return BlockRangeSelection.create(doc, from.pos, to.pos, this.anchor > this.head);
  }

  toJSON() {
    return { type: "knoc-block-range", anchor: this.anchor, head: this.head };
  }
}

/**
 * 브라우저의 글자 하이라이트를 ProseMirror 가 알아서 감춘다
 * (`.ProseMirror-hideselection`). `NodeSelection` 이 쓰는 것과 같은 스위치다 —
 * 이 선택에는 `knoc-blocks-selected` 가 필요 없다.
 */
(BlockRangeSelection.prototype as { visible: boolean }).visible = false;
