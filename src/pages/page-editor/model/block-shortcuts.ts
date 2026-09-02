import { createExtension } from "@blocknote/core";
import {
  blockIdsInRange,
  selectedBlockRange,
  type AnyBlockNoteEditor,
} from "../lib/block-selection";
import type { KnocPartialBlock } from "./blocknote-schema";

/* ── 숫자키 전환 ─────────────────────────────────────────────────────────── */

/**
 * 숫자 → 블록. **Notion 의 번호 그대로다.**
 *
 * 9 는 「하위 페이지」 자리라 비어 있다 — 페이지를 가리키는 블록이 없어서
 * 백로그다(turn-into-items.ts 의 같은 TODO). 그 자리에는 BlockNote 기본
 * (`Mod-Shift-9` = 체크리스트)이 아직 남아 있다.
 *
 * 제목에 `isToggleable: false` 를 **적어서** 넘기는 것은 전환 메뉴와 같은
 * 이유다 — 안 적으면 `updateBlock` 이 props 를 합치기만 해서, 접을 수 있는
 * 제목1 에서 `⌘⌥1` 을 눌러도 접기가 안 풀린다 (turn-into-items.ts).
 */
const NOTION_BLOCK_NUMBERS: Record<string, KnocPartialBlock> = {
  0: { type: "paragraph" },
  1: { type: "heading", props: { level: 1, isToggleable: false } },
  2: { type: "heading", props: { level: 2, isToggleable: false } },
  3: { type: "heading", props: { level: 3, isToggleable: false } },
  4: { type: "checkListItem" },
  5: { type: "bulletListItem" },
  6: { type: "numberedListItem" },
  7: { type: "toggleListItem" },
  8: { type: "codeBlock" },
};

/**
 * 블록 **종류**를 바꾸는 키와 입력 — Notion 규격으로 맞춘 세 가지.
 *
 * | | Notion | BlockNote 기본 |
 * | --- | --- | --- |
 * | 숫자키 전환 | `⌘⌥0`~`8` · `Ctrl+Shift+0`~`8` | `Mod-Alt-0`~`3` 과 인용뿐 |
 * | `⌘Enter` | 체크박스 토글 · 토글 열고 닫기 | 없음 |
 * | `>` + 공백 | 토글 목록 | 인용 |
 *
 * **`model` 인 이유는 블록 종류를 알아야 해서다.** 어떤 블록이 있는지는 스키마가
 * 정하고(blocknote-schema.ts), 스키마는 `model` 이다. 키를 다루지만 자리는
 * 블록 쪽이라 `lib` 의 키보드 확장들(blocknote-block-selection.ts ·
 * blocknote-page-keys.ts)과 갈라 둔다 — 저쪽은 블록이 무엇이든 상관없이 돈다.
 *
 * **대상은 셋 다 같은 규칙이다** — 고른 블록이 있으면 고른 것 전부, 없으면 커서가
 * 있는 블록 하나. `⌘D` · ⠿ 메뉴와도 같다. 한 문서 안에서 「이 키가 어디에
 * 걸리는지」가 키마다 다르면 손이 못 외운다.
 */
export const knocBlockShortcuts = createExtension({
  key: "knocBlockShortcuts",
  /* 숫자키 넷이 BlockNote 것과 겹친다 — 저쪽의 `Mod-Shift-6`~`9` 는 토글 ·
   * 번호 · 불릿 · 체크로, 마크다운 편집기 관례지 Notion 번호가 아니다.
   * 먼저 서서 우리 뜻으로 덮는다 (아래 NOTION_BLOCK_NUMBERS). */
  runsBefore: [
    "quote",
    "bulletListItem-shortcuts",
    "numberedListItem-shortcuts",
    "checkListItem-shortcuts",
    "toggleListItem-shortcuts",
  ],
  keyboardShortcuts: {
    ...blockNumberShortcuts(),
    "Mod-Enter": toggleBlockOpenState,
  },
  inputRules: [
    {
      /**
       * `>` + 공백 → **토글 목록** (Notion).
       *
       * BlockNote 는 `>` 도 `"` 도 인용으로 받는데, Notion 은 `>` 가 토글이고
       * 인용은 `"` 다. 인용을 잃지 않는 것이 이 결정의 조건이었다 — `"` 쪽은
       * BlockNote 규칙이 그대로 남아서 인용을 만드는 길이 안 막힌다.
       *
       * BlockNote 의 `>` 규칙을 지우지 않는다. 입력 규칙은 **먼저 맞는 것 하나만**
       * 돌고 우선순위가 높은 확장의 규칙이 앞에 서므로(ExtensionManager), 이
       * 규칙이 걸리면 저쪽까지 가지 않는다.
       */
      find: /^>\s$/,
      replace: () => ({ type: "toggleListItem" }) as KnocPartialBlock,
    },
  ],
});

/**
 * 숫자 하나에 **키 두 벌**을 건다.
 *
 * Notion 이 이 계열만 `Mod` 를 안 쓰고 OS 마다 다른 조합을 쓴다 — macOS 는
 * `Cmd+Option+숫자`, Windows 는 `Ctrl+Shift+숫자`. `Mod-Alt-N` 은 앞을,
 * `Mod-Shift-N` 은 뒤를 덮는다. 반대쪽에도 같이 걸리지만(mac 의
 * `Cmd+Shift+4` 는 OS 가 먼저 가져가고, Windows 의 `Ctrl+Alt+4` 는 남는 자리다)
 * 해가 없고, 조합을 OS 로 갈라 두면 그 분기를 우리가 들고 있어야 한다.
 */
