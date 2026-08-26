import { useState } from "react";
import { Outlet, useMatch, useMatches, useNavigate } from "react-router";
import { AppShell } from "@/components/AppShell";
import type { BreadcrumbItem } from "@/components/Breadcrumb";
import { PageTree } from "@/components/tree/PageTree";
import type { TreeItemData } from "@/components/tree/PageTreeItem";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";
import { visibleItems } from "@/features/page-tree/visibleItems";
import { useSidebarResize } from "@/hooks/useSidebarResize";

/**
 * 라우트가 바뀌어도 살아남는 껍데기. 셸을 그리고 <Outlet /> 자리를 비워 둔다.
 *
 * useSidebarResize 가 화면이 아니라 여기 있는 이유 — <Outlet /> 안쪽은
 * 이동할 때마다 언마운트된다. 훅을 그 안에 두면 페이지를 옮길 때마다
 * 폭 상태가 사라지고 localStorage 에서 다시 읽히면서 한 번 튄다.
 */

/**
 * 사이드바에 그릴 페이지 목록.
 *
 * TODO(F2): `usePageTree()` 로 바꾼다. 그때 이 상수와 아래 useState 가 사라지고
 * `features/page-tree/PageTreeContainer` 하나가 그 자리에 온다 — `visibleItems`
 * 는 입력만 `PageSummary[]` 로 바뀌고 `PageTree` 는 안 바뀐다.
 *
 * 크럼(아래)이 URL 의 pageId 를 임시로 쓰는 것과 같은 이유로 여기 있다.
 * 목록만 가짜고, **어느 페이지가 열려 있는지와 이동은 진짜다** — 라우터가 한다.
 */
const SIDEBAR_PAGES: TreeItemData[] = [
  { id: "product", title: "제품 기획", icon: null, depth: 0, hasChildren: true, isExpanded: false },
  { id: "roadmap", title: "2분기 로드맵", icon: null, depth: 1, hasChildren: true, isExpanded: false },
  { id: "tokens", title: "토큰 대조표", icon: null, depth: 2, hasChildren: false, isExpanded: false },
  { id: "focus", title: "포커스 링 결정", icon: null, depth: 2, hasChildren: false, isExpanded: false },
  { id: "design", title: "디자인 시스템 정리", icon: null, depth: 1, hasChildren: false, isExpanded: false },
  { id: "notes", title: "회의록", icon: null, depth: 0, hasChildren: false, isExpanded: false },
];

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

  /* TODO(F2): `useExpandedIds()` — 펼침 상태는 localStorage 에 남아야 한다.
   * 지금은 새로고침하면 초기값으로 돌아간다. */
  const [expandedIds, setExpandedIds] = useState<string[]>(["product"]);

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
        sidebar={
          <PageTree
            items={visibleItems(SIDEBAR_PAGES, expandedIds)}
            selectedId={pageId ?? null}
            onSelect={(id) => navigate(`/p/${id}`)}
            onToggle={(id) =>
              setExpandedIds((ids) =>
                ids.includes(id) ? ids.filter((each) => each !== id) : [...ids, id],
              )
            }
            /* TODO(F2): 행 메뉴와 하위 페이지 추가. 지금은 ⋯ 와 + 가 보이기만
             * 하고 아무 일도 안 한다 — 만들기·이름 바꾸기·삭제가 전부 sprint-2 §5 다. */
          />
        }
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
