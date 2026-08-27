import { BlockNoteView } from "@blocknote/mantine";
import { toEditorDoc, type EditorDoc } from "./doc";
import { useEditorDoc } from "./useEditorDoc";
import { useSeedColorScheme } from "./useSeedColorScheme";

/* 라이브러리 CSS. 변수는 여기서 안 건드린다 — SEED 로 되돌려 가리키는 일은
 * styles/blocknote-bridge.css 한 곳뿐이다 (DESIGN.md §7).
 *
 * index.css 가 아니라 이 파일에서 부르는 이유: 이 컴포넌트는 지연 로드라
 * (LazyBlockEditor) 번들러가 CSS 도 같은 청크로 떼어 준다. 문서를 안 여는
 * 화면은 gzip 36KB 인 이 CSS 를 안 받는다 (docs/decisions/f3-blocknote-surface.md). */
import "@blocknote/mantine/style.css";

export interface BlockEditorProps {
  /** 문서 한 장. 바뀌면 에디터를 새로 만든다. */
  pageId: string;
  /** 처음 한 번만 읽는다. 없으면 빈 문서. */
  content?: EditorDoc;
  /** 읽기 전용 — F5 의 보기 권한이 여기로 온다. */
  editable?: boolean;
  /**
   * 내용이 바뀔 때마다. 문서를 덩어리로만 넘긴다.
   *
   * 값을 상태에 담아 두고 다시 content 로 내려보내면 안 된다. 그 순간 문서의
   * 원본이 둘이 된다 (docs/roadmap/architecture.md).
   */
  onChange?: (doc: EditorDoc) => void;
}

/**
 * 문서 본문. props 만 받고 서버도 라우터도 모른다.
 *
 * 슬래시 메뉴 · 포맷 툴바 · 드래그 핸들은 BlockNote 기본 표면 그대로다.
 * SEED 표면으로 갈아 끼우는 것은 F3 §2 다 (SlashMenu · FormatToolbar).
 */
export function BlockEditor({ pageId, content, editable = true, onChange }: BlockEditorProps) {
  const editor = useEditorDoc({ pageId, content });
  const colorScheme = useSeedColorScheme();

  return (
    /* 좌우 거터를 도로 물린다.
     *
     * DocumentSurface 는 measure 720px 안쪽에 56px 을 비워 두는데, BlockNote 도
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
        onChange={onChange && (() => onChange(toEditorDoc(editor.document)))}
      />
    </div>
  );
}
