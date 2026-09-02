import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EditorSurface } from "../../EditorSurface/EditorSurface";
import { ContentEditor } from "../ContentEditor";
import type { ContentEditorProps } from "../ContentEditor";
import { bodyBlock, storyDoc, storyPageId } from "./storyDoc";

/**
 * 블록 선택 — **줄을 넘어가는 순간 글자가 아니라 블록이 잡힙니다** (Notion 규격).
 *
 * BlockNote 기본은 여기서 그냥 글자 선택입니다. 첫 줄과 끝 줄이 절반만 칠해지고
 * `Backspace` 가 두 줄을 하나로 합칩니다. 그 차이를 메운 것이 이 스토리의 전부입니다.
 *
 * ### 끄는 자리에 따라 둘로 갈립니다
 *
 * | 시작한 자리 | 무엇이 잡히나 | 사각형 |
 * | --- | --- | --- |
 * | 글자 위 | 줄을 **넘어가면** 블록이 통째로 (한 줄 안이면 그냥 글자 선택) | 없음 |
 * | **여백** — 문서 좌우의 빈 판 · 거터 54px · 블록 사이 · 목록 들여쓰기 | 지나간 줄 — **한 줄만 훑어도 통째로** | 있음 |
 *
 * 여백 쪽만 마우스를 직접 듣습니다. 글자 위에서 시작한 끌기는 브라우저가 만든 선택을 블록
 * 경계로 밀어 낼 뿐입니다 (`lib/blocknote-block-selection.ts` · `lib/blocknote-marquee-selection.ts`).
 *
 * ### 키보드
 *
 * | 키 | 하는 일 |
 * | --- | --- |
 * | `Esc` | 커서가 있는 블록을 고릅니다. 한 번 더 누르면 풀고 에디터에서 빠져나갑니다 |
 * | 바깥 클릭 | 고른 블록을 풉니다 — 문서 옆 빈 판 · 사이드바 · 상단바 · 문서 제목 |
 * | `Enter` | 고른 블록 **안으로** 커서를 넣습니다 (여러 줄이면 마지막 줄 끝) |
 * | `Backspace` `Delete` | 고른 블록을 지웁니다 |
 * | `↑` `↓` `←` `→` | 선택을 위/아래 블록 하나로 옮깁니다 |
 * | `shift`+`↑` `↓` | 선택을 한 블록 늘리거나 줄입니다 |
 * | `PageUp` `PageDown` | 한 화면 위/아래로 — 골랐으면 선택이, 아니면 커서가 (`shift` 로 늘립니다) |
 * | `⌘A` | 한 번은 이 블록의 글자, 한 번 더는 문서 전체 |
 * | `⌘D` | 고른 블록을 바로 아래에 복제합니다 |
 * | `⌘C` `⌘X` `⌘V` | 블록 단위로 담고, 지우고, 붙입니다 |
 * | `⌘`+`shift`+`↑` `↓` | 고른 블록을 위/아래로 옮깁니다 (BlockNote 기본) |
 * | `⌘⌥0`~`8` · `Ctrl+Shift+0`~`8` | 블록 종류를 바꿉니다 — Notion 번호 그대로 |
 * | `⌘Enter` | 체크박스를 켜고 끄거나 토글을 열고 닫습니다 |
 *
 * - **선택은 그대로 `TextSelection` 입니다.** 새 선택 종류를 만들지 않아서 복사 · 포맷 툴바 ·
 *   `⠿` 로 끌기가 하나도 안 바뀐 채 그대로 동작합니다 (`lib/block-selection.ts`)
 * - **색도 상자도 `⠿` 로 한 줄을 골랐을 때와 같은 값입니다.** 면이 글줄 상자 **안쪽**이라
 *   **줄마다 갈라져** 보입니다 — Notion 과 같은 그림입니다 (DESIGN.md §7)
 * - 끌기 · `shift`+클릭 · `shift`+화살표가 전부 같은 코드 한 벌을 지납니다
 * - 사각형을 화면 끝까지 끌어도 **문서가 따라 내려가지는 않습니다.** 보이는 데까지 고르고
 *   나머지는 `shift`+`↓` 입니다 (백로그)
 */

type BlockSelectionStoryArgs = Omit<ContentEditorProps, "pageId" | "content">;

const meta: Meta<BlockSelectionStoryArgs> = {
  title: "에디터/블록 선택",
  args: {
    editable: true,
    onChange: fn(),
  },
  argTypes: {
    editable: {
      description: "끄면 고르기와 복사는 되고 지우기 · 복제는 안 됩니다",
    },
    onChange: {
      description: "지우기 · 복제 · 붙여넣기가 문서를 바꿉니다. Actions 패널에서 봅니다",
    },
  },
};

