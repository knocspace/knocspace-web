import type { PageNavigationNode } from "./page-navigation";

/**
 * 사이드바에 그릴 자리표시 트리 — F2 까지만 산다.
 *
 * F2 에서 `GET /pages` 가 붙으면 이 파일은 통째로 없어지고 같은 모양이
 * `shared/api` 에서 온다. 그래서 `AppLayout` 이 아니라 여기 있다 —
 * 지울 때 화면 코드를 건드리지 않으려는 것이다.
 */
export const samplePageNavigation: PageNavigationNode[] = [
  { id: "product", title: "제품 기획", icon: null, depth: 0, hasChildren: true, isExpanded: false },
  { id: "roadmap", title: "2분기 로드맵", icon: null, depth: 1, hasChildren: true, isExpanded: false },
  { id: "tokens", title: "토큰 참조표", icon: null, depth: 2, hasChildren: false, isExpanded: false },
  { id: "focus", title: "포커스 링 결정", icon: null, depth: 2, hasChildren: false, isExpanded: false },
  { id: "design", title: "디자인 시스템 정리", icon: null, depth: 1, hasChildren: false, isExpanded: false },
  { id: "notes", title: "회의록", icon: null, depth: 0, hasChildren: false, isExpanded: false },
];
