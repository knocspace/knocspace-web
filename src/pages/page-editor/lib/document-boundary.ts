import { getBlockInfo, getNearestBlockPos } from "@blocknote/core";
import type { EditorView } from "@tiptap/pm/view";

/**
 * 본문의 **맨 앞 경계** — 여기서 위로 나가면 문서 제목이다.
 *
 * Notion 은 제목과 본문이 한 판이라 `↑` 와 `Backspace` 가 그냥 이어진다. 우리는
 * 제목이 `textarea`(PageTitle)고 본문이 ProseMirror 라 판이 둘이고, 그 사이를
 * 넘는 순간을 **여기서 판단하고** 넘기는 일은 화면이 한다 (PageEditorPage).
 *
 * 판단을 lib 으로 뺀 이유는 「첫 블록의 첫 줄인가」가 눈으로 확인하기 어려운
 * 계산이어서다 — 줄바꿈된 문단, 자식이 달린 블록, 여러 줄짜리 코드 블록에서
 * 각각 다르게 답해야 한다.
 */

/**
 * 문서의 첫 블록이 앉는 자리.
 *
 * 문서는 `doc > blockGroup > blockContainer…` 이라, 맨 위 블록 바로 앞은 늘 1 이다
 * (0 은 blockGroup 이 여는 자리). 상수로 두는 것은 이 1 이 「문서의 첫 블록」이라는
 * 뜻이지 아무 자리나 가리키는 숫자가 아니기 때문이다.
 */
const FIRST_BLOCK_POS = 1;

/** 커서 하나가 문서의 첫 블록 안에 있나. 자식 블록 안이면 아니다. */
function isInFirstBlock(view: EditorView): boolean {
  const { selection, doc } = view.state;

  /* 글자를 고르고 있거나 블록을 골랐으면 경계가 아니다 — 그 키는 고른 것에
   * 걸려야 한다 (blocknote-block-selection.ts). */
  if (!selection.empty) {
    return false;
  }

  return getNearestBlockPos(doc, selection.from).posBeforeNode === FIRST_BLOCK_POS;
}

/**
 * `Backspace` 로 제목에 갈 자리인가 — **첫 블록의 첫 글자 앞**.
 *
 * 한 칸이라도 오른쪽이면 지울 글자가 있다는 뜻이라 BlockNote 가 먼저 가져간다.
 * 제목이 아니라 본문에서 지워져야 한다.
 */
export function isAtDocumentStart(view: EditorView): boolean {
  if (!isInFirstBlock(view)) {
    return false;
  }

  const info = getBlockInfo(getNearestBlockPos(view.state.doc, view.state.selection.from));
  if (!info.isBlockContainer) {
    return false;
  }

  return view.state.selection.from === info.blockContent.beforePos + 1;
}

/**
 * `↑` 로 제목에 갈 자리인가 — **첫 블록의 첫 줄**.
 *
 * 첫 **글자**가 아니라 첫 **줄**인 것이 중요하다. 길어서 세 줄로 접힌 문단이
 * 첫 블록이면, 둘째 줄에서 `↑` 는 첫 줄로 가야 하고 첫 줄에서 눌러야 제목으로
 * 나간다. 여러 줄짜리 코드 블록도 같다.
 *
 * 그 「첫 줄인가」는 글자 수로 알 수 없어서 재야 한다. `endOfTextblock` 이
 * ProseMirror 가 그걸 브라우저에 물어보라고 열어 둔 자리다.
 */
export function isAtDocumentTopLine(view: EditorView): boolean {
  return isInFirstBlock(view) && view.endOfTextblock("up");
}
