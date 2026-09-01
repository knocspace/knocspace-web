import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EditorSurface } from "../../EditorSurface/EditorSurface";
import { ContentEditor } from "../ContentEditor";
import type { ContentEditorProps } from "../ContentEditor";
import type { KnocPartialBlock } from "../../../model/blocknote-schema";
import { PALETTE, PALETTE_LABELS, storyDoc, storyPageId } from "./storyDoc";
import type { PaletteColor } from "./storyDoc";

/**
 * 문단. 가장 흔한 블록이고, 새 줄을 만들면 늘 이것으로 시작합니다.
 *
 * | | Notion | BlockNote |
 * | --- | --- | --- |
 * | 블록 | `paragraph` | `paragraph` |
 * | 단축키 | — | `Ctrl+Alt+0` (다른 블록에서 문단으로) |
 * | 색 | 고정 9색 enum | 자유 문자열 — 팔레트를 직접 정할 수 있습니다 |
 * | 정렬 | **없음** | `textAlignment` — 좌 · 중앙 · 우 · 양쪽 |
 *
 * - **정렬은 Notion 에 없는 기능입니다.** BlockNote 가 모든 기본 블록에 얹어 둔 것이라
 *   슬래시 메뉴가 아니라 포맷 툴바에서 바꿉니다
 * - 색은 `textColor` · `backgroundColor` 두 props 입니다. SEED 팔레트로 넘기는 자리는
 *   `blocknote-bridge.css` 한 곳뿐입니다(DESIGN.md §7)
 * - **갈색 · 분홍은 SEED 팔레트에 없어서 BlockNote 기본색 그대로입니다.** 없는 색을
 *   새로 만들면 그게 곧 시스템 밖의 색이 되기 때문입니다(DESIGN.md §1). 컨트롤에서
 *   갈색을 골라 다크로 뒤집어 보면 다른 색들과 결이 다른 것이 보입니다
 * - 인라인 서식(굵게 · 기울임 · 밑줄 · 취소선 · 코드 · 링크)은 블록이 아니라 글자에
 *   붙는 것입니다. 마크다운 표기 `**` `*` `~` `` ` `` 가 그대로 통합니다
 */

const ALIGNMENTS = ["left", "center", "right", "justify"] as const;

const ALIGNMENT_LABELS: Record<(typeof ALIGNMENTS)[number], string> = {
  left: "왼쪽",
  center: "가운데",
  right: "오른쪽",
  justify: "양쪽",
};

type ParagraphStoryArgs = Omit<ContentEditorProps, "pageId" | "content"> & {
  text: string;
  textAlignment: (typeof ALIGNMENTS)[number];
  textColor: PaletteColor;
  backgroundColor: PaletteColor;
  inlineStyles: boolean;
};

/* 인라인 서식 견본. content 를 문자열 대신 배열로 주면 글자마다 style 이 붙는다 —
 * 블록 props 와는 다른 층이라, 색 컨트롤을 바꿔도 이 줄의 서식은 그대로다. */
function inlineSampleBlock(): KnocPartialBlock {
  return {
    type: "paragraph",
    content: [
      { type: "text", text: "굵게", styles: { bold: true } },
      { type: "text", text: " · ", styles: {} },
      { type: "text", text: "기울임", styles: { italic: true } },
      { type: "text", text: " · ", styles: {} },
      { type: "text", text: "밑줄", styles: { underline: true } },
      { type: "text", text: " · ", styles: {} },
      { type: "text", text: "취소선", styles: { strike: true } },
      { type: "text", text: " · ", styles: {} },
      { type: "text", text: "인라인 코드", styles: { code: true } },
      { type: "text", text: " · ", styles: {} },
      {
        type: "link",
        href: "https://www.blocknotejs.org",
        content: "링크",
      },
      { type: "text", text: " · ", styles: {} },
      { type: "text", text: "형광펜", styles: { backgroundColor: "yellow" } },
    ],
  };
}

const meta: Meta<ParagraphStoryArgs> = {
  title: "에디터/문단",
  args: {
    text: "빈 줄에서 바로 쓰기 시작하면 이 블록이 됩니다.",
    textAlignment: "left",
    textColor: "default",
    backgroundColor: "default",
    inlineStyles: true,
    editable: true,
    onChange: fn(),
  },
  argTypes: {
    text: {
      name: "문단 글자",
      description: "한글 줄바꿈은 어절 안쪽에서 끊기지 않습니다(`word-break: keep-all`)",
      control: "text",
      table: { category: "문단 블록" },
    },
    textAlignment: {
      name: "정렬",
      description: "Notion 에는 없고 BlockNote 에만 있는 props 입니다",
      control: { type: "inline-radio", labels: ALIGNMENT_LABELS },
      options: ALIGNMENTS,
      table: { category: "문단 블록" },
    },
    textColor: {
      name: "글자색",
      description: "브릿지가 SEED palette-*-500 으로 넘깁니다. 갈색 · 분홍은 예외",
      control: { type: "select", labels: PALETTE_LABELS },
      options: PALETTE,
      table: { category: "문단 블록" },
    },
    backgroundColor: {
      name: "배경색",
      description: "같은 열의 200 번대입니다. 라이트 · 다크 한 벌로 양쪽이 맞습니다",
      control: { type: "select", labels: PALETTE_LABELS },
      options: PALETTE,
      table: { category: "문단 블록" },
    },
    editable: { description: "끄면 읽기 전용 — F5 의 보기 권한이 여기로 옵니다" },
    onChange: { description: "내용이 바뀔 때마다. Actions 패널에 문서가 통째로 찍힙니다" },
    inlineStyles: {
      name: "인라인 서식 한 줄",
      description: "굵게 · 기울임 · 밑줄 · 취소선 · 코드 · 링크 · 형광펜을 한 줄에",
      control: "boolean",
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<ParagraphStoryArgs>;

/**
 * ### 해 볼 것
 * - **배경색** 을 노랑으로 두고 위 툴바에서 다크로 뒤집어 봅니다. SEED 팔레트가
 *   모드에 따라 뒤집혀서 한 벌로 양쪽이 맞습니다
 * - **글자색** 을 갈색 · 분홍으로 바꿔 봅니다. 이 둘만 BlockNote 기본색입니다
 * - 글자를 끌어 선택하면 포맷 툴바가 뜹니다. 거기서 바꾼 것은 컨트롤에 안 비칩니다
 * - `**굵게**` 처럼 마크다운으로 쳐도 같은 서식이 됩니다
 */
export const Playground: Story = {
  render: ({ text, textAlignment, textColor, backgroundColor, inlineStyles, ...args }) => (
    <EditorSurface>
      <ContentEditor
        {...args}
        pageId={storyPageId("paragraph", text, textAlignment, textColor, backgroundColor, inlineStyles)}
        content={storyDoc([
          {
            type: "paragraph",
            props: { textAlignment, textColor, backgroundColor },
            content: text,
          },
          ...(inlineStyles ? [inlineSampleBlock()] : []),
        ])}
      />
    </EditorSurface>
  ),
};
