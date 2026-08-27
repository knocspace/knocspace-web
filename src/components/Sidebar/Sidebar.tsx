import type { PointerEvent, ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark/BrandMark";
import { TreeSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { sidebarMessages } from "@/lib/messages";

/**
 * 좌측 사이드바. 폭과 접힘 상태는 바깥에서 받는다.
 * 색은 SEED semantic 토큰만, 치수는 --knoc- 변수만 쓴다.
 */

export interface SidebarProps {
  /** 렌더할 폭(px). 접힌 상태면 레일 폭이 넘어온다. */
  width: number;
  collapsed: boolean;
  /** 드래그 중에는 폭 트랜지션을 끈다. 안 그러면 포인터를 한 박자 늦게 따라온다. */
  resizing: boolean;
  /** 레일을 클릭했을 때 */
  onExpand: () => void;
  resizeHandleProps: {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
  };
  /**
   * 페이지 트리가 들어오는 자리. 워크스페이스 락업과 "페이지" 라벨 같은
   * 사이드바 자체의 뼈대는 여기서 그린다 — 바깥이 매번 다시 조립할 것이 아니다.
   * 없으면 `TreeSkeleton` 이 자리를 지킨다.
   */
  children?: ReactNode;
}

export function Sidebar({
  width,
  collapsed,
  resizing,
  onExpand,
  resizeHandleProps,
  children,
}: SidebarProps) {
  return (
    <aside
      style={{ width }}
      data-collapsed={collapsed || undefined}
      className={[
        "relative flex h-full shrink-0 flex-col",
        // 사이드바는 basement, 본문은 default. 라이트에서는 사이드바가 한 톤 어둡고
        // 다크에서도 같은 관계가 유지된다(basement=gray-00, default=gray-100).
        "bg-bg-layer-basement",
        "border-r border-stroke-neutral-muted",
        resizing ? "" : "transition-[width] duration-d2 ease-in-out",
      ].join(" ")}
    >
      {collapsed ? (
        <button
          type="button"
          onClick={onExpand}
          aria-label={sidebarMessages.expand}
          aria-expanded={false}
          className="flex flex-1 flex-col items-center gap-x2 py-x3 knoc-focus-ring-inset hover:bg-bg-neutral-weak-alpha"
        >
          <BrandMark size={18} />
          {Array.from({ length: 3 }, (_, index) => (
            <span
              key={index}
              aria-hidden
              className="size-x5 rounded-r1 bg-bg-neutral-weak-alpha"
            />
          ))}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-x4 overflow-y-auto p-x3">
          <div className="flex items-center gap-x2">
            <BrandMark size={18} />
            <span className="t3-bold truncate text-fg-neutral">
              {sidebarMessages.workspace}
            </span>
          </div>

          {/* 검색 · 새 페이지 · 즐겨찾기 — 각각 F8 · F2 · F8 이다. 지금은
            * 트리 행과 같은 리듬(28px)만 잡아 두는 자리표시다. */}
          <div className="flex flex-col gap-dense-1">
            {sidebarMessages.shortcuts.map((label) => (
              <span
                key={label}
                className="t3-regular flex h-tree-row items-center truncate rounded-r1 px-x2 text-fg-neutral-muted"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex min-w-0 flex-col gap-dense-1">
            <span className="t3-bold px-x2 text-fg-neutral-subtle">
              {sidebarMessages.pages}
            </span>
            {children ?? <TreeSkeleton />}
          </div>
        </div>
      )}

      {/* 우측 경계 = 드래그 핸들.
        * 경계선 위에 겹쳐 두고 폭을 조금 넓혀 잡기 쉽게 한다.
        * touch-none 이 없으면 터치에서 브라우저 스크롤 제스처에 뺏긴다. */}
      <div
        {...resizeHandleProps}
        role="separator"
        aria-orientation="vertical"
        aria-label={sidebarMessages.resizeHandle}
        data-resizing={resizing || undefined}
        className="absolute inset-y-0 right-0 w-x1 translate-x-1/2 cursor-col-resize touch-none bg-bg-transparent transition-colors duration-d1 hover:bg-bg-brand-solid data-resizing:bg-bg-brand-solid"
      />
    </aside>
  );
}
