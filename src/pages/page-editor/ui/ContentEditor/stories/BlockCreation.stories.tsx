import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EditorSurface } from "../../EditorSurface/EditorSurface";
import { ContentEditor } from "../ContentEditor";
import type { ContentEditorProps } from "../ContentEditor";
import type { KnocPartialBlock } from "../../../model/blocknote-schema";
import { storyDoc, storyPageId } from "./storyDoc";

/**
 * 블록을 만드는 세 가지 길 — **마크다운 · 단축키 · 슬래시 메뉴**. 컨트롤로 만드는 것이
 * 아니라 빈 줄에 직접 쳐서 확인하는 스토리입니다.
 *
 * 이미 있는 블록의 종류를 **바꾸는** 것은 `에디터/블록 메뉴` 의 「전환」이고, 여러 줄을
 * 골라 놓고 바꾸는 것은 `에디터/블록 선택` 입니다.
 *
 * ### 1. 마크다운 입력 규칙
 *
 * | 치는 것 | 되는 것 |
 * | --- | --- |
 * | `# ` `## ` `### ` | 제목1 · 제목2 · 제목3 |
 * | `- ` `+ ` `* ` | 글머리 기호 목록 |
 * | `1. ` | 번호 매기기 목록 |
 * | `[] ` `[x] ` | 체크리스트 |
 * | `> ` | **접을 수 있는 목록** |
 * | `" ` | 인용 |
 * | ` ``` ` · ` ```ts ` | 코드 블록 (언어까지 한 번에) |
 * | `---` | 구분선 |
 *
 * - **`> ` 는 인용이 아니라 토글입니다** (Notion 규격). 인용은 `" ` 쪽에 남아 있어 만드는
 *   길이 안 막힙니다 (`model/block-shortcuts.ts`)
 * - **`#### ` 부터는 아무 일도 안 합니다.** 스키마의 `levels: [1, 2, 3]` 이 입력 규칙까지 같이 닫습니다
 * - 접을 수 있는 제목에는 입력 규칙이 없습니다. 슬래시 메뉴나 「전환」으로 만듭니다
 *
 * ### 2. 단축키 — Notion 번호 그대로
 *
 * | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
 * | --- | --- | --- | --- | --- | --- | --- | --- | --- |
 * | 본문 | 제목1 | 제목2 | 제목3 | 체크리스트 | 글머리 | 번호 | 토글 | 코드 |
 *
 * 맥은 `⌘⌥` + 숫자, 윈도우는 `Ctrl+Shift` + 숫자입니다. **두 벌이 같이 걸립니다** — Notion 이
 * 이 계열만 OS 마다 다른 조합을 써서 양쪽을 다 잡아 뒀습니다 (`model/block-shortcuts.ts`).
 * 숫자를 안 쓰는 셋은 BlockNote 기본 그대로 — 인용 `Ctrl+Alt+Q`, 코드 `Ctrl+Alt+C`,
 * 체크박스 · 토글 여닫기 `Ctrl+Enter`.
 *
 * - 9 는 Notion 의 「하위 페이지」 자리라 비워 뒀습니다. 페이지를 가리키는 블록이 아직 없습니다
 * - 걸리는 대상은 **고른 블록이 있으면 고른 것 전부, 없으면 그 줄 하나** 입니다
 * - **표 · 이미지 · 구분선 · 목차는 지나갑니다.** 글이 갈 데가 없는 블록이라서고,
 *   「전환」 줄이 그 블록들에서 안 뜨는 것과 같은 판단입니다
 * - **슬래시 메뉴의 단축키 뱃지는 이 표와 다릅니다.** 뱃지는 사전이 아니라 BlockNote 코어가
 *   항목마다 박아 둔 값이라 지금은 못 고칩니다
 *
 * ### 3. 슬래시 메뉴 — 21항목
 *
 * | 그룹 | 항목 (메뉴에 뜨는 차례) |
 * | --- | --- |
 * | 제목 | 제목1 · 제목2 · 제목3 |
 * | 기본 블록 | 인용 · 접을 수 있는 목록 · 번호 · 글머리 · 체크리스트 · 본문 · 코드 블록 · 구분선 |
 * | 고급 | 표 · **목차** |
 * | 미디어 | 이미지 · 비디오 · 오디오 · 파일 |
 * | 소제목 | 접을 수 있는 제목1 · 2 · 3 |
 * | 기타 | 이모지 |
 *
 * - **목차만 우리 항목입니다** (`model/slash-menu-items.tsx`). 나머지 20개는 이름 · 설명 ·
 *   별칭 · 그룹이 전부 BlockNote 의 `ko` 사전에서 나옵니다
 * - **목차는 「고급」의 표 바로 뒤** 입니다. 끝에 붙이면 「고급」 머리말이 두 번 섭니다 —
 *   메뉴는 줄을 훑다가 그룹이 바뀌면 머리말을 찍습니다
 * - 이름뿐 아니라 **별칭** 으로도 걸립니다 — `/h1` · `/대제목` · `/토글` · `/목차`
 * - **메뉴 표면은 아직 BlockNote 기본입니다.** SEED 로 갈아 끼우는 것은 F3 §2 입니다
 */

