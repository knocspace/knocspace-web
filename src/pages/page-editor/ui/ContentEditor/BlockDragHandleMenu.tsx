import { useState } from "react";
import { SideMenuExtension } from "@blocknote/core/extensions";
import {
  BlockColorsItem,
  useBlockNoteEditor,
  useComponentsContext,
  useExtensionState,
} from "@blocknote/react";
import IconPaintrollerLine from "@karrotmarket/react-monochrome-icon/IconPaintrollerLine";
import IconSquare2StackedLine from "@karrotmarket/react-monochrome-icon/IconSquare2StackedLine";
import IconTrashcanLine from "@karrotmarket/react-monochrome-icon/IconTrashcanLine";
import { blockMenuLabels } from "@/shared/config";
import { copyForInsert } from "../../lib/block-duplication";
import { menuTargetBlocks } from "../../lib/block-selection";
import { knocSchema, type KnocPartialBlock } from "../../model/blocknote-schema";
import { TurnIntoMenuItem } from "./TurnIntoMenuItem";

/**
 * ⠿ 를 눌렀을 때 뜨는 판 — 전환 · 색상 · 복제 · 삭제 (DESIGN.md §9 "블록 메뉴").
 *
 * BlockNote 기본은 삭제 · 색깔 · 표 머리글 셋이다. 표 머리글은 뺐다 — 표 안에서만
 * 뜨는 줄이고, 같은 것을 표 손잡이 메뉴가 이미 갖고 있다. 전환과 복제가 는다.
 *
 * **표면은 BlockNote 것 그대로다.** 판도 줄도 `Generic.Menu` 이고, 브리지가 이미
 * 칠하고 있다 (DESIGN.md §7). `bn-drag-handle-menu` 를 다는 것이 폭 200px 을
 * 받는 조건이다 — §10 Menu 의 기본 폭이고, 슬래시 메뉴(340px)와는 다른 값이다
 * (blocknote-bridge.css 맨 아래).
 *
 * **폭이 판이 뜨는 쪽까지 정한다.** BlockNote 는 이 판을 손잡이 **왼쪽**에 열려고
 * 하는데(`position="left"`), 왼쪽에 자리가 모자라면 mantine 이 오른쪽으로
 * 뒤집는다. 그 "자리" 는 창이 아니라 문서가 굴러가는 칸이다 — 사이드바 오른쪽
 * 끝에서 잘린다(AppLayout 의 overflow-y-auto). 265px 일 때는 1440px 창에서
 * 딱 걸려서 오른쪽으로 뒤집혔다.
 *
 * **아이콘은 seed-icon 이고, 넷 다 Notion 과 같은 그림이다** (DESIGN.md §8·§9) —
 * 도는 고리 · 롤러 · 겹친 사각형 · 휴지통. 이름이 아니라 그림으로 골랐다:
 * seed-icon 은 이름이 뜻이 아니라 모양이라, 별칭으로 좁힌 다음 `.d.ts` 안의
 * `@preview` 를 꺼내 Notion 과 나란히 놓고 정했다.
 *
 * 「전환」 서브메뉴 안쪽만 BlockNote 아이콘인데, 그건 제목1·2·3 을 구별할 그림이
 * 없어서다 (turn-into-items.ts).
 *
 * 16px 인 것은 SEED Menu 규격이다 (DESIGN.md §10). 슬래시 메뉴의 18px 이 아닌
 * 이유는 줄 높이가 다르기 때문이다 — 이 판의 줄은 30px · 12px 글자다.
 */
