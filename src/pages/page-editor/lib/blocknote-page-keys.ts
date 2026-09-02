import { createExtension, getNearestBlockPos } from "@blocknote/core";
import { TextSelection } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import {
  blockRangeAround,
  blockRangeAt,
  selectBlockRange,
  selectedBlockRange,
  type AnyBlockNoteEditor,
  type BlockRange,
} from "./block-selection";

/**
 * `PageUp` · `PageDown` — **한 화면씩**. 고른 블록이 있으면 선택이, 없으면
 * 커서가 움직인다.
 *
 * **브라우저 기본이 하는 일이 브라우저마다 다르다.** contenteditable 안에서
 * 크롬은 캐럿을 옮기고, 파이어폭스·사파리는 화면만 굴린다. Notion 은 캐럿이
 * 따라오므로 그 쪽으로 맞춘다. 블록을 골라 둔 상태에는 캐럿이 아예 없어서
 * 기본 동작이 뜻을 잃는다 — 거기서는 선택이 한 화면 움직인다.
 *
 * **Notion 문서에 없는 자리다.** 화살표가 한 블록씩 옮기고 `shift` 가 늘리는
 * 규칙(blocknote-block-selection.ts)을 그대로 한 화면으로 늘렸다.
 *
 * 이 키만 따로 사는 이유는 **재야 하기 때문이다.** 나머지 키는 문서를 세어서
 * 답이 나오는데, 「한 화면」은 블록마다 높이가 달라서 개수로 안 나온다. 화면
 * 좌표를 읽는 코드가 한 벌 필요하고, 그 한 벌을 선택과 커서가 같이 쓴다.
 */
export const knocPageKeys = createExtension({
  key: "knocPageKeys",
  keyboardShortcuts: {
    PageUp: pageKey(-1, "move"),
    PageDown: pageKey(1, "move"),
    "Shift-PageUp": pageKey(-1, "extend"),
    "Shift-PageDown": pageKey(1, "extend"),
  },
});

type PageMode = "move" | "extend";

function pageKey(direction: -1 | 1, mode: PageMode) {
  return ({ editor }: { editor: AnyBlockNoteEditor }) => {
    const view = editor.prosemirrorView;
    if (!view) {
      return false;
    }

    const range = selectedBlockRange(view.state);
    return range
      ? movePageBlocks(editor, view, range, direction, mode)
      : movePageCaret(editor, view, direction, mode);
  };
}

/**
 * 고른 블록을 한 화면 위/아래로 옮기거나 거기까지 늘린다.
 *
 * 못 쟀으면 `false` 다 — 브라우저 기본(한 화면 스크롤)에 넘긴다. 아무 일도
 * 안 일어나는 것보다 낫다.
 */
function movePageBlocks(
  editor: AnyBlockNoteEditor,
  view: EditorView,
  range: BlockRange,
  direction: -1 | 1,
  mode: PageMode,
) {
  /* 마지막 블록 **안쪽**에서 잰다. 블록 사이 자리를 주면 getNearestBlockPos 가
   * 그 다음 블록을 집는다 (block-selection.ts). */
  const from = direction < 0 ? range.from : range.to - 1;
  const landed = posOnePageAway(view, from, direction);
  if (landed === undefined) {
    return false;
  }

  const doc = view.state.doc;
  const targetRange = blockRangeAt(doc, getNearestBlockPos(doc, landed).posBeforeNode);
  if (!targetRange) {
    return true;
  }

  const next =
    mode === "move"
      ? targetRange
      : blockRangeAround(
          doc,
          Math.min(range.from, targetRange.from),
          Math.max(range.to, targetRange.to) - 1,
        );

  editor.transact((tr) => {
    selectBlockRange(tr, next, direction < 0);
    tr.scrollIntoView();
  });
  return true;
}

/**
 * 커서를 한 화면 위/아래로 옮기거나 거기까지 고른다.
 *
 * `shift` 로 늘린 선택이 줄을 넘어가면 블록 선택이 된다 — 그건 여기가 아니라
 * 넓히기가 한다 (blocknote-block-selection.ts). 여기서는 늘 글자 선택을 놓고,
 * 그 다음 트랜잭션에서 저쪽이 블록 경계로 민다.
 */
function movePageCaret(
  editor: AnyBlockNoteEditor,
  view: EditorView,
  direction: -1 | 1,
  mode: PageMode,
) {
  const { selection } = view.state;
  const landed = posOnePageAway(view, selection.head, direction);
  if (landed === undefined) {
    return false;
  }

  editor.transact((tr) => {
    const $landed = tr.doc.resolve(landed);
    tr.setSelection(
      mode === "move"
        ? TextSelection.near($landed, direction)
        : TextSelection.between(tr.doc.resolve(selection.anchor), $landed),
    ).scrollIntoView();
  });
  return true;
}

/**
 * 그 자리에서 한 화면 위/아래에 있는 자리. 문서 밖으로 나가면 처음 · 끝,
 * 아예 못 재면 `undefined`.
 *
 * 재는 일이라 `try` 로 감싼다. 레이아웃이 없는 환경(테스트 · 아직 안 그려진
 * 에디터)에서 `posAtCoords` 가 던지는데, 키 하나 때문에 에디터가 멈추면 안 된다.
 *
 * 「한 화면」은 창 높이다. 문서가 굴러가는 칸(AppLayout 의 overflow-y-auto)이
 * 창 안에 거의 꽉 차 있어서 그 값이 곧 한 화면이고, 칸을 찾아 올라가는 코드를
 * 안 들고 있어도 된다.
 */
function posOnePageAway(view: EditorView, from: number, direction: -1 | 1) {
  const page = view.dom.ownerDocument.defaultView?.innerHeight;
  if (!page) {
    return undefined;
  }

  try {
    const coords = view.coordsAtPos(from);
    const landed = view.posAtCoords({
      left: coords.left,
      top: direction < 0 ? coords.top - page : coords.bottom + page,
    });

    if (landed) {
      return landed.pos;
    }
  } catch {
    return undefined;
  }

  /* 화면 밖이다 — 문서의 처음이나 끝에 붙인다. 끝은 마지막 블록 **안쪽**이라
   * `-2` 다 (`content.size - 1` 은 블록 사이 자리다). */
  const doc = view.state.doc;
  return direction < 0 ? 1 : doc.content.size - 2;
}
