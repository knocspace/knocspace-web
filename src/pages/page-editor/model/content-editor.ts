import type { ExtensionFactoryInstance } from "@blocknote/core";
import { ko } from "@blocknote/core/locales";
import { syntaxHighlighter } from "@blocknote/code-block";
import { useCreateBlockNote } from "@blocknote/react";
import { editorPlaceholders } from "@/shared/config";
import { knocBlockSelection } from "../lib/blocknote-block-selection";
import { knocDocumentBoundary } from "../lib/blocknote-document-boundary";
import { knocPageKeys } from "../lib/blocknote-page-keys";
import { knocBlockShortcuts } from "./block-shortcuts";
import { toBlockNoteInitialContent, type PageContent } from "./page-content";
import { knocSchema } from "./blocknote-schema";

export interface UseContentEditorOptions {
  /** 문서 한 장. 이 값이 바뀌면 에디터를 새로 만든다. */
  pageId: string;
  /** 처음 한 번만 읽는다. 그 뒤로 문서의 원본은 에디터 쪽이다. */
  content?: PageContent;
  /**
   * F10 자리. 지금은 아무도 안 넘긴다.
   *
   * 미리 열어 두는 이유는 architecture.md 의 네 번째 약속이다 — 협업을 붙일
   * 때 이 훅 안쪽만 바뀌고 쓰는 쪽은 그대로여야 한다.
   *
   * 확장 배열로 받는다. BlockNote 가 주는 withCollaboration()(@blocknote/core/y)
   * 은 확장이 아니라 **options 를 통째로 감싸** y 확장을 얹어 주는 헬퍼라, 그걸
   * 쓰려면 이 훅이 yjs 를 값으로 import 해야 한다. 아직 아무도 안 넘기므로
   * 확장만 받아 두고, 어느 쪽으로 갈지는 F10 에서 정한다.
   */
  collaboration?: ExtensionFactoryInstance[];
}

/**
 * 문서 하나에 붙는 에디터를 만든다. **문서의 원본은 여기서 만든 에디터 하나뿐이다.**
 *
 * 블록을 React state 로 복사하지 않는다. 복사본이 생기는 순간 협업에서 어느
 * 쪽이 맞는지 알 수 없게 된다 (docs/roadmap/architecture.md).
 *
 * deps 가 [pageId] 인 것에 주의. 다른 페이지로 가면 에디터를 새로 만들고,
 * content 가 나중에 바뀌는 것으로는 만들지 않는다 — 서버 응답이 늦게 와서
 * 초기값이 채워지는 경우는 화면 쪽에서 에디터를 늦게 그리는 것으로 푼다.
 */
