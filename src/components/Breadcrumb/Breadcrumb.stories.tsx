import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TopBar } from "@/components/TopBar/TopBar";
import { Breadcrumb } from "./Breadcrumb";
import type { BreadcrumbItem, BreadcrumbProps } from "./Breadcrumb";

/**
 * 상단바 왼쪽에 뜨는 현재 위치. 마지막이 현재 페이지, 그 앞은 눌러서 가는 조상입니다.
 *
 * 좁아지면 순서대로 —
 * 1. **접기** — 5단계부터 `첫 항목 › … › 마지막 둘`. `…` 에 올리면 접힌 제목이 보입니다
 * 2. **줄임** — 그래도 모자라면 **마지막 항목만**. 조상은 안 줄입니다
 *
 * 접기와 줄임은 **남는 폭**의 함수라, 오른쪽 액션까지 있는 진짜 상단바 안에서만
 * 제대로 보입니다.
 */

const 경로: Record<string, BreadcrumbItem[] | null> = {
  "현재 페이지 하나": [{ id: "tokens", title: "토큰 대조표", icon: "🎨" }],
  "2단계": [
    { id: "design", title: "디자인", icon: "📐" },
    { id: "tokens", title: "토큰 대조표", icon: "🎨" },
  ],
  "4단계 (접히기 직전)": [
    { id: "ws", title: "워크스페이스", icon: "🗂" },
    { id: "product", title: "제품 기획", icon: "📌" },
    { id: "design", title: "디자인", icon: "📐" },
    { id: "tokens", title: "토큰 대조표", icon: "🎨" },
  ],
  "5단계 (접힌다)": [
    { id: "ws", title: "워크스페이스", icon: "🗂" },
    { id: "product", title: "제품 기획", icon: "📌" },
    { id: "front", title: "프론트엔드", icon: "🧩" },
    { id: "design", title: "디자인", icon: "📐" },
    { id: "tokens", title: "토큰 대조표", icon: "🎨" },
  ],
  "제목이 아주 길 때": [
    { id: "ws", title: "워크스페이스", icon: "🗂" },
    { id: "product", title: "제품 기획", icon: "📌" },
    { id: "front", title: "프론트엔드", icon: "🧩" },
    { id: "design", title: "디자인", icon: "📐" },
    {
      id: "long",
      title: "SEED 2.5 토큰 이름 대조표와 옛 이름 대응 기록, 그리고 남은 미결정 목록",
      icon: "🎨",
    },
  ],
  "(직접 입력)": null,
};

/** 아이콘을 끈 경로. 지우는 것이지 기본 아이콘으로 바꾸는 게 아니다 */
function withoutIcons(items: BreadcrumbItem[]): BreadcrumbItem[] {
  return items.map(({ id, title }) => ({ id, title }));
}

type BreadcrumbStoryArgs = BreadcrumbProps & {
  preset: string;
  icons: boolean;
};

const meta: Meta<BreadcrumbStoryArgs> = {
  title: "레이아웃/Breadcrumb",
  component: Breadcrumb,
  args: {
    items: 경로["4단계 (접히기 직전)"] ?? [],
    onSelect: fn(),
    preset: "(직접 입력)",
    icons: false,
  },
  argTypes: {
    items: {
      description: "루트부터 현재 페이지까지. 비면 아무것도 안 그립니다",
      control: "object",
    },
    onSelect: { description: "조상을 눌렀을 때. 없으면 글자로만 그립니다" },
    preset: {
      name: "경로 골라 넣기",
      description: "자주 보는 깊이를 items 에 한 번에 넣습니다",
      control: "select",
      options: Object.keys(경로),
      table: { category: "스토리 전용" },
    },
    icons: {
      name: "문서 아이콘",
      description: "유저가 고른 이모지를 붙입니다. **끈 쪽이 지금 앱의 모습**",
      control: "boolean",
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<BreadcrumbStoryArgs>;

/**
 * ### 해 볼 것
 * - **경로** 를 4단계 → 5단계로. 그 순간 가운데가 `…` 로 접힙니다
 * - **제목이 아주 길 때** 로 두고 창을 좁혔다 넓혀 봅니다
 * - **문서 아이콘** 을 켰다 꺼 봅니다. 아이콘 넷이면 80px, 조상 제목 하나 폭입니다.
 *   **끈 쪽이 지금 앱에 나가는 모습**입니다
 */
export const Playground: Story = {
  render: ({ preset, icons, ...args }) => {
    const base = 경로[preset] ?? args.items;
    const items = icons ? base : withoutIcons(base);

    return (
      <div className="w-full max-w-measure overflow-hidden rounded-r1_5 border border-stroke-neutral-weak bg-bg-layer-default">
        <TopBar crumbs={items} onCrumbSelect={args.onSelect} />
        {/* 상단바의 border-b 는 본문과의 경계다. 아래가 비면 프레임 테두리와
          * 겹쳐 두 줄로 읽히므로 본문 자리를 44px 남긴다. */}
        <div className="h-topbar" />
      </div>
    );
  },
};
