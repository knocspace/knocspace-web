import { BlockNoteView } from "@blocknote/mantine";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import {
  FormattingToolbarController,
  SideMenuController,
  SuggestionMenuController,
  useEditorState,
} from "@blocknote/react";
import { useEffect, useImperativeHandle, type Ref } from "react";
import { isWholeBlockSelected } from "../../lib/block-selection";
import { knocDocumentBoundary } from "../../lib/blocknote-document-boundary";
import { isMarqueeDragging } from "../../lib/blocknote-marquee-selection";
import { sideMenuFloatingOptions } from "../../lib/blocknote-side-menu";
import { toPageContent, type PageContent } from "../../model/page-content";
import { useContentEditor } from "../../model/content-editor";
import { knocSlashMenuItems } from "../../model/slash-menu-items";
import { useSeedColorScheme } from "../../model/seed-color-scheme";
import { BlockSideMenu } from "./BlockSideMenu";

/* 라이브러리 CSS. 변수는 여기서 안 건드린다 — SEED 로 되돌려 가리키는 일은
 * app/styles/blocknote-bridge.css 한 곳뿐이다 (DESIGN.md §7).
 *
 * global.css 가 아니라 이 파일에서 부르는 이유: 이 컴포넌트는 지연 로드라
 * (LazyContentEditor) 번들러가 CSS 도 같은 청크로 떼어 준다. 문서를 안 여는
 * 화면은 gzip 36KB 인 이 CSS 를 안 받는다 (docs/decisions/f3-blocknote-surface.md). */
import "@blocknote/mantine/style.css";

/**
 * 밖에서 본문에 커서를 놓는 길. **에디터 인스턴스는 안 내보낸다.**
 *
 * 내보내면 F10 에서 Yjs 로 갈아 끼울 때 밖까지 깨진다
 * (docs/roadmap/sprint-3.md §3). 여는 것은 「커서를 받는다」 하나다.
 */
export interface ContentEditorHandle {
  /** 첫 블록 맨 앞에 커서를 놓고 포커스를 받는다 — 제목에서 `↓` 로 내려올 때. */
  focusStart(): void;
  /** 맨 위에 빈 줄을 만들고 그 안에 커서를 놓는다 — 제목에서 `Enter` 를 칠 때. */
  insertStart(): void;
}

export interface ContentEditorProps {
  /** 문서 한 장. 바뀌면 에디터를 새로 만든다. */
  pageId: string;
  /** 처음 한 번만 읽는다. 없으면 빈 문서. */
  content?: PageContent;
  /** 읽기 전용 — F5 의 보기 권한이 여기로 온다. */
  editable?: boolean;
  /**
   * 내용이 바뀔 때마다. 문서를 덩어리로만 넘긴다.
   *
   * 값을 상태에 담아 두고 다시 content 로 내려보내면 안 된다. 그 순간 문서의
   * 원본이 둘이 된다 (docs/roadmap/architecture.md).
   */
  onChange?: (content: PageContent) => void;
  /**
   * 본문 **맨 앞에서 위로 나갈 때** — `↑`(첫 줄) 와 `Backspace`(첫 글자 앞).
   *
   * 어디로 가는지는 여기서 안 정한다. 이 컴포넌트는 서버도 라우터도 모르는
   * 자리고, 위에 무엇이 있는지도 화면이 안다 (PageEditorPage → PageTitle).
   *
   * 키를 잡는 것은 확장 쪽이다 — blocknote-document-boundary.ts. **여기 React
   * onKeyDown 으로 두면 안 된다**: 그 자리는 ProseMirror 가 먼저 지나간 뒤라,
   * 문서 맨 앞의 `Backspace` 를 PM 이 이미 `preventDefault` 해 놓는다.
   */
  onLeaveStart?: () => void;
  /** 밖에서 커서를 놓기 위한 핸들. */
  ref?: Ref<ContentEditorHandle>;
}

