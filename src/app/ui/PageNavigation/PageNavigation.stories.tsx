import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { InlineInput, TreeSkeleton } from "@/shared/ui";
import { getVisiblePageNavigationNodes } from "../../model/page-navigation";
import { PageNavigation } from "./PageNavigation";
import type { PageNavigationProps } from "./PageNavigation";
import type { PageNavigationNode } from "../../model/page-navigation";

/**
 * 사이드바의 페이지 목록. 접었다 펼 수 있는 계층 트리입니다.
 *
 * | 키 | 하는 일 |
 * | --- | --- |
 * | `↑` `↓` | 행 이동 |
 * | `→` | 펼치기 / 펼쳐졌으면 첫 자식으로 |
 * | `←` | 접기 / 접혔으면 부모로 |
 * | `Home` `End` | 처음 · 마지막 행 |
 * | `Enter` | 페이지 열기 |
 * | `F2` | 이름 바꾸기 |
 * | 메뉴 키 · `Shift+F10` | 행 메뉴 |
 *
 * - **탭 정지점이 하나**라 Tab 한 번이면 트리를 지나갑니다. 안에서는 화살표로
 * - 행의 `+` · `⋯` 는 Tab 으로 못 닿습니다. 키보드로는 메뉴 키가 유일한 길
 * - `items` 는 **보이는 행만 평평하게** 받습니다. 계층은 `depth` 로만 나타내고,
 *   그 배열은 `getVisiblePageNavigationNodes` 가 만듭니다
 * - 펼침·이름 바꾸기·드래그 상태는 전부 밖에서 받습니다
 */

/* 더미 트리. F4 에서 서버가 준 PageSummary[] 가 이 자리에 온다.
 * depth 가 손으로 적힌 값인 것에 주의 — 컴포넌트는 계층을 계산하지 않는다. */
const 기본트리: PageNavigationNode[] = [
  { id: "product", title: "제품 기획", icon: null, depth: 0, hasChildren: true, isExpanded: true },
  { id: "roadmap", title: "2분기 로드맵", icon: null, depth: 1, hasChildren: true, isExpanded: true },
  { id: "tokens", title: "토큰 대조표", icon: null, depth: 2, hasChildren: false, isExpanded: false },
  { id: "focus", title: "포커스 링 결정", icon: null, depth: 2, hasChildren: false, isExpanded: false },
  { id: "design", title: "디자인 시스템 정리", icon: "🎨", depth: 1, hasChildren: false, isExpanded: false },
  { id: "notes", title: "회의록", icon: null, depth: 0, hasChildren: true, isExpanded: false },
  /* 제목이 빈 페이지 — 만들자마자 아직 아무것도 안 쓴 상태다.
   * 트리가 "새 페이지" 로 대신 그린다. */
  { id: "empty", title: "", icon: null, depth: 0, hasChildren: false, isExpanded: false },
];

/* icon 은 F9 전까지 서버가 늘 null 로 준다. 그래서 폴백(빈 종이)이 사실상
 * 트리의 기본 모습이고, 이모지는 나중 이야기다. */
const 아이콘예시: PageNavigationNode[] = [
  { id: "none", title: "icon: null — 빈 종이", icon: null, depth: 0, hasChildren: false, isExpanded: false },
  { id: "emoji", title: "icon: 📐 — 이모지", icon: "📐", depth: 0, hasChildren: false, isExpanded: false },
  { id: "selected", title: "선택되면 아이콘도 fg-brand", icon: null, depth: 0, hasChildren: false, isExpanded: false },
];

const TREES = { "기본 트리": 기본트리, "아이콘 세 갈래": 아이콘예시 };

const 처음펼친것 = ["product", "roadmap"];

type PageNavigationStoryArgs = PageNavigationProps & {
  tree: keyof typeof TREES;
  rowActions: boolean;
  loading: boolean;
};

