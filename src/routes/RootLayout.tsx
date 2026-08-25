import { Outlet, useMatch, useMatches, useNavigate } from "react-router";
import { AppShell } from "@/components/AppShell";
import type { BreadcrumbItem } from "@/components/Breadcrumb";
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

/**
 * 라우트가 handle 에 담아 둔 화면 이름. 없으면 null.
 *
 * useMatches 의 handle 은 unknown 이다. 라우트 설정은 타입 검사를 안 거친
 * 값을 담을 수 있어서, 모양을 여기서 한 번 확인하고 지나간다.
 */
function routeCrumb(handle: unknown): string | null {
  if (typeof handle !== "object" || handle === null || !("crumb" in handle)) {
    return null;
  }
  const { crumb } = handle as { crumb: unknown };
  return typeof crumb === "string" ? crumb : null;
}

export function RootLayout() {
  const sidebar = useSidebarResize();
  const navigate = useNavigate();

  /* 상단바에 올릴 경로. 화면 종류에 따라 출처가 다르다.
   *
   * 문서 화면 — 조상도 제목도 서버에서 온다. 지금 알 수 있는 건 URL 의
   * pageId 하나뿐이라 그것만 현재 페이지로 그린다.
   * TODO(F2): usePage(pageId) 의 조상 배열로 바꾼다. 그때 title 이 id 가
   * 아닌 진짜 제목이 되고, 조상이 앞에 붙는다.
   *
   * 그 밖의 화면 — 카탈로그처럼 문서가 아닌 곳은 주소만 보고 이름을 안다.
   * 라우트가 handle.crumb 으로 스스로 밝히고 여기서 주워 온다. 앞으로
   * 생길 휴지통 · 검색 · 설정도 같은 자리를 쓴다.
   *
   * TODO(F3): saveStatus. 저장이 생기기 전까지는 idle 이라 안 그린다. */
  const pageMatch = useMatch("/p/:pageId");
  const pageId = pageMatch?.params.pageId;
  const matches = useMatches();

  const crumbs: BreadcrumbItem[] = pageId
    ? [{ id: pageId, title: pageId }]
    : matches.flatMap((match) => {
        const crumb = routeCrumb(match.handle);
        /* id 를 pathname 으로 두는 건 이 갈래에서만이다. 지금은 이름이
         * 하나뿐이라 현재 페이지가 되고, 현재 페이지는 누를 수 없어서
         * onCrumbSelect 로 새어 나가지 않는다. 중첩된 화면이 생기면
         * 그때 이 갈래의 이동 규칙을 따로 정한다. */
        return crumb ? [{ id: match.pathname, title: crumb }] : [];
      });

  return (
    <ToastProvider>
      <AppShell
        sidebarWidth={sidebar.width}
        sidebarCollapsed={sidebar.collapsed}
        sidebarResizing={sidebar.resizing}
        onSidebarExpand={sidebar.expand}
        resizeHandleProps={sidebar.handleProps}
        topBar={{
          crumbs,
          onCrumbSelect: (id) => navigate(`/p/${id}`),
        }}
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
