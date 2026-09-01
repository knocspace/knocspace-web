import { useEditorState, type ReactCustomBlockRenderProps } from "@blocknote/react";
import { tableOfContentsLabels } from "@/shared/config";
import type { KnocBlock } from "../../model/blocknote-schema";
import { collectHeadings, type TocEntry } from "../../model/table-of-contents";
import type { tableOfContentsConfig } from "../../model/toc-block";

/**
 * 목차 블록이 그려지는 모양. 스펙에 꽂히는 자리는 toc-block.ts 다.
 *
 * **문서를 읽기만 한다.** 목차는 자기 안에 아무것도 담지 않고(content: "none"),
 * 화면에 있는 것은 전부 제목 블록에서 그때그때 계산한 것이다. 제목을 고치면
 * 목차가 따라 바뀌고, 저장되는 것은 "여기에 목차가 있다" 는 사실 하나뿐이다.
 *
 * 사본을 두지 않는 이유는 architecture.md 의 첫 번째 약속이다 — 문서의 원본은
 * 에디터 하나다. 제목 글자를 목차 블록의 props 에 복사해 두면 그 순간 같은
 * 글자가 문서에 두 벌이 되고, F10 에서 두 사람이 같은 제목을 고칠 때 어느 쪽이
 * 맞는지 알 방법이 없어진다.
 */

export type TableOfContentsRenderProps = ReactCustomBlockRenderProps<
  typeof tableOfContentsConfig
>;

/**
 * 층마다 왼쪽으로 24px. comfy-5 · comfy-7 이고 셋째 층이 끝이다 (제목은 1·2·3).
 *
 * 16px 에서 올렸다. 목차 항목은 같은 크기의 글자가 줄줄이 서는 목록이라, 한 칸이
 * 16px 이면 층이 "들여쓴 것" 이 아니라 "줄이 삐뚤어진 것" 으로 보인다. 트리 행
 * 들여쓰기(14px)보다 넓은 것도 같은 이유다 — 저쪽은 접기 화살표와 아이콘이 층을
 * 같이 말해 주지만, 목차에는 자리뿐이다.
 *
 * **키는 제목 크기가 아니라 층수(depth)다.** 제목3 이 늘 두 칸인 것이 아니라,
 * 그 위에 제목2 가 있었으면 두 칸이고 제목1 밑에 바로 오면 한 칸이다. 층수를
 * 세는 곳은 model/table-of-contents.ts 의 withDepth 다.
 *
 * **거는 자리가 li 가 아니라 그 안의 div 다.** BlockNote 가 본문에 이걸 박아
 * 두기 때문이다 —
 *
 *   .bn-default-styles :is(p, h1…h6, li) { margin: 0; padding: 0 }
 *
 * 그 선언은 에디터 청크가 들고 오는 style.css 에 있고 **cascade layer 밖**이다.
 * 우리 유틸리티는 @layer utilities 안이라, 명시도를 아무리 올려도 layer 밖에
 * 그냥 진다 (global.css 의 layer 순서). li 에 ps-comfy-3 을 걸면 클래스는
 * 붙는데 padding 은 0 으로 남는다 — 실제로 그래서 층이 안 보였다.
 *
 * div 는 저 목록에 없다. 한 겹 넣는 것으로 끝나고, 브리지에 자손 선택자를
 * 새로 만들지 않아도 된다 (DESIGN.md §7 — 목록에 있는 것만 쓴다).
 */
const INDENT: Record<number, string> = {
  0: "ps-0",
  1: "ps-comfy-5",
  2: "ps-comfy-7",
};

/**
 * 제목 블록을 찾아 그 자리로 굴린다.
 *
 * 라우터도 해시도 안 쓴다. 같은 화면 안에서 자리만 옮기는 것이라 주소가 바뀔
 * 일이 아니고, 문서 안 블록 id 를 주소에 올리면 그게 곧 공개 계약이 된다.
 *
 * 상단바(44px)에 가리는 것은 여기서 안 막는다. 스크롤 컨테이너가 자기
 * scroll-padding-top 으로 그만큼 비워 두고 있다 (app/ui/AppLayout.tsx) —
 * 가려지는 이유가 상단바에 있으므로 셸이 아는 값으로 푼다.
 */
