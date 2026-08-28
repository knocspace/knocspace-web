import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { DocumentSurface } from "@/components/DocumentSurface/DocumentSurface";
import { BlockEditor } from "./BlockEditor";
import type { BlockEditorProps } from "./BlockEditor";
import type { KnocPartialBlock } from "./schema";
import { PALETTE, PALETTE_LABELS, storyDoc, storyPageId } from "./storyDoc";
import type { PaletteColor } from "./storyDoc";

/**
 * 인라인 서식. 블록이 아니라 **글자에** 붙는 것들입니다.
 *
 * | | Notion | BlockNote | 마크다운 |
 * | --- | --- | --- | --- |
 * | 굵게 · 기울임 · 밑줄 · 취소선 · 코드 | `annotations` 5종 | `bold` `italic` `underline` `strike` `code` | `**` `*` `~` `` ` `` |
 * | 글자색 · 배경색 | 고정 9색 enum | 자유 문자열 | — |
 * | 링크 | `text.link` | `link` | `[글자](주소)` |
 * | 이모지 | `:이름:` | `:` 로 이모지 메뉴 | — |
 * | 멘션(@사람 · @페이지) | 6종 | **없음** | — |
 * | 인라인 수식 | 있음 | 별도 패키지 | — |
 *
 * - **다섯 서식은 완전히 같습니다.** 이름도 마크다운 표기도 양쪽이 같아서, 이 줄은
 *   Notion 에서 복사해 붙여도 그대로 옵니다
 * - **멘션은 없습니다.** BlockNote 기본 인라인 스펙은 글자와 링크 둘뿐이라, `@사람` ·
 *   `@페이지` 는 `createReactInlineContentSpec` 으로 직접 만들어야 합니다
 *   (`knocspace-parity.md` — P1)
 * - **커스텀 이모지도 없습니다.** `:` 뒤에 이름을 치면 뜨는 그리드는 내장이지만,
 *   워크스페이스마다 이모지를 올리는 것은 Notion 쪽 기능입니다
 * - 배경색은 형광펜입니다. SEED 팔레트가 모드에 따라 뒤집혀서 라이트 · 다크 한 벌로
 *   양쪽이 맞습니다(DESIGN.md §7)
 */

const STYLES = ["bold", "italic", "underline", "strike", "code"] as const;
type InlineStyle = (typeof STYLES)[number];

const STYLE_LABELS: Record<InlineStyle, string> = {
  bold: "굵게 **",
  italic: "기울임 *",
  underline: "밑줄",
  strike: "취소선 ~",
  code: "코드 `",
};

type InlineStoryArgs = Omit<BlockEditorProps, "pageId" | "content"> & {
  styles: InlineStyle[];
  textColor: PaletteColor;
  backgroundColor: PaletteColor;
  link: boolean;
  palette: boolean;
  emoji: boolean;
};

/* 형광펜 아홉 색을 한 줄에. 하나씩 골라 보는 것으로는 갈색 · 분홍이 다른 색이라는
 * 것이 안 보인다 — 나란히 둬야 보인다. */
function paletteBlock(): KnocPartialBlock {
  return {
    type: "paragraph",
    content: PALETTE.filter((color) => color !== "default").map((color) => ({
      type: "text" as const,
      text: ` ${PALETTE_LABELS[color]} `,
      styles: { backgroundColor: color },
    })),
  };
}

