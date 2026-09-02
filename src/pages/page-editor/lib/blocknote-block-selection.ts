import {
  createExtension,
  getBlockInfo,
  getNearestBlockPos,
  selectedFragmentToHTML,
} from "@blocknote/core";
import { SuggestionMenu } from "@blocknote/core/extensions";
import { NodeSelection, Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import type { EditorState } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { EditorView } from "@tiptap/pm/view";
import { BlockRangeSelection } from "./block-range-selection";
import { duplicateBlocks } from "./block-duplication";
import {
  blockIdsInRange,
  blockPosAfter,
  blockPosBefore,
  blockRangeAround,
  blockRangeAt,
  blocksInRange,
  isBackwardSelection,
  selectBlockRange,
  selectedBlockRange,
  wholeDocumentBlockRange,
  type AnyBlockNoteEditor,
  type BlockRange,
} from "./block-selection";

/**
 * 블록 선택 — **끌어서 여러 줄 고르기와 그 뒤의 키보드 전부** (Notion 규격).
 *
 * BlockNote 에는 이 상태가 반쪽만 있다. 블록 하나를 NodeSelection 으로 고르는
 * 것까지는 되는데(⠿ 를 눌렀을 때 우리가 그렇게 한다 — block-selection.ts),
 * **줄을 넘어가는 선택은 그냥 글자 선택**이다. Notion 은 그 순간 두 줄이 통째로
 * 잡히고, 그 뒤로 화살표 · Enter · Backspace · ⌘A · ⌘D 가 전부 「블록」 단위로
 * 움직인다. 그 차이를 메우는 것이 이 확장 하나다.
 *
 * ## 세 조각
 *
 * | | 하는 일 |
 * | --- | --- |
 * | 넓히기 | 줄을 넘어간 선택을 블록 경계까지 밀어 낸다 (`appendTransaction`) |
 * | 칠하기 | 그렇게 잡힌 블록마다 `.ProseMirror-selectednode` 를 얹는다 |
 * | 키보드 | 블록 선택 중일 때의 키 — 화살표 · `Enter` · `Backspace` · `⌘A` · `⌘D` |
 *
 * **넓히기가 마우스 코드를 없앤다.** 끌기를 직접 듣지 않는다 — 브라우저가 만든
 * 글자 선택을 ProseMirror 가 읽어 오면 그때 블록 경계로 밀어 낼 뿐이다. 그래서
 * 같은 코드가 끌기 · `shift`+클릭 · `shift`+화살표 세 가지를 한꺼번에 처리하고,
 * 브라우저와 선택을 두고 다투지 않는다.
 *
 * **칠하기가 필요한 이유.** ProseMirror 는 NodeSelection 만 알아서 칠해 준다
 * (`.ProseMirror-selectednode`). 여러 블록일 때는 우리가 같은 클래스를 데코레이션으로
 * 얹는다 — 색과 상자는 blocknote-bridge.css 에 이미 있는 것을 그대로 쓴다
 * (DESIGN.md §7). 그 면이 글줄 상자 **안쪽**이라 줄마다 갈라져 보인다.
 *
 * 브라우저의 파란 글자 하이라이트는 `knoc-blocks-selected` 로 감춘다. 선택의
 * 정체가 TextSelection 이라 두면 블록 면 위에 하이라이트가 한 겹 더 깔린다.
 *
 * ## 순서
 *
 * `PageUp` · `PageDown` 은 여기 없다. 그 둘만 화면 좌표를 재야 해서 따로 산다
 * (blocknote-page-keys.ts) — 고른 블록이 있으면 선택이, 없으면 커서가 움직인다.
 *
 * `runsBefore` 로 BlockNote 의 `nodeSelectionKeyboard` 앞에 선다. 저쪽은 블록이
 * 하나 골라진 채로 Enter 를 누르면 **아래에 빈 문단을 만드는데**, Notion 은 그
 * 블록 안으로 커서를 넣는다. 둘 다 Enter 를 잡으므로 먼저 서야 우리가 이긴다.
 */
export const knocBlockSelection = createExtension(({ editor }: { editor: AnyBlockNoteEditor }) => ({
  key: "knocBlockSelection",
  runsBefore: ["nodeSelectionKeyboard"],
  prosemirrorPlugins: [blockSelectionPlugin(editor)],
  keyboardShortcuts: {
    Escape: escapeKey,
    Enter: whenBlockSelected(editSelectedBlock),
    Backspace: whenBlockSelected(removeSelectedBlocks),
    Delete: whenBlockSelected(removeSelectedBlocks),

    /* 화살표 넷이 다 선택을 옮긴다 — Notion 문서 그대로다("arrow keys to select
     * a different block"). 글자 사이를 오갈 커서가 없는 상태라 좌우도 위아래와
     * 같은 일을 한다. 다시 글자로 돌아가는 길은 Enter 와 클릭이다. */
    ArrowUp: whenBlockSelected(moveBlockSelection(-1)),
    ArrowLeft: whenBlockSelected(moveBlockSelection(-1)),
    ArrowDown: whenBlockSelected(moveBlockSelection(1)),
    ArrowRight: whenBlockSelected(moveBlockSelection(1)),
    "Shift-ArrowUp": whenBlockSelected(extendBlockSelection(-1)),
    "Shift-ArrowDown": whenBlockSelected(extendBlockSelection(1)),

    "Mod-a": selectAllKey,
    "Mod-d": duplicateKey,
  },
}))();

/* ── 넓히기 · 칠하기 ─────────────────────────────────────────────────────── */

/** BlockNote 가 붙여넣을 줄 아는 형식들 — core 의 acceptedMIMETypes 를 옮겨 적었다. */
const PASTEABLE_TYPES = [
  "vscode-editor-data",
  "blocknote/html",
  "text/markdown",
  "text/html",
  "text/plain",
  "Files",
];

function blockSelectionPlugin(editor: AnyBlockNoteEditor) {
  return new Plugin({
    key: new PluginKey("knocBlockSelection"),

    /**
     * 줄을 넘어간 선택을 블록 경계까지 밀어 낸다.
     *
     * 끌기 한 번에 여러 번 돈다 — 브라우저가 선택을 늘릴 때마다 ProseMirror 가
     * 트랜잭션을 하나 만들고, 그때마다 여기서 경계로 되민다. **같은 자리로
     * 되밀렸으면 아무것도 안 돌려준다** — 안 그러면 우리가 만든 트랜잭션이
     * 다시 우리를 부르는 고리가 된다.
     */
    appendTransaction(_transactions, _oldState, newState) {
      const range = crossBlockRange(newState);
      if (!range) {
        return null;
      }

      const tr = newState.tr;
      selectBlockRange(tr, range, isBackwardSelection(newState));

      return tr.selection.eq(newState.selection) ? null : tr;
    },

    props: {
      /**
       * 고른 블록마다 `.ProseMirror-selectednode` — ⠿ 로 하나를 골랐을 때
       * ProseMirror 가 붙여 주는 그 클래스다. 칠하는 규칙을 새로 만들지 않고
       * 이미 있는 것을 그대로 쓴다 (blocknote-bridge.css · DESIGN.md §7).
       *
       * 자식이 있는 블록은 한 장으로 덮인다. 데코레이션이 `blockContainer`
       * 바깥 상자에 붙고 그 상자가 자식까지 품고 있어서다 — 부모를 고르면
       * 자식도 같이 고른 것이니 그게 맞다.
       */
      decorations(state) {
        const range = selectedBlockRange(state);
        /* 블록 하나는 ProseMirror 가 이미 칠했다. 두 번 칠하면 8% 짜리 면이
         * 두 겹이 되어 그 줄만 진해진다. */
        if (!range || state.selection instanceof NodeSelection) {
          return null;
        }

        return DecorationSet.create(
          state.doc,
          blocksInRange(state.doc, range).map(({ node, pos }) =>
            Decoration.node(pos, pos + node.nodeSize, { class: "ProseMirror-selectednode" }),
          ),
        );
      },

      /**
       * 브라우저의 글자 하이라이트를 감추는 클래스.
       *
       * 선택이 TextSelection 이라 브라우저는 파란 띠를 그린다. NodeSelection
       * 이었으면 ProseMirror 가 `visible = false` 를 보고 알아서 감춰 주는데
       * (`.ProseMirror-hideselection`), 이쪽은 우리 몫이다 — 칠하는 자리는
       * blocknote-bridge.css 맨 아래다.
       */
      attributes(state): Record<string, string> {
        return selectedBlockRange(state) ? { class: "knoc-blocks-selected" } : {};
      },

      handleDOMEvents: {
        /**
         * 복사 — **블록 선택일 때만 우리가 담는다.**
         *
         * BlockNote 의 복사에는 가드가 하나 있다. 담기 전에
         * `window.getSelection()` 을 훑어 `contenteditable="false"` 안이면
         * 브라우저에 맡기고 조용히 물러난다(copyExtension 의
         * checkIfSelectionInNonEditableBlock) — 이미지처럼 못 고치는 섬 안의
         * 글자를 위한 장치다.
         *
         * **블록 선택에서는 그 가드가 뜻을 잃는다.** 고른 것이 블록 몇 개고
         * 담을 것은 문서에서 꺼내면 되는데, 브라우저의 DOM 선택이 어디에
         * 걸쳐 있느냐로 갈리기 때문이다. 잘라내기는 우리 것이라 잘 되고
         * 복사만 안 되던 것이 그 비대칭이다.
         *
         * 담는 내용은 잘라내기와 한 글자도 다르지 않다 — 같은 함수를 부른다.
         *
         * 글자 선택은 그대로 BlockNote 에 넘긴다(`false`). 그 가드가 지키려던
         * 자리는 거기다.
         */
        copy(view, event) {
          if (!selectedBlockRange(view.state) || !event.clipboardData) {
            return false;
          }

          writeToClipboard(view, editor, event);
          return true;
        },

        /**
         * 잘라내기 — **담는 것은 복사와 같고, 지우는 것만 블록 단위다.**
         *
         * BlockNote 의 잘라내기는 `deleteSelection()` 이라 고른 **글자**만
         * 지운다. 우리 선택은 블록 몇 개의 글자를 끝에서 끝까지 덮고 있어서,
         * 그대로 두면 지워진 자리에 **빈 문단 하나가 남는다.** Notion 은 아무것도
         * 안 남긴다 — Backspace 와 같아야 한다.
         */
        cut(view, event) {
          const range = selectedBlockRange(view.state);
          if (!range || !view.editable || !event.clipboardData) {
            return false;
          }

          writeToClipboard(view, editor, event);
          editor.removeBlocks(blockIdsInRange(view.state.doc, range));
          return true;
        },

        /**
         * 붙여넣기 — **고른 블록을 먼저 치우고 나머지는 BlockNote 에 넘긴다.**
         *
         * 잘라내기와 같은 이유다. 그냥 두면 ProseMirror 가 고른 자리에 붙여
         * 넣으면서 **빈 문단 하나를 위에 남긴다** — 우리 선택이 첫 블록의 글자
         * 처음부터 마지막 블록의 글자 끝까지라, 그 「껍데기」가 안 지워진다.
         *
         * 그래서 고른 블록을 빈 문단 하나로 바꾸고 커서를 그 안에 놓은 다음
         * `false` 를 돌려 준다. 빈 문단에 붙여 넣으면 첫 블록이 그 자리에 들어가
         * 앉아서 남는 것이 없다 — Notion 과 같은 결과다.
         *
         * **붙일 것이 있을 때만 치운다.** 클립보드에 우리가 아는 형식이 하나도
         * 없으면 BlockNote 는 아무것도 안 붙이는데, 그때 먼저 지워 버렸으면
         * 고른 블록만 사라진다. 형식 목록은 BlockNote 의 acceptedMIMETypes 를
         * 옮겨 적은 것이다 — 밖으로 안 내놓아서 참조를 못 한다.
         */
        paste(view, event) {
          const range = selectedBlockRange(view.state);
          if (!range || !view.editable) {
            return false;
          }

          const types = event.clipboardData?.types;
          if (!types || !PASTEABLE_TYPES.some((type) => types.includes(type))) {
            return false;
          }

          const { insertedBlocks } = editor.replaceBlocks(
            blockIdsInRange(view.state.doc, range),
            [{ type: "paragraph" }],
          );

          if (insertedBlocks[0]) {
            editor.setTextCursorPosition(insertedBlocks[0], "start");
          }

          return false;
        },
      },
    },
  });
}

/**
 * 고른 블록을 클립보드에 담는다 — 복사와 잘라내기가 같이 쓴다.
 *
 * 세 형식은 BlockNote 가 `⌘C` 에 싣는 것 그대로다. `selectedFragmentToHTML` 이
 * 저쪽 복사 확장이 쓰는 바로 그 함수라, 우리가 담아도 내용이 안 달라진다.
 */
function writeToClipboard(
  view: EditorView,
  editor: AnyBlockNoteEditor,
  event: ClipboardEvent,
) {
  const { clipboardHTML, externalHTML, markdown } = selectedFragmentToHTML(view, editor);

  event.preventDefault();
  event.clipboardData?.clearData();
  event.clipboardData?.setData("blocknote/html", clipboardHTML);
  event.clipboardData?.setData("text/html", externalHTML);
  event.clipboardData?.setData("text/plain", markdown);
}

/**
 * 선택이 줄을 넘어갔으면 그 블록들을 감싸는 자리, 아니면 undefined.
 *
 * `selectedBlockRange` 와 다른 점은 **이미 블록 단위인 것은 안 센다**는 것이다.
 * 넓히기는 「아직 글자 선택인데 줄을 넘어간 것」만 상대한다.
 */
function crossBlockRange(state: EditorState): BlockRange | undefined {
  const { selection, doc } = state;

  /* 이미 블록 단위인 것은 안 센다 — 넓히기는 「아직 글자 선택인데 줄을
   * 넘어간 것」만 상대한다. */
  if (
    selection instanceof NodeSelection ||
    selection instanceof BlockRangeSelection ||
    selection.empty
  ) {
    return undefined;
  }

  const start = getNearestBlockPos(doc, selection.from);
  const end = getNearestBlockPos(doc, selection.to);
  if (start.posBeforeNode === end.posBeforeNode) {
    return undefined;
  }

  return blockRangeAround(doc, selection.from, selection.to);
}

/* ── 키보드 ──────────────────────────────────────────────────────────────── */

interface BlockSelectionContext {
  editor: AnyBlockNoteEditor;
  state: EditorState;
  range: BlockRange;
}

/** 블록 선택 중일 때만 도는 핸들러. 아니면 `false` 를 돌려 다음 차례로 넘긴다. */
function whenBlockSelected(run: (ctx: BlockSelectionContext) => boolean) {
  return ({ editor }: { editor: AnyBlockNoteEditor }) => {
    const state = editor.prosemirrorState;
    const range = selectedBlockRange(state);
    return range ? run({ editor, state, range }) : false;
  };
}

/**
 * Esc — **커서가 있는 블록을 고르고, 이미 골라져 있으면 푼다** (Notion 문서
 * 그대로: "press esc to select the block you're currently in. Or to clear
 * selected blocks").
 *
 * 풀 때 `false` 를 돌리는 것은 일부러다. BlockNote 는 Esc 를 「에디터에서
 * 포커스를 뺀다」로 쓰는데(키보드로 페이지의 다른 곳으로 나가는 길이다), 우리가
 * 다 잡아 버리면 그 길이 막힌다. 선택만 풀고 나머지는 저쪽에 넘긴다 — 사용자가
 * 보기에는 「한 번 더 누르면 빠져나간다」가 된다.
 *
 * 슬래시 메뉴가 떠 있으면 아예 손대지 않는다. 그 Esc 는 메뉴를 닫는 것이고,
 * 그것도 BlockNote 쪽 일이다.
 */
function escapeKey({ editor }: { editor: AnyBlockNoteEditor }) {
  if (editor.getExtension(SuggestionMenu)?.shown()) {
    return false;
  }

  const state = editor.prosemirrorState;
  const range = selectedBlockRange(state);

  if (range) {
    editor.transact((tr) => tr.setSelection(TextSelection.near(tr.doc.resolve(range.to), -1)));
    return false;
  }

  const block = getNearestBlockPos(state.doc, state.selection.from);
  editor.transact((tr) => tr.setSelection(NodeSelection.create(tr.doc, block.posBeforeNode)));
  return true;
}

/**
 * Enter — 고른 블록 **안으로** 커서를 넣는다 (Notion: "press enter to edit any
 * text inside a selected block").
 *
 * BlockNote 기본은 아래에 빈 문단을 만든다(NodeSelectionKeyboard). 그래서 이
 * 확장이 `runsBefore` 로 저쪽 앞에 선다.
 *
 * 여러 줄을 골랐으면 **마지막 줄 끝**이다. 고르기를 끝낸 자리가 거기라 손이
 * 이미 그쪽에 있다.
 */
function editSelectedBlock({ editor, range }: BlockSelectionContext) {
  editor.transact((tr) =>
    tr.setSelection(TextSelection.near(tr.doc.resolve(range.to), -1)).scrollIntoView(),
  );
  return true;
}

/** Backspace · Delete — 고른 블록을 지운다. */
function removeSelectedBlocks({ editor, state, range }: BlockSelectionContext) {
  editor.removeBlocks(blockIdsInRange(state.doc, range));
  return true;
}

/**
 * 화살표 — 선택을 위/아래 블록 **하나로** 옮긴다.
 *
 * 문서 순서다. 접히지 않은 자식이 있으면 그 안으로 들어가고(아래), 자식의
 * 마지막 줄에서 아래로 가면 부모의 다음 형제로 나온다 — 화면에서 보이는 차례
 * 그대로다 (block-selection.ts 의 `blockPosBefore` · `blockPosAfter`).
 *
 * 끝에서 더 가려고 하면 **그 자리에 선다.** `true` 를 돌려 브라우저가 페이지를
 * 스크롤하는 것까지 막는다 — 문서 끝에서 아래 화살표를 눌렀다고 화면이 튀면
 * 선택이 사라진 것처럼 보인다.
 */
function moveBlockSelection(direction: -1 | 1) {
  return ({ editor, state, range }: BlockSelectionContext) => {
    const target =
      direction < 0
        ? blockPosBefore(state.doc, range.from)
        : blockPosAfter(state.doc, range.to);

    if (target === undefined) {
      return true;
    }

    editor.transact((tr) =>
      tr.setSelection(NodeSelection.create(tr.doc, target)).scrollIntoView(),
    );
    return true;
  };
}

/**
 * `shift` + 화살표 — 선택을 한 블록 **늘리거나 줄인다** (Notion: "hold down
 * shift + up/down arrow keys to expand your selection up or down").
 *
 * **어느 쪽이 늘어나는지는 어느 쪽으로 골랐는지가 정한다.** 아래로 끌어 고른
 * 선택은 아래쪽 끝이 움직이고, 위로 끌어 고른 것은 위쪽 끝이 움직인다. 글자
 * 선택에서 `shift` 가 하는 일과 같아야 손이 헷갈리지 않는다.
 *
 * 그래서 방향을 선택에 다시 실어 준다(`selectBlockRange` 의 `backward`). 안
 * 그러면 늘렸다 줄였다 하는 사이에 기준점이 반대로 뒤집힌다.
 */
function extendBlockSelection(direction: -1 | 1) {
  return ({ editor, state, range }: BlockSelectionContext) => {
    const doc = state.doc;
    const blocks = blocksInRange(doc, range);
    const single = blocks.length === 1;
    /* 머리(움직이는 쪽)가 위에 있나. 블록 하나짜리는 방향이 없어서 양쪽으로 자란다. */
    const headAtTop = !single && isBackwardSelection(state);
    const growing = single || (direction < 0) === headAtTop;

    let next: BlockRange | undefined;
    if (growing) {
      const target =
        direction < 0 ? blockPosBefore(doc, range.from) : blockPosAfter(doc, range.to);
      const targetRange = target === undefined ? undefined : blockRangeAt(doc, target);
      if (!targetRange) {
        return true;
      }
      /* 더한 블록이 다른 깊이일 수 있다 — 첫 자식에서 위로 늘리면 부모가 온다.
       * 합친 자리를 다시 blockRangeAround 에 통과시켜 공통 조상에 맞춘다. */
      next = blockRangeAround(
        doc,
        Math.min(range.from, targetRange.from),
        Math.max(range.to, targetRange.to) - 1,
      );
    } else {
      next =
        direction < 0
          ? { from: range.from, to: blocks[blocks.length - 1].pos }
          : { from: blocks[1].pos, to: range.to };
    }

    editor.transact((tr) => {
      selectBlockRange(tr, next, growing ? direction < 0 : direction > 0);
      tr.scrollIntoView();
    });
    return true;
  };
}

/**
 * ⌘A — **한 번은 이 블록, 한 번 더는 문서 전체** (Notion: "press cmd/ctrl + a
 * once to select the block your cursor is in").
 *
 * 첫 번째가 글자 선택인 것이 중요하다. 코드 블록에서 ⌘A 는 코드를 고르는
 * 것이어야 하고, 골라 놓고 바로 덮어 쓰는 것도 여기서 온다. 두 번째부터는 블록
 * 단위라 Backspace 가 문서를 비운다.
 *
 * 글자를 담지 않는 블록(표 · 이미지)에서는 첫 단계를 건너뛴다. 고를 글자가 없다.
 *
 * ProseMirror 기본은 한 번에 문서 전체(AllSelection)라, 이 자리를 안 잡으면
 * 단계가 없다.
 */
function selectAllKey({ editor }: { editor: AnyBlockNoteEditor }) {
  const state = editor.prosemirrorState;
  const doc = state.doc;
  const range = selectedBlockRange(state);

  if (!range) {
    const info = getBlockInfo(getNearestBlockPos(doc, state.selection.from));

    if (info.isBlockContainer && info.blockContent.node.isTextblock) {
      const from = info.blockContent.beforePos + 1;
      const to = info.blockContent.afterPos - 1;

      if (state.selection.from !== from || state.selection.to !== to) {
        editor.transact((tr) => tr.setSelection(TextSelection.create(tr.doc, from, to)));
        return true;
      }
    }
  }

  const all = wholeDocumentBlockRange(doc);
  if (range && range.from === all.from && range.to === all.to) {
    return true;
  }

  editor.transact((tr) => selectBlockRange(tr, all));
  return true;
}

/**
 * ⌘D — 고른 블록을 복제한다 (Notion: "press cmd/ctrl + D to duplicate the
 * blocks you've selected").
 *
 * 아무것도 안 골랐으면 커서가 있는 블록 하나다. ⠿ 메뉴의 「복제」와 같은 것을
 * 부른다 — 사본을 만드는 규칙은 block-duplication.ts 한 곳에만 있다.
 */
function duplicateKey({ editor }: { editor: AnyBlockNoteEditor }) {
  const state = editor.prosemirrorState;
  const range =
    selectedBlockRange(state) ??
    blockRangeAt(state.doc, getNearestBlockPos(state.doc, state.selection.from).posBeforeNode);

  if (!range) {
    return false;
  }

  duplicateBlocks(editor, blockIdsInRange(state.doc, range));
  return true;
}
