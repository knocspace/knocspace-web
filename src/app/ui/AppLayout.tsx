import { useState } from "react";
import { Outlet, useMatch, useMatches, useNavigate } from "react-router";
import { ToastProvider } from "@/shared/ui";
import { getPageCrumbs, getRouteCrumbs } from "../model/breadcrumb";
import { getVisiblePageNavigationNodes } from "../model/page-navigation";
import { samplePageNavigation } from "../model/sample-page-navigation";
import { useSidebarResize } from "../model/sidebar-resize";
import { ErrorBoundary } from "./ErrorBoundary/ErrorBoundary";
import { PageNavigation } from "./PageNavigation/PageNavigation";
import { Sidebar } from "./Sidebar/Sidebar";
import { TopBar } from "./TopBar/TopBar";

/**
 * 모든 route를 감싸는 KnocSpace 애플리케이션 프레임.
 *
 * 여기가 하는 일은 조립뿐이다 — 어떤 부품을 어디에 놓고, 무엇을 서로
 * 넘겨줄지. 무엇을 그릴지 고르는 계산은 전부 `model/` 에 있다.
 *
 * `Sidebar` 와 `PageNavigation` 은 형제다. 사이드바는 자리(children)만 열고,
 * 그 자리에 무엇이 오는지는 여기서 정한다.
 */
export function AppLayout() {
  const sidebar = useSidebarResize();
  const navigate = useNavigate();
  const [expandedIds, setExpandedIds] = useState<string[]>(["product"]);
  const pageId = useMatch("/p/:pageId")?.params.pageId;
  const matches = useMatches();

  const crumbs = pageId
    ? getPageCrumbs(samplePageNavigation, pageId)
    : getRouteCrumbs(matches);

  return (
    <ToastProvider>
      <div className="flex h-dvh w-full overflow-hidden bg-bg-layer-default text-fg-neutral">
        <Sidebar
          width={sidebar.width}
          collapsed={sidebar.collapsed}
          resizing={sidebar.resizing}
          onExpand={sidebar.expand}
          resizeHandleProps={sidebar.handleProps}
        >
          <PageNavigation
            items={getVisiblePageNavigationNodes(samplePageNavigation, expandedIds)}
            selectedId={pageId ?? null}
            onSelect={(id) => navigate(`/p/${id}`)}
            onToggle={(id) =>
              setExpandedIds((ids) =>
                ids.includes(id) ? ids.filter((each) => each !== id) : [...ids, id],
              )
            }
          />
        </Sidebar>

        {/* scroll-pt — 상단바가 sticky 라, 문서 안에서 어딘가로 굴려 갈 때
          * (목차 항목 클릭) 목적지가 그 44px 아래에 깔린다. scrollIntoView 는
          * 컨테이너의 scroll-padding 을 그대로 지키므로, 가리는 쪽인 셸이
          * 자기 높이만큼 미리 비워 두는 것이 맞다 — 굴리는 쪽(블록)이
          * 상단바 높이를 알 필요가 없어진다. */}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto scroll-pt-[var(--knoc-topbar-height)]">
          <TopBar crumbs={crumbs} onCrumbSelect={(id) => navigate(`/p/${id}`)} />
          <ErrorBoundary onGoHome={() => navigate("/")}>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </ToastProvider>
  );
}
