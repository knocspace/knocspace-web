import type { PointerEvent, ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import type { TopBarProps } from "./TopBar";

/**
 * 3단 셸. 사이드바 | (상단바 / 본문).
 *
 * 스크롤은 우측 컬럼이 갖는다. 상단바가 그 안에서 sticky 로 붙고,
 * 사이드바는 자기 안에서 따로 스크롤한다.
 */

export interface AppShellProps {
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  sidebarResizing: boolean;
  onSidebarExpand: () => void;
  resizeHandleProps: {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
  };
  sidebar?: ReactNode;
  /* 상단바 내용은 통째로 넘긴다. 셸이 브레드크럼·저장 상태를 하나씩
   * 받아 넘기면 이 파일이 상단바가 무엇을 그리는지 알게 된다.
   *
   * 상단바를 ReactNode 슬롯으로 받는 방법도 있다(그러면 이 통과 prop 이
   * 사라진다). 안 고른 이유는 둘 — 사이드바가 이미 같은 방식으로 값을
   * 통과시키고 있어서 규칙이 하나로 남고, 셸이 직접 그려야 상단바가 없는
   * 화면이 실수로 나오지 않는다. */
  topBar?: TopBarProps;
  children?: ReactNode;
}

export function AppShell({
  sidebarWidth,
  sidebarCollapsed,
  sidebarResizing,
  onSidebarExpand,
  resizeHandleProps,
  sidebar,
  topBar,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-bg-layer-default text-fg-neutral">
      <Sidebar
        width={sidebarWidth}
        collapsed={sidebarCollapsed}
        resizing={sidebarResizing}
        onExpand={onSidebarExpand}
        resizeHandleProps={resizeHandleProps}
      >
        {sidebar}
      </Sidebar>

      {/* min-w-0 이 없으면 긴 본문이 사이드바를 밀어낸다 */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <TopBar {...topBar} />
        {children}
      </div>
    </div>
  );
}
