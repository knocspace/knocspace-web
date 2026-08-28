import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { DocumentSurface } from "@/components/DocumentSurface/DocumentSurface";
import { BlockEditor } from "../BlockEditor";
import type { BlockEditorProps } from "../BlockEditor";
import { bodyBlock, PALETTE, PALETTE_LABELS, storyDoc, storyPageId } from "./storyDoc";
import type { PaletteColor } from "./storyDoc";

/**
 * 인용. 왼쪽 막대와 흐린 글자로 본문과 갈라집니다.
 *
 * | | Notion | BlockNote |
 * | --- | --- | --- |
 * | 블록 | `quote` | `quote` |
 * | 입력 | `> ` | `> ` · `" ` (따옴표 뒤 공백) |
 * | 단축키 | — | `Ctrl+Alt+Q` |
 *
 * - **막대와 글자색은 브릿지가 SEED 로 넘긴 값입니다.** BlockNote 가 `#7d797a` 를
 *   CSS 에 박아 둬서 변수로는 안 닿고, DESIGN.md §7 이 열어 준 자손 선택자 두 줄로
 *   `fg-neutral-muted` 를 덮습니다
 * - **막대 굵기는 안 건드립니다.** `border-left` 가 아니라 `border-left-color` 만 덮어서,
 *   BlockNote 가 2px 을 3px 로 바꾸면 그 변경이 그대로 따라옵니다
 * - 막대를 글자와 같은 색으로 두는 것도 BlockNote 의 선택 그대로입니다
 * - BlockNote 문서에는 색 props 만 적혀 있지만, 자식 블록도 받습니다
 */

type QuoteStoryArgs = Omit<BlockEditorProps, "pageId" | "content"> & {
  text: string;
  textColor: PaletteColor;
  backgroundColor: PaletteColor;
  nested: boolean;
};

const meta: Meta<QuoteStoryArgs> = {
  title: "에디터/인용",
  args: {
    text: "고칠 수 없는 것을 설명하지 말고, 고칠 수 있게 만들어라.",
    textColor: "default",
    backgroundColor: "default",
    nested: false,
    editable: true,
    onChange: fn(),
  },
  argTypes: {
    text: {
      name: "인용 글자",
      description: "인용 안에서도 굵게 · 링크 같은 인라인 서식이 그대로 통합니다",
      control: "text",
      table: { category: "인용 블록" },
    },
    textColor: {
      name: "글자색",
      description: "기본값일 때만 브릿지의 `fg-neutral-muted` 가 걸립니다",
      control: { type: "select", labels: PALETTE_LABELS },
      options: PALETTE,
      table: { category: "인용 블록" },
    },
    backgroundColor: {
      name: "배경색",
      description: "인용 전체에 깔립니다. 막대까지 덮지는 않습니다",
      control: { type: "select", labels: PALETTE_LABELS },
      options: PALETTE,
      table: { category: "인용 블록" },
    },
    nested: {
      name: "자식 블록",
      description: "인용 안에 문단을 한 줄 더 답니다. 막대가 자식까지 내려옵니다",
      control: "boolean",
      table: { category: "인용 블록" },
    },
    editable: { description: "끄면 읽기 전용 — F5 의 보기 권한이 여기로 옵니다" },
    onChange: { description: "내용이 바뀔 때마다. Actions 패널에 문서가 통째로 찍힙니다" },
  },
};

export default meta;
type Story = StoryObj<QuoteStoryArgs>;

/**
 * ### 해 볼 것
 * - **글자색** 을 기본에서 회색으로 바꿔 봅니다. 브릿지가 덮은 색과 BlockNote 팔레트의
 *   회색이 다른 색이라는 것이 보입니다
 * - 다크로 뒤집어 봅니다. 막대도 글자도 같이 뒤집혀야 합니다
 * - 빈 줄에서 `> ` 또는 `" ` 를 쳐 봅니다. 둘 다 인용이 됩니다
 * - 인용 끝에서 `Enter` 두 번 — 인용을 빠져나옵니다
 */
export const Playground: Story = {
  render: ({ text, textColor, backgroundColor, nested, ...args }) => (
    <DocumentSurface>
      <BlockEditor
        {...args}
        pageId={storyPageId("quote", text, textColor, backgroundColor, nested)}
        content={storyDoc([
          bodyBlock("인용 앞에 오는 본문입니다."),
          {
            type: "quote",
            props: { textColor, backgroundColor },
            content: text,
            children: nested ? [{ type: "paragraph", content: "인용 안에 달린 자식 블록." }] : undefined,
          },
          bodyBlock("인용 뒤에 오는 본문입니다."),
        ])}
      />
    </DocumentSurface>
  ),
};
