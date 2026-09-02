import { createExtension, createStore } from "@blocknote/core";
import { Extension as TiptapExtension } from "@tiptap/core";
import type { EditorView } from "@tiptap/pm/view";
import type { AnyBlockNoteEditor } from "./block-selection";
import { isAtDocumentStart, isAtDocumentTopLine } from "./document-boundary";

/**
 * 본문 **맨 앞에서 위로 나가는** 두 키 — `↑`(첫 줄)와 `Backspace`(첫 글자 앞).
 *
 * Notion 은 제목과 본문이 한 판이라 커서가 그냥 이어지는데, 우리는 제목이
 * `textarea`(PageTitle)고 본문이 ProseMirror 라 판이 둘이다. 넘어갈 **순간**을
 * 여기서 잡고, 넘기는 일은 화면이 한다 (PageEditorPage).
 *
 * ── 왜 맨 뒤에 서는가
 *
 * **ProseMirror 가 문서 맨 앞의 `Backspace` 를 스스로 `preventDefault` 한다.**
 * 아무 플러그인도 안 가져가면 `captureKeyDown` 이 도는데, 거기서
 * `stopNativeHorizontalDelete` 가 「글줄 끝이면 브라우저에 맡기지 않는다」로
 * 참을 돌려주기 때문이다(prosemirror-view). 문서 맨 앞은 정의상 글줄의 끝이라
 * 늘 걸린다.
 *
 * 그래서 **키를 실제로 가져가야 한다.** 처음에는 React `onKeyDown` 으로 받고
 * `defaultPrevented` 가 안 섰을 때만 처리했는데, 저 경로가 늘 먼저 서서
 * 브라우저에서는 한 번도 안 걸렸다. 레이아웃이 없는 테스트에서는
 * `endOfTextblock` 이 거짓이라 그 경로가 안 돌아 통과했다 — 그래서 못 잡혔다.
 *
 * `captureKeyDown` 은 **`handleKeyDown` 을 전부 물어본 다음**에만 돈다. 그러니
 * 그 줄에 끼어들어 참을 돌려주면 된다. 순서가 중요하다:
 *
 *   BlockNote  블록 종류를 먼저 벗긴다 (제목1 → 본문). 그게 첫 `Backspace` 다
 *   우리       저쪽이 안 가져갔을 때만 — 그때가 제목으로 올라갈 자리다
 *   PM         여기까지 아무도 안 가져가야 preventDefault 한다 (이제 안 온다)
 *
 * 그 순서를 `priority` 로 만든다. tiptap 은 확장을 우선순위 **내림차순**으로
 * 늘어놓고 그 차례로 keymap 플러그인을 넣는다. 기본이 100 이고 BlockNote 것들이
 * 91~111 이라, 1 이면 맨 뒤가 보장된다.
 *
 * BlockNote 확장의 `keyboardShortcuts` 로는 이 자리를 못 만든다. 그쪽은 전부
 * 100 보다 높은 자리에 서서 BlockNote 보다 **먼저** 돌고, 그러면 제목1 을
 * 본문으로 되돌리기도 전에 제목 줄로 튀어 나간다.
 *
 * 조합 중(`isComposing`)은 따로 안 막는다. ProseMirror 가 `handleKeyDown` 을
 * 부르기 전에 걸러 낸다.
 */
export interface DocumentBoundaryState {
  /** 본문 맨 앞에서 위로 나갈 때. 안 채우면 두 키 다 그냥 지나간다. */
  onLeaveStart?: () => void;
}

/**
 * tiptap 확장 우선순위. 기본이 100, BlockNote 확장들이 91~111 이라 1 이면
 * 맨 뒤다 — `captureKeyDown` 바로 앞자리.
 */
const RUNS_LAST = 1;

export const knocDocumentBoundary = createExtension(({ editor }: { editor: AnyBlockNoteEditor }) => {
  /* **콜백을 store 로 받는다.** 확장은 에디터와 함께 한 번만 만들어지는데
   * 콜백은 화면이 다시 그릴 때마다 새 함수라, 만들 때 받으면 첫 번째 함수가
   * 영영 박힌다. store 는 BlockNote 가 확장마다 열어 둔 자리이고
   * (모든 확장이 하나씩 갖는다), 채우는 것은 ContentEditor 다. */
  const store = createStore<DocumentBoundaryState>({});

  const leave = (isAtBoundary: (view: EditorView) => boolean) => () => {
    const view = editor.prosemirrorView;
    const onLeaveStart = store.state.onLeaveStart;

    if (!view || !onLeaveStart || !isAtBoundary(view)) {
      return false;
    }

    onLeaveStart();
    return true;
  };

  return {
    key: "knocDocumentBoundary",
    store,
    tiptapExtensions: [
      TiptapExtension.create({
        name: "knocDocumentBoundary",
        priority: RUNS_LAST,
        addKeyboardShortcuts: () => ({
          /* 수식어가 붙은 것은 안 걸린다. `Backspace` 는 맨 `Backspace` 뿐이고
           * `shift`+`↑`(선택 늘리기)는 다른 이름이다 — prosemirror-keymap 이
           * 수식어까지 정확히 맞춰 본다. */
          Backspace: leave(isAtDocumentStart),
          ArrowUp: leave(isAtDocumentTopLine),
        }),
      }),
    ],
  } as const;
});

/* 만든 것을 그대로 안 내보내고 **틀**을 내보낸다. BlockNote 의 확장들과 같은
 * 모양이다 — 등록할 때 한 번 부르고(content-editor.ts), 화면에서는 이 틀로
 * 찾는다(`useExtension`). 틀이 곧 이름표라 둘이 짝을 맞춘다. */
