import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "./Spinner";
import type { SpinnerProps } from "./Spinner";

/**
 * 기다리는 동안 도는 원. SEED `ProgressCircle` 을 감쌌습니다.
 *
 * - 크기는 둘뿐 — 16px 은 글자 옆, 24px 은 영역 하나
 * - 0.5초 안에 끝나는 로딩에는 안 붙입니다
 * - 무엇이 올지 알면 [Skeleton](?path=/docs/ui-skeleton--docs) 이 낫습니다
 */

/** props 셋 + 스토리에서만 쓰는 배치용 글자 하나. */
type SpinnerStoryArgs = SpinnerProps & {
  sideText: string;
};

const meta: Meta<SpinnerStoryArgs> = {
  title: "UI/Spinner",
  component: Spinner,
  args: {
    size: "small",
    tone: "neutral",
    label: "불러오는 중",
    sideText: "",
  },
  argTypes: {
    size: {
      description: "16px = 글자 옆 · 24px = 영역 하나",
      control: "inline-radio",
      options: ["small", "medium"],
    },
    tone: {
      description: "도는 부분 색. staticWhite 는 어두운 오버레이 위에서만",
      control: "inline-radio",
      options: ["neutral", "brand", "staticWhite"],
    },
    label: {
      description: "**화면에 안 보임.** 스크린리더가 읽을 이름. 비우면 숨깁니다",
      control: "text",
    },
    sideText: {
      name: "옆에 둘 글자",
      description: "**보이는 쪽.** 스피너 오른쪽에 설 13px 글자",
      control: "text",
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<SpinnerStoryArgs>;

/**
 * ### 해 볼 것
 * - **옆에 둘 글자** 를 채우고 `size` 바꾸기 — 16px 이어야 글자와 키가 맞습니다
 * - `tone` 을 brand 로. 바탕 링이 주황이면 잘못된 것입니다
 * - `label` 과 **옆에 둘 글자** 는 하나만. 둘 다면 두 번 읽힙니다
 */
export const Playground: Story = {
  render: ({ sideText, ...args }) =>
    sideText ? (
      <div className="flex items-center gap-x3">
        <Spinner {...args} />
        <span className="t3-regular text-fg-neutral-muted">{sideText}</span>
      </div>
    ) : (
      <Spinner {...args} />
    ),
};
