import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ErrorState } from "./ErrorState";
import type { ErrorStateProps } from "./ErrorState";
import { errorMessages } from "@/lib/messages";
import type { Message } from "@/lib/messages";

/**
 * 불러오지 못했을 때 그 자리에 대신 뜨는 화면.
 *
 * | variant | 자리 |
 * | --- | --- |
 * | `default` | 화면 전체 |
 * | `compact` | 사이드바 240px |
 * | `inline` | 본문 안 한 영역. SEED PageBanner, 설명 없음 |
 *
 * - **빨간 아이콘을 안 씁니다.** 빈 화면과의 구별은 아이콘 모양과 버튼이 만듭니다.
 *   색은 `inline` 에서만
 * - 문구는 원인별로 갈립니다 — 권한이 없으면 "다시 시도" 가 답이 아닙니다.
 *   404 는 `emptyMessages.notFound` 쪽입니다
 */

type PresetName =
  | "서버 오류(5xx)"
  | "오프라인"
  | "다시 시도했는데 또 실패"
  | "권한 없음"
  | "영역 하나만 실패"
  | "(직접 입력)";

/** §9 에 확정된 문구. subject 는 못 불러온 대상 — 트리면 "목록", 문서면 "페이지". */
const 문구: Record<PresetName, Message | null> = {
  "서버 오류(5xx)": errorMessages.server("목록"),
  오프라인: errorMessages.offline,
  "다시 시도했는데 또 실패": errorMessages.retryFailed,
  "권한 없음": errorMessages.forbidden,
  "영역 하나만 실패": errorMessages.inline("표"),
  "(직접 입력)": null,
};

type ErrorStateStoryArgs = ErrorStateProps & {
  preset: PresetName;
  frame: "본문 영역" | "사이드바 240px";
};

const meta: Meta<ErrorStateStoryArgs> = {
  title: "UI/ErrorState",
  component: ErrorState,
  args: {
    title: "목록을 불러오지 못했어요",
    description: ["서버가 응답하지 않았어요.", "잠시 뒤 다시 시도해 주세요."],
    action: "다시 시도",
    variant: "default",
    onAction: fn(),
    preset: "(직접 입력)",
    frame: "본문 영역",
  },
  argTypes: {
    title: { description: "무슨 일이 일어났는지 한 문장", control: "text" },
    description: {
      description: "제목 아래 설명. **문장마다 한 칸씩**. inline 에서는 안 그립니다",
      control: "object",
    },
    action: { description: "버튼 글자. 비우면 버튼 없음", control: "text" },
    variant: {
      description: "default = 전면 · compact = 사이드바 · inline = 영역 하나",
      control: "inline-radio",
      options: ["default", "compact", "inline"],
    },
    onAction: { description: "버튼을 눌렀을 때" },
    preset: {
      name: "실제 문구",
      description: "messages.ts 의 확정 문구로 제목·설명·버튼을 덮어씁니다",
      control: "select",
      options: Object.keys(문구),
      table: { category: "스토리 전용" },
    },
    frame: {
      name: "놓이는 자리",
      description: "감쌀 상자 — 본문 220px / 사이드바 240px",
      control: "inline-radio",
      options: ["본문 영역", "사이드바 240px"],
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<ErrorStateStoryArgs>;

/**
 * ### 해 볼 것
 * - `variant` 를 default → inline → compact 로. inline 만 색을 씁니다
 * - `action` 을 비우면 버튼이 사라집니다
 * - **실제 문구 = 다시 시도했는데 또 실패** — "다시 시도" 를 접고 "홈으로" 를 줍니다
 */
export const Playground: Story = {
  render: ({ preset, frame, ...args }) => {
    const 확정 = 문구[preset];
    const props: ErrorStateProps = 확정
      ? { ...args, title: 확정.title, description: 확정.description, action: 확정.action }
      : args;

    if (frame === "사이드바 240px") {
      return (
        <div className="w-sidebar rounded-r1 bg-bg-layer-basement">
          <ErrorState {...props} />
        </div>
      );
    }

    return (
      <div className="flex max-w-measure" style={{ minHeight: 220 }}>
        <ErrorState {...props} />
      </div>
    );
  },
};
