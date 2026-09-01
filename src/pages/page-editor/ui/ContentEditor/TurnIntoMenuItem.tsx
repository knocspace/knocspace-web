import { Fragment } from "react";
import { SideMenuExtension } from "@blocknote/core/extensions";
import { useBlockNoteEditor, useComponentsContext, useExtensionState } from "@blocknote/react";
import IconArrow2ClockwiseCircularLine from "@karrotmarket/react-monochrome-icon/IconArrow2ClockwiseCircularLine";
import { blockMenuLabels } from "@/shared/config";
import { menuTargetBlocks } from "../../lib/block-selection";
import { knocSchema } from "../../model/blocknote-schema";
import { turnIntoItems, type TurnIntoItem } from "../../model/turn-into-items";

export interface TurnIntoMenuItemProps {
  /** 서브메뉴가 열려 있는지. 상태는 부모가 든다 — 「색상」과 같이 봐야 해서다 */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 블록 메뉴의 「전환」 한 줄과 그 서브메뉴. 목록은 turn-into-items.ts 다.
 *
 * **표면은 BlockNote 것이다.** 「색상」이 여는 판과 같은 부품(Generic.Menu)이고,
 * 브리지가 이미 칠하고 있다 — 슬래시 메뉴와 같은 배경 · 반경 · 호버색이 나온다
 * (DESIGN.md §7). 우리가 넣는 것은 목록과 아이콘뿐이다.
 *
 * 서브메뉴가 오른쪽으로 열리고(`position="right"`) 줄 끝에 꺾쇠가 서는 것도
 * BlockNote 가 하는 일이다. `subTrigger` 를 넘기면 mantine 이 그 자리에 꺾쇠를
 * 그린다 — 우리가 그리지 않는다.
 *
 * **판을 닫힌 동안 아예 안 그린다.** 그게 이 컴포넌트가 BlockNote 기본과 다른
 * 유일한 곳이고, 서브메뉴 둘이 겹쳐 보이던 것을 여기서 끊는다 — 아래 주석.
 */
export function TurnIntoMenuItem({ open, onOpenChange }: TurnIntoMenuItemProps) {
  const Components = useComponentsContext()!;
  const editor = useBlockNoteEditor(knocSchema);

  /* 어느 블록 옆에서 열렸는지. BlockNote 의 메뉴 항목들과 같은 방법이다
   * (BlockColorsItem · RemoveBlockItem). 메뉴가 열려 있는 동안 사이드 메뉴는
   * 얼어 있어서(freezeMenu) 이 값이 발밑에서 바뀌지 않는다. */
  const block = useExtensionState(SideMenuExtension, {
    editor,
    selector: (state) => state?.block,
  });

  if (block === undefined) {
    return null;
  }

  const items = turnIntoItems(editor);

  /* 목록에 없는 블록 위에서는 줄 자체를 안 그린다 — 이미지 · 표 · 구분선 · 목차 ·
   * 코드 블록이다. BlockNote 의 블록 타입 선택도 같은 자리에서 같은 판단을 한다
   * (BlockTypeSelect 의 shouldShow).
   *
   * 안 막으면 이미지를 본문으로 바꿀 수 있게 되고, 그건 전환이 아니라 삭제다 —
   * `updateBlock` 이 종류를 갈아 끼우면 그 블록이 들고 있던 것이 갈 데가 없다. */
  if (!items.some((item) => isCurrentBlock(block, item))) {
    return null;
  }

  return (
    <Components.Generic.Menu.Root position="right" sub={true} onOpenChange={onOpenChange}>
      <Components.Generic.Menu.Trigger sub={true}>
        <Components.Generic.Menu.Item
          className="bn-menu-item"
          subTrigger={true}
          icon={<IconArrow2ClockwiseCircularLine size={16} />}
        >
          {blockMenuLabels.turnInto}
        </Components.Generic.Menu.Item>
      </Components.Generic.Menu.Trigger>

      {/* **닫혀 있으면 판을 아예 안 단다.** mantine 은 닫힌 서브메뉴를 바로 떼지
        * 않고 흐려지는 동안 남겨 둔다 — BlockNote 가 `transitionProps` 에
        * `duration: 250` · `exitDelay: 250` 을 박아 둬서 0.5초다(mantine 기본은 0).
        *
        * 서브메뉴가 하나뿐일 때는 안 보이던 일이다. 「전환」이 생기면서 둘이 되자,
        * 「전환」에서 「색상」으로 내려가는 동안 닫히는 판과 열리는 판이 같은 자리에
        * **겹쳐 뜬다.**
        *
        * mantine 은 이미 제대로 하고 있다 — 형제 서브메뉴가 열리는 순간
        * registerOpenSub 이 이쪽을 닫는다(opened === false). 남는 것은 그림뿐이라,
        * 그림을 안 그리면 끝난다. 이 판은 언마운트라 사라지는 데 시간이 안 걸린다.
        *
        * 반대 방향(색상 → 전환)은 저쪽 판이 남는 것이라 여기서 못 막는다.
        * BlockDragHandleMenu 가 그쪽을 맡는다. */}
      {open && (
        <Components.Generic.Menu.Dropdown sub={true} className="bn-menu-dropdown">
          {items.map((item, index) => {
            const Icon = item.icon;

            return (
              <Fragment key={item.title}>
                {/* 머리말은 묶음이 바뀌는 줄에만 찍는다 — 슬래시 메뉴와 같은 규칙이고
                  * (BlockNote 의 SuggestionMenu), 목록이 그 순서로 정렬돼 있어서
                  * 성립한다. 첫 줄은 앞이 없으므로 늘 찍힌다. */}
                {item.group !== items[index - 1]?.group && (
                  <Components.Generic.Menu.Label>{item.group}</Components.Generic.Menu.Label>
                )}
                <Components.Generic.Menu.Item
                  className="bn-menu-item"
                  icon={<Icon size={16} />}
                  /* 지금 그것이면 체크. 코드 블록 언어 목록과 같은 이유다 —
                   * 열두 줄 중 어느 것이 지금인지 눈으로 알 방법이 이것뿐이다 —
                   * 「제목1」과 「접을 수 있는 제목1」처럼 그림이 같은 줄도 있다.
                   * false 를 넘기는 쪽은 체크 자리를 빈칸으로 잡아 줄이 안 어긋난다. */
                  checked={isCurrentBlock(block, item)}
                  onClick={() => {
                    /* 「복제」·「삭제」와 같은 규칙이다 — block-selection.ts.
                     * 한 메뉴 안에서 줄마다 대상이 달라지면 안 된다. */
                    const targets = menuTargetBlocks(block, editor.getSelection()?.blocks);

                    /* 한 트랜잭션으로 묶는다. 나눠 부르면 되돌리기가 블록 수만큼
                     * 걸리고, 협업에서는 중간 상태가 그대로 남 화면에 간다. */
                    editor.transact(() => {
                      for (const target of targets) {
                        editor.updateBlock(target, item.to);
                      }
                    });
                  }}
                >
                  {item.title}
                </Components.Generic.Menu.Item>
              </Fragment>
            );
          })}
        </Components.Generic.Menu.Dropdown>
      )}
    </Components.Generic.Menu.Root>
  );
}

/**
 * 지금 블록이 그 항목인지. 종류가 같고, 항목이 정하는 props 가 전부 같으면 같다.
 *
 * props 를 통째로 비교하지 않는 것에 주의. 블록에는 색 · 정렬처럼 전환과
 * 상관없는 props 가 같이 들어 있어서, 그것까지 보면 색을 칠한 제목1 이
 * 「제목1」과 다른 것이 된다. 보는 것은 항목이 적어 둔 것뿐이다 —
 * 제목이면 level, 나머지는 없다.
 */
function isCurrentBlock(
  block: { type: string; props: Record<string, unknown> },
  item: TurnIntoItem,
) {
  if (block.type !== item.to.type) {
    return false;
  }

  const props: Record<string, unknown> = item.to.props ?? {};
  return Object.entries(props).every(([name, value]) => block.props[name] === value);
}
