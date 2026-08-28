import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { DocumentSurface } from "@/components/DocumentSurface/DocumentSurface";
import { BlockEditor } from "./BlockEditor";
import type { BlockEditorProps } from "./BlockEditor";
import type { KnocPartialBlock } from "./schema";
import { bodyBlock, storyDoc, storyPageId } from "./storyDoc";

/**
 * 문서 **안쪽** 제목 블록. `heading` 한 종류이고 `level` 로 H1~H6 이 갈립니다.
 *
 * | | Notion | 크기 | 마크다운 | 슬래시 |
 * | --- | --- | --- | --- | --- |
 * | H1 | 제목1 | 3em · 48px | `# ` | `/제목1` · `Ctrl+Alt+1` |
 * | H2 | 제목2 | 2em · 32px | `## ` | `/제목2` |
 * | H3 | 제목3 | 1.3em · 20.8px | `### ` | `/제목3` |
 * | H4 | 제목4 | 1em · 16px | `#### ` | `/제목4` |
 * | H5 | — | 0.9em · 14.4px | `##### ` | `/제목5` |
 * | H6 | — | 0.8em · 12.8px | `###### ` | `/제목6` |
 *
 * - **Notion 에는 제목4 까지입니다**(2026-03 에 추가 — `knocspace-parity.md`).
 *   H5 · H6 은 BlockNote 에만 있고, 저희 슬래시 메뉴에는 `소제목` 그룹으로 올라옵니다
 * - **크기와 줄간은 BlockNote 것을 그대로 씁니다** — DESIGN.md §2 · §7. 26 · 20 · 17px
 *   로 줄여 봤지만 본문과의 위계가 눌려서 되돌렸습니다
 * - DESIGN.md 가 값을 정해 둔 것은 H1·H2·H3 뿐입니다. H4 부터는 BlockNote 기본값
 *   그대로고, H4 는 본문(16px)과 크기가 같아 굵기로만 구별됩니다
 * - **페이지 제목 34px 과는 다른 것입니다.** 그건 `PageTitle`(F3 §3) 자리고,
 *   문서가 블록 배열 하나뿐인 BlockNote 에는 아예 없는 개념입니다
 * - 토글 제목(`isToggleable`)은 같은 블록의 속성입니다. Notion 도 BlockNote 도
 *   메뉴에는 H1·H2·H3 만 올려 두지만, 속성 자체는 여섯 단계 다 받습니다
 */

const LEVELS = [1, 2, 3, 4, 5, 6] as const;
type HeadingLevel = (typeof LEVELS)[number];

/* 컨트롤에 찍히는 이름. 값은 숫자 그대로 두고 보이는 글자만 바꾼다 —
 * 블록에 들어가는 것은 `level: 2` 이지 "H2" 가 아니기 때문이다.
 *
 * 숫자 1~6 을 그대로 두면 무엇의 1 인지가 안 보인다. 화면에서도 슬래시 메뉴
 * 에서도 이것들은 H1 · H2 로 불린다. */
const LEVEL_LABELS: Record<HeadingLevel, string> = {
  1: "H1",
  2: "H2",
  3: "H3",
  4: "H4",
  5: "H5",
  6: "H6",
};

/* pageId · content 는 arg 가 아니다. render 가 나머지 arg 로 만들어 넘긴다 — storyDoc.ts. */
type HeadingStoryArgs = Omit<BlockEditorProps, "pageId" | "content"> & {
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

/* component 를 안 적는다. 다른 스토리들과 다른 점이라 이유를 남긴다.
 *
 * 여기서 보여주는 것은 BlockEditor 라는 컴포넌트가 아니라 그 안에 놓인 제목
 * 블록이다. arg 도 컴포넌트 props(pageId · content)가 아니라 블록 props(level ·
 * isToggleable)라, component 를 적으면 스토리북이 arg 와 props 를 맞춰 보다가
 * 어긋난다. BlockEditor 자체의 props 표는 그 컴포넌트 스토리가 생길 때 붙는다. */
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
      description:
        "Notion 이름으로 제목1~제목4. H5 · H6 은 Notion 에 없고 BlockNote 에만 있습니다",
      control: { type: "inline-radio", labels: LEVEL_LABELS },
      options: LEVELS,
      /* 표에는 값이 그대로 보이게 둔다. 컨트롤에 H1 로 찍히니, 블록에 들어가는
       * 것이 숫자라는 걸 어딘가 한 곳에서는 말해 줘야 한다. */
      table: { category: "제목 블록", type: { summary: "1 | 2 | 3 | 4 | 5 | 6" } },
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
      name: "H1~H6 한 번에",
      description: "지금 설정 그대로 여섯 단계를 한 문서에. 사이 간격은 붙여 놔야 보입니다",
      control: "boolean",
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<HeadingStoryArgs>;

/**
 * ### 해 볼 것
 * - **제목** 을 H1 → H6 으로 내려 봅니다. H4 부터는 본문과 크기가 같아 굵기로만 갈립니다
 * - **토글 제목** 을 켜고 제목 왼쪽 화살표를 눌러 봅니다
 * - **H1~H6 한 번에** 로 위계가 실제로 보이는지 확인합니다
 * - 빈 줄에서 `# ` `## ` … 또는 `/제목2`, `Ctrl+Alt+2` 로도 같은 블록이 됩니다.
 *   그렇게 바꾼 결과는 컨트롤에 안 비칩니다(`storyDoc.ts` 의 `storyPageId`)
 * - 위 툴바로 다크로 뒤집어 봅니다. 제목 색은 `blocknote-bridge.css` 가 SEED 로 넘긴 값입니다
 */
export const Playground: Story = {
  render: (args) => (
    /* DocumentSurface 로 감싸는 것은 거터 때문이다. BlockEditor 가 -mx-doc-gutter
     * 로 좌우를 도로 물고 있어서, px-doc-gutter 를 깐 표면 안에 넣어야 실제
     * 문서와 같은 자리에 선다 (DESIGN.md §7).
     *
     * pageId 를 컨트롤 값에서 만드는 이유는 storyPageId 에 적어 뒀다. */
    <DocumentSurface>
      <BlockEditor
        pageId={storyPageId("heading", args.level, args.isToggleable, args.allLevels, args.text)}
        content={headingDoc(args)}
        editable={args.editable}
        onChange={args.onChange}
      />
    </DocumentSurface>
  ),
};
