import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import IconPencilLine from "@karrotmarket/react-monochrome-icon/IconPencilLine";
import IconPlusLine from "@karrotmarket/react-monochrome-icon/IconPlusLine";
import IconTrashcanLine from "@karrotmarket/react-monochrome-icon/IconTrashcanLine";
import { Menu } from "./Menu";
import type { MenuAction, MenuPlacement, MenuProps } from "./Menu";

/**
 * 눌러서 여는 목록. 지금은 트리 행의 `⋯` 와 우클릭이 엽니다.
 *
 * | 키 | 하는 일 |
 * | --- | --- |
 * | `Enter` · `Space` | 엽니다 |
 * | `↑` `↓` | 항목 이동. **비활성 항목도 지나갑니다** |
 * | `Esc` | 닫습니다. **포커스가 트리거로 돌아와야 합니다** |
 *
 * - 열림 상태는 밖에서 갖습니다(`open` · `onOpenChange`)
 * - 삭제 같은 항목은 구분선 아래로, 한 메뉴에 하나만
 * - 트리 행의 `⋯` 는 Tab 으로 못 닿습니다. 키보드로 이름 바꾸기·삭제에 가는
 *   길이 이 메뉴 하나뿐입니다
 */

/** 트리 행 메뉴의 실제 구성 — 이름 바꾸기 · 하위 페이지 추가 · (구분선) 삭제 */
const 기본항목: MenuAction[] = [
  { id: "rename", label: "이름 바꾸기", icon: IconPencilLine, onSelect: fn() },
  { id: "add", label: "하위 페이지 추가", icon: IconPlusLine, onSelect: fn() },
  { id: "delete", label: "삭제", icon: IconTrashcanLine, isDestructive: true, onSelect: fn() },
];

const ITEM_SETS = {
  "트리 행(기본)": 기본항목,
  "비활성 섞임": [
    기본항목[0],
    { ...기본항목[1], isDisabled: true },
    기본항목[2],
  ],
  "파괴적 항목 없음": [기본항목[0], 기본항목[1]],
  "아이콘 없음": 기본항목.map((item) => ({ ...item, icon: undefined })),
  "항목 하나": [기본항목[0]],
};

type ItemSetName = keyof typeof ITEM_SETS;

type MenuStoryArgs = MenuProps & {
  itemSet: ItemSetName;
};

/* 스토리용 트리거. 실제 앱에서는 트리 행의 ⋯ (IconButton 24) 가 이 자리다 —
 * 여기서는 Tab 으로 닿아야 키보드 확인이 되므로 일반 버튼으로 둔다. */
const 트리거 = (
  <button
    type="button"
    className="knoc-focus-ring t3-bold rounded-r1_5 border border-stroke-neutral-weak px-x3 py-x2 text-fg-neutral"
  >
    행 메뉴 열기
  </button>
);

/* Floating UI 는 열둘을 알지만 Menu 는 모서리 여덟만 연다. 가운데 맞춤 넷을
 * 왜 닫았는지는 Menu.tsx 의 MenuPlacement 주석에 있다. 여기 배열이 그 타입과
 * 어긋나면 MenuPlacement[] 대입에서 컴파일이 깨진다. */
const PLACEMENTS: MenuPlacement[] = [
  "bottom-start",
  "bottom-end",
  "top-start",
  "top-end",
  "right-start",
  "right-end",
  "left-start",
  "left-end",
];

const meta: Meta<MenuStoryArgs> = {
  title: "UI/Menu",
  component: Menu,
  args: {
    items: 기본항목,
    itemSet: "트리 행(기본)",
    open: false,
    onOpenChange: fn(),
    placement: "bottom-start",
    gutter: 4,
    children: 트리거,
  },
  argTypes: {
    items: {
      control: false,
      description: "메뉴 항목. isDestructive 는 구분선 아래로, 한 메뉴에 하나만",
    },
    itemSet: {
      name: "항목 고르기",
      description: "items 에 넣을 조합",
      control: "select",
      options: Object.keys(ITEM_SETS),
      table: { category: "스토리 전용" },
    },
    open: { description: "열려 있는지. 부르는 쪽이 갖습니다", control: "boolean" },
    onOpenChange: { description: "열고 닫힐 때. Esc · 바깥 클릭 · 항목 선택 포함" },
    placement: {
      description: "뜨는 자리. 자리가 없으면 반대쪽으로 뒤집힙니다",
      control: "select",
      options: PLACEMENTS,
    },
    gutter: {
      description: "트리거와의 거리(px)",
      control: { type: "range", min: 0, max: 24, step: 1 },
    },
    children: { control: false, description: "메뉴를 여는 트리거. 요소 하나여야 합니다" },
  },
};

export default meta;
type Story = StoryObj<MenuStoryArgs>;

/**
 * ### 해 볼 것
 * - **키보드로** 열어 봅니다. Tab → `Enter` → `↑` `↓` → `Esc`
 * - `open` 을 켜 두고 규격을 봅니다 — 항목 30px, 글자 13px, 구분선
 * - **항목 고르기 = 비활성 섞임** 으로 두고 `↑` `↓` 로 지나가 봅니다
 * - `placement` · `gutter` 로 뜨는 자리를 옮겨 봅니다
 */
export const Playground: Story = {
  render: function PlaygroundStory({ itemSet, ...args }) {
    const [, updateArgs] = useArgs<MenuStoryArgs>();
    return (
      /* 트리거를 가운데에 둔다. 왼쪽 위에 붙어 있으면 flip 이 개입할 일이
       * 없어서, 창을 줄여도 뒤집히는 걸 못 본다. */
      <div className="flex min-h-96 items-center justify-center">
        <Menu
          {...args}
          items={ITEM_SETS[itemSet]}
          onOpenChange={(open) => {
            updateArgs({ open });
            args.onOpenChange(open);
          }}
        >
          {트리거}
        </Menu>
      </div>
    );
  },
};