const meta: Meta<InlineStoryArgs> = {
  title: "에디터/인라인 서식",
  args: {
    styles: ["bold"],
    textColor: "default",
    backgroundColor: "default",
    link: true,
    palette: true,
    emoji: true,
    editable: true,
    onChange: fn(),
  },
  argTypes: {
    styles: {
      name: "서식",
      description: "겹쳐서 걸립니다. 굵게 + 코드처럼 같이 켜 보세요",
      control: { type: "inline-check", labels: STYLE_LABELS },
      options: STYLES,
      table: { category: "인라인 서식" },
    },
    textColor: {
      name: "글자색",
      description: "블록 전체가 아니라 고른 글자에만 붙습니다",
      control: { type: "select", labels: PALETTE_LABELS },
      options: PALETTE,
      table: { category: "인라인 서식" },
    },
    backgroundColor: {
      name: "형광펜",
      description: "같은 열의 200 번대입니다",
      control: { type: "select", labels: PALETTE_LABELS },
      options: PALETTE,
      table: { category: "인라인 서식" },
    },
    link: {
      name: "링크",
      description: "링크 위에 커서를 두면 편집 툴바가 뜹니다(열기 · 고치기 · 지우기)",
      control: "boolean",
      table: { category: "인라인 서식" },
    },
    editable: { description: "끄면 읽기 전용 — 툴바도 안 뜹니다" },
    onChange: { description: "내용이 바뀔 때마다. Actions 패널에 문서가 통째로 찍힙니다" },
    palette: {
      name: "형광펜 아홉 색",
      description: "아홉 색을 한 줄에 나란히. 갈색 · 분홍이 결이 다른 것이 여기서 보입니다",
      control: "boolean",
      table: { category: "스토리 전용" },
    },
    emoji: {
      name: "이모지 줄",
      description: "이모지가 든 문단을 한 줄 더 답니다",
      control: "boolean",
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<InlineStoryArgs>;

/**
 * ### 해 볼 것
 * - **서식** 을 여러 개 켜 봅니다. 코드 + 굵게처럼 겹쳐도 됩니다
 * - 글자를 끌어 선택하면 포맷 툴바가 뜹니다. 거기서 바꾼 것은 컨트롤에 안 비칩니다
 * - `**굵게**` · `` `코드` `` 를 직접 쳐 봅니다. 마지막 기호를 치는 순간 서식이 됩니다
 * - 빈 줄에서 `:` 를 치고 이름을 이어 쳐 봅니다 — 이모지 메뉴가 뜹니다
 * - 링크에 커서를 두면 링크 툴바가 뜹니다. 주소를 고쳐 봅니다
 * - **형광펜 아홉 색** 을 켜고 다크로 뒤집어 봅니다. 갈색 · 분홍만 따로 놉니다
 */
export const Playground: Story = {
  render: ({ styles, textColor, backgroundColor, link, palette, emoji, ...args }) => {
    /* 켠 서식만 모아 한 덩어리로 넘긴다. BlockNote 는 styles 를 켜진 것만 담은
     * 객체로 받는다 — false 를 일일이 넣지 않아도 된다. */
    const 서식 = Object.fromEntries(styles.map((style) => [style, true]));
    const 색 = {
      ...(textColor !== "default" ? { textColor } : {}),
      ...(backgroundColor !== "default" ? { backgroundColor } : {}),
    };

    return (
      <DocumentSurface>
        <BlockEditor
          {...args}
          pageId={storyPageId("inline", styles.join(), textColor, backgroundColor, link, palette, emoji)}
          content={storyDoc([
            {
              type: "paragraph",
              content: [
                { type: "text", text: "서식이 안 걸린 글자와 ", styles: {} },
                { type: "text", text: "서식이 걸린 글자", styles: { ...서식, ...색 } },
                { type: "text", text: " 를 나란히 둡니다.", styles: {} },
              ],
            },
            ...(link
              ? [
                  {
                    type: "paragraph" as const,
                    content: [
                      { type: "text" as const, text: "링크는 ", styles: {} },
                      {
                        type: "link" as const,
                        href: "https://www.blocknotejs.org/docs",
                        content: "이렇게 붙습니다",
                      },
                      { type: "text" as const, text: ". 주소는 툴바에서 고칩니다.", styles: {} },
                    ],
                  },
                ]
              : []),
            ...(palette ? [paletteBlock()] : []),
            ...(emoji
              ? [{ type: "paragraph" as const, content: "이모지도 글자입니다 🌱 🍊 ✅ — : 를 쳐서 넣습니다." }]
              : []),
          ])}
        />
      </DocumentSurface>
    );
  },
};
