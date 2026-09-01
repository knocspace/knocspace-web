import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { treeMessages } from "@/shared/config";
import { PageNavigationItem } from "./PageNavigationItem";
import type { PageNavigationNode } from "../../model/page-navigation";

/**
 * 페이지 트리 — DESIGN.md §10, 시안 "PageNavigation 키보드".
 *
 * `role="tree"`. **평평한 배열을 받아 그린다** — 중첩을 재귀 컴포넌트로 그리면
 * F8 에서 가상 스크롤이 안 붙는다 (§5).
 *
 * 펼침 상태를 안 가진다. `isExpanded` 는 값으로 받고 `onToggle` 로 알린다 —
 * 어느 것이 펼쳐져 있는지는 localStorage 에 남아야 하고 그건 F2 의 일이다.
 *
 * props 만 받는다. 서버도 라우터도 Query 도 모른다.
 */

export interface PageNavigationProps {
  /** 이미 평탄화된, 보이는 항목만. 접힌 자식은 여기 없어야 한다 */
  items: PageNavigationNode[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  /** ⋯ 또는 메뉴 키. anchor 는 메뉴를 띄울 자리다 */
  onMenu?: (id: string, anchor: HTMLElement | null) => void;
  onAdd?: (id: string) => void;
  onContextMenu?: (id: string, event: MouseEvent<HTMLElement>) => void;
  /** F2 제자리 이름 바꾸기 — 트리는 켜 달라고 알리기만 한다 */
  onRename?: (id: string) => void;
  /** 드래그 중인 원본 (F8) */
  draggingId?: string | null;
  /** 이름 바꾸는 중인 항목의 제목 자리를 대신 채운다 (F2 InlineInput) */
  renamingId?: string | null;
  renameSlot?: ReactNode;
  /** 스크린리더가 읽을 트리 이름. 사이드바에 둘 이상 놓일 때만 바꾼다 */
  label?: string;
}

/**
 * 형제 관계를 계산한다 — `aria-posinset` · `aria-setsize`.
 *
 * DOM 이 평평해서 `role="group"` 이 없다. 그러면 스크린리더가 "3 중 2번째" 를
 * 스스로 셀 수 없어서, 값으로 직접 줘야 한다. 안 주면 깊이만 읽고 몇 개 중
 * 몇 번째인지는 안 읽는다.
 *
 * 배열이 DFS 순서라 형제는 **같은 depth 로 연속된 구간**이고, 더 얕은 항목이
 * 나오면 그 구간이 닫힌다.
 */
function computePositions(items: PageNavigationNode[]) {
  const posInSet = new Array<number>(items.length).fill(1);
  const setSize = new Array<number>(items.length).fill(1);
  /** depth → 아직 안 닫힌 형제 구간의 인덱스들 */
  const open = new Map<number, number[]>();

  const close = (deeperThan: number) => {
    for (const [depth, indexes] of open) {
      if (depth <= deeperThan) continue;
      indexes.forEach((itemIndex, order) => {
        posInSet[itemIndex] = order + 1;
        setSize[itemIndex] = indexes.length;
      });
      open.delete(depth);
    }
  };

  items.forEach((item, index) => {
    close(item.depth);
    const run = open.get(item.depth) ?? [];
    run.push(index);
    open.set(item.depth, run);
  });
  close(-1);

  return { posInSet, setSize };
}

export function PageNavigation({
  items,
  selectedId,
  onSelect,
  onToggle,
  onMenu,
  onAdd,
  onContextMenu,
  onRename,
  draggingId,
  renamingId,
  renameSlot,
  label = treeMessages.label,
}: PageNavigationProps) {
  const rowsRef = useRef(new Map<string, HTMLDivElement>());

  /**
   * roving tabindex 의 그 하나. 트리를 떠났다 돌아오면 여기로 돌아온다 (§10).
   *
   * 상태로 들고 있지만 화면에 나가는 값이 아니다 — 어느 항목이 tabIndex 0 인지만
   * 정한다. 선택(selectedId)과 다른 것이다: 선택은 지금 열려 있는 페이지고,
   * 이건 키보드 커서다.
   */
  const [focusedId, setFocusedId] = useState<string | null>(null);

  /**
   * 커서가 가리키던 항목이 사라질 수 있다 — 부모를 접거나 페이지를 지우면.
   * 그때는 열려 있는 페이지, 그것도 없으면 첫 항목으로 되돌린다.
   */
  const cursorId = useMemo(() => {
    const has = (id: string | null | undefined) =>
      Boolean(id) && items.some((item) => item.id === id);
    if (has(focusedId)) return focusedId;
    if (has(selectedId)) return selectedId;
    return items[0]?.id ?? null;
  }, [focusedId, selectedId, items]);

  const { posInSet, setSize } = useMemo(() => computePositions(items), [items]);

  const moveTo = (index: number) => {
    const next = items[index];
    if (!next) return;
    setFocusedId(next.id);
    rowsRef.current.get(next.id)?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = items.findIndex((item) => item.id === cursorId);
    if (index < 0) return;
    const item = items[index];

    switch (event.key) {
      case "ArrowDown":
        moveTo(index + 1);
        break;

      case "ArrowUp":
        moveTo(index - 1);
        break;

      /* 접혀 있으면 펼치고, 펼쳐져 있으면 첫 자식으로.
       * 자식은 배열에서 바로 다음 칸이다 — DFS 순서라서. */
      case "ArrowRight":
        if (!item.hasChildren) return;
        if (item.isExpanded) moveTo(index + 1);
        else onToggle(item.id);
        break;

      /* 펼쳐져 있으면 접고, 아니면 부모로. 부모는 뒤로 거슬러 올라가 처음
       * 만나는 한 단계 얕은 항목이다. */
      case "ArrowLeft":
        if (item.hasChildren && item.isExpanded) {
          onToggle(item.id);
          break;
        }
        for (let i = index - 1; i >= 0; i -= 1) {
          if (items[i].depth < item.depth) {
            moveTo(i);
            break;
          }
        }
        break;

      case "Home":
        moveTo(0);
        break;

      case "End":
        moveTo(items.length - 1);
        break;

      case "Enter":
        onSelect(item.id);
        break;

      case "F2":
        if (!onRename) return;
        onRename(item.id);
        break;

      /* 메뉴 키와 Shift+F10 — 우클릭과 같은 것을 연다. 마우스 없이도
       * 이름 바꾸기 · 하위 페이지 추가 · 삭제에 닿는 유일한 길이다 (§10). */
      case "ContextMenu":
        onMenu?.(item.id, rowsRef.current.get(item.id) ?? null);
        break;

      case "F10":
        if (!event.shiftKey) return;
        onMenu?.(item.id, rowsRef.current.get(item.id) ?? null);
        break;

      default:
        return;
    }

    // 여기까지 왔으면 위 case 중 하나를 처리한 것이다. ↑↓ 로 사이드바가
    // 같이 스크롤되거나 Enter 가 폼을 보내는 일을 막는다.
    event.preventDefault();
  };

  /* 항목이 없으면 트리를 아예 안 그린다. 빈 트리를 두면 스크린리더가 이름만
   * 읽고 아무것도 없는 위젯으로 안내한다 — 빈 화면은 바깥이 그린다 (F2). */
  if (items.length === 0) return null;

  return (
    <div
      role="tree"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-dense-1"
    >
      {items.map((item, index) => (
        <PageNavigationItem
          key={item.id}
          ref={(element) => {
            if (element) rowsRef.current.set(item.id, element);
            else rowsRef.current.delete(item.id);
          }}
          item={item}
          isSelected={item.id === selectedId}
          tabIndex={item.id === cursorId ? 0 : -1}
          posInSet={posInSet[index]}
          setSize={setSize[index]}
          isDragging={item.id === draggingId}
          renameSlot={item.id === renamingId ? renameSlot : undefined}
          onSelect={(id) => {
            // 마우스로 고른 것도 커서를 옮긴다. 안 그러면 Tab 으로 돌아왔을 때
            // 엉뚱한 자리에서 시작한다.
            setFocusedId(id);
            onSelect(id);
          }}
          onToggle={onToggle}
          onMenu={onMenu}
          onAdd={onAdd}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  );
}
