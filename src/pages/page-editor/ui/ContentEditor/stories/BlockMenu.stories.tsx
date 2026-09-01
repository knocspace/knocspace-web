import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EditorSurface } from "../../EditorSurface/EditorSurface";
import { ContentEditor } from "../ContentEditor";
import type { ContentEditorProps } from "../ContentEditor";
import { bodyBlock, storyDoc, storyPageId } from "./storyDoc";

/**
 * 블록 손잡이(`⠿`)를 누르면 뜨는 메뉴입니다. **네 줄 — 전환 · 색상 · 복제 · 삭제**
 * (DESIGN.md §9 "블록 메뉴").
 *
 * | | 우리 | BlockNote 기본 |
 * | --- | --- | --- |
 * | 줄 | 전환 · 색상 · 복제 · 삭제 | 삭제 · 색깔 · 표 머리글 |
 * | 아이콘 | seed-icon 16px — Notion 과 같은 그림 | 없음 |
 * | 폭 | 200px (§10 Menu 기본 폭) | 내용을 따라감 (실제로는 늘 100px) |
 * | 표면 | BlockNote `Generic.Menu` 그대로 | 같음 |
 *
 * - **표면은 안 바꿨습니다.** 판도 줄도 BlockNote 부품이고, 브릿지가 이미 SEED 로
 *   칠하고 있습니다 — 슬래시 메뉴 · 코드 블록 언어 목록과 같은 판입니다(DESIGN.md §7)
 * - **색상 줄이 여는 판은 BlockNote 것 그대로입니다.** 그 줄이 여는 색 스무 칸을 그리는 부품을
 *   `@blocknote/react` 가 밖으로 안 내놔서, 아이콘만 이름 옆에 붙였습니다
 * - **전환 서브메뉴의 아이콘만 BlockNote 기본입니다.** seed-icon 에 제목1·2·3 을
 *   구별할 그림이 없어서고(DESIGN.md §6), 그동안 슬래시 메뉴와 같은 그림을 씁니다
 * - `⠿` 를 누르면 그 블록이 통째로 선택됩니다. 그건 메뉴가 아니라 사이드 메뉴 쪽
 *   일입니다(`BlockSideMenu`)
 */

type BlockMenuStoryArgs = Omit<ContentEditorProps, "pageId" | "content">;

const meta: Meta<BlockMenuStoryArgs> = {
  title: "에디터/블록 메뉴",
  args: {
    editable: true,
    onChange: fn(),
  },
  argTypes: {
    editable: {
      description: "끄면 손잡이가 아예 안 뜹니다 — 메뉴도 같이 사라집니다",
    },
    onChange: {
      description: "전환 · 복제 · 삭제가 문서를 바꿉니다. Actions 패널에서 결과를 봅니다",
    },
  },
};

export default meta;
type Story = StoryObj<BlockMenuStoryArgs>;

/**
 * ### 해 볼 것
 * - 아무 줄에 마우스를 올리고 `⠿` 를 누릅니다. 네 줄이 뜨고, 그 블록이 파랗게 선택됩니다
 * - **전환** 에 마우스를 올립니다. 오른쪽으로 서브메뉴가 열리고, **지금 그 블록인 줄에
 *   체크**가 서 있습니다. 제목1 위에서 열면 「제목1」에 체크입니다
 * - 제목1 을 본문으로 바꿨다가 다시 제목1 로 되돌려 봅니다. 글자는 그대로입니다
 * - 서브메뉴 **맨 아래**의 **접을 수 있는 제목1** 로 바꿔 봅니다. 제목 왼쪽에 꺾쇠가 생기고,
 *   아래 블록들이 그 안으로 들어갑니다. **슬래시 메뉴에는 없는 줄입니다** — `/` 로는 못 만들고
 *   전환으로만 갑니다. 접히는 것 넷(목록 · 제목1·2·3)이 목록 끝에 모여 있습니다
 * - 접은 채로 다시 **제목1** 을 눌러 봅니다. 접기가 풀립니다 — `isToggleable: false` 를 적어서
 *   넘기기 때문이고, 안 적으면 props 가 합쳐지기만 해서 안 풀립니다
 * - **복제** 를 누릅니다. 바로 아래에 같은 줄이 하나 더 생깁니다 — 접힌 목록을 복제하면
 *   안에 든 줄까지 같이 옵니다
 * - 여러 줄을 끌어 고른 뒤 그중 한 줄의 `⠿` 로 **복제** 나 **삭제** 를 누릅니다.
 *   고른 것 전부에 걸립니다
 * - 고른 것 **밖의** 줄에서 열면 그 줄 하나에만 걸립니다
 * - 맨 아래 **코드 블록** 에서 열어 봅니다. **전환 줄이 아예 없습니다** — 글자를 담는
 *   블록끼리만 오갈 수 있어서고, 이미지 · 표 · 구분선 · 목차에서도 같습니다
 * - **색상** 서브메뉴를 열어 봅니다. 아이콘이 이름 왼쪽에 붙었을 뿐, 안쪽은 BlockNote 것입니다
 * - **전환 → 색상 → 전환** 으로 빠르게 오갑니다. 서브메뉴는 **한 번에 하나만** 떠 있어야 합니다 —
 *   BlockNote 는 닫힌 판을 0.5초 동안 남겨 둬서 그냥 두면 둘이 겹칩니다(DESIGN.md §9)
 * - 다크로 뒤집어 봅니다. 판 · 글자 · 호버색이 전부 따라와야 합니다
 *
 * 판이 손잡이 **왼쪽**에 떠야 합니다(Notion 과 같은 쪽). 오른쪽에 뜬다면 왼쪽에 자리가 모자라
 * mantine 이 뒤집은 것입니다 — 스토리 캔버스를 넓히면 돌아옵니다(DESIGN.md §7).
 */
export const Playground: Story = {
  render: (args) => (
    <EditorSurface>
      <ContentEditor
        {...args}
        pageId={storyPageId("block-menu")}
        content={storyDoc([
          { type: "heading", props: { level: 1 }, content: "제목1 위에서 열어 보세요" },
          {
            type: "heading",
            props: { level: 2, isToggleable: true },
            content: "접을 수 있는 제목2 — 전환에만 있는 줄입니다",
            children: [bodyBlock("접힌 제목 안에 든 줄.")],
          },
          bodyBlock("본문 줄입니다. 전환으로 제목이나 목록이 될 수 있어요."),
          { type: "quote", content: "인용도 전환 목록에 있습니다." },
          { type: "bulletListItem", content: "글머리 기호 목록" },
          { type: "numberedListItem", content: "번호 매기기 목록" },
          { type: "checkListItem", content: "체크리스트" },
          {
            type: "toggleListItem",
            content: "접을 수 있는 목록 — 복제하면 안쪽까지 같이 옵니다",
            children: [bodyBlock("접힌 자리에 든 줄.")],
          },
          {
            type: "codeBlock",
            props: { language: "typescript" },
            content: "// 여기서 열면 전환 줄이 없습니다",
          },
        ])}
      />
    </EditorSurface>
  ),
};
