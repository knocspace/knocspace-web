import type { TreeItemData } from "@/components/PageTree/PageTreeItem";

/**
 * 접힌 항목의 자손을 뺀 배열 — sprint-2 §4.
 *
 * `PageTree` 는 **보이는 것만** 받는다. 접힌 자식까지 넘기고 컴포넌트가 거르면
 * F8 가상 스크롤이 "몇 번째 행" 을 셀 수 없다 (DESIGN.md §5).
 *
 * 지금은 입력도 `TreeItemData[]` 다. F2 에서 `PageSummary[]` 를 받아 `depth` 를
 * 직접 계산하는 것으로 바뀌고, **나가는 모양은 그대로다** — 그래서 `PageTree`
 * 는 그때 안 바뀐다.
 */
export function visibleItems(
  rows: TreeItemData[],
  expandedIds: readonly string[],
): TreeItemData[] {
  const shown: TreeItemData[] = [];
  /** 이 깊이보다 깊은 것은 접힌 부모 밑이라 건너뛴다 */
  let hideDeeperThan: number | null = null;

  for (const row of rows) {
    if (hideDeeperThan !== null && row.depth > hideDeeperThan) continue;
    hideDeeperThan = null;

    const isExpanded = row.hasChildren && expandedIds.includes(row.id);
    shown.push({ ...row, isExpanded });
    if (row.hasChildren && !isExpanded) hideDeeperThan = row.depth;
  }

  return shown;
}