export default meta;
type Story = StoryObj<BlockSelectionStoryArgs>;

/**
 * ### 해 볼 것
 *
 * **끌기**
 * - 첫 줄 가운데에서 셋째 줄 가운데까지 끌어 봅니다. 세 줄이 **통째로** 잡힙니다 —
 *   반쯤 칠해진 줄이 없어야 합니다. 그대로 되끌면 선택이 **줄어야** 합니다
 * - 한 줄 **안에서만** 끌어 봅니다. 그건 그냥 글자 선택입니다
 * - 첫 줄을 누르고 다섯째 줄을 `shift`+클릭 — 사이가 전부 잡힙니다
 *
 * **여백에서 끌기**
 * - 글 **왼쪽 바깥**(⠿ 가 뜨는 자리)에서 아래로 끌어 봅니다. 사각형이 지나간 줄이 잡힙니다
 * - 여백에서 **한 줄 높이만** 짧게 훑어도 그 줄이 **통째로** 잡혀야 합니다 —
 *   글자 위에서 끌었을 때와 다른 점이 이것입니다
 * - 고른 다음 아무 데나 클릭하면 풀립니다. `⠿` 와 스크롤 막대만 **안 풉니다** — 에디터 UI 입니다
 *
 * **키보드**
 * - 아무 줄에서 `Esc` 로 한 줄을 잡고 `shift`+`↓`. **두 줄이 다 칠해져야 합니다**
 * - 골라 둔 채로 `Enter`. 커서가 그 줄 **안**으로 들어갑니다 (BlockNote 기본은 아래에 빈 줄을 만듭니다)
 * - `⌘A` 를 두 번. 한 번은 그 줄의 글자, 한 번 더는 문서 전체입니다
 *
 * **고른 것 전부에 걸리는 것**
 * - 여러 줄을 골라 놓고 `⌘⌥5`(윈도우 `Ctrl+Shift+5`) · `⌘D` · `⠿` 메뉴의 「삭제」 · 「전환」
 * - 두 줄을 골라 `⌘X` — 그 자리에 **빈 줄이 안 남아야** 합니다. `⌘C` · `⌘V` 는 두 줄이 두 줄로 붙습니다
 * - 여러 줄을 고르면 **포맷 툴바가 뜹니다.** 한 줄만 골랐을 때는(`Esc` · `⠿`) 안 뜹니다
 * - 줄과 줄 **사이**를 봅니다. 줄마다 갈라져 보여야 합니다 — 사이가 메워지면 안 됩니다
 *
 * 표 안에서 셀을 끌어 고르는 것은 표 **한 블록** 안이라 블록 선택이 아닙니다.
 * 제목 줄과의 경계(첫 줄 맨 앞 `Backspace`)와 문서 좌우의 빈 판은 스토리에 셸이 없어
 * 실제 화면에서 봅니다.
 */
export const Playground: Story = {
  render: (args) => (
    <EditorSurface>
      <ContentEditor
        {...args}
        pageId={storyPageId("block-selection")}
        content={storyDoc([
          { type: "heading", props: { level: 1 }, content: "여기서부터 끌어 보세요" },
          bodyBlock("첫 줄 가운데에서 아래로 끌면, 줄을 넘어가는 순간 통째로 잡힙니다."),
          { type: "quote", content: "인용도 같이 잡힙니다." },
          { type: "bulletListItem", content: "글머리 기호 목록" },
          {
            type: "toggleListItem",
            content: "접을 수 있는 목록 — 펼치고 ↓ 로 안쪽에 들어가 보세요",
            children: [
              bodyBlock("안쪽 줄 하나."),
              bodyBlock("안쪽 줄 둘. 여기서 shift+↑ 를 눌러 보세요."),
            ],
          },
          { type: "numberedListItem", content: "번호 매기기 목록" },
          { type: "checkListItem", content: "체크리스트" },
          {
            type: "table",
            content: {
              type: "tableContent",
              rows: [
                { cells: ["셀 두 개를", "끌어 보세요"] },
                { cells: ["블록 선택이", "아닙니다"] },
              ],
            },
          },
          {
            type: "codeBlock",
            props: { language: "typescript" },
            content: "// 코드 블록 안에서 ⌘A 는 코드를 고릅니다",
          },
          bodyBlock("마지막 줄. 여기에 ⌘V 로 붙여 보세요."),
        ])}
      />
    </EditorSurface>
  ),
};
