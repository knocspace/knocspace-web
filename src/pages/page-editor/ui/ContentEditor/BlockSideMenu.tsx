import { SideMenuExtension } from "@blocknote/core/extensions";
import {
  AddBlockButton,
  DragHandleButton,
  SideMenu,
  useBlockNoteEditor,
  useExtension,
  type SideMenuProps,
} from "@blocknote/react";
import { selectBlock } from "../../lib/block-selection";

/**
 * 사이드 메뉴(＋ · ⠿). BlockNote 기본과 **한 가지만 다르다** — ⠿ 를 누르면 그
 * 블록이 선택된다. Notion 이 그렇게 동작하고, BlockNote 는 메뉴만 연다.
 *
 * 안에 그려지는 두 버튼은 BlockNote 것 그대로다. 기본 SideMenu 가 넣는 것과 같은
 * 둘을 같은 순서로 다시 넣을 뿐이다 — 손잡이를 감싸는 자리를 만들려면 children 을
 * 우리가 넘겨야 하기 때문이다.
 *
 * 자리 계산은 여기가 아니다 — blocknote-side-menu.ts, 색과 치수는
 * blocknote-bridge.css 다.
 */
export function BlockSideMenu(props: SideMenuProps) {
  const editor = useBlockNoteEditor();

  /* 어느 블록 옆에 서 있는지는 사이드 메뉴 자신이 안다. 구독(useExtensionState)
   * 이 아니라 확장을 잡아 두고 누를 때 한 번 읽는다 — 마우스가 블록을 지날 때마다
   * 이 값이 바뀌는데, 그때마다 이 컴포넌트까지 다시 그릴 이유가 없다. */
  const sideMenu = useExtension(SideMenuExtension);

  return (
    <SideMenu {...props}>
      <AddBlockButton />
      {/* `display: contents` — 상자를 안 만든다. 손잡이의 클릭을 잡으려고 한 겹
        * 씌우는 것이라, 판의 가로 배치(＋ 옆에 ⠿)가 이 span 때문에 달라지면 안 된다.
        *
        * 드래그 핸들 **메뉴**의 클릭도 여기로 올라온다. 메뉴는 포털로 나가지만
        * React 이벤트는 DOM 이 아니라 React 트리를 타기 때문이다. 그래도 두는
        * 이유는 그 경우가 전부 무해해서다 — 「삭제」는 블록이 없어져서 selectBlock
        * 이 그냥 돌아 나오고, 「색」·「헤더」는 이미 골라 둔 같은 블록을 다시 고른다. */}
      <span
        className="contents"
        onClick={() => {
          const block = sideMenu.store.state?.block;
          if (block) {
            selectBlock(editor, block.id);
          }
        }}
      >
        <DragHandleButton dragHandleMenu={props.dragHandleMenu} />
      </span>
    </SideMenu>
  );
}