export function BlockDragHandleMenu() {
  const Components = useComponentsContext()!;
  const editor = useBlockNoteEditor(knocSchema);

  /* 「전환」 서브메뉴가 열려 있는지. 이 판이 들고 있는 이유는 아래 두 곳에서
   * 같이 쓰기 때문이다 — 「전환」 자신의 판을 그릴지, 「색상」의 판을 감출지. */
  const [turnIntoOpen, setTurnIntoOpen] = useState(false);

  const block = useExtensionState(SideMenuExtension, {
    editor,
    selector: (state) => state?.block,
  });

  if (block === undefined) {
    return null;
  }

  /* 「복제」·「삭제」가 다루는 블록. 규칙은 block-selection.ts 에 한 벌 있고,
   * 「전환」도 같은 것을 부른다. 여기서 다시 세지 않는다. */
  const targetBlocks = () => menuTargetBlocks(block, editor.getSelection()?.blocks);

  return (
    /* **「전환」이 열려 있는 동안 「색상」의 판을 감춘다.** 서브메뉴 둘이 겹쳐
     * 뜨던 것의 나머지 반쪽이다 — 「색상」에서 「전환」으로 올라가면 mantine 이
     * 그 판을 닫아 두고도 0.5초 동안 그림을 남긴다(TurnIntoMenuItem 의 주석).
     *
     * 저쪽은 BlockNote 부품이라 언마운트로 못 끊는다. BlockColorsItem 이 판을
     * 직접 그리고, 열렸는지도 안 알려 준다. 그래서 그 판을 이름으로 짚어 감춘다 —
     * `bn-color-picker-dropdown` 은 BlockColorsItem 이 스스로 다는 이름이다.
     *
     * 자리를 차지한 채 투명해지는 것이 아니라 `display: none` 이라, 감춘 동안
     * 마우스도 안 걸린다. 「전환」이 닫히는 순간 도로 보인다. */
    <Components.Generic.Menu.Dropdown
      className={`bn-menu-dropdown bn-drag-handle-menu${
        turnIntoOpen ? " [&_.bn-color-picker-dropdown]:hidden" : ""
      }`}
    >
      <TurnIntoMenuItem open={turnIntoOpen} onOpenChange={setTurnIntoOpen} />

      {/* 색상 줄이 여는 판은 BlockNote 것을 그대로 쓴다. 이 줄이 여는 것은 색 스무 칸이고,
        * 그걸 그리는 부품(ColorPicker · ColorIcon)은 @blocknote/react 가 밖으로
        * 안 내놓는다 — 우리가 다시 그리면 사전 · 색 목록 · 칠하는 방법 세 벌을
        * 베껴 와야 하고 그게 BlockNote 를 따라 안 움직인다.
        *
        * **그래서 아이콘이 왼쪽 칸이 아니라 이름 안에 있다.** BlockColorsItem 은
        * children 을 이름 자리에만 넣어 주고 아이콘 자리는 안 열어 준다. 10px 은
        * mantine 이 왼쪽 칸에 주는 간격(--mantine-spacing-xs)과 같은 값이라,
        * 이름의 시작점이 위아래 줄과 맞는다. 값이 어긋나면 이 줄만 밀린다. */}
      <BlockColorsItem>
        <span className="inline-flex items-center gap-dense-5">
          <IconPaintrollerLine size={16} />
          {blockMenuLabels.colors}
        </span>
      </BlockColorsItem>

      {/* 복제 · 삭제는 우리가 그린다. BlockNote 의 RemoveBlockItem 을 안 쓰는
        * 이유는 하나다 — 그 부품은 이름만 받고 아이콘 자리를 안 열어 준다.
        * 하는 일(고른 것 전부 지우기)은 그대로 옮겨 왔다. */}
      <Components.Generic.Menu.Item
        className="bn-menu-item"
        icon={<IconSquare2StackedLine size={16} />}
        onClick={() => {
          const blocks = targetBlocks();
          /* 사이드 메뉴가 들고 있는 블록은 BlockNote 가 `Block<any, any, any>` 로
           * 준다(SideMenuState). 우리 스키마로 좁힐 방법이 밖에 없어서 넣는
           * 자리에서 한 번 짚어 준다 — 값은 이 문서에서 꺼낸 것 그대로다. */
          const copies = blocks.map(copyForInsert) as KnocPartialBlock[];

          /* 마지막 블록 **뒤**에 붙인다. 여러 줄을 복제하면 원본 다음에 사본이
           * 통째로 오는 것이 Notion 이고, 한 줄씩 사이에 끼우면 순서가 섞인다. */
          editor.insertBlocks(copies, blocks[blocks.length - 1], "after");
        }}
      >
        {blockMenuLabels.duplicate}
      </Components.Generic.Menu.Item>

      <Components.Generic.Menu.Item
        className="bn-menu-item"
        icon={<IconTrashcanLine size={16} />}
        onClick={() => editor.removeBlocks(targetBlocks())}
      >
        {blockMenuLabels.remove}
      </Components.Generic.Menu.Item>
    </Components.Generic.Menu.Dropdown>
  );
}
