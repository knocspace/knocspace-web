import { BlockNoteView } from "@blocknote/mantine";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import {
  FormattingToolbarController,
  SideMenuController,
  SuggestionMenuController,
  useEditorState,
} from "@blocknote/react";
import { isWholeBlockSelected } from "../../lib/block-selection";
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
}

/**
 * 문서 본문. props 만 받고 서버도 라우터도 모른다.
 *
 * 슬래시 메뉴 · 포맷 툴바는 아직 BlockNote 기본 **표면**이다. 슬래시 메뉴는
 * 목록만 우리 것으로 넘긴다 — 목차 한 줄을 더하려는 것이고, 그리는 것은
 * BlockNote 다 (slash-menu-items.tsx). 사이드 메뉴도 생김새는 기본이고, 우리 것은
 * 세로 위치(blocknote-side-menu.ts)와 ⠿ 를 눌렀을 때의 블록 선택(BlockSideMenu)이다.
 *
 * 표면 자체를 SEED 로 갈아 끼우는 것은 F3 §2 다 (SlashMenu · FormatToolbar).
 */
export function ContentEditor({ pageId, content, editable = true, onChange }: ContentEditorProps) {
  const editor = useContentEditor({ pageId, content });
  const colorScheme = useSeedColorScheme();

  /* ⠿ 로 블록을 통째로 고른 동안에는 포맷 툴바를 안 띄운다 — block-selection.ts.
   *
   * 값이 boolean 이라 다시 그리는 것은 선택이 그 상태로 들고 날 때뿐이다. 본문은
   * ProseMirror 가 들고 있어서 이 리렌더가 문서를 건드리지 않는다. */
  const isBlockSelected = useEditorState({
    editor,
    selector: ({ editor }) => isWholeBlockSelected(editor.prosemirrorState),
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
         * BlockNote 기본 그대로고, 우리 것은 자리 계산(blocknote-side-menu.ts)과
         * ⠿ 를 눌렀을 때의 블록 선택(BlockSideMenu) 둘이다. (크기와 블록까지의
         * 간격만 CSS 에서 줄인다 — blocknote-bridge.css 맨 아래.) */
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
        {!isBlockSelected && <FormattingToolbarController />}
      </BlockNoteView>
    </div>
  );
}
