import IconExclamationmarkTriangleLine from "@karrotmarket/react-monochrome-icon/IconExclamationmarkTriangleLine";
import {
  PageBannerButton,
  PageBannerContent,
  PageBannerRoot,
  PageBannerTitle,
} from "@seed-design/react";
import { EmptyState } from "./EmptyState";
import type { Message } from "./messages";

/**
 * 조회 실패 — DESIGN.md §9.
 *
 * 골격은 EmptyState 와 같다. 다른 것은 아이콘 모양과 버튼뿐이라 그대로 쓴다.
 *
 * 빨간 아이콘을 쓰지 않는다. 목록을 못 불러온 건 망가진 것도 잃은 것도
 * 아니다. 빈 화면과 구별되는 건 색이 아니라 아이콘 모양과 "다시 시도"
 * 버튼이고, 그 둘로 충분하다 — 색으로만 나르지 않아서 색각 이상
 * 사용자에게도 같은 정보가 간다. 빨강은 되돌릴 수 없는 것에 남겨 둔다.
 */

export interface ErrorStateProps extends Message {
  onAction?: () => void;
  /**
   * default  전면. 화면 전체가 그 상태다
   * compact  사이드바 240px. PageBanner 는 좌우 패딩만 16px 씩이라 안 들어간다
   * inline   본문 안 한 영역만 실패. 주변이 멀쩡해서 눈이 여기를 먼저 잡아야 한다
   */
  variant?: "default" | "compact" | "inline";
}

export function ErrorState({
  title,
  description,
  action,
  onAction,
  variant = "default",
}: ErrorStateProps) {
  // inline — 여기서만 색을 쓴다. 주변이 멀쩡하기 때문에 이 영역만 실패했다는
  // 걸 눈이 먼저 잡아야 한다. 전면형은 화면 전체가 그 상태라 색이 필요 없다.
  if (variant === "inline") {
    return (
      <PageBannerRoot variant="weak" tone="critical">
        <PageBannerContent>
          <PageBannerTitle>{title}</PageBannerTitle>
        </PageBannerContent>
        {action && onAction && (
          <PageBannerButton onClick={onAction}>{action}</PageBannerButton>
        )}
      </PageBannerRoot>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex flex-col gap-x1 px-x2 py-x3">
        <span className="t3-regular text-pretty text-fg-neutral-muted">{title}</span>
        {action && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="t3-bold knoc-focus-ring self-start rounded-r1 text-fg-brand"
          >
            {action}
          </button>
        )}
      </div>
    );
  }

  return (
    <EmptyState
      icon={IconExclamationmarkTriangleLine}
      title={title}
      description={description}
      action={action}
      onAction={onAction}
      // 실패한 동작을 brandSolid 로 강조하지 않는다.
      actionVariant="neutralWeak"
    />
  );
}
