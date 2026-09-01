import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EditorSurface } from "@/pages/page-editor";
import { ContentEditor } from "../ContentEditor";
import type { ContentEditorProps } from "../ContentEditor";
import type { KnocPartialBlock } from "../../../model/blocknote-schema";
import { storyDoc, storyPageId } from "./storyDoc";

/**
 * 블록을 만드는 세 가지 길 — 슬래시 메뉴 · 마크다운 · 단축키. **여기는 손으로 쳐 보는
 * 스토리입니다.** 컨트롤로 만드는 것이 아니라, 빈 줄에 직접 쳐서 확인합니다.
 *
 * ### 마크다운 입력 규칙
 *
 * | 치는 것 | 되는 것 | 단축키 |
 * | --- | --- | --- |
 * | `# ` ~ `###### ` | 제목 H1~H6 | `Ctrl+Alt+1` ~ `6` |
 * | `- ` `+ ` `* ` | 글머리 목록 | `Ctrl+Shift+8` |
 * | `1. ` | 번호 목록 | `Ctrl+Shift+7` |
 * | `[] ` `[x] ` | 체크박스 | `Ctrl+Shift+9` |
 * | — | 접을 수 있는 목록 | `Ctrl+Shift+6` |
 * | `> ` · `" ` | 인용 | `Ctrl+Alt+Q` |
 * | ` ``` ` · ` ```ts ` | 코드 블록 | `Ctrl+Alt+C` |
 * | `---` | 구분선 | — |
 * | — | 본문으로 되돌리기 | `Ctrl+Alt+0` |
 *
 * - **접을 수 있는 목록만 입력 규칙이 없습니다.** 슬래시 메뉴나 단축키로 만듭니다
 * - 인용은 `>` 말고 따옴표로도 됩니다 — `"` 뒤에 공백
 * - 코드 블록은 언어까지 한 번에 칩니다: ` ```ts ` 뒤에 공백
 * - **이 목록은 BlockNote 소스에서 확인한 것입니다.** 공식 문서에는 일부만 적혀
 *   있습니다(`knocspace-parity.md` — "입력 규칙 전체 목록이 문서화되어 있지 않음")
 *
 * ### 슬래시 메뉴 24항목
 *
 * | 그룹 | 항목 |
 * | --- | --- |
 * | 제목 | 제목1 · 제목2 · 제목3 |
 * | 소제목 | 제목4 · 제목5 · 제목6 · 접을 수 있는 제목1·2·3 |
 * | 기본 블록 | 본문 · 글머리 기호 목록 · 번호 매기기 목록 · 체크리스트 · 접을 수 있는 목록 · 인용 · 코드 블록 · 구분선 |
 * | 고급 | 표 |
 * | 미디어 | 이미지 · 비디오 · 오디오 · 파일 |
 * | 기타 | 이모지 |
 *
 * - **메뉴 이름은 한국어입니다.** `useContentEditor` 이 BlockNote 의 `ko` 사전을 넘깁니다
 *   (23개 로케일 중 하나). 문구를 바꾸려면 사전을 덮습니다
 * - Notion 은 슬래시 명령이 40종 넘습니다. 차이는 대부분 **없는 블록** 만큼입니다 —
 *   콜아웃 · 목차 · 북마크 · 임베드 · 수식(`knocspace-parity.md`)
 * - 메뉴는 이름뿐 아니라 **별칭** 으로도 걸립니다. `/h1`, `/대제목`, `/토글` 다 됩니다
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
      { type: "heading", props: { level: 3 }, content: "# 로 만든 제목3" },
      { type: "bulletListItem", content: "- 로 만든 글머리" },
      { type: "numberedListItem", content: "1. 로 만든 번호" },
      { type: "checkListItem", props: { checked: true }, content: "[x] 로 만든 체크박스" },
      { type: "toggleListItem", content: "Ctrl+Shift+6 으로 만든 토글", children: [{ type: "paragraph", content: "접힌 자리." }] },
      { type: "quote", content: "> 로 만든 인용" },
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
      description: "끄면 읽기 전용 — 슬래시 메뉴도 입력 규칙도 안 걸립니다",
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
 * - **빈 문서** 로 두고 `/` 를 칩니다. 이어서 `제목` · `h1` · `표` 를 쳐서 걸러 봅니다
 * - 위 표의 규칙을 하나씩 쳐 봅니다. **`규칙 견본`** 과 같은 모양이 나와야 합니다
 * - `Ctrl+Alt+0` 으로 본문으로 되돌립니다. 어느 블록에서든 됩니다
 * - 만든 블록 왼쪽에 마우스를 올려 손잡이(`⠿`)를 잡고 끌어 순서를 바꿔 봅니다
 * - 손잡이를 누르면 블록 메뉴가 뜹니다 — **삭제 · 위아래 추가뿐입니다.** Notion 의
 *   Turn into · 복제 · 이동 · 댓글은 없습니다(`knocspace-parity.md`)
 * - 여러 블록을 끌어 선택하고 `Ctrl+Z` · `Ctrl+Y` 로 되돌려 봅니다
 * - **읽기 전용** 을 끄고 다시 쳐 봅니다 — 아무것도 안 걸립니다
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
