import type { ComponentType } from "react";

/**
 * 아이콘 자리에 넣을 수 있는 것 — seed-icon · 카카오 monochrome-icon 이 이 모양이다.
 *
 * 컴포넌트 폴더 밖에 두는 이유는 이 타입을 셋이 나눠 쓰기 때문이다
 * (EmptyState · IconButton · Menu). 어느 한 컴포넌트 파일에 두면 나머지 둘이
 * 그 컴포넌트를 import 하게 되고, shared/ui 안에서 부품끼리 서로를 아는
 * 그물이 생긴다. 공용 타입은 부품이 아니라 세그먼트가 갖는다.
 */
export type IconComponent = ComponentType<{
  size?: string | number;
  className?: string;
}>;
