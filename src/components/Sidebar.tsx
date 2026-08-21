import type { ReactNode } from "react";

/**
 * 좌측 사이드바.
 * 색은 SEED semantic 토큰만, 치수는 --knoc- 변수만 쓴다.
 */

export interface SidebarProps {
  children?: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside
      className={[
        "flex h-full w-[var(--knoc-sidebar-default)] shrink-0 flex-col",
        // 사이드바는 basement, 본문은 default. 라이트에서는 사이드바가 한 톤 어둡고
        // 다크에서도 같은 관계가 유지된다(basement=gray-00, default=gray-100).
        "bg-bg-layer-basement",
        "border-r border-stroke-neutral-muted",
      ].join(" ")}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-x4 overflow-y-auto p-x3">
        {children ?? <SidebarPlaceholder />}
      </div>
    </aside>
  );
}

function SidebarPlaceholder() {
  return (
    <>
      <div className="flex items-center gap-x2">
        <span aria-hidden className="size-x5 rounded-r1 bg-bg-neutral-weak-alpha" />
        <span className="t3-bold truncate text-fg-neutral">워크스페이스</span>
      </div>

      <div className="flex flex-col gap-x1">
        {["검색", "새 페이지", "즐겨찾기"].map((label) => (
          <span
            key={label}
            className="t3-regular flex h-[var(--knoc-tree-row-height)] items-center truncate rounded-r1 px-x2 text-fg-neutral-muted"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-x1">
        <span className="t3-bold px-x2 text-fg-neutral-subtle">페이지</span>
        {/* 트리 자리표시 */}
        {[0, 1, 2, 3].map((row) => (
          <span
            key={row}
            aria-hidden
            className="h-[var(--knoc-tree-row-height)] rounded-r1 bg-bg-neutral-weak-alpha"
            style={{ marginLeft: `calc(var(--knoc-tree-indent) * ${row % 2})` }}
          />
        ))}
      </div>
    </>
  );
}
