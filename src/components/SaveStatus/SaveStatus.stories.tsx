import type { Meta, StoryObj } from "@storybook/react-vite";
import { TopBar } from "@/components/TopBar/TopBar";
import type { BreadcrumbItem } from "@/components/Breadcrumb/Breadcrumb";
import { SaveStatus } from "./SaveStatus";
import type { SaveState, SaveStatusProps } from "./SaveStatus";

/**
 * 상단바 오른쪽 끝의 저장 상태. 답하는 질문은 하나입니다 — **"내 글이 저장됐나."**
 *
 * | status | 화면 |
 * | --- | --- |
 * | `idle` | **아무것도 안 그립니다** |
 * | `saving` | 스피너 + "저장 중" |
 * | `saved` | "저장됨" — 2초 뒤 사라집니다 |
 * | `offline` | "오프라인 — 연결되면 저장할게요" |
 *
 * - **넷 다 조용한 회색 한 줄.** 색도 굵기도 버튼도 없습니다
 * - 재시도 중인 동안도 `saving` 입니다. 몇 번째 시도인지는 쓸 정보가 아닙니다
 * - 사람이 손대야 하는 실패는 본문 위 배너로 올립니다
 *   ([ErrorState](?path=/docs/ui-errorstate--docs) 의 `inline`)
 * - "저장 중" 은 스크린리더가 안 읽습니다. 읽을 것은 결과뿐입니다
 */

const CRUMBS: BreadcrumbItem[] = [
  { id: "design", title: "디자인" },
  { id: "tokens", title: "토큰 대조표" },
];

const SAVE_STATES: SaveState[] = ["idle", "saving", "saved", "offline"];

const meta: Meta<SaveStatusProps> = {
  title: "레이아웃/SaveStatus",
  component: SaveStatus,
  args: { status: "saving" },
  argTypes: {
    status: {
      description: "지금 저장 상태. 재시도 중인 동안도 saving 입니다",
      control: "inline-radio",
      options: SAVE_STATES,
    },
  },
};

export default meta;
type Story = StoryObj<SaveStatusProps>;

/**
 * ### 해 볼 것
 * - `saving` → `saved` → 2초 뒤 사라집니다
 * - `idle` 은 회색 글자가 아니라 **아무것도 안 그립니다**
 * - 넷을 넘기면서 **글 쓰는 동안 눈에 안 걸리는지** 봅니다. 걸리면 잘못된 것입니다
 */
export const Playground: Story = {
  render: (args) => (
    <div className="w-full max-w-measure overflow-hidden rounded-r1_5 border border-stroke-neutral-weak bg-bg-layer-default">
      <TopBar crumbs={CRUMBS} saveStatus={args.status} />
      {/* 상단바의 border-b 는 본문과의 경계다. 아래가 비면 프레임 테두리와
        * 겹쳐 두 줄로 읽히므로 본문 자리를 44px 남긴다. */}
      <div className="h-topbar" />
    </div>
  ),
};
