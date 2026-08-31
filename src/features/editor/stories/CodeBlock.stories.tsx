import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { DocumentSurface } from "@/components/DocumentSurface/DocumentSurface";
import { BlockEditor } from "../BlockEditor";
import type { BlockEditorProps } from "../BlockEditor";
import { bodyBlock, storyDoc, storyPageId } from "./storyDoc";

/**
 * 코드 블록. 기본 스키마에서 **유일하게 갈아 끼운 블록** 입니다.
 *
 * | | Notion | BlockNote |
 * | --- | --- | --- |
 * | 블록 | `code` | `codeBlock` |
 * | 입력 | ` ``` ` | ` ``` ` · ` ```ts ` 처럼 언어까지 |
 * | 단축키 | — | `Ctrl+Alt+C` |
 * | 언어 | 70여 개 | **46개** (`@blocknote/code-block` 기본 묶음) |
 * | 캡션 | 있음 | **없음** |
 * | 줄바꿈 토글 | 있음 | **없음** |
 *
 * - **코어의 기본 코드 블록은 하이라이트가 꺼져 있고 언어 목록이 비어 있습니다.**
 *   하이라이터(Shiki)가 무거워서 코어에서 빼 뒀기 때문입니다. 언어 목록은
 *   `codeBlock.ts` 가, 하이라이터는 `useEditorDoc` 이 붙입니다
 * - **언어 선택기는 코어 것이 아닙니다.** 코어는 native `<select>` 를 직접 그리는데
 *   펼친 목록을 OS 가 그려서 브릿지가 안 닿습니다. 스펙에서 `render` 하나만 바꿔
 *   슬래시 메뉴와 같은 메뉴 표면으로 돌렸습니다 — `codeBlock.ts` · `CodeLanguageMenu.tsx`
 * - **라이트에서도 배경이 검정입니다.** 표면을 뒤집으려면 Shiki 문법색까지 같이
 *   뒤집어야 해서 DESIGN.md §6 에 미결정으로 열려 있습니다. 브릿지는 반경(`r1_5`)만
 *   가져옵니다
 * - `mermaid` 도 언어 목록에 있지만 **글자를 물들일 뿐 다이어그램으로 그리지는 않습니다.**
 *   Notion 은 같은 코드 블록을 그림으로 렌더합니다 — 그리려면 `@blocknote/diagram-block`
 *   이 따로 필요합니다(`knocspace-parity.md`)
 */

/* 언어를 바꿔도 코드가 그대로면 하이라이트가 바뀌었는지 알 수 없다. 언어마다
 * 그 언어답게 짧은 견본을 둔다 — 문자열 · 주석 · 키워드가 한 줄에 다 들어가게. */
const SAMPLES: Record<string, { label: string; code: string }> = {
  typescript: {
    label: "TypeScript",
    code: "// 인사를 만든다\nconst 인사 = (이름: string): string => `${이름}, 반가워요`;",
  },
  javascript: {
    label: "JavaScript",
    code: "// 기본 언어입니다\nconst 인사 = (이름) => `${이름}, 반가워요`;",
  },
  tsx: {
    label: "TSX",
    code: 'export function 인사({ 이름 }: { 이름: string }) {\n  return <p className="t5-regular">{이름}, 반가워요</p>;\n}',
  },
  python: {
    label: "Python",
    code: '# 인사를 만든다\ndef 인사(이름: str) -> str:\n    return f"{이름}, 반가워요"',
  },
  json: {
    label: "JSON",
    code: '{ "format": "blocknote", "schemaVersion": 1, "blocks": [] }',
  },
  css: {
    label: "CSS",
    code: ".bn-container .bn-default-styles {\n  font-family: inherit; /* 앱 글꼴을 따라간다 */\n}",
  },
  sql: {
    label: "SQL",
    code: "select id, title from pages where deleted_at is null order by updated_at desc;",
  },
  markdown: {
    label: "Markdown",
    code: "# 제목1\n\n- 글머리\n- **굵게** 와 `인라인 코드`",
  },
  mermaid: {
    label: "Mermaid (그림은 안 그려집니다)",
    code: "flowchart LR\n  문서 --> 블록 --> 저장",
  },
  text: {
    label: "Plain Text",
    code: "하이라이트가 없는 상태입니다.",
  },
};

const LANGUAGES = Object.keys(SAMPLES);
const LANGUAGE_LABELS = Object.fromEntries(
  Object.entries(SAMPLES).map(([key, { label }]) => [key, label]),
);

type CodeStoryArgs = Omit<BlockEditorProps, "pageId" | "content"> & {
  language: string;
  wrapper: boolean;
};

const meta: Meta<CodeStoryArgs> = {
  title: "에디터/코드",
  args: {
    language: "typescript",
    wrapper: true,
    editable: true,
    onChange: fn(),
  },
  argTypes: {
    language: {
      name: "언어",
      description: "여기 열 개는 견본이 있는 것뿐이고, 실제로는 46개 중에서 고릅니다",
      control: { type: "select", labels: LANGUAGE_LABELS },
      options: LANGUAGES,
      table: { category: "코드 블록", type: { summary: "language" } },
    },
    editable: { description: "끄면 읽기 전용 — 언어 고르는 칸도 잠깁니다" },
    onChange: { description: "내용이 바뀔 때마다. Actions 패널에 문서가 통째로 찍힙니다" },
    wrapper: {
      name: "앞뒤 본문",
      description: "코드 블록 위아래에 본문을 둡니다. 검은 덩어리가 문서에서 튀는지 봅니다",
      control: "boolean",
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<CodeStoryArgs>;

/**
 * ### 해 볼 것
 * - **언어** 를 바꿔 봅니다. 왼쪽 위 언어 이름도 같이 바뀝니다
 * - 그 **언어 이름을 눌러 봅니다.** 46개가 메뉴로 뜨고, 지금 언어에 체크가 붙습니다.
 *   슬래시 메뉴와 같은 배경 · 반경 · 호버색인지 견줘 봅니다
 * - `Plain Text` 로 두면 하이라이트가 사라집니다. 나머지와 견줘 봅니다
 * - 코드 안에서 `Tab` 을 눌러 봅니다 — 블록을 나가지 않고 들여쓰기가 됩니다
 * - 다크로 뒤집어 봅니다. **여기만 안 바뀝니다** — 라이트에서도 검정인 것이 지금의 답입니다
 * - 빈 줄에서 ` ```ts ` 를 치고 공백 — 언어까지 붙은 채로 만들어집니다
 */
export const Playground: Story = {
  render: ({ language, wrapper, ...args }) => (
    <DocumentSurface>
      <BlockEditor
        {...args}
        pageId={storyPageId("code", language, wrapper)}
        content={storyDoc([
          ...(wrapper ? [bodyBlock("코드 앞에 오는 본문입니다.")] : []),
          { type: "codeBlock", props: { language }, content: SAMPLES[language].code },
          ...(wrapper ? [bodyBlock("코드 뒤에 오는 본문입니다.")] : []),
        ])}
      />
    </DocumentSurface>
  ),
};
