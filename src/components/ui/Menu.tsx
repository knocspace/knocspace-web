import type { ReactNode } from "react";
import {
  MenuContent,
  MenuItem,
  MenuItemLabel,
  MenuPositioner,
  MenuRoot,
  MenuScrollArea,
  MenuTrigger,
} from "@seed-design/react";
import type { IconComponent } from "./EmptyState";

/**
 * 우클릭 · 드롭다운 메뉴 — DESIGN.md §10.
 *
 * SEED Menu 를 감싸되 반경과 밀도를 덮는다. SEED 기본값은 반경 r5 20px,
 * 항목 폰트 t5 16px, 세로 패딩 12px 인데 그건 터치 시트 기준이다.
 * 28px 트리 행 옆에 뜨는 메뉴가 다이얼로그만큼 둥글면 무게가 안 맞는다.
 *
 * 덮는 방법이 자리마다 다르다. §1 을 어기지 않으려면 셋을 구분해야 한다.
 *
 * 1. 값이 그 요소 자신에 있으면 style prop — content 폭·반경, 항목 높이·패딩
 * 2. 값이 자식 요소에 있으면 그 자식에 style prop — 글자 크기는 label 이
 *    자기 클래스로 들고 있어서(.seed-menu-item__label--size_*) 항목 root 에
 *    걸면 안 먹는다. 이게 지금까지 항목이 16px 로 나오던 이유다
 * 3. 값이 의사요소에 있으면 Tailwind before:/after: — 호버 배경과 포커스 링은
 *    :before / :after 가 그려서 style prop 이 닿지 않는다. Tailwind 유틸리티는
 *    utilities 레이어라 seed-components 보다 뒤에 와서 !important 없이 이기고,
 *    자기 의사요소를 가리키는 것이라 "자손 선택자" 도 아니다
 */

export interface MenuAction {
  id: string;
  label: string;
  icon?: IconComponent;
  onSelect: () => void;
  /** 되돌릴 수 없는 것. 구분선 아래로 내려가고 한 메뉴에 하나만 둔다 */
  isDestructive?: boolean;
  isDisabled?: boolean;
}

export interface MenuProps {
  items: MenuAction[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 트리거. asChild 로 넘어가므로 요소 하나여야 한다 */
  children: ReactNode;
}

/** 아이콘은 트리 행 액션 버튼과 같은 16px (§2) */
const ICON_SIZE = 16;

// SEED 값을 덮는 자리. 여기 밖에서 메뉴 치수를 쓰지 않는다.
const CONTENT_STYLE = {
  width: 200,
  borderRadius: "var(--seed-radius-r2)",
} as const;

const ITEM_STYLE = {
  /* height 를 실효화하려면 recipe 의 padding-block 을 0 으로 눌러야 한다.
   * size="small" 도 위아래 10px 씩이라, 안 누르면 30px 박스 안에서 세로
   * 패딩만 20px 이 된다. 세로 가운데는 recipe 의 align-items: center 가 잡는다. */
  height: 30,
  paddingBlock: 0,
  paddingInline: "var(--knoc-space-dense-4)",
  gap: "var(--knoc-space-dense-4)",
} as const;

/**
 * 글자 크기는 항목 root 가 아니라 label 이 자기 클래스로 들고 있다.
 * root 에 fontSize 를 걸어도 자식이 자기 값을 다시 선언해서 안 내려간다.
 */
const LABEL_STYLE = {
  fontSize: "var(--seed-font-size-t3)",
  lineHeight: "var(--seed-line-height-t3)",
} as const;

/**
 * 호버 배경(:before)과 포커스 링(:after) 모양.
 *
 * SEED 는 둘 다 반경 r3 12px 에 좌우 8px 씩 안으로 들여서 그린다. 30px 행에서
 * 반경 12px 이면 거의 알약이고, 8px 을 들이면 하이라이트가 항목보다 좁아
 * 글자만 남고 배경이 뒤로 물러난다. 트리 행 선택 배경(r1)과 계열을 맞춘다.
 */
const ITEM_SURFACE =
  "before:inset-x-0 before:rounded-r1 after:inset-x-0 after:rounded-r1";

export function Menu({ items, open, onOpenChange, children }: MenuProps) {
  const normal = items.filter((item) => !item.isDestructive);
  const destructive = items.filter((item) => item.isDestructive);

  const renderItem = (item: MenuAction) => (
    <MenuItem
      key={item.id}
      onClick={item.onSelect}
      disabled={item.isDisabled}
      // 색을 직접 칠하지 않는다. tone 이 label 과 아이콘을 같이 바꾼다 —
      // label 은 자기 클래스로 색을 들고 있어서 root 에 color 를 걸면 반만 든다.
      tone={item.isDestructive ? "critical" : "neutral"}
      style={ITEM_STYLE}
      className={ITEM_SURFACE}
    >
      {item.icon && <item.icon size={ICON_SIZE} />}
      <MenuItemLabel style={LABEL_STYLE}>{item.label}</MenuItemLabel>
    </MenuItem>
  );

  return (
    // size 를 안 넘기면 medium(터치) 으로 그려진다. small 로 시작해 놓고
    // 남는 차이만 위에서 덮는다 — 덮을 값이 적을수록 SEED 업그레이드에 안전하다.
    <MenuRoot open={open} onOpenChange={onOpenChange} size="small">
      <MenuTrigger asChild>{children}</MenuTrigger>
      <MenuPositioner>
        <MenuContent style={CONTENT_STYLE}>
          {/* scrollArea 를 빼먹으면 max-height 와 overflow-y 가 같이 빠져서
            * 항목이 많을 때 메뉴가 화면 밖으로 자란다. SEED 는 여기에 상하
            * 8px 패딩과 항목 사이 8px 간격을 주는데, 둘 다 터치 기준이라 뺀다. */}
          <MenuScrollArea className="gap-0 p-dense-2">
            {normal.map(renderItem)}
            {destructive.length > 0 && normal.length > 0 && (
              // 손이 미끄러져 닿는 자리에서 떨어뜨린다.
              <div
                role="separator"
                className="mx-x1 my-x1 h-px bg-stroke-neutral-muted"
              />
            )}
            {destructive.map(renderItem)}
          </MenuScrollArea>
        </MenuContent>
      </MenuPositioner>
    </MenuRoot>
  );
}
