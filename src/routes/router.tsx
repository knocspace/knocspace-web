import { createBrowserRouter } from "react-router";
import { DocumentSurface } from "@/components/DocumentSurface";
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
 */

export const router = createBrowserRouter([
  {
    // path 없는 레이아웃 라우트. 주소를 차지하지 않고 감싸기만 한다.
    element: <RootLayout />,
    // TODO(F1-3): errorElement 에 ErrorBoundary
    children: [
      // TODO(F2): 홈. 지금은 기존 자리표시 문서를 그대로 둔다.
      { index: true, element: <DocumentSurface /> },
      { path: "p/:pageId", element: <PageRoute /> },
      // TODO(F1-5): /dev/ui 카탈로그 — import.meta.env.DEV 일 때만 등록
      { path: "*", element: <NotFound /> },
    ],
  },
]);