/**
 * 문서 본문. props 만 받고 서버도 라우터도 모른다.
 *
 * 슬래시 메뉴 · 포맷 툴바는 아직 BlockNote 기본 **표면**이다. 슬래시 메뉴는
 * 목록만 우리 것으로 넘긴다 — 목차 한 줄을 더하려는 것이고, 그리는 것은
 * BlockNote 다 (slash-menu-items.tsx). 사이드 메뉴도 생김새는 기본이고, 우리 것은
 * 세로 위치(blocknote-side-menu.ts) · ⠿ 를 눌렀을 때의 블록 선택 · 그때 뜨는
 * 메뉴의 목록 셋이다 (BlockSideMenu · BlockDragHandleMenu).
 *
 * 표면 자체를 SEED 로 갈아 끼우는 것은 F3 §2 다 (SlashMenu · FormatToolbar).
 */
export function ContentEditor({
  pageId,
  content,
  editable = true,
  onChange,
  onLeaveStart,
  ref,
}: ContentEditorProps) {
  const editor = useContentEditor({ pageId, content });
  const colorScheme = useSeedColorScheme();

  /* 본문 맨 앞에서 위로 나가는 두 키는 확장이 잡고(blocknote-document-boundary.ts),
   * **어디로 갈지만 여기서 채운다.** 확장은 에디터와 함께 한 번만 만들어지는데
   * 이 콜백은 다시 그릴 때마다 새 함수라, 만들 때 넘기면 첫 번째 함수가 영영
   * 박힌다. store 가 그 사이를 잇는 BlockNote 의 자리다.
   *
   * `useExtension` 을 안 쓴다. 그 훅은 컨텍스트에서 에디터를 꺼내는 것이라
   * `BlockNoteView` **안**에서만 돈다 — 여기는 그걸 그리는 바깥이라 던진다.
   * 에디터를 이미 들고 있으니 그냥 물어보면 된다. */
  useEffect(() => {
    editor.getExtension(knocDocumentBoundary)?.store.setState({ onLeaveStart });
  }, [editor, onLeaveStart]);

  useImperativeHandle(
    ref,
    () => ({
      focusStart() {
        const first = editor.document[0];
        /* 빈 문서에도 문단 하나는 늘 있다(TrailingNode). 없다면 에디터가 아직
         * 안 선 것이라 커서를 놓을 자리도 없다. */
        if (!first) {
          return;
        }

        editor.focus();
        editor.setTextCursorPosition(first, "start");
      },

      /**
       * 제목에서 `Enter` — **줄을 하나 만든다.** 내려가는 것이 아니다.
       *
       * Notion 은 제목과 본문이 한 판이라 제목 끝의 `Enter` 가 그냥 「다음 줄」이고,
       * 그 줄은 없으면 생긴다. 아래에 이미 글이 있으면 그 위로 빈 줄이 하나 끼고,
       * 있던 글은 밀려 내려간다.
       *
       * **맨 위가 이미 빈 문단이면 그 줄이 곧 새 줄이라 안 만든다.** 안 그러면
       * 새 문서에서 제목을 치고 `Enter` 를 누르는 가장 흔한 경우에 빈 줄이 둘이
       * 되고, 하나가 위에 남는다.
       */
      insertStart() {
        const first = editor.document[0];
        if (!first) {
          return;
        }

        editor.focus();

        const isEmptyParagraph =
          first.type === "paragraph" && Array.isArray(first.content) && first.content.length === 0;

        if (isEmptyParagraph) {
          editor.setTextCursorPosition(first, "start");
          return;
        }

        const [inserted] = editor.insertBlocks([{ type: "paragraph" }], first, "before");
        editor.setTextCursorPosition(inserted, "start");
      },
    }),
    [editor],
  );

  /* 블록을 **하나** 통째로 고른 동안에는 포맷 툴바를 안 띄운다 — block-selection.ts.
   *
   * **여러 줄을 고른 것은 여기 안 걸린다.** 그때는 Notion 도 툴바를 띄우고,
   * ⌘B 가 고른 줄 전부에 걸린다. 굵게를 걸 자리가 없는 것은 블록 하나를
   * 골랐을 때뿐이다.
   *
   * 값이 boolean 이라 다시 그리는 것은 선택이 그 상태로 들고 날 때뿐이다. 본문은
   * ProseMirror 가 들고 있어서 이 리렌더가 문서를 건드리지 않는다. */
  const isBlockSelected = useEditorState({
    editor,
    selector: ({ editor }) => isWholeBlockSelected(editor.prosemirrorState),
  });

  /* 여백에서 사각형을 끄는 동안에도 안 띄운다 — blocknote-marquee-selection.ts.
   *
   * 에디터 **안에서** 시작한 끌기라면 BlockNote 가 스스로 접는다(`view.dom` 의
   * `pointerdown` 을 듣는다). 문서 좌우 빈 판에서 시작한 것은 그 귀에 안
   * 들어와서, 끌고 있는 내내 툴바가 따라다녔다. */
  const isMarquee = useEditorState({
    editor,
    selector: ({ editor }) => isMarqueeDragging(editor.prosemirrorState),
  });

  return (
    /* 좌우 거터를 도로 물린다.
     *
     * EditorSurface 는 measure 720px 안쪽에 56px 을 비워 두는데, BlockNote 도
     * 에디터에 54px 을 자기 몫으로 잡는다. 그냥 두면 110px 이 겹쳐서 본문 폭이
     * 608px 이 아니라 500px 이 된다.
     *
     * 둘 중 BlockNote 쪽을 남긴다. 그 자리가 드래그 핸들의 히트 영역이고,
     * 그건 BlockNote 에 남겨 두기로 한 것이기 때문이다 (DESIGN.md §7).
     * 결과는 54px 거터 — 정한 값보다 2px 좁지만, 그 2px 은 핸들이 앉는
     * 자리라서 SEED 쪽으로 끌고 오면 핸들이 본문을 물고 들어온다. */
    <div className="-mx-doc-gutter">
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={colorScheme}
        onChange={onChange && (() => onChange(toPageContent(editor.document)))}
        /* 기본 사이드 메뉴를 끄고 같은 것을 다시 넣는다. 그려지는 ＋ 와 ⠿ 는
         * BlockNote 기본 그대로고, 우리 것은 자리 계산(blocknote-side-menu.ts) ·
         * ⠿ 를 눌렀을 때의 블록 선택 · ⠿ 메뉴의 목록 셋이다 (BlockSideMenu).
         * (크기와 블록까지의 간격만 CSS 에서 줄인다 — blocknote-bridge.css 맨 아래.) */
        sideMenu={false}
        /* 기본 슬래시 메뉴도 끄고 같은 것을 다시 넣는다. 목록에 목차를 더하려면
         * getItems 를 우리가 넘겨야 하고, 그건 컨트롤러 쪽에만 있다.
         *
         * 표면은 아직 BlockNote 기본이다 — suggestionMenuComponent 를 안 넘기면
         * 기본 메뉴가 그대로 그려진다. SEED 로 갈아 끼우는 것은 F3 §2 이고,
         * 그때 이 자리에 컴포넌트 한 줄이 는다. */
        slashMenu={false}
        /* 포맷 툴바도 끄고 같은 것을 다시 넣는다. 표면은 BlockNote 기본 그대로고
         * (F3 §2 에서 갈아 끼운다), 우리가 바꾸는 것은 **언제 뜨는지** 하나다. */
        formattingToolbar={false}
      >
        <SideMenuController sideMenu={BlockSideMenu} floatingUIOptions={sideMenuFloatingOptions} />
        {/* 목록을 만드는 것은 컴포넌트 밖이다 — slash-menu-items.tsx.
          * 메뉴 본체는 jsdom 에서 안 떠서, 검사할 수 있는 자리가 그쪽뿐이다. */}
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) => filterSuggestionItems(knocSlashMenuItems(editor), query)}
        />
        {/* 컨트롤러를 아예 안 그린다. BlockNote 의 shouldShow 는 선택이 비어 있지
          * 않으면 참이라 블록 선택에서도 툴바가 뜨는데, 그 판단은 확장 안쪽이라
          * 밖에서 못 바꾼다 — 뜨고 나서 숨기는 것보다 안 붙이는 쪽이 깨끗하다. */}
        {!isBlockSelected && !isMarquee && <FormattingToolbarController />}
      </BlockNoteView>
    </div>
  );
}
