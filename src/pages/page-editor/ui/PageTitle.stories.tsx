import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EditorSurface } from "@/pages/page-editor";
import { PageTitle } from "./PageTitle";
import type { PageTitleProps } from "./PageTitle";

/**
 * 문서 한 장의 이름. **본문 안의 제목1 과는 다른 것입니다.**
 *
 * | | 크기 | 굵기 | 줄간 | 자간 |
 * | --- | --- | --- | --- | --- |
 * | 문서 제목 | 40px | 700 | 1.2 | −0.035em |
 * | 제목1 (블록) | 30px | 700 | 1.3 | 없음 |
 * | 제목2 (블록) | 24px | 700 | 1.3 | 없음 |
 * | 제목3 (블록) | 20px | 700 | 1.3 | 없음 |
 * | 본문 | 16px | 400 | 1.5 | 없음 |
 *
 * - 값의 출처는 `knocspace.css` 의 `--knoc-text-doc-title` 하나입니다.
 *   제목1·2·3 은 같은 파일의 `--knoc-text-heading-*` 이고, 에디터에는
 *   `blocknote-bridge.css` 가 `--level` 로 넘깁니다
 * - **Notion 은 제목에 굵기 600 을 씁니다.** 저희는 700 입니다 — DESIGN.md §2 가
 *   600 을 워드마크 전용으로 묶어 뒀습니다
 * - **`InlineInput` 이 아닙니다.** 제목은 접지 않고 줄바꿈해야 해서 편집 중에도
 *   `textarea` 여야 합니다. 이유 셋은 `PageTitle.tsx` 주석에 적어 뒀습니다
 * - **`h1` 이 아닙니다.** 본문 제목1 블록이 이미 진짜 `<h1>` 이라(코어가
 *   `document.createElement`) 여기까지 `h1` 이면 한 문서에 셋이 됩니다.
 *   이름은 `aria-label` 로 줍니다
 * - **줄바꿈이 안 담깁니다.** Enter 는 `onEnter` 로 나가고(본문 첫 블록으로 넘기는
 *   것은 F3 §3), 여러 줄을 붙여넣어도 공백 하나로 눌립니다 — 이 값이 그대로
 *   사이드바 트리와 브레드크럼까지 나가기 때문입니다
 * - 테두리도 배경도 없습니다 (DESIGN.md §10). 편집 중에도 캐럿만 섭니다
 */

type PageTitleStoryArgs = PageTitleProps & { withBody: boolean };

const meta: Meta<PageTitleStoryArgs> = {
  title: "레이아웃/PageTitle",
  component: PageTitle,
  args: {
    value: "2분기 제품 로드맵",
    editable: true,
    withBody: true,
    onChange: fn(),
    onEnter: fn(),
  },
  argTypes: {
    value: {
      description: "지금 제목. 비우면 자리 문구가 보입니다",
      control: "text",
    },
    editable: { description: "끄면 읽기 전용 — F5 의 보기 권한이 여기로 옵니다" },
    onChange: { description: "글자가 바뀔 때마다. 저장 시점은 여기서 안 정합니다" },
    onEnter: {
      description: "제목에서 Enter. 줄바꿈 대신 본문으로 나가는 자리입니다 (F3 §3)",
    },
    withBody: {
      name: "본문 흉내",
      description: "아래에 16px 문단을 깔아 제목과의 위계를 봅니다",
      control: "boolean",
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<PageTitleStoryArgs>;

/**
 * ### 해 볼 것
 * - **제목** 을 비워 자리 문구(`제목 없음`)를 봅니다
 * - 길게 쳐서 **줄이 접히는지** 봅니다. 잘리면 안 됩니다 — 상자가 같이 자랍니다
 * - 글자 가운데를 클릭해 **캐럿이 그 자리에 서는지** 봅니다 (DESIGN.md §10)
 * - Enter 를 눌러 봅니다. 줄이 안 늘고 Actions 패널에 `onEnter` 가 찍힙니다
 * - 여러 줄짜리 글을 **붙여넣어** 봅니다. 한 줄로 눌려 들어옵니다
 * - **읽기 전용** 으로 끄면 같은 자리에 같은 글자가 그대로 남습니다
 */
export const Playground: Story = {
  /* key 로 다시 마운트한다. 아래 Demo 가 값을 자기 상태로 들고 있어서, 컨트롤에서
   * 제목을 바꿔도 key 가 없으면 처음 값에 머문다. */
  render: (args) => <Demo key={args.value} {...args} />,
};

/** 제어 컴포넌트라 값을 들고 있는 쪽이 필요하다. 화면에서는 라우트가 그 자리다. */
function Demo({ withBody, ...args }: PageTitleStoryArgs) {
  const [value, setValue] = useState(args.value);

  return (
    <EditorSurface>
      <PageTitle
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange?.(next);
        }}
      />
      {withBody && (
        <p className="mt-x4 text-fg-neutral" style={{ fontSize: 16, lineHeight: 1.5 }}>
          본문 16px 입니다. 제목 40px 과 나란히 두고 위계가 서는지 봅니다. 문서 안쪽 제목1 은
          30px 이라 이 둘 사이에 앉습니다.
        </p>
      )}
    </EditorSurface>
  );
}
