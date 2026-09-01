import type { ComponentType, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ErrorBoundary } from "./ErrorBoundary";

/**
 * 화면을 그리다 예외가 터졌을 때 흰 화면 대신 뜨는 마지막 방어선.
 * 앱에서는 `AppLayout` 이 라우트 안쪽을 감쌉니다.
 *
 * - **렌더 중에 던져진 예외만** 잡습니다. 이벤트 핸들러·`setTimeout` 은 못 잡습니다
 * - 데이터를 못 불러온 것은 [ErrorState](?path=/docs/ui-errorstate--docs) 자리입니다
 * - 화면에는 제목 하나와 버튼 둘뿐. 설명 문구가 없는 것이 확정입니다
 * - ‘기술 정보 보기’ 는 개발 빌드에서만 나옵니다
 */

/** 스토리에서 일부러 터뜨리는 용도. 앱 코드에는 이런 게 없다. */
function 터지는화면(): never {
  throw new Error("페이지를 그리는 중에 터졌어요 (스토리북 예시)");
}

interface ErrorBoundaryStoryArgs {
  /** 감쌀 화면 */
  children: ReactNode;
  onGoHome?: () => void;
  throwOnRender?: boolean;
}

const meta: Meta<ErrorBoundaryStoryArgs> = {
  title: "UI/ErrorBoundary",
  /* 클래스 컴포넌트는 props 타입이 딱 맞아야 해서, 스토리 전용 스위치를
   * 하나 더 얹은 args 를 그대로는 못 받는다. 표(Docs 의 속성 목록)를
   * 살리려면 component 를 넘겨야 하므로 여기서만 맞춰 준다. */
  component: ErrorBoundary as ComponentType<ErrorBoundaryStoryArgs>,
  args: { throwOnRender: true, onGoHome: fn(), children: null },
  argTypes: {
    children: { control: false, description: "이 경계가 감쌀 화면" },
    onGoHome: { description: "‘홈으로’ 를 눌렀을 때. 이동은 밖에서 합니다" },
    throwOnRender: {
      name: "렌더 중 터뜨리기",
      description: "children 을 예외를 던지는 화면으로 바꿉니다",
      control: "boolean",
      table: { category: "스토리 전용" },
    },
  },
};

export default meta;
type Story = StoryObj<ErrorBoundaryStoryArgs>;

/**
 * ### 해 볼 것
 * - **렌더 중 터뜨리기** 를 끄면 아무것도 안 그리고 children 을 통과시킵니다
 * - 켜면 잡힌 화면. **‘기술 정보 보기’** 를 펼쳐 봅니다
 * - 콘솔의 빨간 로그는 정상입니다. 잡힌 예외도 React 가 한 번 찍습니다
 */
export const Playground: Story = {
  render: ({ throwOnRender = false, onGoHome }) => (
    /* key 를 바꿔 경계를 새로 마운트한다. 클래스 컴포넌트가 잡은 에러는
     * state 에 남아서, children 만 정상으로 바꿔서는 안 돌아온다. */
    <ErrorBoundary key={String(throwOnRender)} onGoHome={onGoHome}>
      {throwOnRender ? (
        <터지는화면 />
      ) : (
        <p className="t3-regular text-fg-neutral-muted">
          터지지 않은 화면. ErrorBoundary 는 여기서 아무것도 안 합니다.
        </p>
      )}
    </ErrorBoundary>
  ),
};
