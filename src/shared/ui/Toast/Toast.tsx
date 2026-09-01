import type { ReactNode } from "react";
import {
  SnackbarRegion,
  SnackbarRenderer,
  SnackbarRootProvider,
} from "@seed-design/react";

/**
 * 토스트가 뜨는 자리 — DESIGN.md §10.
 *
 * SEED Snackbar 를 그대로 감싼다. 표면(min-height 44px, r2)은 맞고,
 * SEED 에 없는 것은 가장자리 여백뿐이다 — 모바일은 하단 고정이라 정할
 * 필요가 없었다.
 *
 * 하단 가운데에 둔다. 노션이 그 자리다. 사이드바 폭이 200~480px 로 변해도
 * 토스트는 뷰포트 기준이라 움직이지 않는다.
 *
 * 앱을 한 번만 감싼다. 지금은 AppLayout 이 자리다.
 * 띄우는 쪽은 useToast() 를 쓴다.
 */

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <SnackbarRootProvider>
      {children}
      {/* SEED 의 region recipe 가 이미 left:0 · right:0 · align-items:center 다.
        * 화면 폭을 다 차지하고 가운데 정렬한다 — 하단 가운데는 그대로 쓴다.
        * 우리가 더하는 것은 position 과 가장자리 여백뿐이다.
        *
        * 가장자리 16px(§10)은 bottom 이 아니라 padding 으로 준다.
        * SEED 의 tailwind4-theme 은 p·m·gap·size 만 @utility 로 x 스케일에
        * 이어 두고 bottom·left·inset 은 안 만든다 — 그쪽은 Tailwind 기본
        * --spacing-* 네임스페이스를 보는데 SEED 는 --dimension-* 에만 값을
        * 넣는다. bottom-x3 처럼 쓰면 클래스가 아예 생성되지 않고 조용히 없다.
        * region 은 이미 bottom:0(safe-area) 이라 padding 만으로 맞는다.
        *
        * Tailwind 유틸리티는 utilities 레이어라 seed-components 보다 뒤에
        * 와서 !important 없이 이긴다 (global.css 의 @layer 순서). */}
      <SnackbarRegion className="fixed p-x4">
        <SnackbarRenderer />
      </SnackbarRegion>
    </SnackbarRootProvider>
  );
}
