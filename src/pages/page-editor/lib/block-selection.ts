import { getNodeById, type BlockNoteEditor } from "@blocknote/core";
import { NodeSelection, type EditorState } from "@tiptap/pm/state";

/**
 * 블록 하나를 통째로 고른다 — ⠿ 를 눌렀을 때 Notion 이 하는 일이다.
 *
 * **선택 상태를 우리가 들지 않는다.** ProseMirror 의 NodeSelection 을 그 블록에
 * 놓는 것이 전부고, 나머지는 전부 딸려 온다.
 *
 *   보이는 것  PM 이 그 블록의 DOM 에 `.ProseMirror-selectednode` 를 붙인다.
 *              칠하는 것은 blocknote-bridge.css 다 (DESIGN.md §7)
 *   지우기     Backspace · Delete 가 블록을 지운다
 *   Enter      아래에 빈 문단을 만든다 — BlockNote 의 NodeSelectionKeyboard
 *   복사       ⌘C 가 블록을 통째로 담는다
 *   해제       본문 아무 데나 누르면 선택이 그리로 옮겨 간다
 *
 * React state 로 들었으면 이 다섯을 손으로 다시 만들어야 하고, 문서의 상태가
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
 * 블록이 통째로 골라져 있는지 — ⠿ 로 고른 그 상태다.
 *
 * **이미지·구분선을 직접 눌러 고른 것과 구별해야 한다.** 둘 다 NodeSelection 이지만
 * 앉는 노드가 다르다 — 저쪽은 blockContent(이미지 노드 자체)고, 이쪽은 그것을 담은
 * blockContainer 다. 노드 이름을 보는 이유가 그거다.
 *
 * 쓰는 곳은 포맷 툴바다. 블록을 통째로 골랐을 때 BlockNote 는 툴바를 띄우는데
 * (선택이 비어 있지 않으면 띄운다 — core 의 FormattingToolbar), 굵게·기울임을
 * 걸 자리가 아니라서 Notion 은 안 띄운다. 이미지를 고른 경우는 그대로 둔다 —
 * 그쪽 툴바에는 캡션·바꾸기처럼 그 블록에서 실제로 쓰는 것이 들어 있다.
 */
export function isWholeBlockSelected(state: EditorState) {
  const { selection } = state;
  return selection instanceof NodeSelection && selection.node.type.name === "blockContainer";
}
