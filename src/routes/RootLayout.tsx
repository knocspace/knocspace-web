import { Outlet } from "react-router";
import { AppShell } from "@/components/AppShell";
import { useSidebarResize } from "@/hooks/useSidebarResize";

/**
 * 라우트가 바뀌어도 살아남는 껍데기. 셸을 그리고 <Outlet /> 자리를 비워 둔다.
 *
 * useSidebarResize 가 화면이 아니라 여기 있는 이유 — <Outlet /> 안쪽은
 * 이동할 때마다 언마운트된다. 훅을 그 안에 두면 페이지를 옮길 때마다
 * 폭 상태가 사라지고 localStorage 에서 다시 읽히면서 한 번 튄다.
 */

export function RootLayout() {
  const sidebar = useSidebarResize();

  return (
    <AppShell
      sidebarWidth={sidebar.width}
      sidebarCollapsed={sidebar.collapsed}
      sidebarResizing={sidebar.resizing}
      onSidebarExpand={sidebar.expand}
      resizeHandleProps={sidebar.handleProps}
    >
      <Outlet />
    </AppShell>
  );
}
