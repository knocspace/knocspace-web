import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EditorSurface } from "../../EditorSurface/EditorSurface";
import { ContentEditor } from "../ContentEditor";
import type { ContentEditorProps } from "../ContentEditor";
import type { TableCellProps } from "@blocknote/core";
import type { KnocPartialBlock } from "../../../model/blocknote-schema";
import { bodyBlock, storyDoc, storyPageId } from "./storyDoc";

/**
 * 표. **기본 블록이 아니라 `blocknote-schema.ts` 에서 따로 넣은 블록입니다.**
 *
 * | | Notion | BlockNote |
 * | --- | --- | --- |
 * | 블록 | `table` + `table_row` 로 두 겹 | `table` 한 겹에 `tableContent` |
 * | 헤더 행 · 열 | 있음 | `headerRows` · `headerCols` — 켜고 끄기가 아니라 **개수** |
 * | 셀 병합 | 있음 | `colspan` · `rowspan` |
 * | 셀 안 | 인라인 콘텐츠 | 인라인 콘텐츠 — **블록은 못 넣습니다** |
 *
 * - **헤더로 바꾸기 · 셀 병합 · 셀 배경색 · 셀 글자색은 에디터 옵션(`tables`)입니다.** 넷 다
 *   BlockNote 기본은 꺼져 있고 `useContentEditor` 에서 켰습니다. 옵션은 **사용자가 만들 수
 *   있는지**만 정하고, 문서에 이미 담긴 값은 옵션과 상관없이 그려집니다 — 아래 컨트롤이 그쪽입니다
 * - 손잡이 메뉴의 헤더 항목은 **첫 행 · 첫 열에서만** 뜹니다. 두 겹짜리 헤더는 `headerRows` 에
 *   값을 담아야 나옵니다
 * - 열 너비는 `columnWidths` 로 저장됩니다. 화면에서 경계를 끌면 이 값이 바뀝니다
 */

type TableStoryArgs = Omit<ContentEditorProps, "pageId" | "content"> & {
  headerRow: boolean;
  headerCol: boolean;
  merged: boolean;
  cellColors: boolean;
  narrowFirstColumn: boolean;
};

/* 색이나 병합이 붙는 칸. 그냥 문자열만 넘겨도 칸이 되고, 두 모양이 한 줄에
 * 섞여도 된다 — props 가 필요한 칸만 이렇게 편다. */
function cell(text: string, props: Partial<TableCellProps>) {
  return { type: "tableCell" as const, props, content: text };
}

function tableBlock({
  headerRow,
  headerCol,
  merged,
  cellColors,
  narrowFirstColumn,
}: TableStoryArgs): KnocPartialBlock {
  const 색: Partial<TableCellProps> = cellColors
    ? { backgroundColor: "yellow", textColor: "red" }
    : {};

  /* 둘째 줄만 컨트롤을 따른다. 나머지 줄은 늘 밋밋해서, 켠 것과 안 켠 것이
   * 한 표 안에서 견줘진다. */
  const 둘째줄 = merged
    ? /* colspan 을 주면 그 칸이 오른쪽을 먹는다. 먹힌 칸은 배열에서 빼야 한다 —
       * 안 빼면 열이 하나 더 있는 표가 된다. */
      [cell("제목", 색), cell("제목1 ~ 제목3 · level 1~3", { ...색, colspan: 2 })]
    : [cell("제목", 색), cell("제목1 ~ 제목3", 색), cell("level: 1~3", 색)];

  return {
    type: "table",
    content: {
      type: "tableContent",
      /* 헤더는 "몇 줄까지가 헤더인지" 를 숫자로 갖는다. 켜고 끄는 값이 아니라
       * 개수라서, 두 줄짜리 헤더도 만들 수 있다. */
      headerRows: headerRow ? 1 : undefined,
      headerCols: headerCol ? 1 : undefined,
      /* undefined 면 자동. 첫 칸만 좁혀서, 저장된 폭과 자동 폭이 한 표 안에서
       * 어떻게 섞이는지 보이게 한다. */
      columnWidths: narrowFirstColumn ? [120, undefined, undefined] : undefined,
      rows: [
        { cells: ["블록", "Notion", "BlockNote"] },
        { cells: 둘째줄 },
        { cells: ["인용", "quote", "quote"] },
        { cells: ["콜아웃", "callout", "없음 — 직접 만듭니다"] },
      ],
    },
  };
}

const meta: Meta<TableStoryArgs> = {
  title: "에디터/표",
  args: {
    headerRow: true,
    headerCol: false,
    merged: false,
    cellColors: false,
    narrowFirstColumn: true,
    editable: true,
    onChange: fn(),
  },
  argTypes: {
    headerRow: {
      name: "헤더 행",
      description: "첫 줄을 머리글로. 값은 개수(`headerRows`)라 두 줄짜리도 됩니다",
      control: "boolean",
      table: { category: "표 블록" },
    },
    headerCol: {
      name: "헤더 열",
      description: "첫 칸 열을 머리글로(`headerCols`). Notion 에도 있는 기능입니다",
      control: "boolean",
      table: { category: "표 블록" },
    },
    merged: {
      name: "셀 병합",
      description: "둘째 줄의 오른쪽 두 칸을 하나로(`colspan: 2`)",
      control: "boolean",
      table: { category: "표 블록" },
    },
    cellColors: {
      name: "셀 색",
      description: "둘째 줄에 셀 배경·글자색. 블록 색과 달리 **칸마다** 붙습니다",
      control: "boolean",
      table: { category: "표 블록" },
    },
    narrowFirstColumn: {
      name: "첫 열 좁게",
      description: "첫 열만 120px 로 고정(`columnWidths`). 나머지는 자동입니다",
      control: "boolean",
      table: { category: "표 블록" },
    },
    editable: { description: "끄면 읽기 전용 — 열 너비도 못 끕니다" },
    onChange: { description: "내용이 바뀔 때마다. 열 너비를 끌어도 찍힙니다" },
  },
};

export default meta;
type Story = StoryObj<TableStoryArgs>;

/**
 * ### 해 볼 것
 * - **헤더 행** · **헤더 열** 을 켜 봅니다. 글자 굵기는 BlockNote 것이고 배경은 우리가 얹은 것입니다
 * - **헤더 열** 과 **셀 색** 을 같이 켜 봅니다. 둘째 줄 첫 칸은 회색이 아니라 **노랑이 이깁니다** —
 *   회색은 색을 안 고른 머리글에만 깔립니다
 * - **셀 병합** 을 켜 봅니다. 둘째 줄이 두 칸에서 한 칸으로 붙습니다
 * - 표 안 손잡이를 눌러 봅니다 — 행 · 열 추가와 삭제에 **`행 제목` · `열 제목` · 색** 이 붙습니다
 * - 칸 안에서 `Tab` — 다음 칸으로, 마지막 칸에서는 줄이 하나 생깁니다
 */
export const Playground: Story = {
  render: (args) => (
    <EditorSurface>
      <ContentEditor
        editable={args.editable}
        onChange={args.onChange}
        pageId={storyPageId(
          "table",
          args.headerRow,
          args.headerCol,
          args.merged,
          args.cellColors,
          args.narrowFirstColumn,
        )}
        content={storyDoc([
          bodyBlock("표 앞에 오는 본문입니다."),
          tableBlock(args),
          bodyBlock("표 뒤에 오는 본문입니다."),
        ])}
      />
    </EditorSurface>
  ),
};
