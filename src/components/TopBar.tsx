import type { ReactNode } from "react";

/**
 * 상단바. 본문 스크롤 컨테이너 안에서 sticky 로 붙는다.
 * 높이는 --knoc-topbar-height (44px). SEED 앱바 56pt 는 터치 기준이라 쓰지 않는다.
 */

export interface TopBarProps {
  /** 좌측 브레드크럼 자리 */
  children?: ReactNode;
  /** 우측 액션 자리 — 저장상태 · 공유 · 북마크 · 더보기 */
  actions?: ReactNode;
}

export function TopBar({ children, actions }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-topbar shrink-0 items-center justify-between gap-x4 border-b border-stroke-neutral-muted bg-bg-layer-default px-x4">
      <div className="flex min-w-0 items-center gap-x2">
        {children ?? (
          <span className="t3-regular truncate text-fg-neutral-subtle">
            브레드크럼
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-x2">
        {actions ?? (
          <>
            {/* 액션 자리표시 */}
            {[0, 1, 2].map((slot) => (
              <span
                key={slot}
                aria-hidden
                className="size-x6 rounded-r1 bg-bg-neutral-weak-alpha"
              />
            ))}
          </>
        )}
      </div>
    </header>
  );
}
