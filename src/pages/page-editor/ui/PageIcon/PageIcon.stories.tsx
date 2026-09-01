import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EditorSurface } from "@/pages/page-editor";
import { PageTitle } from "../PageTitle/PageTitle";
import { listEmojiCategories, searchEmoji } from "../../lib/page-icon-emoji";
import { PageIcon } from "./PageIcon";
import type { PageIconProps } from "./PageIcon";

/**
 * 문서 제목 위에 붙는 아이콘. **얼굴이 둘입니다.**
 *
 * | 아이콘 | 보이는 것 | 높이 |
 * | --- | --- | --- |
 * | 없음 | 🙂 `아이콘 추가` | 24px |
 * | 있음 | 52px 이모지 | 52px + 사방 4px 호버 배경 |
 *
 * 둘 다 **눌러야** 판이 열립니다. 마우스를 올리는 것만으로 336px 짜리 판이
 * 튀어나오면 지나가기만 해도 화면이 가려집니다.
 *
 * - **「아이콘 추가」는 평상시 안 보이지만 자리는 늘 잡습니다.** 호버할 때만 자리가
 *   생기면 마우스를 올릴 때마다 제목이 아래로 밀립니다
 * - **호버뿐 아니라 `:focus-within` 에도 열립니다.** 호버로만 열면 키보드로는 이
 *   버튼에 닿을 방법이 없습니다 — 감춰진 동안에도 탭 순서에는 남아 있습니다
 * - **감추고 드러내는 것은 이 컴포넌트가 아닙니다.** 「제목 언저리」 는 여기 밖이라
 *   감싸는 쪽(`PageEditorPage`)이 `group` 으로 합니다. 이 스토리도 같은 방식으로 감쌉니다
 * - **왼쪽 끝이 제목과 맞습니다.** 버튼의 호버 여백(4px)을 음수 마진으로 상쇄해서,
 *   호버 배경은 이모지보다 사방 4px 크되 **자리 계산은 이모지 크기 그대로**입니다.
 *   아이콘을 넣고 빼도 왼쪽 끝이 안 움직입니다
 * - 아이콘과 제목 사이는 **10px** 입니다 (DESIGN.md §2)
 * - **이모지는 여기서만 예외입니다.** §8 이 UI 크롬에 이모지를 금지하지만 유저가
 *   고르는 문서 아이콘은 콘텐츠라 빠집니다. 그래서 「아이콘 추가」 버튼의 아이콘은
 *   이모지가 아니라 seed-icon 입니다
 */

type IconStoryArgs = Pick<PageIconProps, "value" | "editable" | "onChange"> & {
  title: string;
};

/* component 를 안 적는다 — PageIconPicker 스토리와 같은 이유다. 목록과 검색은
 * 컨트롤이 아니라 render 가 진짜 함수로 넘긴다. */
const meta: Meta<IconStoryArgs> = {
  title: "문서/PageIcon",
  args: {
    value: undefined,
    editable: true,
    title: "2분기 제품 로드맵",
    onChange: fn(),
  },
  argTypes: {
    value: {
      name: "아이콘",
      description: "비우면 「아이콘 추가」 로 보입니다. 이모지 하나를 넣어 보세요",
      control: "text",
    },
    editable: {
      description: "끄면 읽기 전용 — 눌러도 안 열리고, 아이콘이 없으면 아무것도 안 그립니다",
    },
    onChange: { description: "고르거나 지웠을 때. `제거` 는 `undefined` 로 옵니다" },
    title: {
      name: "제목 글자",
      description: "아이콘과의 간격·왼쪽 정렬을 보려면 제목이 옆에 있어야 합니다",
      control: "text",
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<IconStoryArgs>;

/**
 * ### 해 볼 것
 * - **아이콘을 비운 채** 제목 언저리에 마우스를 올려 봅니다 — 「아이콘 추가」 가 나타나고,
 *   **제목은 안 움직입니다**
 * - 마우스를 치우고 **Tab** 을 눌러 봅니다. 안 보이던 버튼에 포커스가 가면 같이 나타납니다
 * - 눌러서 판을 열고 이모지를 하나 고릅니다. 「아이콘 추가」 가 52px 이모지로 바뀌고
 *   **왼쪽 끝은 그대로** 입니다
 * - 이모지를 다시 눌러 판을 열고 `제거` 를 눌러 봅니다
 * - 판이 열린 채로 **Escape** · **바깥 클릭** 을 해 봅니다. 포커스가 아이콘으로 돌아갑니다
 * - **읽기 전용** 을 꺼 봅니다. 아이콘이 없으면 줄 자체가 사라집니다 — 고를 수 없는
 *   사람에게 「아이콘 추가」 를 보여 줄 이유가 없습니다
 */
export const Playground: Story = {
  /* key 로 다시 마운트한다. 아래 Demo 가 값을 자기 상태로 들고 있어서, 컨트롤에서
   * 아이콘을 바꿔도 key 가 없으면 처음 값에 머문다. */
  render: (args) => <Demo key={args.value} {...args} />,
};

/** 제어 컴포넌트라 값을 들고 있는 쪽이 필요하다. 화면에서는 라우트가 그 자리다. */
function Demo({ title, ...args }: IconStoryArgs) {
  const [icon, setIcon] = useState(args.value || undefined);
  const [text, setText] = useState(title);

  return (
    <EditorSurface>
      {/* PageEditorPage 와 같은 구조다. 아이콘과 제목이 한 묶음이고, 감추고 드러내는
        * 것을 이 묶음이 한다 — 제목 위에 마우스를 올렸을 때도 나와야 하기 때문이다. */}
      <div className="group mb-x4">
        <div
          className={`mb-dense-5 ${icon ? "" : "invisible group-hover:visible group-focus-within:visible"}`}
        >
          <PageIcon
            value={icon}
            editable={args.editable}
            onChange={(next) => {
              setIcon(next);
              args.onChange?.(next);
            }}
            listCategories={listEmojiCategories}
            searchEmoji={searchEmoji}
          />
        </div>
        <PageTitle value={text} onChange={setText} />
      </div>
    </EditorSurface>
  );
}
