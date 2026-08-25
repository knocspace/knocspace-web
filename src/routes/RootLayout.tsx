import { Outlet, useNavigate } from "react-router";
import { AppShell } from "@/components/AppShell";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";
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
  const navigate = useNavigate();

  return (
    <ToastProvider>
      <AppShell
        sidebarWidth={sidebar.width}
        sidebarCollapsed={sidebar.collapsed}
        sidebarResizing={sidebar.resizing}
        onSidebarExpand={sidebar.expand}
        resizeHandleProps={sidebar.handleProps}
      >
        {/* Outlet 안쪽만 감싼다. 화면 하나가 죽어도 사이드바와 상단바는
          * 살아 있어야 다른 페이지로 갈 수 있다 (DESIGN.md §9). */}
        <ErrorBoundary onGoHome={() => navigate("/")}>
          <Outlet />
        </ErrorBoundary>
      </AppShell>
    </ToastProvider>
  );
}
