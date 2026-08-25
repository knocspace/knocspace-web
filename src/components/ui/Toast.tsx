import type { ReactNode } from "react";
import {
  SnackbarRegion,
  SnackbarRenderer,
  SnackbarRootProvider,
} from "@seed-design/react";

/**
 * 토스트가 뜨는 자리 — DESIGN.md §10.
 *
 * SEED Snackbar 를 그대로 감싼다. 표면(min-height 44px, r2,
 * bg-neutral-inverted)은 맞고, SEED 에 없는 것은 데스크톱 위치 규칙뿐이다 —
 * 모바일은 하단 고정이라 정할 필요가 없었다.
 *
 * 하단 왼쪽에 둔다. 트리에서 지운 것을 되돌리는 버튼이 트리 근처에 있어야
 * 한다. 넓은 화면에서 중앙은 방금 손이 있던 자리에서 800px 떨어진다.
 *
 * 앱을 한 번만 감싼다. 지금은 RootLayout 이 자리다.
 * 띄우는 쪽은 useToast() 를 쓴다.
 */

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <SnackbarRootProvider>
      {children}
      {/* SEED 의 region recipe 는 left:0 · right:0 · align-items:center 라
        * 화면 폭을 다 차지하고 가운데 정렬한다. 모바일 기준이다.
        *
        * right 와 정렬을 풀어 하단 왼쪽으로 옮긴다. Tailwind 유틸리티는
        * utilities 레이어라 seed-components 보다 뒤에 와서 !important 없이
        * 이긴다 (index.css 의 @layer 순서). §1 을 어기지 않는다.
        *
        * 가장자리 16px(§10)은 bottom·left 가 아니라 padding 으로 준다.
        * SEED 의 tailwind4-theme 은 p·m·gap·size 만 @utility 로 x 스케일에
        * 이어 두고 bottom·left·inset 은 안 만든다 — 그쪽은 Tailwind 기본
        * --spacing-* 네임스페이스를 보는데 SEED 는 --dimension-* 에만 값을
        * 넣는다. bottom-x3 처럼 쓰면 클래스가 아예 생성되지 않고 조용히 없다.
        * region 은 이미 left:0 · bottom:0(safe-area) 이라 padding 만으로 맞는다. */}
      <SnackbarRegion className="fixed right-auto w-auto items-start p-x4">
        <SnackbarRenderer />
      </SnackbarRegion>
    </SnackbarRootProvider>
  );
}
