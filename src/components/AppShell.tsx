import type { PointerEvent, ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

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
  breadcrumb?: ReactNode;
  topBarActions?: ReactNode;
  children?: ReactNode;
}

export function AppShell({
  sidebarWidth,
  sidebarCollapsed,
  sidebarResizing,
  onSidebarExpand,
  resizeHandleProps,
  sidebar,
  breadcrumb,
  topBarActions,
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
        <TopBar actions={topBarActions}>{breadcrumb}</TopBar>
        {children}
      </div>
    </div>
  );
}
