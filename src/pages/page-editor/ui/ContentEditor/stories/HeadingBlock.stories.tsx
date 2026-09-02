import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EditorSurface } from "../../EditorSurface/EditorSurface";
import { ContentEditor } from "../ContentEditor";
import type { ContentEditorProps } from "../ContentEditor";
import type { KnocPartialBlock } from "../../../model/blocknote-schema";
import { bodyBlock, storyDoc, storyPageId } from "./storyDoc";

/**
 * 문서 **안쪽** 제목 블록. `heading` 한 종류이고 `level` 로 H1~H3 이 갈립니다.
 *
 * | | Notion | 크기 | 마크다운 | 슬래시 |
 * | --- | --- | --- | --- | --- |
 * | H1 | 제목1 | 30px | `# ` | `/제목1` · `Ctrl+Alt+1` |
 * | H2 | 제목2 | 24px | `## ` | `/제목2` · `Ctrl+Alt+2` |
 * | H3 | 제목3 | 20px | `### ` | `/제목3` · `Ctrl+Alt+3` |
 *
 * - **H4~H6 은 닫았습니다** (`blocknote-schema.ts` 의 `levels`). H4 는 본문과 크기가 같고
 *   H5·H6 은 더 작아서 위계가 아니라 각주로 읽힙니다. 슬래시 메뉴 · 단축키 · 마크다운 셋이
 *   `levels` 한 곳에서 나와 같이 닫힙니다 — 다만 **붙여넣기는 안 걸러집니다**
 * - **크기는 우리 값입니다** — 30 · 24 · 20px, 줄간 1.3 (Notion 값. DESIGN.md §2).
 *   BlockNote 기본 48 · 32 · 20.8px 은 제목1 이 너무 크게 섭니다
 * - **페이지 제목 40px 과는 다른 것입니다.** 그건 `PageTitle` 자리고, 문서가 블록 배열
 *   하나뿐인 BlockNote 에는 아예 없는 개념입니다
 * - 토글 제목(`isToggleable`)은 같은 블록의 속성이고 세 단계 다 받습니다
 */

const LEVELS = [1, 2, 3] as const;
type HeadingLevel = (typeof LEVELS)[number];

/* 보이는 글자만 바꾸고 값은 숫자 그대로 둔다 — 블록에 들어가는 것은
 * `level: 2` 이지 "H2" 가 아니다. */
const LEVEL_LABELS: Record<HeadingLevel, string> = {
  1: "H1",
  2: "H2",
  3: "H3",
};

/* pageId · content 는 arg 가 아니다. render 가 나머지 arg 로 만들어 넘긴다 — storyDoc.ts. */
type HeadingStoryArgs = Omit<ContentEditorProps, "pageId" | "content"> & {
  level: HeadingLevel;
  isToggleable: boolean;
  text: string;
  allLevels: boolean;
};

/** 제목 한 줄. 접히는 제목이면 접힌 자리에 넣을 블록까지 같이 만든다. */
function headingBlock(level: HeadingLevel, isToggleable: boolean, text: string): KnocPartialBlock {
  return {
    type: "heading",
    props: { level, isToggleable },
    content: text,
    /* 자식이 없으면 화살표를 눌러도 아무 일이 안 일어나서, 토글이 붙었는지
     * 안 붙었는지 화면으로 구별이 안 된다. */
    children: isToggleable
      ? [{ type: "paragraph", content: "접힌 자리에는 아무 블록이나 들어가요." }]
      : undefined,
  };
}

function headingDoc({ level, isToggleable, text, allLevels }: HeadingStoryArgs) {
  return storyDoc(
    allLevels
      ? LEVELS.flatMap((each) => [
          headingBlock(each, isToggleable, `${LEVEL_LABELS[each]} — ${text}`),
          bodyBlock(),
        ])
      : [headingBlock(level, isToggleable, text), bodyBlock()],
  );
}

/* component 를 안 적는다. arg 가 컴포넌트 props 가 아니라 블록 props 라,
 * 적으면 스토리북이 둘을 맞춰 보다가 어긋난다. ContentEditor 의 props 표는
 * `에디터/문서 한 장` 에 있다. */
const meta: Meta<HeadingStoryArgs> = {
  title: "에디터/제목",
  args: {
    level: 1,
    isToggleable: false,
    text: "분기 목표",
    allLevels: false,
    editable: true,
    onChange: fn(),
  },
  argTypes: {
    level: {
      name: "제목",
      description: "Notion 이름으로 제목1~제목3. H4~H6 은 `blocknote-schema.ts` 에서 닫았습니다",
      control: { type: "inline-radio", labels: LEVEL_LABELS },
      options: LEVELS,
      /* 표에는 값이 그대로 보이게 둔다. 컨트롤에 H1 로 찍히니, 블록에 들어가는
       * 것이 숫자라는 걸 어딘가 한 곳에서는 말해 줘야 한다. */
      table: { category: "제목 블록", type: { summary: "1 | 2 | 3" } },
    },
    isToggleable: {
      name: "토글 제목",
      description:
        "켜면 제목 왼쪽에 화살표가 붙고 아래 블록이 그 안으로 접힙니다. BlockNote 메뉴에서는 `접을 수 있는 제목`",
      control: "boolean",
      table: { category: "제목 블록" },
    },
    text: {
      name: "제목 글자",
      description: "제목 줄에 들어갈 글자",
      control: "text",
      table: { category: "제목 블록" },
    },
    editable: { description: "끄면 읽기 전용 — F5 의 보기 권한이 여기로 옵니다" },
    onChange: { description: "내용이 바뀔 때마다. Actions 패널에 문서가 통째로 찍힙니다" },
    allLevels: {
      name: "H1~H3 한 번에",
      description: "지금 설정 그대로 세 단계를 한 문서에. 사이 간격은 붙여 놔야 보입니다",
      control: "boolean",
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<HeadingStoryArgs>;

/**
 * ### 해 볼 것
 * - **제목** 을 H1 → H3 으로 내려 봅니다
 * - **H1~H3 한 번에** 로 위계가 실제로 보이는지 확인합니다
 * - **토글 제목** 을 켜고 제목 왼쪽 화살표를 눌러 봅니다
 * - 빈 줄에서 `# ` · `/제목2` · `Ctrl+Alt+2` 로도 같은 블록이 됩니다.
 *   `#### ` 과 `Ctrl+Alt+4` 는 아무 일도 안 합니다
 */
export const Playground: Story = {
  render: (args) => (
    /* EditorSurface 로 감싸는 것은 거터 때문이다. ContentEditor 가 -mx-doc-gutter
     * 로 좌우를 도로 물고 있어서, px-doc-gutter 를 깐 표면 안에 넣어야 실제
     * 문서와 같은 자리에 선다 (DESIGN.md §7). */
    <EditorSurface>
      <ContentEditor
        pageId={storyPageId("heading", args.level, args.isToggleable, args.allLevels, args.text)}
        content={headingDoc(args)}
        editable={args.editable}
        onChange={args.onChange}
      />
    </EditorSurface>
  ),
};
