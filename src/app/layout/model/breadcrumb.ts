import type { PageNavigationNode } from "./page-navigation";
import { getPageNavigationPath } from "./page-navigation-path";

/**
 * 상단바 경로에 무엇을 채우나 — DESIGN.md §10.
 *
 * 출처가 둘이다. 문서 화면(`/p/:pageId`)은 페이지 트리에서 조상을 뽑고,
 * 문서가 아닌 화면(홈 · 앞으로의 휴지통 · 검색)은 라우트가 `handle.crumb` 으로
 * 내놓은 이름 하나를 쓴다. 고르는 규칙이 화면 조립보다 앞에 있는 계산이라
 * `AppLayout` 이 아니라 여기 있다.
 *
 * `Breadcrumb` 의 `BreadcrumbItem` 과 모양이 같지만 타입을 따로 둔다.
 * 그쪽은 props 이고 이쪽은 데이터다 — 컴포넌트는 이 값이 트리에서 왔는지
 * 라우트에서 왔는지 몰라야 한다.
 */
export interface Crumb {
  id: string;
  title: string;
  icon?: string | null;
}

/** 라우터가 넘겨주는 것 중 여기서 보는 것만. react-router 를 알지 않으려는 것이다 */
interface RouteMatch {
  pathname: string;
  handle: unknown;
}

function routeCrumb(handle: unknown): string | null {
  if (typeof handle !== "object" || handle === null || !("crumb" in handle)) return null;
  const { crumb } = handle as { crumb: unknown };
  return typeof crumb === "string" ? crumb : null;
}

/** 문서가 아닌 화면. `handle.crumb` 을 적어 둔 라우트만 줄에 오른다 */
export function getRouteCrumbs(matches: readonly RouteMatch[]): Crumb[] {
  return matches.flatMap((match) => {
    const crumb = routeCrumb(match.handle);
    return crumb ? [{ id: match.pathname, title: crumb }] : [];
  });
}

/**
 * 문서 화면. **접기 전 원본 목록으로 부른다** — 이유는 `getPageNavigationPath`.
 *
 * 트리에 없는 id 로 들어오면 (아직 안 받아온 페이지, 잘못된 주소) 경로를
 * 비우는 대신 id 한 칸만 그린다. 상단바가 통째로 비면 화면이 어디인지
 * 말해 주는 것이 아무것도 없다.
 */
export function getPageCrumbs(rows: PageNavigationNode[], pageId: string): Crumb[] {
  const path = getPageNavigationPath(rows, pageId);
  if (path.length === 0) return [{ id: pageId, title: pageId }];

  return path.map(({ id, title, icon }) => ({ id, title, icon }));
}
