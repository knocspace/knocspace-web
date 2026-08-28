import type { ExtensionFactoryInstance } from "@blocknote/core";
import { ko } from "@blocknote/core/locales";
import { syntaxHighlighter } from "@blocknote/code-block";
import { useCreateBlockNote } from "@blocknote/react";
import { editorPlaceholders } from "@/lib/messages";
import { toInitialContent, type EditorDoc } from "./doc";
import { knocSchema } from "./schema";

export interface UseEditorDocOptions {
  /** 문서 한 장. 이 값이 바뀌면 에디터를 새로 만든다. */
  pageId: string;
  /** 처음 한 번만 읽는다. 그 뒤로 문서의 원본은 에디터 쪽이다. */
  content?: EditorDoc;
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
export function useEditorDoc({ pageId, content, collaboration }: UseEditorDocOptions) {
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
      initialContent: toInitialContent(content),
      /* dictionary 의 placeholders 위에 덮어씌운다(코어가 두 벌을 합친다).
       * 문구의 출처는 DESIGN.md §9 뿐이라 로케일 기본 문장을 그대로 두지 않는다.
       *
       * emptyDocument = 빈 문서 한 줄, default = 포커스가 앉은 빈 블록.
       * 둘 다 같은 문장이다 — 사용자 입장에서 상황이 같다. */
      placeholders: {
        emptyDocument: editorPlaceholders.firstLine,
        default: editorPlaceholders.firstLine,
      },
      /* 코드 블록 하이라이트(Shiki). 스키마 쪽 언어 목록과 짝이다 — schema.ts. */
      extensions: [syntaxHighlighter, ...(collaboration ?? [])],
    },
    [pageId],
  );
}
