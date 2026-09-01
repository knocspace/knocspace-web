/**
 * KnocSpace 심볼. 원본은 src/shared/assets/brand/knocspace-symbol*.svg.
 *
 * stroke 를 currentColor 로 두고 색은 바깥에서 준다 — 기본은 text-fg-brand 라
 * 라이트/다크가 SEED 토큰을 따라 알아서 뒤집힌다(-dark.svg 를 쓸 일이 없다).
 * 작은 크기에서 선이 사라지지 않게 stroke 두께는 크기별로 다르다.
 */

export type BrandMarkSize = 16 | 18 | 24;

/** 원본 SVG 3종의 stroke-width 를 그대로 가져온 값 */
const STROKE_WIDTH: Record<BrandMarkSize, number> = {
  16: 2.4,
  18: 2.2,
  24: 2,
};

export interface BrandMarkProps {
  size?: BrandMarkSize;
  /** 색·여백만 넘긴다. 기본 색은 text-fg-brand. */
  className?: string;
  /** 옆에 워크스페이스 이름이 없을 때만 준다. 없으면 장식으로 취급한다. */
  label?: string;
}

export function BrandMark({ size = 24, className, label }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE_WIDTH[size]}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={["shrink-0 text-fg-brand", className].filter(Boolean).join(" ")}
    >
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" />
      <path d="M9.5 7.5v9M9.5 12l6-4.5M9.5 12l6 4.5" />
    </svg>
  );
}
