import { useRef } from "react";
import type { MouseEvent, ReactNode, Ref } from "react";
import IconPlusLine from "@karrotmarket/react-monochrome-icon/IconPlusLine";
import IconChevronRightLine from "@karrotmarket/react-monochrome-icon/IconChevronRightLine";
import IconVertrectangleFoldedLine from "@karrotmarket/react-monochrome-icon/IconVertrectangleFoldedLine";
import IconDot3HorizontalLine from "@karrotmarket/react-monochrome-icon/IconDot3HorizontalLine";
import { IconButton } from "../ui/IconButton";
import { editorPlaceholders, treeMessages } from "../ui/messages";

/**
 * 트리 항목 하나 — DESIGN.md §5 · §10, 시안 "트리 행 — 상태와 호버 액션".
 *
 * 28px 행 / 들여쓰기 14px × depth / `t3-regular` 13-18 / 반경 r1.
 * **치수는 어느 상태에서도 안 움직인다.** 상태가 바꾸는 것은 배경과 글자색뿐이다.
 *
 * `role="treeitem"` 이다. `row` 가 아니다 — `row` 는 grid · treegrid 안에만
 * 있는 role 이고 이 트리에는 열이 없다.
 *
 * props 만 받는다. 서버도 라우터도 Query 도 모른다.
 */

/**
 * 항목 하나를 그리는 값 — sprint-1 §4. 자식을 품지 않고 `depth` 로만 계층을
 * 말한다. F2 에서 `visibleItems` 가 `PageSummary[]` + 펼친 id 집합으로 만든다.
 */
export interface TreeItemData {
  id: string;
  title: string;
  /** 문서 아이콘 이모지. null 이면 기본 문서 아이콘을 그린다 (F9 전까지 늘 null) */
  icon: string | null;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

export interface PageTreeItemProps {
  item: TreeItemData;
  isSelected: boolean;
  /**
   * roving tabindex — 트리 전체에서 0 인 항목은 하나뿐이다 (§10).
   * 행마다 탭 정지점을 두면 페이지 50개에서 사이드바를 벗어나는 데 Tab 50번이다.
   */
  tabIndex: number;
  /** 형제 중 몇 번째인지. 평평한 DOM 이라 스크린리더가 스스로 셀 수 없다 */
  posInSet: number;
  setSize: number;
  /** 드래그 중인 원본. 40% 로 남는다 (§5). 실제 드래그는 F8 */
  isDragging?: boolean;
  /**
   * 제목 자리를 대신 채운다. F2 에서 `InlineInput` 이 여기로 들어온다 —
   * 이름 바꾸기를 켜는 것은 바깥(행 메뉴 · F2 키)이라 이 컴포넌트가 안 가진다.
   */
  renameSlot?: ReactNode;

  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  /** ⋯ 를 눌렀을 때. 메뉴를 띄우는 것은 바깥이다 */
  onMenu?: (id: string, anchor: HTMLElement | null) => void;
  /** + 를 눌렀을 때 — 이 페이지 안에 하위 페이지 */
  onAdd?: (id: string) => void;
  onContextMenu?: (id: string, event: MouseEvent<HTMLElement>) => void;

