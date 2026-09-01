import type { CSSProperties } from "react";
import { ActionButton, Icon as SeedIcon } from "@seed-design/react";
import type { IconComponent } from "../icon";

/**
 * 아이콘만 있는 버튼 — DESIGN.md §10.
 *
 * 32 · 40 은 SEED ActionButton 을 쓰되 반경·아이콘·표면을 덮는다. 24 만
 * SEED 밖이다 — ActionButton 의 제일 작은 xsmall 이 32px 이라 28px 트리 행에
 * 안 들어간다. 32 를 24 로 줄이는 건 값 하나가 아니라 패딩·아이콘·반경이
 * 전부 걸려서, 덮는 게 아니라 다른 컴포넌트다 (§1).
 *
 * SEED 기본값을 그대로 두면 세 크기가 서로 다른 물건으로 보인다.
 * 반경이 4px · 완전 원 · 8px 로 셋 다 다르고(xsmall 만 radius-full 이다),
 * 아이콘이 16 · 14 · 18 로 오르내리고, selected 가 24 는 면인데
 * 32 · 40 은 brandOutline 이라 선이 된다. §10 의 표대로 맞춘다.
 */

export interface IconButtonProps {
  icon: IconComponent;
  /** 스크린리더가 읽을 이름. 없으면 렌더하지 않는다 */
  ariaLabel: string;
  /** 24 트리 행 · 32 툴바 · 40 헤더 */
  size?: 24 | 32 | 40;
  onClick?: () => void;
  isSelected?: boolean;
  isDisabled?: boolean;
  /** 트리처럼 탭 정지점이 하나인 위젯 안에서는 -1 (§10 PageNavigation) */
  tabIndex?: number;
}

/**
 * DESIGN.md §10 의 표 그대로. 세 크기가 한 식구로 보이는지는 여기만 보면 된다.
 *
 * | size | 반경 | 아이콘 |
 * | 24 | r1 4px | 16 |
 * | 32 | r1_5 6px | 20 |
 * | 40 | r1_5 6px | 24 |
 */
const SPEC = {
  24: { icon: 16, radius: "var(--seed-radius-r1)" },
  32: { icon: 20, radius: "var(--seed-radius-r1_5)" },
  40: { icon: 24, radius: "var(--seed-radius-r1_5)" },
} as const;

/**
 * iconOnly 패딩을 0 으로 둔다.
 *
 * SEED 는 자기 아이콘 크기(14 · 18)에 맞춰 패딩을 잡아 놨다. 아이콘을 §10 값인
 * 20 · 24 로 키우면 40 이 min-width 40 + 좌우 10px + 아이콘 24 = 44×40 으로
 * 찌그러진다. 패딩을 빼면 min-width 와 height 가 정사각을 잡고 flex 가 가운데를
 * 잡는다.
 */
const NO_BOX_PADDING = {
  "--seed-box-padding-top": "0px",
  "--seed-box-padding-bottom": "0px",
  "--seed-box-padding-left": "0px",
  "--seed-box-padding-right": "0px",
} as CSSProperties;

/**
 * ghost 는 글자색과 아이콘색을 이 변수 하나로 몬다
 * (color · --seed-icon-color 가 전부 var(--seed-box-color) 를 본다).
 * color 만 바꾸면 글자는 따라오고 아이콘은 안 따라온다.
 */
const SELECTED_BOX_COLOR = {
  "--seed-box-color": "var(--seed-color-fg-brand)",
} as CSSProperties;

export function IconButton({
  icon: Icon,
  ariaLabel,
  size = 32,
  onClick,
  isSelected,
  isDisabled,
  tabIndex,
}: IconButtonProps) {
  if (!ariaLabel) {
    // 아이콘만 있는 버튼은 이름이 없으면 스크린리더에서 존재하지 않는 것과 같다.
    if (import.meta.env.DEV) {
      console.warn("IconButton: ariaLabel 이 없어서 렌더하지 않습니다.");
    }
    return null;
  }

  const spec = SPEC[size];

  /* 세 크기가 공유하는 표면 규칙 (§10) — selected 는 면(bg-brand-weak),
   * 평상시는 배경 없이 자기 호버에서만 회색.
   *
   * 호버 클래스를 disabled 에서 빼는 건 SEED 의 :not(:disabled) 를 손으로
   * 재현하는 것이다. Tailwind hover: 는 disabled 여부를 안 본다.
   *
   * ActionButton 에는 className 으로 넘긴다. Tailwind 유틸리티는 utilities
   * 레이어라 seed-components 보다 뒤에 와서 !important 없이 이긴다. */
  const surface = isSelected
    ? "bg-bg-brand-weak"
    : isDisabled
      ? "bg-bg-transparent"
      : size === 24
        ? // 24 는 트리 행 안에서만 산다. 행이 이미 bg-neutral-weak-alpha 로
          // 호버돼 있어서, 버튼도 같은 값이면 눌러도 아무 일이 없어 보인다.
          // 한 단계 진한 pressed 를 쓴다 (knocspace.css 의 tree-action 주석).
          "bg-bg-transparent hover:bg-bg-neutral-weak-alpha-pressed"
        : "bg-bg-transparent hover:bg-bg-neutral-weak-alpha";

  if (size === 24) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-pressed={isSelected}
        tabIndex={tabIndex}
        style={{ borderRadius: spec.radius }}
        className={[
          // 28px 행 안이라 링이 밖으로 나갈 자리가 없다 (§6)
          "knoc-focus-ring-inset flex size-tree-action shrink-0 items-center justify-center",
          "transition-colors duration-d1",
          surface,
          isSelected
            ? "text-fg-brand"
            : "text-fg-neutral-subtle hover:text-fg-neutral-muted",
          // SEED 의 disabled 와 같은 토큰을 쓴다. stroke 색을 글자에 쓰지 않는다
          isDisabled ? "cursor-not-allowed text-fg-disabled" : "",
        ].join(" ")}
      >
        <Icon size={spec.icon} />
      </button>
    );
  }

  return (
    <ActionButton
      size={size === 32 ? "xsmall" : "medium"}
      layout="iconOnly"
      // 늘 ghost 다. selected 를 brandOutline 으로 바꾸면 1px 테두리가 생겨
      // 24 는 면인데 32 · 40 만 선이 된다. brandOutline 은 carrot 트랙도 함께
      // 끌고 온다 (§10 Spinner 의 그 자리).
      variant="ghost"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      tabIndex={tabIndex}
      style={{
        borderRadius: spec.radius,
        ...NO_BOX_PADDING,
        ...(isSelected ? SELECTED_BOX_COLOR : null),
      }}
      className={surface}
    >
      {/* SEED 의 iconOnly 는 <Icon svg={...} /> 를 자식으로 요구한다.
        * 날 svg 를 그대로 넣으면 IconRequired 가 렌더 중에 throw 한다.
        *
        * size 는 여기서 넘긴다 — Icon 이 --seed-icon-size 를 자기 요소에
        * 인라인으로 박아서, 버튼 크기별 기본값(14 · 18)을 이긴다.
        *
        * px 를 붙여 문자열로 넘기는 건 타입 때문이다. SEED 의 size 는
        * dimension 토큰 이름을 받는 자리라 날 숫자를 안 받는다. */}
      <SeedIcon svg={<Icon />} size={`${spec.icon}px`} />
    </ActionButton>
  );
}
