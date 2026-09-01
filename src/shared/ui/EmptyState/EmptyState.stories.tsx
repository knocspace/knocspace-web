import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import IconDocumentPenLine from "@karrotmarket/react-monochrome-icon/IconDocumentPenLine";
import IconMagnifyingglassLine from "@karrotmarket/react-monochrome-icon/IconMagnifyingglassLine";
import IconTrashcanLine from "@karrotmarket/react-monochrome-icon/IconTrashcanLine";
import IconStarLine from "@karrotmarket/react-monochrome-icon/IconStarLine";
import { EmptyState } from "./EmptyState";
import type { EmptyStateProps } from "./EmptyState";
import { emptyMessages } from "@/shared/config";
import type { Message } from "@/shared/config";

/**
 * 보여 줄 것이 없을 때 그 자리를 채우는 화면. **실패가 아니라 정상**입니다 —
 * 실패는 [ErrorState](?path=/docs/ui-errorstate--docs) 쪽입니다.
 *
 * | variant | 자리 | 그리는 것 |
 * | --- | --- | --- |
 * | `default` | 화면·본문 전체 | 아이콘 + 제목 + 설명 + 버튼 |
 * | `compact` | 사이드바 · 팝오버 · 목록 안 | 제목만 |
 *
 * - 버튼은 다음에 할 일이 **그 화면 안에** 있을 때만
 * - 문구는 여기서 안 짓습니다. `emptyMessages` 에서 가져옵니다
 */

/* 패널에서 고를 아이콘. 아이콘은 값이 아니라 컴포넌트라 컨트롤에 그냥은
 * 못 싣는다 — argTypes 의 mapping 이 "이름 → 컴포넌트" 를 대신 이어 준다.
 * 무엇을 고를지는 화면을 그리는 쪽이 §9 를 보고 정한다. */
const ICONS = {
  "문서 쓰기": IconDocumentPenLine,
  돋보기: IconMagnifyingglassLine,
  휴지통: IconTrashcanLine,
  별: IconStarLine,
};

type IconName = keyof typeof ICONS;

/** §9 에 확정된 문구. 고르면 제목·설명·버튼이 통째로 바뀐다. */
type PresetName =
  | "첫 실행"
  | "검색 결과 없음"
  | "검색 결과 없음(compact)"
  | "즐겨찾기 비었음"
  | "휴지통 비었음"
  | "없는 페이지(404)"
  | "(직접 입력)";

const 문구: Record<PresetName, Message | null> = {
  "첫 실행": emptyMessages.firstRun,
  "검색 결과 없음": emptyMessages.searchNoResult("포커스 링"),
  "검색 결과 없음(compact)": emptyMessages.searchNoResultCompact,
  "즐겨찾기 비었음": emptyMessages.favoritesEmpty,
  "휴지통 비었음": emptyMessages.trashEmpty,
  "없는 페이지(404)": emptyMessages.notFound,
  "(직접 입력)": null,
};

type EmptyStateStoryArgs = EmptyStateProps & {
  iconName: IconName;
  preset: PresetName;
  frame: "본문 영역" | "사이드바 240px";
};

const meta: Meta<EmptyStateStoryArgs> = {
  title: "UI/EmptyState",
  component: EmptyState,
  args: {
    icon: IconDocumentPenLine,
    iconName: "문서 쓰기",
    title: "페이지가 아직 없어요",
    description: ["첫 페이지를 만들면 왼쪽 목록에 쌓여요."],
    action: "페이지 만들기",
    actionVariant: "brandSolid",
    variant: "default",
    onAction: fn(),
    preset: "(직접 입력)",
    frame: "본문 영역",
  },
  argTypes: {
    icon: {
      control: false,
      description: "제목 위 24px 아이콘. compact 에서는 안 그립니다",
    },
    iconName: {
      name: "아이콘 고르기",
      description: "icon 에 넣을 아이콘",
      control: "select",
      options: Object.keys(ICONS),
      table: { category: "스토리 전용" },
    },
    title: { description: "왜 비었는지 한 문장", control: "text" },
    description: {
      description: "제목 아래 설명. **문장마다 한 칸씩** 나눠 담습니다",
      control: "object",
    },
    action: { description: "버튼 글자. 비우면 버튼 없음", control: "text" },
    actionVariant: {
      description: "brandSolid 는 할 일이 그것 하나뿐일 때만",
      control: "inline-radio",
      options: ["brandSolid", "neutralWeak"],
    },
    variant: {
      description: "compact = 사이드바 · 팝오버 · 목록 안",
      control: "inline-radio",
      options: ["default", "compact"],
    },
    onAction: { description: "버튼을 눌렀을 때" },
    preset: {
      name: "실제 문구",
      description: "messages.ts 의 확정 문구로 제목·설명·버튼을 덮어씁니다",
      control: "select",
      options: Object.keys(문구),
      table: { category: "스토리 전용" },
    },
    frame: {
      name: "놓이는 자리",
      description: "감쌀 상자 — 본문 220px / 사이드바 240px",
      control: "inline-radio",
      options: ["본문 영역", "사이드바 240px"],
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<EmptyStateStoryArgs>;

/**
 * ### 해 볼 것
 * - `description` 은 문장 배열. 칸을 늘리면 줄이 늘어납니다
 * - `action` 을 비우면 버튼이 사라집니다
 * - `variant` 를 compact + **놓이는 자리** 를 사이드바로
 * - **실제 문구** — 진짜 화면에 나가는 말입니다
 */
export const Playground: Story = {
  render: ({ preset, frame, iconName, ...rest }) => {
    const args: EmptyStateProps = { ...rest, icon: ICONS[iconName] };
    const 확정 = 문구[preset];
    const props: EmptyStateProps = 확정
      ? { ...args, title: 확정.title, description: 확정.description, action: 확정.action }
      : args;

    if (frame === "사이드바 240px") {
      return (
        <div className="w-sidebar rounded-r1 bg-bg-layer-basement">
          <EmptyState {...props} />
        </div>
      );
    }

    return (
      <div className="flex" style={{ minHeight: 220 }}>
        <EmptyState {...props} />
      </div>
    );
  },
};
