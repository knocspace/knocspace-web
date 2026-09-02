import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EditorSurface } from "../../EditorSurface/EditorSurface";
import { ContentEditor } from "../ContentEditor";
import type { ContentEditorProps } from "../ContentEditor";
import type { KnocPartialBlock } from "../../../model/blocknote-schema";
import { bodyBlock, storyDoc, storyPageId } from "./storyDoc";

/**
 * 목차 — **BlockNote 에 없어서 우리가 만든 첫 블록입니다** (F3 §3).
 * 문서의 제목1·2·3 을 모아 보여주고, 항목을 누르면 그 제목으로 굴러갑니다.
 *
 * ### 규칙
 *
 * | | |
 * | --- | --- |
 * | 모으는 것 | 제목1 · 2 · 3 (스키마가 셋으로 닫혀 있습니다) |
 * | 층 세는 법 | 제목 **크기가 아니라 앞 제목과의 관계** — 1 · 3 · 2 · 3 · 1 이면 0 · 1 · 1 · 2 · 0 |
 * | 들여쓰기 | 층마다 24px |
 * | 빼는 것 | 글자가 빈 제목 |
 * | 찾는 범위 | 접을 수 있는 목록 · 표 안까지 (`children` 을 따라 내려갑니다) |
 * | 긴 제목 | 한 줄로 자릅니다 |
 * | 글자 | 14px · `fg-neutral-muted`, 밑줄은 처음부터 — hover 에만 두면 누를 수 있다는 게 안 보입니다 |
 * | 제목이 없을 때 | 옅은 파랑 띠에 한 줄 안내. 띠가 "여기가 목차 자리" 라는 표시입니다 |
 *
 * ### 담는 것이 없습니다
 *
 * 저장되는 것은 `{ "type": "tableOfContents" }` 한 줄이 전부이고, 화면의 글자는 전부 제목
 * 블록에서 그때그때 셉니다. 사본을 두면 같은 글자가 문서에 두 벌이 되고, F10 협업에서 어느
 * 쪽이 맞는지 알 수 없습니다 (`architecture.md`).
 *
 * ### 슬래시 메뉴
 *
 * **고급** 그룹의 표 바로 아래입니다. `/목차` · `/toc` · `/개요` 로도 걸립니다.
 * 아이콘은 seed-icon 의 `IconDocumentLine` — 680개에 "목차" 라는 이름은 없지만 seed-icon 은
 * 이름이 아니라 **모양** 이라 이것이 Notion 의 목차와 같은 그림입니다 (DESIGN.md §8).
 */

const STARTS = ["제목 있는 문서", "제목 없는 문서", "긴 문서"] as const;
type Start = (typeof STARTS)[number];

type TocStoryArgs = Omit<ContentEditorProps, "pageId" | "content"> & {
  start: Start;
};

function heading(level: 1 | 2 | 3, text: string): KnocPartialBlock {
  return { type: "heading", props: { level }, content: text };
}

/* 목차를 **첫 블록으로 두지 않는다.** 세 갈래 다 앞에 본문 한 줄이 서 있는
 * 이유가 이것이고, 지우면 스토리를 열자마자 목차가 통째로 잡힌 채로 뜬다.
 *
 * 목차는 content: "none" 이라 커서가 못 앉는다(toc-block.ts). 그런 블록이 문서
 * 첫 줄이면 에디터가 처음 잡는 선택이 커서가 아니라 그 노드의 NodeSelection 이
 * 되고, blocknote-bridge.css 의 노드 선택 링이 그려진다 — 구분선·이미지를
 * 통째로 골랐을 때와 같은 자리다. 블록 자체는 멀쩡한데 늘 잡혀 있는 것처럼 보인다.
 *
 * 앞뒤에 본문을 두는 것은 다른 블록 스토리(인용·코드·표·파일)와도 같은 모양이다. */
function startBlocks(start: Start): KnocPartialBlock[] {
  if (start === "제목 없는 문서") {
    /* 안내 문구가 뜨는 상태. 목차를 먼저 넣고 제목을 나중에 치는 순서가
     * 실제로 흔해서, 그때 이 블록이 뭘 기다리는지 보여야 합니다. */
    return [
      bodyBlock("목차 앞에 오는 본문입니다."),
      { type: "tableOfContents" },
      { type: "paragraph", content: "위에 목차가 있고 제목은 아직 없습니다. 아래에 `# ` 를 쳐 보세요." },
      { type: "paragraph", content: "" },
    ];
  }

  if (start === "긴 문서") {
    /* 눌러서 굴러가는 것을 보려면 화면보다 긴 문서가 필요합니다. */
    return [
      bodyBlock("목차 앞에 오는 본문입니다."),
      { type: "tableOfContents" },
      ...Array.from({ length: 6 }, (_, index) => [
        heading(2, `${index + 1}장. 스크롤 확인용 제목`),
        { type: "paragraph", content: "본문이 이만큼 있습니다." } as KnocPartialBlock,
        { type: "paragraph", content: "목차에서 이 장을 누르면 여기로 굴러옵니다." } as KnocPartialBlock,
        { type: "paragraph", content: "" } as KnocPartialBlock,
      ]).flat(),
    ];
  }

  return [
    bodyBlock("목차 앞에 오는 본문입니다."),
    { type: "tableOfContents" },
    heading(1, "제목1 — 가장 왼쪽"),
    { type: "paragraph", content: "제목을 고치면 위 목차가 같이 바뀝니다." },
    heading(2, "제목2 — 한 칸 들어옵니다"),
    heading(3, "제목3 — 두 칸 들어옵니다"),
    { type: "paragraph", content: "본문은 목차에 안 들어갑니다." },
    heading(2, "글자가 아주 길어서 한 줄에 다 안 들어가는 제목은 목차에서 말줄임으로 잘립니다"),
    {
      type: "toggleListItem",
      content: "접힌 자리 안에도 제목이 있습니다",
      children: [heading(3, "접힌 안쪽의 제목3")],
    },
  ];
}

const meta: Meta<TocStoryArgs> = {
  title: "에디터/목차",
  args: {
    start: "제목 있는 문서",
    editable: true,
    onChange: fn(),
  },
  argTypes: {
    editable: { description: "끄면 읽기 전용 — 목차 항목은 그대로 눌립니다" },
    onChange: { description: "제목을 고칠 때마다 찍힙니다. 목차는 문서를 다시 읽습니다" },
    start: {
      name: "시작 상태",
      description: "제목 없는 문서는 안내 문구를, 긴 문서는 눌러서 굴러가는 것을 봅니다",
      control: "inline-radio",
      options: STARTS,
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<TocStoryArgs>;

/**
 * ### 해 볼 것
 * - 제목을 고쳐 봅니다. **한 글자마다** 목차가 따라옵니다
 * - **긴 문서** 로 바꾸고 목차 항목을 눌러 굴러가는지 봅니다
 * - 제목1 바로 밑에 제목3 을 넣어 봅니다. 두 칸이 아니라 **한 칸** 입니다 —
 *   층은 크기가 아니라 앞 제목과의 관계로 셉니다
 * - 제목 블록을 만들고 글자를 안 치면 목차에 안 들어옵니다
 * - **읽기 전용** 을 꺼도 항목은 눌립니다 — 이동은 편집이 아닙니다
 */
export const Playground: Story = {
  render: ({ start, ...args }) => (
    <EditorSurface>
      <ContentEditor
        {...args}
        pageId={storyPageId("toc", start)}
        content={storyDoc(startBlocks(start))}
      />
    </EditorSurface>
  ),
};
