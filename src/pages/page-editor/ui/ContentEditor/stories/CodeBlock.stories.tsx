import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EditorSurface } from "../../EditorSurface/EditorSurface";
import { ContentEditor } from "../ContentEditor";
import type { ContentEditorProps } from "../ContentEditor";
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
 * | 캡션 · 줄바꿈 토글 | 있음 | **없음** |
 *
 * - **하이라이터도 언어 목록도 우리가 붙입니다.** 하이라이터(Shiki)가 무거워 코어는 둘 다
 *   비워 뒀습니다 — 목록은 `code-block.ts`, 하이라이터는 `useContentEditor` 입니다
 * - **언어 선택기도 코어 것이 아닙니다.** 코어의 native `<select>` 는 펼친 목록을 OS 가 그려
 *   브릿지가 안 닿아서, 슬래시 메뉴와 같은 메뉴 표면으로 돌렸습니다 (`CodeLanguageMenu.tsx`)
 * - **라이트에서도 배경이 검정입니다.** 표면을 뒤집으려면 Shiki 문법색까지 같이 뒤집어야 해서
 *   DESIGN.md §6 에 미결정으로 열려 있습니다
 * - `mermaid` 는 **글자를 물들일 뿐 다이어그램으로 그리지는 않습니다** (`knocspace-parity.md`)
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

type CodeStoryArgs = Omit<ContentEditorProps, "pageId" | "content"> & {
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
 * - **언어** 를 바꿔 봅니다. 왼쪽 위 언어 이름도 같이 바뀌고, `Plain Text` 에서는 하이라이트가 사라집니다
 * - 그 **언어 이름을 눌러** 46개 메뉴를 엽니다. 슬래시 메뉴와 같은 표면인지 견줘 봅니다
 * - 코드 안에서 `Tab` — 블록을 나가지 않고 들여쓰기가 됩니다
 * - 다크로 뒤집어 봅니다. **여기만 안 바뀝니다**
 */
export const Playground: Story = {
  render: ({ language, wrapper, ...args }) => (
    <EditorSurface>
      <ContentEditor
        {...args}
        pageId={storyPageId("code", language, wrapper)}
        content={storyDoc([
          ...(wrapper ? [bodyBlock("코드 앞에 오는 본문입니다.")] : []),
          { type: "codeBlock", props: { language }, content: SAMPLES[language].code },
          ...(wrapper ? [bodyBlock("코드 뒤에 오는 본문입니다.")] : []),
        ])}
      />
    </EditorSurface>
  ),
};
