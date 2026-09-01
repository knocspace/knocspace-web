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
import { BlockDragHandleMenu } from "./BlockDragHandleMenu";

/**
 * 사이드 메뉴(＋ · ⠿). BlockNote 기본과 **두 가지가 다르다** — ⠿ 를 누르면 그
 * 블록이 선택되고, 그때 뜨는 메뉴가 우리 것이다. 앞은 Notion 이 그렇게 동작하는데
 * BlockNote 는 메뉴만 열기 때문이고, 뒤는 BlockNote 기본이 삭제 · 색깔뿐이기
 * 때문이다 (BlockDragHandleMenu).
 *
 * 그려지는 두 버튼은 BlockNote 것 그대로다. 기본 SideMenu 가 넣는 것과 같은
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
        * 이 그냥 돌아 나오고, 「전환」·「색상」은 id 가 그대로라 같은 블록을 다시
        * 고른다. 「복제」도 원본이 그 자리에 남아 있어서 같다. */}
      <span
        className="contents"
        onClick={() => {
          const block = sideMenu.store.state?.block;
          if (block) {
            selectBlock(editor, block.id);
          }
        }}
      >
        {/* props.dragHandleMenu 를 안 넘긴다. 이 컴포넌트를 쓰는 곳은 한 곳
          * (ContentEditor 의 SideMenuController)이고, 거기서 메뉴를 갈아 끼울 일이
          * 생기면 그건 이 판 전체를 바꾸는 일이다. */}
        <DragHandleButton dragHandleMenu={BlockDragHandleMenu} />
      </span>
    </SideMenu>
  );
}
