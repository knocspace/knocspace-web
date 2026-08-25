import type { CSSProperties } from "react";
import {
  ProgressCircleRange,
  ProgressCircleRoot,
  ProgressCircleTrack,
} from "@seed-design/react";

/**
 * 로딩 표시 — SEED ProgressCircle 을 감싼다. DESIGN.md §10.
 *
 * sprint-1 표는 SEED 대응을 LoadingIndicator 로 적었지만 그건 아니다.
 * LoadingIndicator 는 usePendingButtonContext 를 읽는 "버튼 pending" 전용이고,
 * children 을 투명하게 겹쳐 버튼 폭을 유지하는 게 일이다. 버튼 안 로딩은
 * SEED ActionButton 이 알아서 하므로 여기서 다루지 않는다.
 */

export interface SpinnerProps {
  /** 16 = 글자 옆·저장 상태 / 24 = 영역 하나 */
  size?: "small" | "medium";
  /** 오버레이 위에서만 staticWhite */
  tone?: "neutral" | "brand" | "staticWhite";
  /**
   * 스크린리더가 읽을 이름. 옆에 글자 라벨이 이미 있으면 넘기지 않는다 —
   * 같은 말을 두 번 읽는다.
   */
  label?: string;
}

/**
 * SEED 의 size variant 가 하는 일은 --size · --thickness 두 개를 채우는 것이
 * 전부다 (24 → 3px, 40 → 5px). 반경 · cx · cy · width · height 는
 * react-progress 가 그 둘에서 계산한다. 그래서 size="inherit" 로 두고 우리가
 * 채우는 건 다시 만드는 게 아니라 값을 넘기는 것이다 (§1).
 *
 * medium 24 는 SEED 가 맞춰 둔 조합이 있으니 그대로 쓴다. 우리가 정하는 건
 * small 16 하나고, 굵기는 24:3 = 16:2 로 비율을 맞췄다.
 *
 * SEED 기본 24 는 인라인 자리에 안 맞는다. 이 앱은 트리 행 28px · 본문 13px
 * 이라, 13px 글자 옆에 24px 스피너를 두면 스피너가 글자보다 크다.
 * §7 의 저장 상태도 16px 을 쓴다.
 */
const SMALL_STYLE = {
  "--size": "16px",
  "--thickness": "2px",
} as CSSProperties;

/**
 * SEED 가 semantic 을 안 거치고 팔레트를 직접 가리키는 자리다 —
 * tone="brand" 의 바탕 링이 carrot-200 이라 §1 의 brand 재매핑 9개로는
 * 안 따라온다. 팔레트 재정의는 §1 금지라 style prop 으로 넘긴다.
 *
 * 같은 참조가 action-button(버튼 pending 트랙) · checkmark ·
 * reaction-button 에도 있다. 셋 다 아직 안 쓰는 상태라 여기만 덮는다.
 */
const BRAND_TRACK = {
  "--track-color": "var(--seed-color-palette-purple-200)",
} as CSSProperties;

export function Spinner({ size = "small", tone = "neutral", label }: SpinnerProps) {
  return (
    <ProgressCircleRoot
      size={size === "small" ? "inherit" : "24"}
      tone={tone}
      style={{
        ...(size === "small" ? SMALL_STYLE : null),
        ...(tone === "brand" ? BRAND_TRACK : null),
      }}
      // value 를 넘기지 않으면 indeterminate 로 돈다.
      role="status"
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <ProgressCircleTrack />
      <ProgressCircleRange />
    </ProgressCircleRoot>
  );
}
