import { Component, type ErrorInfo, type ReactNode } from "react";
import { ActionButton } from "@seed-design/react";
import { boundaryMessages } from "./messages";

/**
 * 라우트 단위 fallback — DESIGN.md §9.
 *
 * F1 에서 유일한 클래스 컴포넌트다. componentDidCatch 에 훅 대응이 없다.
 *
 * 이건 렌더 중에 throw 된 것만 잡는다. 서버가 500 을 뱉는 건 예외가 아니라
 * 그냥 값이라 여기 안 걸린다 — 그건 F2 에서 Query 의 isError 로 받아
 * ErrorState 를 그린다. 헷갈리면 "왜 ErrorBoundary 가 안 뜨지" 로 헤맨다.
 *
 * 설명이 없는 것이 확정이다. 제목이 무슨 일인지 말했고 버튼이 뭘 할 수
 * 있는지 말한다. 그 사이에 "새로 고치면 다시 열려요" 를 끼우면 버튼을
 * 소리 내어 읽는 것이다. 저장 상태도 약속하지 않는다 — 렌더가 죽은 순간
 * 저장 안 된 편집은 실제로 없어졌을 수 있다.
 */

interface ErrorBoundaryProps {
  children: ReactNode;
  /** 홈으로 보낼 방법. 라우터를 모르는 컴포넌트라 밖에서 받는다 */
  onGoHome?: () => void;
}

interface ErrorBoundaryState {
  error: Error | null;
  detailOpen: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null, detailOpen: false };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 지금은 콘솔이 전부다. F5 에서 리포팅이 생기면 여기서 보낸다.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    const { error, detailOpen } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex flex-1 flex-col items-center justify-center px-x4 text-center">
        <div className="flex max-w-empty flex-col items-center">
          {/* 아이콘 없음 — ErrorState 보다 한 단계 큰 상태라는 신호 */}
          <span className="t6-bold text-balance text-fg-neutral">
            {boundaryMessages.title}
          </span>

          {/* EmptyState 와 같은 36px(small) 버튼이다. 40px 은 다이얼로그
            * 자리고, 여기는 화면 안이라 EmptyState 쪽 계열을 따른다.
            * 제목이 18px 로 한 단계 크니 위 여백만 16 → 20 으로 벌린다. */}
          <div className="mt-comfy-4 flex gap-x2">
            <ActionButton
              size="small"
              variant="brandSolid"
              onClick={() => window.location.reload()}
            >
              {boundaryMessages.refresh}
            </ActionButton>
            {this.props.onGoHome && (
              <ActionButton
                size="small"
                variant="neutralWeak"
                onClick={this.props.onGoHome}
              >
                {boundaryMessages.home}
              </ActionButton>
            )}
          </div>

          {/* 개발 빌드에서만. 기본 접힘 */}
          {import.meta.env.DEV && (
            <>
              <button
                type="button"
                onClick={() => this.setState({ detailOpen: !detailOpen })}
                aria-expanded={detailOpen}
                className="t3-regular knoc-focus-ring mt-x4 rounded-r1 text-fg-neutral-subtle underline underline-offset-2"
              >
                {boundaryMessages.detail}
              </button>
              {detailOpen && (
                <pre className="t3-regular mt-x2 max-w-full overflow-x-auto rounded-r1_5 bg-bg-neutral-weak p-x3 text-left font-mono text-fg-neutral-muted">
                  {error.message}
                  {"\n"}
                  {error.stack?.split("\n")[1]?.trim()}
                </pre>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
}
