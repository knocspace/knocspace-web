import type { Meta, StoryObj } from "@storybook/react-vite";
import { useToast } from "./useToast";

/**
 * 화면 아래 가운데에 잠깐 떴다 사라지는 알림. props 가 아니라 훅입니다.
 *
 * ```tsx
 * const toast = useToast();
 * toast.show({ message: "변경 사항을 저장했어요" });
 * toast.show({ message: "페이지를 삭제했어요", actionLabel: "되돌리기", onAction: undo });
 * ```
 *
 * - 문구는 **이미 끝난 일**로. 물어보는 건 [Dialog](?path=/docs/ui-dialog--docs) 자리
 * - **조회 실패에는 안 씁니다.** 토스트는 사라지는데 실패는 사라지면 안 됩니다
 * - 동시에 하나만. 단 **되돌리기가 떠 있는 동안은 안 밀립니다**
 * - 3초, 되돌리기가 붙으면 5초. 마우스를 올리면 멈춥니다
 */

interface ToastStoryArgs {
  message: string;
  actionLabel: string;
  actionResultMessage: string;
}

const meta: Meta<ToastStoryArgs> = {
  title: "UI/Toast",
  args: {
    message: "변경 사항을 저장했어요",
    actionLabel: "",
    actionResultMessage: "되돌렸어요",
  },
  argTypes: {
    message: {
      name: "message",
      description: "뜰 문구. **이미 끝난 일**로 적습니다",
      control: "text",
    },
    actionLabel: {
      name: "actionLabel",
      description: "동작 버튼 글자. 비우면 글자만, 채우면 3초 → 5초",
      control: "text",
    },
    actionResultMessage: {
      name: "동작을 눌렀을 때 뜰 문구",
      description: "되돌린 것도 끝난 일이라 같은 방식으로 알립니다",
      control: "text",
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<ToastStoryArgs>;

const 버튼 =
  "knoc-focus-ring t3-bold rounded-r1_5 border border-stroke-neutral-weak px-x3 py-x2 text-fg-neutral";

/**
 * ### 해 볼 것
 * - **띄우기** — `actionLabel` 을 비우면 글자만, 채우면 버튼이 붙고 5초가 됩니다
 * - 뜬 토스트에 마우스를 올려 두면 안 사라집니다
 * - `actionLabel` 을 채워 띄운 직후 **밀어내기** — 안 밀립니다. 비우고 하면 밀립니다
 */
export const Playground: Story = {
  render: function PlaygroundStory({ message, actionLabel, actionResultMessage }) {
    const toast = useToast();
    const hasAction = actionLabel.trim().length > 0;

    return (
      <div className="flex flex-wrap gap-x3">
        <button
          type="button"
          className={버튼}
          onClick={() =>
            toast.show({
              message,
              ...(hasAction
                ? {
                    actionLabel,
                    onAction: () => toast.show({ message: actionResultMessage }),
                  }
                : null),
            })
          }
        >
          띄우기
        </button>

        <button
          type="button"
          className={버튼}
          onClick={() => toast.show({ message: "이름을 바꿨어요" })}
        >
          다른 토스트로 밀어내기
        </button>
      </div>
    );
  },
};