export function useContentEditor({ pageId, content, collaboration }: UseContentEditorOptions) {
  return useCreateBlockNote(
    {
      schema: knocSchema,
      /* 한국어 UI — 슬래시 메뉴 · 툴바 · 툴팁 전부. 23개 로케일 중 ko 가 있다. */
      dictionary: ko,
      /* 표에서 손으로 할 수 있는 것들. 넷 다 BlockNote 기본이 false 라, 안 켜면
       * 문서에 담긴 헤더 · 병합 · 색은 그려지기만 하고 사용자가 만들지는 못한다.
       *
       * 넷을 갈라 켜지 않는다. 표 하나에서 헤더는 되는데 병합은 안 되는 식이면
       * 되는 것과 안 되는 것의 경계를 사용자가 알 방법이 없다.
       *
       * headers 는 첫 행 · 첫 열 한 겹까지다. 손잡이 메뉴의 항목이 index === 0
       * 에서만 뜨기 때문이고(BlockNote 쪽 제약), 두 겹짜리 헤더는 문서에 값으로
       * 담아야 나온다. */
      tables: {
        headers: true,
        splitCells: true,
        cellBackgroundColor: true,
        cellTextColor: true,
      },
      initialContent: toBlockNoteInitialContent(content),
      /* dictionary 의 placeholders 위에 덮어씌운다(코어가 두 벌을 합친다).
       * 문구의 출처는 DESIGN.md §9 뿐이라 로케일 기본 문장을 그대로 두지 않는다.
       *
       * emptyDocument = 빈 문서 한 줄, default = 포커스가 앉은 빈 블록.
       * 둘 다 같은 문장이다 — 사용자 입장에서 상황이 같다. */
      placeholders: {
        emptyDocument: editorPlaceholders.firstLine,
        default: editorPlaceholders.firstLine,
      },
      /* 블록을 끌 때 「여기에 놓인다」를 가리키는 삽입선 — DESIGN.md §1 · §7.
       *
       * BlockNote 기본은 5px 짜리 #ddeeff 다. §1 이 「커서, 삽입선」을 강조색
       * 하나로 못 박아 뒀는데 이 선만 빠져 있었다 — 표 쪽의 같은 선
       * (.bn-table-drop-cursor)은 이미 우리 색이다.
       *
       * 값은 --knoc-color-drop-indicator 다. 강조색을 그대로 쓰지 않고 60% 로
       * 두는 이유는 knocspace.css 에 적어 뒀다 — 짧게 말하면 본문을 가로지르는
       * 600px 짜리 선이라, 표 안의 짧은 막대와 같은 세기로 두면 문서 위에
       * 보라색 띠가 그어진다.
       *
       * **CSS 가 아니라 여기인 이유.** 이 선은 확장이 만드는 div 에 자리와 크기,
       * 색까지 인라인 style 로 박힌다. 특히 굵기는 좌표 계산에도 쓰여서(경계선
       * 위아래로 width/2 씩) CSS 로는 !important 없이 못 이긴다. 색만 CSS 로
       * 갈라 두면 짝이 흩어지므로, 라이브러리가 열어 둔 옵션 하나로 같이 준다.
       *
       * 3px 은 5px 을 그냥 줄인 값이 아니다. 옅은 색에서 진한 색으로 오면서 같은
       * 굵기가 두 배로 무거워졌다. 블록 사이 여백이 3px 이라(--knoc-editor-block-pad-y)
       * 선이 그 틈을 정확히 채우고, Notion 도 이 자리에서 2~3px 이다.
       *
       * 옵션에 없는 둘 — 둥근 끝과 가로 미끄러짐 — 은 blocknote-bridge.css 맨
       * 아래가 얹는다. */
      dropCursor: {
        width: 3,
        color: "var(--knoc-color-drop-indicator)",
      },
      /* 코드 블록 하이라이트(Shiki). 스키마 쪽 언어 목록과 짝이다 — blocknote-schema.ts.
       *
       * knocBlockSelection 은 블록 선택이다 — 끌어서 여러 줄 고르기와 그 뒤의
       * 키보드 전부(화살표 · Enter · Backspace · ⌘A · ⌘D). BlockNote 는 줄을
       * 넘어가는 선택을 그냥 글자 선택으로 두는데 Notion 은 블록을 잡는다
       * (blocknote-block-selection.ts).
       *
       * knocPageKeys 는 PageUp · PageDown 이다 — 고른 블록이 있으면 선택이,
       * 없으면 커서가 한 화면 움직인다. 그 둘만 화면 좌표를 재야 해서 갈라 뒀다.
       *
       * knocBlockShortcuts 는 블록 **종류**를 바꾸는 것들이다 — 숫자키 전환 ·
       * ⌘Enter · `>` 입력. 스키마를 알아야 해서 이쪽(model)에 산다.
       *
       * knocDocumentBoundary 는 본문 맨 앞에서 제목으로 나가는 `↑` ·
       * `Backspace` 다. 그 둘만 **맨 뒤에** 서야 해서 tiptap 우선순위를 직접
       * 쓰고, 어디로 갈지는 화면이 store 에 채워 준다 (ContentEditor). */
      extensions: [
        syntaxHighlighter,
        knocBlockSelection,
        knocPageKeys,
        knocBlockShortcuts,
        knocDocumentBoundary(),
        ...(collaboration ?? []),
      ],
    },
    [pageId],
  );
}
