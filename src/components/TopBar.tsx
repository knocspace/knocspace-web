import type { ReactNode } from "react";
import { Breadcrumb } from "./Breadcrumb";
import type { BreadcrumbItem } from "./Breadcrumb";
import { SaveStatus } from "./SaveStatus";
import type { SaveState } from "./SaveStatus";

/**
 * 상단바. 본문 스크롤 컨테이너 안에서 sticky 로 붙는다.
 * 높이는 --knoc-topbar-height (44px). SEED 앱바 56pt 는 터치 기준이라 쓰지 않는다.
 *
 * 안에 무엇이 들어갈지는 이 컴포넌트가 안다 — 왼쪽은 Breadcrumb, 오른쪽은
 * SaveStatus 와 액션이다 (DESIGN.md §10). 그래서 ReactNode 슬롯이 아니라
 * 값을 받는다. 슬롯으로 두면 호출하는 쪽마다 순서와 간격을 다시 정하게 된다.
 *
 * 데이터는 여전히 모른다. 값은 전부 props 로 올라온다.
 */

export interface TopBarProps {
  /** 루트부터 현재 페이지까지. 비어 있으면 왼쪽은 빈 채로 둔다 */
  crumbs?: BreadcrumbItem[];
  onCrumbSelect?: (id: string) => void;
  /** 기본은 idle — 변경이 없으면 아무것도 안 그린다 (§10) */
  saveStatus?: SaveState;
  onSaveRetry?: () => void;
  /** 공유 · 북마크 · 더보기. 아직 없어서 자리만 잡아 둔다 */
  actions?: ReactNode;
}

export function TopBar({
  crumbs = [],
  onCrumbSelect,
  saveStatus = "idle",
  onSaveRetry,
  actions,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-topbar shrink-0 items-center justify-between gap-x4 border-b border-stroke-neutral-muted bg-bg-layer-default px-x4">
      {/* min-w-0 이 있어야 긴 제목이 오른쪽 액션을 밀어내지 않고 줄어든다 */}
      <div className="flex min-w-0 items-center">
        <Breadcrumb items={crumbs} onSelect={onCrumbSelect} />
      </div>

      <div className="flex shrink-0 items-center gap-x2">
        <SaveStatus status={saveStatus} onRetry={onSaveRetry} />

        {actions ?? (
          <>
            {/* 액션 자리표시 — F3 에서 진짜 버튼으로 바뀐다 */}
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
