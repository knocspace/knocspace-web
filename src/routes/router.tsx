import { createBrowserRouter } from "react-router";
import { DocumentSurface } from "@/components/DocumentSurface/DocumentSurface";
import { routeMessages } from "@/lib/messages";
import { NotFound } from "./NotFound";
import { PageRoute } from "./PageRoute";
import { RootLayout } from "./RootLayout";

/**
 * URL 과 화면의 대응표. 라우팅 지식은 이 파일 밖으로 새지 않는다.
 *
 * children 은 전부 RootLayout 의 <Outlet /> 자리에 들어간다.
 * 셸(사이드바·상단바)은 유지되고 이 목록만 갈아끼워진다.
 *
 * 라우트별 React.lazy 는 화면이 무거워지는 F3 부터 붙인다.
 *
 * handle.crumb 은 그 화면이 상단바에 내놓을 이름이다. 문서가 아닌 화면
 * (앞으로의 휴지통 · 검색 · 설정)이 쓴다. 문서 화면은 경로가 서버에서
 * 오므로 여기 적지 않는다 — RootLayout 을 볼 것.
 *
 * 컴포넌트 카탈로그는 여기 없다. 스토리북으로 옮겼다 — `npm run storybook`.
 */

export const router = createBrowserRouter([
  {
    // path 없는 레이아웃 라우트. 주소를 차지하지 않고 감싸기만 한다.
    element: <RootLayout />,
    // TODO(F1-3): errorElement 에 ErrorBoundary
    children: [
      // TODO(F2): 홈. 지금은 기존 자리표시 문서를 그대로 둔다.
      { index: true, element: <DocumentSurface />, handle: { crumb: routeMessages.home } },
      { path: "p/:pageId", element: <PageRoute /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
