import type { PointerEvent, ReactNode } from "react";

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
          aria-label="사이드바 펼치기"
          aria-expanded={false}
          className="flex flex-1 flex-col items-center gap-x2 py-x3 hover:bg-bg-neutral-weak-alpha focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-stroke-focus-ring"
        >
          {/* 아이콘 레일 자리표시. 실제 아이콘은 트리 스프린트에서. */}
          {Array.from({ length: 4 }, (_, index) => (
            <span
              key={index}
              aria-hidden
              className="size-x5 rounded-r1 bg-bg-neutral-weak-alpha"
            />
          ))}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-x4 overflow-y-auto p-x3">
          {children ?? <SidebarPlaceholder />}
        </div>
      )}

      {/* 우측 경계 = 드래그 핸들.
        * 경계선 위에 겹쳐 두고 폭을 조금 넓혀 잡기 쉽게 한다.
        * touch-none 이 없으면 터치에서 브라우저 스크롤 제스처에 뺏긴다. */}
      <div
        {...resizeHandleProps}
        role="separator"
        aria-orientation="vertical"
        aria-label="사이드바 폭 조절"
        data-resizing={resizing || undefined}
        className="absolute inset-y-0 right-0 w-x1 translate-x-1/2 cursor-col-resize touch-none bg-bg-transparent transition-colors duration-d1 hover:bg-bg-brand-solid data-resizing:bg-bg-brand-solid"
      />
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