  ref?: Ref<HTMLDivElement>;
}

/**
 * 좌측 패딩 = `4px + 14px × depth`.
 *
 * 유틸리티가 아니라 인라인 계산인 이유는 depth 가 값이기 때문이다. 값마다
 * 클래스를 만들면 깊이 상한이 생긴다. `TreeSkeleton` 이 같은 식을 쓴다 —
 * 자리표시와 실물이 어긋나면 로드 후 화면이 흔들린다.
 */
function indentOf(depth: number) {
  return {
    paddingLeft: `calc(var(--knoc-space-dense-2) + var(--knoc-tree-indent) * ${depth})`,
  };
}

/**
 * 상태별 배경 — §5 의 표 그대로.
 *
 * 호버가 선택보다 뒤에 오면 안 된다. 선택된 행에 회색 호버를 얹으면 보라가
 * 탁해진다. 선택은 자기 pressed 단계로 진해진다.
 */
function surfaceOf(isSelected: boolean) {
  return isSelected
    ? "bg-bg-brand-weak text-fg-neutral hover:bg-bg-brand-weak-pressed"
    : "bg-bg-transparent text-fg-neutral-muted hover:bg-bg-neutral-weak-alpha";
}

/**
 * 펼침 화살표. 버튼이 아니라 클릭되는 표시다.
 *
 * `treeitem` 안에 또 버튼을 두면 상태를 말하는 곳이 둘이 된다 — 펼침 여부는
 * 행의 `aria-expanded` 가 이미 말하고, 키보드로는 → ← 가 같은 일을 한다.
 * 그래서 `aria-hidden` 이고 포커스도 안 받는다.
 *
 * 아이콘은 하나를 돌려 쓴다. seed-icon v3 에 ChevronDown 이 따로 있지만,
 * 돌리면 펼쳐지는 동작이 90도 회전으로 이어져 보인다 — 두 파일을 갈아 끼우면
 * 그냥 튄다.
 */
function Twisty({ isExpanded, onClick }: { isExpanded: boolean; onClick: () => void }) {
  return (
    <span
      aria-hidden
      onClick={(event) => {
        // 행 열기까지 같이 일어나면 펼치자마자 페이지가 바뀐다
        event.stopPropagation();
        onClick();
      }}
      className="flex size-x4 shrink-0 cursor-pointer items-center justify-center text-fg-neutral-subtle"
    >
      <IconChevronRightLine
        size={16}
        className={`transition-transform duration-d1 ${isExpanded ? "rotate-90" : ""}`}
      />
    </span>
  );
}

export function PageTreeItem({
  item,
  isSelected,
  tabIndex,
  posInSet,
  setSize,
  isDragging,
  renameSlot,
  onSelect,
  onToggle,
  onMenu,
  onAdd,
  onContextMenu,
  ref,
}: PageTreeItemProps) {
  const { id, title, icon, depth, hasChildren, isExpanded } = item;
  const name = title || editorPlaceholders.title;

  /* 메뉴가 붙을 자리. 메뉴를 띄우는 것은 바깥이지만 어디에 띄울지는
   * 이 행만 안다 - 버튼의 화면 좌표다. */
  const menuAnchorRef = useRef<HTMLSpanElement>(null);

  return (
    <div
      ref={ref}
      role="treeitem"
      aria-level={depth + 1}
      aria-posinset={posInSet}
      aria-setsize={setSize}
      aria-selected={isSelected}
      // 자식이 없는 항목에는 아예 없어야 한다. false 를 주면 스크린리더가
      // "접힘" 이라고 읽어서 열 것이 있는 줄 안다.
      aria-expanded={hasChildren ? isExpanded : undefined}
      tabIndex={tabIndex}
      data-id={id}
      onClick={() => onSelect(id)}
      onContextMenu={(event) => onContextMenu?.(id, event)}
      style={{ ...indentOf(depth), opacity: isDragging ? 0.4 : undefined }}
      className={[
        "group flex h-tree-row select-none items-center gap-x1 pr-x1",
        "t3-regular cursor-pointer rounded-r1",
        // 28px 행 안이라 링이 밖으로 나갈 자리가 없다 (§6)
        "knoc-focus-ring-inset transition-colors duration-d1",
        surfaceOf(isSelected),
      ].join(" ")}
    >
      {hasChildren ? (
        <Twisty isExpanded={isExpanded} onClick={() => onToggle(id)} />
      ) : (
        /* 자식이 없어도 자리는 남긴다. 없애면 형제끼리 제목 시작점이 어긋난다 */
        <span aria-hidden className="size-x4 shrink-0" />
      )}

      {icon ? (
        <span
          aria-hidden
          className="flex size-x4 shrink-0 items-center justify-center leading-none"
        >
          {icon}
        </span>
      ) : (
        /* 빈 페이지 — seed-icon v3 의 vertrectangle_folded.
           * 이름이 뜻이 아니라 모양 기준이다(세로 사각형 + 접힌 모서리).
           * 별칭에 document · file · paper · 문서 · 파일 이 걸려 있다. */
        <IconVertrectangleFoldedLine
          size={16}
          aria-hidden
          className={`shrink-0 ${isSelected ? "text-fg-brand" : "text-fg-neutral-subtle"}`}
        />
      )}

      {renameSlot ?? <span className="min-w-0 flex-1 truncate">{name}</span>}

      {/* 액션 버튼 — 행 호버에서만 보인다.
        *
        * `hidden` 이라 안 보일 때는 자리도 접근성 트리도 안 차지한다.
        * `invisible` 로 자리를 남기면 안 눌린 행의 제목이 늘 48px 짧아져서,
        * 다 들어갈 제목이 괜히 잘린다. 빠져도 되는 이유는 이 둘이 행 메뉴
        * 항목의 **마우스 지름길**이기 때문이다 — 이름 바꾸기 · 하위 페이지
        * 추가 · 삭제는 전부 메뉴 키가 여는 같은 메뉴 안에 있어서 키보드로
        * 막히는 기능이 없다 (§10).
        *
        * 그래서 tabIndex 는 -1 이고 포커스 링도 필요 없다. */}
      <span
        // 버튼을 눌렀는데 페이지까지 열리면 안 된다. 행 전체가 클릭 대상이라
        // 여기서 한 번 막는다 — IconButton 은 이벤트를 안 넘겨준다.
        onClick={(event) => event.stopPropagation()}
        className="hidden shrink-0 items-center group-hover:flex"
      >
        <span ref={menuAnchorRef} className="flex">
          <IconButton
            icon={IconDot3HorizontalLine}
            ariaLabel={treeMessages.more(name)}
            size={24}
            tabIndex={-1}
            onClick={() => onMenu?.(id, menuAnchorRef.current)}
          />
        </span>
        <IconButton
          icon={IconPlusLine}
          ariaLabel={treeMessages.addChild(name)}
          size={24}
          tabIndex={-1}
          onClick={() => onAdd?.(id)}
        />
      </span>
    </div>
  );
}