function scrollToHeading(editor: TableOfContentsRenderProps["editor"], id: string) {
  const target = editor.domElement?.querySelector(`[data-id="${id}"]`);
  if (!(target instanceof HTMLElement)) return;

  /* 움직임을 줄여 달라고 한 사용자에게는 안 굴리고 바로 옮긴다. 스크롤은
   * 화면 전체가 움직이는 것이라 애니메이션 중에 가장 크게 걸린다. */
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export function TableOfContentsView({ editor }: TableOfContentsRenderProps) {
  /* 문서가 바뀔 때만 다시 센다. 기본값 "all" 은 커서가 움직여도 부르는데,
   * 목차는 선택과 아무 상관이 없어서 타이핑 한 글자마다 헛일이 된다.
   *
   * 훅이 결과를 deep-equal 로 견줘서, 제목이 아닌 곳을 고치는 동안에는
   * 목록이 같은 값으로 나와 다시 그리지 않는다. */
  const headings = useEditorState({
    editor,
    on: "change",
    /* 스펙이 넘겨주는 editor 는 **자기 블록 하나짜리 스키마**로 타입이 좁다 —
     * createReactBlockSpec 이 Record<Config["type"], Config> 로 묶기 때문이다.
     * 실제로 들어오는 것은 문서 전체를 든 에디터라 값은 맞고 타입만 좁다. */
    selector: ({ editor }) => collectHeadings(editor.document as unknown as KnocBlock[]),
  });

  return (
    /* contentEditable={false} — 안에 버튼이 있는 블록이라 이게 없으면
     * ProseMirror 가 이 DOM 을 문서 내용으로 보고 커서를 들여보낸다.
     * 코드 블록의 언어 메뉴와 같은 이유다 (CodeBlockView.tsx). */
    /* 글자 크기는 nav 한 곳에서 정한다 — 항목도 안내 띠도 같이 따라온다.
     * 본문 16px 이 아니라 t4(14px)고, 값은 knocspace.css 에 있다. */
    <nav
      contentEditable={false}
      aria-label={tableOfContentsLabels.title}
      className="w-full text-toc-entry"
    >
      {headings.length === 0 ? (
        /* 빈 화면 컴포넌트를 쓰지 않는다. 문서 안에 든 블록 하나가 아이콘과
         * 제목을 세우면 그 자리만 화면처럼 읽힌다 (DESIGN.md §9) — 여기는 한
         * 줄짜리 안내 띠다.
         *
         * 옅은 파랑으로 칠하는 이유는 **자리를 보이게 하려는 것**이다. 글자만
         * 두면 아직 빈 목차 블록이 본문 한 줄과 구별되지 않아서, 방금 넣은
         * 블록이 어디 있는지 안 보인다. 띠가 곧 "여기가 목차 자리" 라는
         * 표시고, 제목을 하나 넣는 순간 목록으로 바뀌면서 사라진다.
         *
         * 상태색 중 informative 를 쓰는 것은 DESIGN.md §1 이 열어 둔 그대로다
         * — 경고도 오류도 아닌 안내다. 잠깐 있는 것이라 테두리는 안 두른다.
         *
         * p 가 아니라 div 다. 한 문장이라 p 가 맞지만, BlockNote 가 본문의 p
         * 에도 padding: 0 을 layer 밖에서 박아서 띠의 안쪽 여백이 통째로
         * 날아간다 — 들여쓰기와 같은 이유다 (INDENT). */
        <div className="rounded-r1 bg-bg-informative-weak px-dense-4 py-dense-2
          text-fg-neutral-muted">
          {tableOfContentsLabels.empty}
        </div>
      ) : (
        <ul className="list-none p-0">
          {headings.map((entry) => (
            <TocRow
              key={entry.id}
              entry={entry}
              onSelect={() => scrollToHeading(editor, entry.id)}
            />
          ))}
        </ul>
      )}
    </nav>
  );
}

function TocRow({ entry, onSelect }: { entry: TocEntry; onSelect: () => void }) {
  return (
    <li>
      {/* 들여쓰기를 지는 div. li 에 걸면 BlockNote 의 padding: 0 에 진다 (INDENT) */}
      <div className={INDENT[entry.depth]}>
        <button
          type="button"
          onClick={onSelect}
          /* 한 줄로 자른다. 긴 제목이 두세 줄로 접히면 목차의 층이 안 보인다 —
           * 들여쓰기 24px 보다 접힌 줄이 눈에 먼저 띈다. 잘려도 읽어 주는 쪽에는
           * 글자가 다 간다(버튼 이름이 곧 제목이다).
           *
           * **밑줄은 처음부터 그어 둔다.** hover 에만 두면 누를 수 있다는 것이
           * 마우스를 얹기 전에는 안 보인다 — 목차는 본문과 같은 색·같은 크기의
           * 글자라 밑줄 말고는 링크임을 알릴 표시가 없고, 마우스가 없는 쪽(터치·
           * 키보드)에는 hover 가 아예 오지 않는다.
           *
           * 밑줄 색은 글자보다 옅게 둔다. 목록 전체에 그어지는 선이라 글자와
           * 같은 진하기면 층(들여쓰기)보다 밑줄이 먼저 읽힌다.
           *
           * 글자는 fg-neutral 이 아니라 **fg-neutral-muted** 다. 목차는 본문을
           * 가리키는 표지판이지 본문이 아니라서, 제목들과 같은 진하기면 문서
           * 맨 위에서 제일 진한 덩어리가 된다. 한 단계 물러선 회색이 본문에
           * 자리를 내준다.
           *
           * 여기서 더 옅은 fg-neutral-subtle 로는 안 간다. 라이트에서 #868b94
           * 라 흰 바탕 대비가 3.2:1 이고, 이 크기 글자에 필요한 4.5:1 에 못
           * 미친다 (muted 는 #555d6d, 7.5:1). 누르는 것이라 더 그렇다.
           *
           * hover 에서 fg-neutral 로 진해진다. 배경만 깔면 옅은 회색 글자가
           * 옅은 회색 배경에 얹혀 오히려 흐려진다. */
          className="block w-full truncate rounded-r1 px-dense-2 py-dense-1 text-left
            text-fg-neutral-muted underline decoration-stroke-neutral-muted
            underline-offset-2 hover:bg-bg-neutral-weak-alpha hover:text-fg-neutral
            knoc-focus-ring"
        >
          {entry.text}
        </button>
      </div>
    </li>
  );
}

/**
 * 내보내는 HTML. 버튼은 빼고 목록만 남긴다.
 *
 * 훅을 안 쓴다. 내보내기는 그 순간의 문서 한 장을 찍는 것이라 다시 그릴 일이
 * 없고, 이 컴포넌트는 에디터 밖(복사·내보내기 경로)에서도 불린다.
 */
export function TableOfContentsExternalHTML({ editor }: TableOfContentsRenderProps) {
  const headings = collectHeadings(editor.document as unknown as KnocBlock[]);

  return (
    <nav aria-label={tableOfContentsLabels.title}>
      <ul>
        {headings.map((entry) => (
          <li key={entry.id} data-level={entry.level}>
            {entry.text}
          </li>
        ))}
      </ul>
    </nav>
  );
}
