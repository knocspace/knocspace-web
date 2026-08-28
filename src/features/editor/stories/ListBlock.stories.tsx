import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { DocumentSurface } from "@/components/DocumentSurface/DocumentSurface";
import { BlockEditor } from "../BlockEditor";
import type { BlockEditorProps } from "../BlockEditor";
import type { KnocPartialBlock } from "../schema";
import { storyDoc, storyPageId } from "./storyDoc";

/**
 * 목록 네 종류. 블록 타입은 다르지만 다루는 법은 같습니다 — `Tab` 으로 들어가고
 * `Shift+Tab` 으로 나오며, 접힌 자식은 `children` 에 들어갑니다.
 *
 * | | Notion | BlockNote | 입력 | 단축키 |
 * | --- | --- | --- | --- | --- |
 * | 글머리 | `bulleted_list_item` | `bulletListItem` | `- ` `+ ` `* ` | `Ctrl+Shift+8` |
 * | 번호 | `numbered_list_item` | `numberedListItem` | `1. ` | `Ctrl+Shift+7` |
 * | 체크박스 | `to_do` | `checkListItem` | `[] ` `[x] ` | `Ctrl+Shift+9` |
 * | 토글 | `toggle` | `toggleListItem` | — | `Ctrl+Shift+6` |
 *
 * - **번호 매기기는 숫자뿐입니다.** Notion 은 `list_format` 으로 알파벳 · 로마자까지
 *   고르지만, BlockNote 는 시작 숫자(`start`)만 받습니다(`knocspace-parity.md`)
 * - 토글만 입력 규칙이 없습니다. 슬래시 메뉴나 단축키로 만듭니다
 * - 체크 표시의 강조색은 `accent-color` 로 SEED 브랜드색을 넘깁니다. 안 걸면 OS 기본
 *   파랑입니다(DESIGN.md §7)
 * - 중첩은 네 종류가 서로 섞입니다 — 글머리 아래에 체크박스를 넣어도 됩니다
 */

const KINDS = ["bulletListItem", "numberedListItem", "checkListItem", "toggleListItem"] as const;
type ListKind = (typeof KINDS)[number];

const KIND_LABELS: Record<ListKind, string> = {
  bulletListItem: "글머리",
  numberedListItem: "번호",
  checkListItem: "체크박스",
  toggleListItem: "토글",
};

type ListStoryArgs = Omit<BlockEditorProps, "pageId" | "content"> & {
  kind: ListKind;
  checked: boolean;
  start: number;
  nested: boolean;
};

/* 항목 하나. 종류마다 의미가 있는 props 만 붙인다 — checked 를 글머리에 넘기면
 * 스키마에 없는 props 라 에디터가 만들어질 때 걸린다. */
function listItem(
  kind: ListKind,
  text: string,
  { checked, start, children }: { checked?: boolean; start?: number; children?: KnocPartialBlock[] },
): KnocPartialBlock {
  if (kind === "checkListItem") {
    return { type: kind, props: { checked: checked ?? false }, content: text, children };
  }
  if (kind === "numberedListItem" && start !== undefined) {
    return { type: kind, props: { start }, content: text, children };
  }
  return { type: kind, content: text, children };
}

function listBlocks({ kind, checked, start, nested }: ListStoryArgs): KnocPartialBlock[] {
  /* 자식은 두 번째 항목에만 단다. 전부 달면 어디가 한 단 들어간 것인지 안 보이고,
   * 토글은 자식이 없으면 화살표를 눌러도 아무 일이 안 일어난다. */
  const children = nested || kind === "toggleListItem"
    ? [listItem(kind, "한 단 들어간 항목 — Tab 으로 만듭니다", { checked: false })]
    : undefined;

  return [
    /* checked 는 첫 항목만 컨트롤을 따른다. 나머지가 늘 꺼져 있어야 켠 것과 끈 것이
     * 한 화면에서 비교된다. */
    listItem(kind, "첫 번째 항목", { checked, start }),
    listItem(kind, "두 번째 항목", { checked: false, children }),
    listItem(kind, "세 번째 항목", { checked: false }),
  ];
}

const meta: Meta<ListStoryArgs> = {
  title: "에디터/목록",
  args: {
    kind: "bulletListItem",
    checked: true,
    start: 1,
    nested: true,
    editable: true,
    onChange: fn(),
  },
  argTypes: {
    kind: {
      name: "목록 종류",
      description: "네 종류가 서로 다른 블록 타입입니다. 포맷 툴바에서 서로 바꿀 수 있습니다",
      control: { type: "inline-radio", labels: KIND_LABELS },
      options: KINDS,
      table: { category: "목록 블록" },
    },
    checked: {
      name: "첫 항목 체크",
      description: "**체크박스일 때만.** 나머지 항목은 늘 꺼져 있습니다",
      control: "boolean",
      table: { category: "목록 블록" },
    },
    start: {
      name: "시작 숫자",
      description: "**번호일 때만.** Notion 의 알파벳 · 로마자는 BlockNote 에 없습니다",
      control: { type: "number", min: 1 },
      table: { category: "목록 블록" },
    },
    nested: {
      name: "한 단 들어간 항목",
      description: "두 번째 항목 아래에 자식을 답니다. 토글은 이 값과 상관없이 늘 답니다",
      control: "boolean",
      table: { category: "목록 블록" },
    },
    editable: { description: "끄면 읽기 전용 — 체크박스도 못 누릅니다" },
    onChange: { description: "내용이 바뀔 때마다. 체크를 눌러도 찍힙니다" },
  },
};

export default meta;
type Story = StoryObj<ListStoryArgs>;

/**
 * ### 해 볼 것
 * - **목록 종류** 를 넷으로 바꿔 봅니다. **시작 숫자** 는 번호에서만, **첫 항목 체크** 는
 *   체크박스에서만 화면이 바뀝니다
 * - 항목 끝에 커서를 두고 `Tab` · `Shift+Tab` — 컨트롤 없이도 단이 바뀝니다
 * - 토글의 화살표를 접었다 펴 봅니다. 접힌 상태는 문서에 저장되지 않습니다
 * - 체크박스를 눌러 보고 Actions 패널에서 `onChange` 가 찍히는지 봅니다
 * - **읽기 전용** 을 끄고 체크박스를 눌러 봅니다 — 안 눌립니다
 */
export const Playground: Story = {
  render: (args) => (
    <DocumentSurface>
      <BlockEditor
        editable={args.editable}
        onChange={args.onChange}
        pageId={storyPageId("list", args.kind, args.checked, args.start, args.nested)}
        content={storyDoc(listBlocks(args))}
      />
    </DocumentSurface>
  ),
};