function blockNumberShortcuts() {
  const shortcuts: Record<string, (ctx: { editor: AnyBlockNoteEditor }) => boolean> = {};

  for (const [number, block] of Object.entries(NOTION_BLOCK_NUMBERS)) {
    const turnInto = turnBlocksInto(block);
    shortcuts[`Mod-Alt-${number}`] = turnInto;
    shortcuts[`Mod-Shift-${number}`] = turnInto;
  }

  return shortcuts;
}

/**
 * 고른 블록을 그 종류로 바꾼다.
 *
 * **글자를 담는 블록만 바꾼다.** 표 · 이미지 · 목차는 글이 갈 데가 없어서
 * 그냥 지나간다 — 전환 메뉴가 그 블록들에서 아예 안 뜨는 것과 같은 규칙이고
 * (turn-into-items.ts), BlockNote 의 `Mod-Alt-0` 도 같은 자리에서 같은 것을 본다.
 *
 * 코드 블록도 여기 걸린다. 코드 블록에서 `⌘⌥0` 은 안 듣고, 문단에서 `⌘⌥8` 로
 * 들어가는 길만 열려 있다 — 나오는 길은 ⠿ 메뉴가 아니라 `Backspace` 다.
 */
function turnBlocksInto(block: KnocPartialBlock) {
  return ({ editor }: { editor: AnyBlockNoteEditor }) => {
    const targets = targetBlockIds(editor);
    let changed = false;

    for (const id of targets) {
      const current = editor.getBlock(id);
      if (!current || editor.schema.blockSchema[current.type]?.content !== "inline") {
        continue;
      }

      editor.updateBlock(id, block);
      changed = true;
    }

    return changed;
  };
}

/* ── ⌘Enter ──────────────────────────────────────────────────────────────── */

/**
 * `⌘Enter` — 체크박스를 켜고 끄거나, 접히는 블록을 열고 닫는다
 * (Notion: "modify the current block you're in").
 *
 * **둘이 사는 곳이 다르다.** 체크는 문서에 담긴 props(`checked`)라 `updateBlock`
 * 하나면 되는데, **접힘은 문서에 없다** — BlockNote 는 그걸 `localStorage` 에
 * 넣고(`toggle-<블록 id>`), 여닫는 길을 손잡이 버튼 클릭 하나로만 열어 뒀다
 * (core 의 createToggleWrapper). 상태를 읽거나 바꾸는 API 가 없다.
 *
 * 그래서 그 버튼을 눌러 준다. 우리가 `localStorage` 를 직접 건드리면 화면이
 * 안 따라오고(그리는 것은 그쪽 nodeView 다), 접힘 상태를 우리가 따로 들면
 * 같은 값이 두 곳에 생긴다. **BlockNote 가 열어 둔 유일한 문으로 들어간다.**
 *
 * 문서에 없는 상태라 새로고침하면 그 브라우저에만 남고 다른 사람에게는 안
 * 보인다. 그건 BlockNote 의 결정이고, F10 에서 협업을 붙일 때 다시 볼 자리다.
 */
function toggleBlockOpenState({ editor }: { editor: AnyBlockNoteEditor }) {
  let changed = false;

  for (const id of targetBlockIds(editor)) {
    const block = editor.getBlock(id);
    if (!block) {
      continue;
    }

    if (block.type === "checkListItem") {
      editor.updateBlock(id, { props: { checked: !block.props.checked } });
      changed = true;
      continue;
    }

    changed = clickToggleHandle(editor, id) || changed;
  }

  return changed;
}

/**
 * 접힘 손잡이를 누른다. 그 블록이 안 접히는 종류면 손잡이가 없고, 없으면 거짓.
 *
 * 자리를 `:scope` 로 못 박는 것은 **접힌 안쪽에도 같은 손잡이가 있어서다.**
 * 그냥 찾으면 자식의 손잡이를 누를 수 있다. `[data-id]` 는 바깥 상자와 안쪽
 * 상자 둘 다에 붙어서(BlockContainer 의 renderHTML) 첫 번째가 바깥이고,
 * 자식들은 그 아래 다른 `.bn-block-group` 에 산다.
 */
function clickToggleHandle(editor: AnyBlockNoteEditor, blockId: string) {
  const outer = editor.prosemirrorView?.dom.querySelector(`[data-id="${blockId}"]`);
  const handle = outer?.querySelector(
    ":scope > .bn-block > .bn-block-content .bn-toggle-button",
  );

  if (!(handle instanceof HTMLElement)) {
    return false;
  }

  handle.click();
  return true;
}

/* ── 공통 ────────────────────────────────────────────────────────────────── */

/** 고른 블록이 있으면 그것들, 없으면 커서가 있는 블록 하나. */
function targetBlockIds(editor: AnyBlockNoteEditor): string[] {
  const state = editor.prosemirrorState;
  const range = selectedBlockRange(state);

  return range
    ? blockIdsInRange(state.doc, range)
    : [editor.getTextCursorPosition().block.id];
}
