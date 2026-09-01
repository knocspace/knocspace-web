import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EditorSurface } from "../../EditorSurface/EditorSurface";
import { ContentEditor } from "../ContentEditor";
import type { ContentEditorProps } from "../ContentEditor";
import type { KnocPartialBlock } from "../../../model/blocknote-schema";
import { bodyBlock, storyDoc, storyPageId } from "./storyDoc";

/**
 * 구분선. props 가 하나도 없는 유일한 블록입니다 — 있거나 없거나 뿐입니다.
 *
 * | | Notion | BlockNote |
 * | --- | --- | --- |
 * | 블록 | `divider` | `divider` |
 * | 입력 | `---` | `---` |
 *
 * - 선 색은 브릿지가 `stroke-neutral-muted` 로 덮습니다. BlockNote 가 `#7d797a` 를
 *   박아 둔 자리라 변수로는 안 닿습니다(DESIGN.md §7)
 * - **Notion 은 이 블록을 프레젠테이션 모드에서 슬라이드 구분자로도 씁니다.**
 *   저희는 그 모드가 없어서 구분선은 구분선일 뿐입니다(`knocspace-parity.md`)
 * - 커서가 앉지 않는 블록이라, 지우려면 드래그 핸들 메뉴나 앞줄에서 `Backspace` 입니다
 */

type DividerStoryArgs = Omit<ContentEditorProps, "pageId" | "content"> & {
  layout: "문단 사이" | "연달아 둘" | "문서 맨 앞";
};

const LAYOUTS = ["문단 사이", "연달아 둘", "문서 맨 앞"] as const;

function dividerBlocks(layout: DividerStoryArgs["layout"]): KnocPartialBlock[] {
  const divider: KnocPartialBlock = { type: "divider" };

  if (layout === "연달아 둘") {
    /* 둘을 붙여 두면 블록 하나가 세로로 얼마를 먹는지 보인다. 선은 1px 이지만
     * 블록은 그보다 훨씬 두껍다 — 위아래 여백이 블록 안에 들어 있다. */
    return [bodyBlock("구분선 두 개가 연달아 옵니다."), divider, divider, bodyBlock("여기가 그 뒤입니다.")];
  }

  if (layout === "문서 맨 앞") {
    return [divider, bodyBlock("구분선이 첫 블록이면 위에 커서를 둘 자리가 없습니다.")];
  }

  return [
    bodyBlock("구분선 앞에 오는 본문입니다."),
    divider,
    bodyBlock("구분선 뒤에 오는 본문입니다."),
  ];
}

const meta: Meta<DividerStoryArgs> = {
  title: "에디터/구분선",
  args: {
    layout: "문단 사이",
    editable: true,
    onChange: fn(),
  },
  argTypes: {
    editable: { description: "끄면 읽기 전용 — F5 의 보기 권한이 여기로 옵니다" },
    onChange: { description: "내용이 바뀔 때마다. Actions 패널에 문서가 통째로 찍힙니다" },
    layout: {
      name: "놓이는 자리",
      description: "구분선은 props 가 없어서, 볼 것은 자리와 여백뿐입니다",
      control: "inline-radio",
      options: LAYOUTS,
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<DividerStoryArgs>;

/**
 * ### 해 볼 것
 * - 빈 줄에서 `---` 를 쳐 봅니다. 세 번째 하이픈에서 바로 선이 됩니다
 * - **연달아 둘** 로 두고 위아래 여백이 겹치는지 봅니다
 * - 다크로 뒤집어 봅니다. 선이 배경에 묻히면 안 됩니다
 * - 선 위에 마우스를 올려 드래그 핸들이 잡히는지 봅니다 — 커서는 안 앉지만 블록입니다
 */
export const Playground: Story = {
  render: ({ layout, ...args }) => (
    <EditorSurface>
      <ContentEditor
        {...args}
        pageId={storyPageId("divider", layout)}
        content={storyDoc(dividerBlocks(layout))}
      />
    </EditorSurface>
  ),
};
