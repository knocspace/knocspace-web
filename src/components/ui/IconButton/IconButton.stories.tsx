import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import IconPlusLine from "@karrotmarket/react-monochrome-icon/IconPlusLine";
import IconDot3VerticalLine from "@karrotmarket/react-monochrome-icon/IconDot3VerticalLine";
import IconMagnifyingglassLine from "@karrotmarket/react-monochrome-icon/IconMagnifyingglassLine";
import IconPencilLine from "@karrotmarket/react-monochrome-icon/IconPencilLine";
import IconTrashcanLine from "@karrotmarket/react-monochrome-icon/IconTrashcanLine";
import { IconButton } from "./IconButton";
import type { IconButtonProps } from "./IconButton";

/**
 * 글자 없이 아이콘만 있는 버튼.
 *
 * | size | 자리 | 반경 | 아이콘 |
 * | --- | --- | --- | --- |
 * | 24 | 트리 행 | 4px | 16px |
 * | 32 | 툴바 | 6px | 20px |
 * | 40 | 헤더 | 6px | 24px |
 *
 * - 그 사이 값은 없습니다. **24 만 SEED 밖** — ActionButton 최소가 32px 이라
 *   28px 트리 행에 안 들어갑니다
 * - `ariaLabel` 은 필수. 트리 행이 50개면 같은 이름 50개가 되므로 제목을 넣습니다
 */

/* 패널에서 고를 아이콘. 아이콘은 값이 아니라 컴포넌트라 컨트롤에 그냥은
 * 못 싣는다 — argTypes 의 mapping 이 "이름 → 컴포넌트" 를 대신 이어 준다. */
const ICONS = {
  "＋ 추가": IconPlusLine,
  "⋯ 더 보기": IconDot3VerticalLine,
  "🔍 검색": IconMagnifyingglassLine,
  "✎ 이름 바꾸기": IconPencilLine,
  "🗑 삭제": IconTrashcanLine,
};

/* args 에는 이름만 담고, 컴포넌트는 렌더에서 위 표에서 꺼낸다.
 * (argTypes 의 mapping 을 쓰는 방법도 있지만, 그러면 args 의 타입과 실제 값이
 *  어긋나서 캐스팅이 하나 늘고 스토리를 다른 데서 재사용할 때도 안 따라온다.) */
type IconName = keyof typeof ICONS;

type IconButtonStoryArgs = IconButtonProps & {
  iconName: IconName;
  sideBySide?: boolean;
};

const meta: Meta<IconButtonStoryArgs> = {
  title: "UI/IconButton",
  component: IconButton,
  args: {
    icon: IconPlusLine,
    iconName: "＋ 추가",
    ariaLabel: "하위 페이지 추가",
    size: 32,
    isSelected: false,
    isDisabled: false,
    onClick: fn(),
    sideBySide: false,
  },
  argTypes: {
    icon: { control: false, description: "버튼 안에 그릴 아이콘 컴포넌트" },
    iconName: {
      name: "아이콘 고르기",
      description: "icon 에 넣을 아이콘",
      control: "select",
      options: Object.keys(ICONS),
      table: { category: "스토리 전용" },
    },
    ariaLabel: {
      description: "**화면에 안 보임.** 스크린리더가 읽을 버튼 이름. 비우면 안 그립니다",
      control: "text",
    },
    size: {
      description: "24 트리 행 · 32 툴바 · 40 헤더",
      control: "inline-radio",
      options: [24, 32, 40],
    },
    isSelected: { description: "켜진 상태. 글자·아이콘·배경이 브랜드 색으로" },
    isDisabled: { description: "누를 수 없는 상태" },
    tabIndex: {
      description: "Tab 으로 닿을지. 트리 안에서는 -1",
      control: "number",
    },
    onClick: { description: "눌렀을 때" },
    sideBySide: {
      name: "세 크기 나란히",
      description: "지금 설정 그대로 24 · 32 · 40 을 한 줄에",
      control: "boolean",
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<IconButtonStoryArgs>;

/**
 * ### 해 볼 것
 * - 버튼을 누르면 `isSelected` 가 뒤집힙니다. `isDisabled` 면 안 바뀝니다
 * - **세 크기 나란히** — 셋이 한 식구로 보이는지는 붙여 놔야 보입니다
 * - `ariaLabel` 을 지우면 Accessibility 패널에 위반으로 잡힙니다
 */
export const Playground: Story = {
  render: function PlaygroundStory({ sideBySide, iconName, ...args }) {
    const [, updateArgs] = useArgs<IconButtonStoryArgs>();
    const icon = ICONS[iconName];
    const onClick = () => {
      updateArgs({ isSelected: !args.isSelected });
      args.onClick?.();
    };

    if (sideBySide) {
      return (
        <div className="flex items-center gap-x4">
          {([24, 32, 40] as const).map((size) => (
            <IconButton key={size} {...args} icon={icon} size={size} onClick={onClick} />
          ))}
        </div>
      );
    }

    return <IconButton {...args} icon={icon} onClick={onClick} />;
  },
};
