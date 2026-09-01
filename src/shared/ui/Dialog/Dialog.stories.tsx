import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { Dialog } from "./Dialog";
import type { DialogProps } from "./Dialog";

/**
 * 진행하기 전에 한 번 물어보는 창. 폭 400px, 딤 위에 뜹니다.
 *
 * - **되돌릴 수 없는 일 앞에서만.** 되돌릴 수 있으면 그냥 하고
 *   [Toast](?path=/docs/ui-toast--docs) 에 되돌리기를 붙입니다
 * - 제목은 질문형, 버튼 글자는 "예" 가 아니라 **무슨 일이 일어나는지**로
 * - Tab 은 창 안에 갇히고 `Esc` · 딤으로 닫힙니다. 닫히면 포커스가 제자리로
 * - **처음 포커스는 `tone` 이 정합니다** — 보통은 확인, `danger` 면 취소
 */

const meta: Meta<DialogProps> = {
  title: "UI/Dialog",
  component: Dialog,
  args: {
    isOpen: false,
    onOpenChange: fn(),
    title: "저장하지 않고 나갈까요?",
    description: ["지금 나가면 방금 쓴 내용이 사라져요."],
    cancelLabel: "계속 쓰기",
    confirmLabel: "나가기",
    onConfirm: fn(),
    tone: "default",
  },
  argTypes: {
    isOpen: { description: "열려 있는지. 부르는 쪽이 갖습니다", control: "boolean" },
    onOpenChange: { description: "닫혀야 할 때. Esc · 딤 · 취소 · 확인 모두" },
    title: { description: "‘…할까요?’ 한 문장", control: "text" },
    description: {
      description: "확인하면 무슨 일이 생기는지. **문장마다 한 칸씩**",
      control: "object",
    },
    cancelLabel: { description: "물러나는 쪽 버튼 글자", control: "text" },
    confirmLabel: { description: "진행하는 쪽 버튼 글자 — ‘예’ 말고 ‘삭제’", control: "text" },
    onConfirm: { description: "확인을 눌렀을 때. 창은 알아서 닫힙니다" },
    tone: {
      description: "danger = 되돌릴 수 없는 일. 처음 포커스가 취소로 갑니다",
      control: "inline-radio",
      options: ["default", "danger"],
    },
  },
};

export default meta;
type Story = StoryObj<DialogProps>;

/**
 * ### 해 볼 것
 * - **열기** 로 열고 `Esc` 로 닫습니다. 포커스가 열기 버튼에 돌아와야 합니다
 * - `tone` 을 danger 로 두고 **열자마자 Enter** — 취소가 눌려야 맞습니다
 * - `description` 칸을 늘리면 문장이 늘어납니다
 */
export const Playground: Story = {
  render: function PlaygroundStory(args) {
    const [, updateArgs] = useArgs<DialogProps>();
    return (
      <>
        <button
          type="button"
          onClick={() => updateArgs({ isOpen: true })}
          className="knoc-focus-ring t3-bold rounded-r1_5 border border-stroke-neutral-weak px-x3 py-x2 text-fg-neutral"
        >
          열기
        </button>

        <Dialog
          {...args}
          onOpenChange={(open) => {
            updateArgs({ isOpen: open });
            args.onOpenChange(open);
          }}
        />
      </>
    );
  },
};
