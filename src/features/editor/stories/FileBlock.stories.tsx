import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { DocumentSurface } from "@/components/DocumentSurface/DocumentSurface";
import { BlockEditor } from "../BlockEditor";
import type { BlockEditorProps } from "../BlockEditor";
import type { KnocPartialBlock } from "../schema";
import { bodyBlock, storyDoc, storyPageId } from "./storyDoc";

/**
 * 이미지 · 동영상 · 오디오 · 파일. 네 블록이 `url` · `caption` · `name` 을 나눠 갖습니다.
 *
 * | | Notion | BlockNote | 가진 props |
 * | --- | --- | --- | --- |
 * | 이미지 | `image` | `image` | `url` `caption` `name` `showPreview` `previewWidth` `textAlignment` |
 * | 동영상 | `video` | `video` | 이미지와 같음 |
 * | 오디오 | `audio` | `audio` | `showPreview` 까지 (폭 없음) |
 * | 파일 | `file` | `file` | `url` `caption` `name` |
 * | PDF | `pdf` | **없음** | 파일 블록으로 대신합니다 |
 *
 * - **업로드 핸들러(`uploadFile`)는 앱이 직접 붙입니다.** 아직 안 붙어 있어서 지금은
 *   URL 로만 넣을 수 있습니다. 파일 서버가 생기는 F4 이후의 일입니다
 * - `url` 이 비면 **"파일 추가" 자리** 로 뜹니다. 이게 블록을 만들었을 때의 첫 모습입니다
 * - 이미지는 미리보기 폭을 드래그로 바꿉니다. 그 값이 `previewWidth` 로 저장됩니다
 * - **북마크 · 임베드 · 링크 프리뷰는 BlockNote 에 아예 없습니다**(`knocspace-parity.md`).
 *   웹 링크를 카드로 펴는 블록은 직접 만들어야 합니다
 */

/* 견본 이미지를 파일 안에 그린다. 외부 URL 을 쓰면 네트워크가 없을 때 스토리가
 * 깨진 이미지로 뜬다 — 스토리북은 오프라인에서도 열려야 한다. */
const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
  <rect width="640" height="360" fill="#e8e6e6"/>
  <text x="320" y="188" font-family="sans-serif" font-size="28" fill="#7d797a" text-anchor="middle">견본 이미지 640 × 360</text>
</svg>`;

const SAMPLE_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(SAMPLE_SVG)}`;

/* 동영상·오디오는 견본을 못 만든다. 파일 안에 그릴 수 있는 것이 아니고, 외부
 * URL 은 위와 같은 이유로 안 쓴다. URL 이 붙은 모습(플레이어 껍데기)만 보이고
 * 재생은 안 된다 — 여기서 볼 것은 블록의 자리와 여백이다. */
const SAMPLE_MEDIA = "https://example.com/견본.mp4";

const KINDS = ["image", "video", "audio", "file"] as const;
type FileKind = (typeof KINDS)[number];

const KIND_LABELS: Record<FileKind, string> = {
  image: "이미지",
  video: "동영상",
  audio: "오디오",
  file: "파일",
};

type FileStoryArgs = Omit<BlockEditorProps, "pageId" | "content"> & {
  kind: FileKind;
  hasUrl: boolean;
  caption: string;
  name: string;
  showPreview: boolean;
  previewWidth: number;
};

/* 종류마다 가진 props 가 다르다. 스키마에 없는 props 를 넘기면 에디터를 만들 때
 * 걸리므로, 한 덩어리로 펴 넘기지 않고 종류별로 갈라 담는다. */
function fileBlock({
  kind,
  hasUrl,
  caption,
  name,
  showPreview,
  previewWidth,
}: FileStoryArgs): KnocPartialBlock {
  const url = hasUrl ? (kind === "image" ? SAMPLE_IMAGE : kind === "file" ? SAMPLE_IMAGE : SAMPLE_MEDIA) : "";

  if (kind === "file") {
    return { type: "file", props: { url, caption, name } };
  }
  if (kind === "audio") {
    return { type: "audio", props: { url, caption, name, showPreview } };
  }
  return { type: kind, props: { url, caption, name, showPreview, previewWidth } };
}

const meta: Meta<FileStoryArgs> = {
  title: "에디터/파일과 미디어",
  args: {
    kind: "image",
    hasUrl: true,
    caption: "캡션은 블록 아래에 붙습니다.",
    name: "견본.svg",
    showPreview: true,
    previewWidth: 480,
    editable: true,
    onChange: fn(),
  },
  argTypes: {
    kind: {
      name: "블록 종류",
      description: "네 블록이 서로 다른 타입입니다. 가진 props 도 조금씩 다릅니다",
      control: { type: "inline-radio", labels: KIND_LABELS },
      options: KINDS,
      table: { category: "파일 블록" },
    },
    hasUrl: {
      name: "URL 있음",
      description: "끄면 `파일 추가` 자리로 뜹니다 — 블록을 막 만들었을 때의 모습입니다",
      control: "boolean",
      table: { category: "파일 블록" },
    },
    caption: {
      name: "캡션",
      description: "비우면 캡션 줄이 통째로 사라집니다",
      control: "text",
      table: { category: "파일 블록" },
    },
    name: {
      name: "파일 이름",
      description: "**파일 · 오디오에서 화면에 보입니다.** 이미지 · 동영상에서는 안 보입니다",
      control: "text",
      table: { category: "파일 블록" },
    },
    showPreview: {
      name: "미리보기",
      description: "**파일 블록에는 없습니다.** 끄면 이미지도 파일처럼 이름 한 줄로 접힙니다",
      control: "boolean",
      table: { category: "파일 블록" },
    },
    previewWidth: {
      name: "미리보기 폭",
      description: "**이미지 · 동영상만.** 화면에서 모서리를 끌어도 이 값이 바뀝니다",
      control: { type: "number", min: 100, max: 720, step: 20 },
      table: { category: "파일 블록" },
    },
    editable: { description: "끄면 읽기 전용 — 폭도 못 끌고 캡션도 못 고칩니다" },
    onChange: { description: "내용이 바뀔 때마다. 폭을 끌어도 찍힙니다" },
  },
};

export default meta;
type Story = StoryObj<FileStoryArgs>;

/**
 * ### 해 볼 것
 * - **URL 있음** 을 꺼 봅니다. 네 종류 모두 `파일 추가` 자리로 바뀝니다 — 눌러도 업로드
 *   탭이 없는 것이 지금 상태입니다
 * - **미리보기 폭** 을 바꾸거나, 이미지 모서리를 마우스로 끌어 봅니다
 * - **미리보기** 를 끄면 이미지가 파일 한 줄로 접힙니다
 * - **동영상 · 오디오는 재생되지 않습니다.** 견본 URL 이 가짜라 플레이어 껍데기만 뜹니다
 * - 캡션을 지워 봅니다. 줄 자체가 없어져서 아래 본문이 붙습니다
 */
export const Playground: Story = {
  render: (args) => (
    <DocumentSurface>
      <BlockEditor
        editable={args.editable}
        onChange={args.onChange}
        pageId={storyPageId(
          "file",
          args.kind,
          args.hasUrl,
          args.caption,
          args.name,
          args.showPreview,
          args.previewWidth,
        )}
        content={storyDoc([
          bodyBlock("파일 블록 앞에 오는 본문입니다."),
          fileBlock(args),
          bodyBlock("파일 블록 뒤에 오는 본문입니다."),
        ])}
      />
    </DocumentSurface>
  ),
};
