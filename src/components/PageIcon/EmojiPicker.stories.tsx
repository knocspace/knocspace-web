import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { listEmojiCategories, searchEmoji } from "@/features/editor/emojiSearch";
import { EmojiPicker } from "./EmojiPicker";
import type { EmojiPickerProps } from "./EmojiPicker";

/**
 * 이모지 고르는 판. 평소에는 `PageIcon` 안에서 열리지만, 여기서는 **판만 떼어**
 * 놓고 봅니다.
 *
 * | | 값 | 출처 |
 * | --- | --- | --- |
 * | 폭 | 336px (8열 × 40px + 좌우 8px) | `--knoc-icon-picker-width` |
 * | 목록 높이 | 240px, 안에서 스크롤 | `--knoc-icon-picker-list-height` |
 * | 표면 | `bg-layer-floating` + 그림자 `s3` | 떠 있는 것 — DESIGN.md §3 · §10 |
 * | 이모지 | 24px = SEED `t9` | `--knoc-text-doc-icon-choice` |
 *
 * - **데이터는 진짜입니다.** `features/editor/emojiSearch` 를 그대로 씁니다 —
 *   목록 1,870개와 검색이 실제로 돕니다
 * - **아무것도 안 쳤을 때와 검색했을 때가 다른 목록입니다.** 전자는 카테고리
 *   순서로 구획을 나누고(표정과 사람 → 자연 → …), 후자는 구획 없이 결과만 줍니다
 * - **검색은 영어만 됩니다.** 이모지 데이터의 키워드가 영어뿐이라 `책` · `로켓` 은
 *   0개입니다. 자리 문구로는 알릴 자리가 없어서 **빈 결과 문구**가 이유를 말합니다
 * - **필터에 상자가 없습니다.** 판이 이미 테두리를 두르고 있어서 안에 상자를 또
 *   두면 상자 안의 상자가 됩니다. 테두리도 배경도 밑줄도 없이 캐럿만 남깁니다 —
 *   문서 제목(`PageTitle`)과 같은 원칙입니다 (DESIGN.md §10)
 * - SEED `TextField` 를 쓰지 않는 이유는 `EmojiPicker.tsx` 주석에 있습니다
 */

type PickerStoryArgs = Pick<EmojiPickerProps, "value" | "onPick">;

/* component 를 안 적는다 — HeadingBlock 스토리와 같은 이유다.
 *
 * 여기서 컨트롤로 여는 것은 props 의 일부(value · onPick)뿐이고, 목록과 검색은
 * 컨트롤이 아니라 render 가 진짜 함수로 넘긴다. component 를 적으면 스토리북이
 * arg 와 props 를 맞춰 보다가 빠진 둘 때문에 어긋난다. */
const meta: Meta<PickerStoryArgs> = {
  title: "레이아웃/EmojiPicker",
  args: {
    value: undefined,
    onPick: fn(),
  },
  argTypes: {
    value: {
      description: "지금 고른 것. 격자에서 눌린 상태로 보이고, 있을 때만 `제거` 가 뜹니다",
      control: "text",
    },
    onPick: {
      description: "고르거나 랜덤을 눌렀을 때. `제거` 는 `undefined` 로 옵니다",
    },
  },
};

export default meta;
type Story = StoryObj<PickerStoryArgs>;

/**
 * ### 해 볼 것
 * - 스크롤해서 **구획 이름이 위에 붙어 따라오는지** 봅니다 (표정과 사람 → 자연 → …)
 * - 필터에 `fire` · `book` · `cat` 을 쳐 봅니다
 * - **`책` 처럼 한글을 쳐 봅니다.** 0개가 나오고 이유가 문구로 나옵니다
 * - **지금 고른 것** 에 이모지 하나를 넣으면 `제거` 가 나타나고, 격자에서 그 칸이 눌려 보입니다
 * - `랜덤` 을 여러 번 눌러 봅니다. 지금 것과 같은 것은 안 나옵니다
 * - 위 툴바로 다크로 뒤집어 봅니다 — 표면·그림자·글자색이 전부 토큰입니다
 */
export const Playground: Story = {
  render: (args) => (
    /* 판은 원래 아이콘 아래에 absolute 로 뜬다. 여기서는 붙을 아이콘이 없으므로
     * 그냥 놓고, 대신 문서 바탕색 위에 세워서 표면과 그림자가 보이게 한다. */
    <div className="bg-bg-layer-basement p-x6">
      <EmojiPicker
        value={args.value || undefined}
        onPick={args.onPick}
        listCategories={listEmojiCategories}
        searchEmoji={searchEmoji}
      />
    </div>
  ),
};