const STARTS = ["빈 문서", "안내 문단", "규칙 견본"] as const;
type Start = (typeof STARTS)[number];

type CreationStoryArgs = Omit<ContentEditorProps, "pageId" | "content"> & {
  start: Start;
};

function startBlocks(start: Start): KnocPartialBlock[] {
  if (start === "빈 문서") {
    /* 진짜 빈 문서. 자리표시 문구가 뜨고 커서가 첫 줄에 앉는다 — 새 페이지를
     * 만들었을 때와 같은 상태다. */
    return [];
  }

  if (start === "규칙 견본") {
    /* 위 표의 결과를 미리 만들어 둔 것. 손으로 쳐서 나온 모양과 견주는 용도라
     * 순서를 표와 똑같이 맞춘다. */
    return [
      { type: "heading", props: { level: 3 }, content: "### 로 만든 제목3" },
      { type: "bulletListItem", content: "- 로 만든 글머리 기호 목록" },
      { type: "numberedListItem", content: "1. 로 만든 번호 매기기 목록" },
      { type: "checkListItem", props: { checked: true }, content: "[x] 로 만든 체크리스트" },
      {
        type: "toggleListItem",
        /* `> ` 가 인용이 아니라 이 줄이 되는 것이 Notion 과 맞춘 자리다. */
        content: "> 로 만든 접을 수 있는 목록",
        children: [{ type: "paragraph", content: "접힌 자리." }],
      },
      { type: "quote", content: '" 로 만든 인용' },
      { type: "codeBlock", props: { language: "typescript" }, content: "// ```ts 로 만든 코드 블록" },
      { type: "divider" },
      { type: "paragraph", content: "--- 로 만든 구분선이 위에 있습니다." },
    ];
  }

  return [
    { type: "paragraph", content: "아래 빈 줄에 직접 쳐 보세요. 위 표가 그대로 통합니다." },
    { type: "paragraph", content: "" },
  ];
}

const meta: Meta<CreationStoryArgs> = {
  title: "에디터/블록 만들기",
  args: {
    start: "안내 문단",
    editable: true,
    onChange: fn(),
  },
  argTypes: {
    editable: {
      description: "끄면 읽기 전용 — 슬래시 메뉴도 입력 규칙도 단축키도 안 걸립니다",
    },
    onChange: { description: "블록이 만들어질 때마다 찍힙니다. 규칙이 걸린 순간이 보입니다" },
    start: {
      name: "시작 상태",
      description: "빈 문서는 자리표시 문구까지, 규칙 견본은 표의 결과를 미리 만들어 둡니다",
      control: "inline-radio",
      options: STARTS,
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<CreationStoryArgs>;

/**
 * ### 해 볼 것
 *
 * **마크다운** — 위 표의 규칙을 하나씩 쳐 보고 **`규칙 견본`** 과 견줍니다. `>` 뒤 공백은
 * 인용이 아니라 **접을 수 있는 목록** 이고, 인용은 `"` 뒤 공백입니다. `#### ` 은 아무 일도
 * 안 하고 글자가 그대로 남습니다.
 *
 * **단축키** — 아무 줄에서 `Ctrl+Shift+5`(맥은 `⌘⌥5`)로 글머리, `Ctrl+Shift+0` 으로 본문.
 * **표** 위에서 눌러 보면 아무 일도 안 일어납니다 — 글이 갈 데가 없는 블록입니다.
 *
 * **슬래시 메뉴** — **빈 문서** 로 두고 `/` 를 칩니다. `제목` · `h1` · `표` · `목차` 로 걸러 보고,
 * **고급** 그룹의 머리말이 한 번만 서는지 봅니다. 메뉴에 뜨는 단축키 뱃지는 위 표와 **다릅니다**.
 *
 * **그 밖에** — `Ctrl+Z` 로 되돌리면 입력 규칙이 걸린 것도 한 번에 돌아오고,
 * **읽기 전용** 을 끄면 셋 다 아무것도 안 걸립니다.
 */
export const Playground: Story = {
  render: ({ start, ...args }) => (
    <EditorSurface>
      <ContentEditor
        {...args}
        pageId={storyPageId("creation", start)}
        content={storyDoc(startBlocks(start))}
      />
    </EditorSurface>
  ),
};
