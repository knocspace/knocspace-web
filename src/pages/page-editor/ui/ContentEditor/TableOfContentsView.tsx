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

/** 층마다 왼쪽으로 16px. comfy-3 · comfy-6 이고 셋째 층이 끝이다 (제목은 1·2·3). */
const INDENT: Record<number, string> = {
  1: "ps-0",
  2: "ps-comfy-3",
  3: "ps-comfy-6",
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
    <nav contentEditable={false} aria-label={tableOfContentsLabels.title} className="w-full">
      {headings.length === 0 ? (
        /* 빈 화면 컴포넌트를 쓰지 않는다. 문서 안에 든 블록 하나가 아이콘과
         * 제목을 세우면 그 자리만 화면처럼 읽힌다 (DESIGN.md §9). */
        <p className="text-fg-neutral-muted">{tableOfContentsLabels.empty}</p>
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
    <li className={INDENT[entry.level]}>
      <button
        type="button"
        onClick={onSelect}
        /* 한 줄로 자른다. 긴 제목이 두세 줄로 접히면 목차의 층이 안 보인다 —
         * 들여쓰기 16px 보다 접힌 줄이 눈에 먼저 띈다. 잘려도 읽어 주는 쪽에는
         * 글자가 다 간다(버튼 이름이 곧 제목이다). */
        className="block w-full truncate rounded-r1 px-dense-2 py-dense-1 text-left
          text-fg-neutral hover:bg-bg-neutral-weak-alpha hover:underline knoc-focus-ring"
      >
        {entry.text}
      </button>
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
