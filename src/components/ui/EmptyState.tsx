import type { ComponentType, ReactNode } from "react";
import { ActionButton } from "@seed-design/react";
import type { Message } from "./messages";

/**
 * 빈 화면 — DESIGN.md §9.
 *
 * SEED ContentPlaceholder 를 쓰지 않는다. 그 골격에는 일러스트 슬롯이
 * 있는데(이미지 max-width 160px) §9 는 "일러스트나 안내 카드를 두지
 * 않는다"라서 전제가 반대다. 껍데기만 남기고 감싸면 더 복잡해진다.
 *
 * ErrorState 가 이 컴포넌트를 그대로 쓴다. 골격이 같고 아이콘과 버튼만
 * 다르기 때문이다.
 */

export type IconComponent = ComponentType<{
  size?: string | number;
  className?: string;
}>;

export interface EmptyStateProps extends Message {
  /** seed-icon 컴포넌트. compact 에서는 무시한다 */
  icon?: IconComponent;
  onAction?: () => void;
  /** 다음 행동이 그 화면 안에 있고 유일할 때만 brandSolid (§9) */
  actionVariant?: "brandSolid" | "neutralWeak";
  /** compact = 사이드바 240px · 검색 팝오버 · 목록 안 */
  variant?: "default" | "compact";
}

/**
 * 문장 배열을 <br> 로 잇는다.
 *
 * 줄바꿈은 폭이 아니라 문장이 정한다 (§8). keep-all 은 어절 안쪽만
 * 지켜서, 어절 "사이"가 끊기는 건 이렇게 직접 끊어야 막힌다.
 */
function Sentences({ lines }: { lines: readonly string[] }): ReactNode {
  return lines.map((sentence, index) => (
    <span key={sentence}>
      {index > 0 && <br />}
      {sentence}
    </span>
  ));
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  onAction,
  actionVariant = "neutralWeak",
  variant = "default",
}: EmptyStateProps) {
  // compact — 240px 폭에 아이콘·제목·설명·버튼을 다 넣으면 사이드바를 다 먹는다.
  // 한 줄과 텍스트 버튼만 남긴다.
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-x2 px-x2 py-x3">
        <span className="t3-regular min-w-0 text-pretty text-fg-neutral-subtle">
          {title}
        </span>
        {action && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="t3-bold knoc-focus-ring shrink-0 rounded-r1 text-fg-brand"
          >
            {action}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-x4 text-center">
      {/* 320px 을 넘기지 않는다. 안 잡아 두면 넓은 창에서 설명 한 줄이
        * 화면을 가로질러 가운데 정렬이 무의미해진다. */}
      <div className="flex max-w-empty flex-col items-center">
        {Icon && <Icon size={24} className="text-fg-neutral-subtle" />}

        <span
          className={[
            "t5-bold text-balance text-fg-neutral",
            Icon ? "mt-x2" : "",
          ].join(" ")}
        >
          {title}
        </span>

        {description && (
          <span className="t4-regular mt-x1 text-pretty text-fg-neutral-muted">
            <Sentences lines={description} />
          </span>
        )}

        {action && onAction && (
          <div className="mt-x4">
            <ActionButton size="small" variant={actionVariant} onClick={onAction}>
              {action}
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
}