const meta: Meta<PageNavigationStoryArgs> = {
  title: "레이아웃/PageNavigation",
  component: PageNavigation,
  args: {
    items: [],
    selectedId: "roadmap",
    onSelect: fn(),
    onToggle: fn(),
    draggingId: null,
    renamingId: null,
    label: "페이지 목록",
    tree: "기본 트리",
    rowActions: true,
    loading: false,
  },
  argTypes: {
    items: {
      control: false,
      description: "보이는 행만, 보이는 순서대로. 접힌 자식은 안 들어갑니다",
    },
    selectedId: { description: "지금 열려 있는 페이지", control: "text" },
    onSelect: { description: "행을 눌렀을 때. 페이지를 여는 건 밖에서 합니다" },
    onToggle: { description: "펼치거나 접을 때. 펼친 목록도 밖에서 듭니다" },
    onMenu: {
      control: false,
      description: "행 메뉴를 열 때(⋯ · 메뉴 키). anchor 는 띄울 기준 요소",
    },
    onAdd: { control: false, description: "`+` 를 눌렀을 때 — 하위 페이지 추가" },
    onRename: { control: false, description: "`F2` 를 눌렀을 때. 켜 달라는 신호만 보냅니다" },
    onContextMenu: { control: false, description: "행을 우클릭했을 때" },
    draggingId: {
      description: "집어 든 행. 40% 로 흐려져 제자리에 남습니다",
      control: "select",
      options: [null, ...기본트리.map((item) => item.id)],
    },
    renamingId: {
      description: "이름 바꾸는 중인 행. 그 행 제목 자리를 renameSlot 이 채웁니다",
      control: "select",
      options: [null, ...기본트리.map((item) => item.id)],
    },
    renameSlot: { control: false, description: "그 행 제목 자리에 넣을 요소(InlineInput)" },
    label: {
      description: "**화면에 안 보임.** 스크린리더가 읽을 트리 이름",
      control: "text",
    },
    tree: {
      name: "원본 트리",
      description: "이 스토리가 넣을 페이지 목록",
      control: "inline-radio",
      options: Object.keys(TREES),
      table: { category: "스토리 전용" },
    },
    rowActions: {
      name: "행 액션 넘기기",
      description: "끄면 호버해도 `+` · `⋯` 가 안 나옵니다",
      control: "boolean",
      table: { category: "스토리 전용" },
    },
    loading: {
      name: "불러오는 중",
      description: "트리 대신 TreeSkeleton 을 그립니다",
      control: "boolean",
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<PageNavigationStoryArgs>;

/**
 * ### 해 볼 것
 * - 트리를 클릭하고 위 표의 키를 눌러 봅니다. Tab 으로 나갔다 오면 있던 행에서 다시 시작
 * - **행 액션 넘기기** 를 끄면 `+` · `⋯` 가 안 나옵니다
 * - `renamingId` 를 고르면 그 행이 입력칸이 됩니다(`F2` 와 같습니다)
 * - `draggingId` 를 고르면 그 행이 40% 로 흐려집니다
 * - **불러오는 중** 을 켰다 꺼도 사이드바 높이가 안 바뀌어야 합니다
 */
export const Playground: Story = {
  render: function PlaygroundStory({ tree, rowActions, loading, ...args }) {
    const [, updateArgs] = useArgs<PageNavigationStoryArgs>();
    const [expanded, setExpanded] = useState<string[]>(처음펼친것);

    const 원본 = TREES[tree];
    const items = getVisiblePageNavigationNodes(원본, expanded);
    const renaming = 원본.find((item) => item.id === args.renamingId);

    const 액션 = rowActions
      ? {
          onAdd: fn(),
          onMenu: fn(),
          onRename: (id: string) => updateArgs({ renamingId: id }),
        }
      : {};

    return (
      /* 사이드바 240px 흉내. 트리는 basement 표면 위에서만 제대로 보인다. */
      <div className="w-sidebar rounded-r1_5 border border-stroke-neutral-muted bg-bg-layer-basement p-dense-3">
        {loading ? (
          <TreeSkeleton rows={5} />
        ) : (
          <PageNavigation
            {...args}
            {...액션}
            items={items}
            onSelect={(id) => {
              updateArgs({ selectedId: id });
              args.onSelect(id);
            }}
            onToggle={(id) => {
              setExpanded((ids) =>
                ids.includes(id) ? ids.filter((each) => each !== id) : [...ids, id],
              );
              args.onToggle(id);
            }}
            renameSlot={
              renaming ? (
                <InlineInput
                  value={renaming.title}
                  onCommit={fn()}
                  isEditing
                  onEditingChange={(editing) => {
                    if (!editing) updateArgs({ renamingId: null });
                  }}
                  ariaLabel="페이지 이름"
                  requiredMessage="이름을 비워 둘 수 없어요"
                  className="t3-regular"
                />
              ) : undefined
            }
          />
        )}
      </div>
    );
  },
};
