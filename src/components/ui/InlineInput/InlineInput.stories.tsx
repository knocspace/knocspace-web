import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { InlineInput } from "./InlineInput";
import type { InlineInputProps } from "./InlineInput";

/**
 * 제자리 편집. 평소엔 글자, 누르면 그 자리에서 입력칸이 됩니다.
 *
 * | 키 · 동작 | 결과 |
 * | --- | --- |
 * | 더블클릭 | 편집 시작 |
 * | `Enter` · 바깥 클릭 | 확정 |
 * | `Esc` | 취소 |
 *
 * - 편집 상태는 밖에서 갖습니다. 켜는 건 행 메뉴나 `F2` 라 바깥 일입니다
 * - `boxed` 는 트리 행, `bare` 는 문서 제목(테두리도 배경도 없이 캐럿만)
 * - **읽기 ↔ 편집에 글자가 1px 도 안 움직여야 합니다**
 */

/* 글자 스타일은 맥락이 정한다 — 트리 행은 13px(t3), 문서 제목은 32px(t12).
 *
 * 문서 제목의 진짜 크기는 34px 인데 그 토큰이 아직 없다. SEED t 스케일 밖이라
 * F3 에서 --knoc- 로 만든다. 여기서는 제일 가까운 t12 로 보인다 — 임의값
 * 표기를 쓰지 않기 위해서다 (DESIGN.md §4). */
const TEXT_STYLES = ["t3-regular", "t4-regular", "t12-bold"];

type InlineInputStoryArgs = InlineInputProps & {
  frame: "트리 행(사이드바)" | "문서 제목";
};

const meta: Meta<InlineInputStoryArgs> = {
  title: "UI/InlineInput",
  component: InlineInput,
  args: {
    value: "토큰 대조표",
    onCommit: fn(),
    isEditing: false,
    onEditingChange: fn(),
    ariaLabel: "페이지 이름",
    selectOnEdit: true,
    requiredMessage: "이름을 비워 둘 수 없어요",
    variant: "boxed",
    className: "t3-regular",
    frame: "트리 행(사이드바)",
  },
  argTypes: {
    value: { description: "확정돼 있는 글자. 입력 중인 글자는 안에서 듭니다", control: "text" },
    onCommit: { description: "확정될 때. Esc 로는 안 부릅니다" },
    isEditing: { description: "편집 중인지. 부르는 쪽이 갖습니다", control: "boolean" },
    onEditingChange: { description: "편집이 켜지고 꺼질 때" },
    ariaLabel: {
      description: "**화면에 안 보임.** 입력칸 이름. 옆에 라벨을 둘 자리가 없어서 씁니다",
      control: "text",
    },
    selectOnEdit: { description: "편집 시작할 때 전체 선택할지. 제목은 끕니다" },
    requiredMessage: { description: "빈 값이면 확정을 막고 띄울 문구", control: "text" },
    variant: {
      description: "boxed = 트리 행 · bare = 문서 제목",
      control: "inline-radio",
      options: ["boxed", "bare"],
    },
    className: {
      description: "글자 스타일. 크기는 놓이는 맥락이 정합니다",
      control: "select",
      options: TEXT_STYLES,
    },
    frame: {
      name: "놓이는 자리",
      description: "감쌀 자리 — 트리 행 28px / 문서 제목",
      control: "inline-radio",
      options: ["트리 행(사이드바)", "문서 제목"],
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<InlineInputStoryArgs>;

/**
 * ### 해 볼 것
 * - **더블클릭** → 이름 바꾸고 `Enter`. 다시 열어 `Esc`. 그 사이 글자가 안 움직여야 합니다
 * - 다 지우고 `Enter` — `requiredMessage` 가 막습니다. 비우면 빈 이름도 확정됩니다
 * - `variant` 를 bare + **놓이는 자리** 를 문서 제목으로
 */
export const Playground: Story = {
  render: function PlaygroundStory({ frame, ...args }) {
    const [, updateArgs] = useArgs<InlineInputStoryArgs>();

    const field = (
      <InlineInput
        {...args}
        onCommit={(next) => {
          updateArgs({ value: next });
          args.onCommit(next);
        }}
        onEditingChange={(editing) => {
          updateArgs({ isEditing: editing });
          args.onEditingChange(editing);
        }}
      />
    );

    if (frame === "문서 제목") {
      return (
        <div className="flex max-w-measure flex-col gap-x4 rounded-r1 bg-bg-layer-default p-x4">
          {field}
          {/* 제목만 떼어 놓고 보면 32px 이 큰지 작은지 알 수 없다. 본문 16px
            * (t5-regular · DESIGN.md §2) 옆에 둬야 비율이 보인다. 글은 자리를
            * 채우는 것뿐이라 짧게 둔다. */}
          <p className="t5-regular text-fg-neutral">
            SEED 원본은 모바일·터치 기준이라 이 화면에서는 한 단계씩 크다. 트리 행
            28px 에 맞춰 내린 값을 여기에 적어 둔다.
          </p>
        </div>
      );
    }

    return (
      <div className="w-sidebar rounded-r1 bg-bg-layer-basement p-x2">
        <div className="flex h-tree-row items-center gap-x1 px-x1">{field}</div>
      </div>
    );
  },
};
