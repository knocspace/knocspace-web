import { createBrowserRouter } from "react-router";
import { NotFoundPage } from "@/pages/not-found";
import { EditorSurface, PageEditorPage } from "@/pages/page-editor";
import { routeMessages } from "@/shared/config";
import { AppLayout } from "../ui/AppLayout";

/**
 * URL 과 화면의 대응표. 라우팅 지식은 이 파일 밖으로 새지 않는다.
 *
 * children 은 전부 AppLayout 의 <Outlet /> 자리에 들어간다.
 * 셸(사이드바·상단바)은 유지되고 이 목록만 갈아끼워진다.
 *
 * 라우트별 React.lazy 는 화면이 무거워지는 F3 부터 붙인다.
 *
 * handle.crumb 은 그 화면이 상단바에 내놓을 이름이다. 문서가 아닌 화면
 * (앞으로의 휴지통 · 검색 · 설정)이 쓴다. 문서 화면은 경로가 서버에서
 * 오므로 여기 적지 않는다 — AppLayout 을 볼 것.
 *
 * 컴포넌트 카탈로그는 여기 없다. 스토리북으로 옮겼다 — `npm run storybook`.
 */

export const router = createBrowserRouter([
  {
    // path 없는 레이아웃 라우트. 주소를 차지하지 않고 감싸기만 한다.
    element: <AppLayout />,
    // TODO(F1-3): errorElement 에 ErrorBoundary
    children: [
      /* TODO(F2): 홈 화면(`pages/home`)이 들어올 자리. 지금은 `page-editor` 의
       * 문서 표면만 빈 채로 그린다.
       *
       * 여기만 화면이 아닌 부품을 라우트에 꽂는다. F2 에 `pages/home` 이
       * 생기면 이 줄과 `page-editor` public API 의 `EditorSurface` 가 같이
       * 빠진다 — 그때까지는 홈 슬라이스를 만들 내용이 없어서 비워 둔다. */
      { index: true, element: <EditorSurface />, handle: { crumb: routeMessages.home } },
      { path: "p/:pageId", element: <PageEditorPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
