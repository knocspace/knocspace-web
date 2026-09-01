import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton, TreeSkeleton } from "./Skeleton";
import type { SkeletonProps } from "./Skeleton";

/**
 * 콘텐츠가 오기 전에 그 자리를 대신 차지하는 회색 덩어리.
 *
 * - 무엇이 올지 아는 자리에 씁니다. 모르면 [Spinner](?path=/docs/ui-spinner--docs)
 * - `width` · `height` 는 실제 콘텐츠와 같아야 합니다. 로드 뒤 내용이 튀면 값이 틀린 것
 * - `TreeSkeleton` — 28px 행을 `rows` 개 쌓는 트리 전용 묶음
 */

/** props 셋 + 어떤 묶음으로 볼지 고르는 스토리 전용 스위치. */
type SkeletonStoryArgs = SkeletonProps & {
  preset: "한 줄" | "문서 본문" | "트리(TreeSkeleton)";
  rows: number;
};

const meta: Meta<SkeletonStoryArgs> = {
  title: "UI/Skeleton",
  component: Skeleton,
  args: {
    width: "62%",
    height: 16,
    shape: "text",
    preset: "한 줄",
    rows: 5,
  },
  argTypes: {
    width: { description: "숫자면 px, 문자열이면 CSS 값", control: "text" },
    height: { description: "숫자면 px, 문자열이면 CSS 값", control: "text" },
    shape: {
      description: "text = 글자 줄 · block = 카드 · circle = 아바타",
      control: "inline-radio",
      options: ["text", "block", "circle"],
    },
    preset: {
      name: "묶음",
      description: "실제 화면 조합을 통째로 불러옵니다. 고르면 위 세 값은 무시",
      control: "inline-radio",
      options: ["한 줄", "문서 본문", "트리(TreeSkeleton)"],
      table: { category: "스토리 전용" },
    },
    rows: {
      name: "트리 줄 수",
      description: "TreeSkeleton 줄 수",
      control: { type: "number", min: 1, max: 12 },
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<SkeletonStoryArgs>;

/**
 * ### 해 볼 것
 * - `width` 는 `240`(px)과 `"62%"` 둘 다 받습니다
 * - **묶음 = 문서 본문** — 마지막 줄만 짧습니다. 다 같으면 표처럼 읽힙니다
 * - **묶음 = 트리** — 줄 높이가 트리 행과 같아야 도착해도 안 튑니다
 * - 다크에서도 봅니다. 회색 위 회색이라 한쪽에서만 보이기 쉽습니다
 */
export const Playground: Story = {
  render: ({ preset, rows, ...args }) => {
    if (preset === "문서 본문") {
      return (
        <div className="flex max-w-measure flex-col gap-x3">
          <Skeleton width="62%" height={34} shape="block" />
          <Skeleton width="100%" height={16} />
          <Skeleton width="92%" height={16} />
          <Skeleton width="61%" height={16} />
        </div>
      );
    }

    if (preset === "트리(TreeSkeleton)") {
      return (
        <div className="w-sidebar rounded-r1_5 bg-bg-layer-basement p-dense-3">
          <TreeSkeleton rows={rows} />
        </div>
      );
    }

    return <Skeleton {...args} />;
  },
};
