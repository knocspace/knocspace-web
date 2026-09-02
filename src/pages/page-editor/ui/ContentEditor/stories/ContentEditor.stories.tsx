import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EditorSurface } from "../../EditorSurface/EditorSurface";
import { ContentEditor } from "../ContentEditor";
import type { ContentEditorProps } from "../ContentEditor";
import { emptyPageContent } from "../../../model/page-content";
import { samplePageContent } from "../../../model/sample-page-content";
import { storyPageId } from "./storyDoc";

/**
 * 문서 본문 한 장. 블록 스토리들이 한 종류씩 떼어 보는 것을 여기서는 다 같이 봅니다.
 *
 * **`ContentEditor` 컴포넌트의 스토리이기도 합니다** — 아래 속성 표가 이 컴포넌트가 받는
 * props 입니다. 블록별 스토리는 여기에 문서만 갈아 끼운 것입니다.
 *
 * - `content` 는 **처음 한 번만** 읽습니다. 그 뒤로 문서의 원본은 에디터 쪽 하나뿐입니다
 *   (`docs/roadmap/architecture.md`)
 * - `pageId` 가 바뀌면 에디터를 새로 만듭니다 — 다른 페이지로 갔다는 뜻입니다
 * - 서버도 라우터도 모릅니다. 저장은 화면 쪽 일이라 `onChange` 만 냅니다
 * - 실제 화면은 `LazyContentEditor` 로 부릅니다. BlockNote 가 ProseMirror · Mantine · Shiki 를
 *   같이 들고 오는 무게라 첫 화면에서 떼어냈습니다
 */

const DOCS = ["견본 문서", "빈 문서"] as const;

type EditorStoryArgs = ContentEditorProps & {
  doc: (typeof DOCS)[number];
};

const meta: Meta<EditorStoryArgs> = {
  title: "에디터/문서 한 장",
  component: ContentEditor,
  args: {
    pageId: "story-page",
    content: samplePageContent(),
    editable: true,
    onChange: fn(),
    doc: "견본 문서",
  },
  argTypes: {
    pageId: {
      description: "문서 한 장. **바꿔 보세요 — 에디터가 통째로 새로 만들어집니다**",
      control: "text",
    },
    content: {
      description: "처음 한 번만 읽습니다. 이 스토리에서는 아래 `문서` 가 만듭니다",
      control: false,
    },
    editable: { description: "끄면 읽기 전용 — F5 의 보기 권한이 여기로 옵니다" },
    onChange: {
      description: "내용이 바뀔 때마다 문서를 덩어리로. **되받아 content 로 내리면 안 됩니다** — 원본이 둘이 됩니다",
    },
    doc: {
      name: "문서",
      description: "견본은 블록 열 종류, 빈 문서는 자리표시 문구가 뜨는 새 페이지 상태입니다",
      control: "inline-radio",
      options: DOCS,
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<EditorStoryArgs>;

/**
 * ### 해 볼 것
 * - 본문을 고친 뒤 **`pageId`** 를 아무 글자로 바꿔 봅니다. 고친 것이 사라집니다 —
 *   그게 이 prop 의 뜻입니다(다른 페이지로 간 것)
 * - **문서** 를 빈 문서로 바꿔 자리표시 문구를 봅니다
 * - **읽기 전용** 을 꺼 봅니다. 손잡이도 툴바도 같이 사라집니다
 * - Actions 패널에서 `onChange` 로 나가는 문서 모양(`format` · `schemaVersion` · `blocks`)을
 *   봅니다. 저장 포맷이 그대로 이것입니다
 */
export const Playground: Story = {
  render: ({ doc, ...args }) => (
    <EditorSurface>
      <ContentEditor
        {...args}
        /* pageId 는 컨트롤 값을 그대로 쓰되 문서 선택을 뒤에 붙인다. 문서를 바꿨는데
         * id 가 그대로면 에디터가 안 다시 서기 때문이다 — storyDoc.ts 참고. */
        pageId={storyPageId(args.pageId, doc)}
        content={doc === "견본 문서" ? samplePageContent() : emptyPageContent()}
      />
    </EditorSurface>
  ),
};
