import type { TreeItemData } from "@/components/PageTree/PageTreeItem";

/**
 * 루트부터 그 페이지까지 — 상단바 경로에 쓴다.
 *
 * 조상은 서버에서 오는 것이 아니다. 트리 목록이 이미 앱 안에 있으므로
 * 거기서 뽑는다. `GET /pages` 도 평평한 배열 하나를 줄 뿐이라 (backend-sync)
 * F2 에서도 출처는 같은 목록이다.
 *
 * **접기 전 원본 목록으로 부른다.** `visibleItems` 를 거친 보이는 목록이
 * 아니다 — 부모가 접힌 채로 주소창에 `/p/tokens` 를 직접 쳐서 들어오면
 * 그 행은 보이는 목록에 없는데, 경로는 그때도 나와야 한다.
 *
 * TODO(F2): `PageSummary[]` 를 받아 `parentId` 사슬을 타는 것으로 바꾼다.
 * 그러면 아래의 "문서 순서" 전제가 통째로 필요 없어지고, 훑는 대신
 * 깊이만큼만 올라간다. 나가는 모양은 그대로라 `Breadcrumb` 은 안 바뀐다.
 */
export function pathFromRoot(rows: TreeItemData[], id: string): TreeItemData[] {
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) return [];

  /* 자기 자리에서 뒤로 훑으며 depth 가 하나씩 줄어드는 항목을 줍는다.
   *
   * 이게 성립하는 건 배열이 문서 순서이기 때문이다 — 부모는 언제나 자기
   * 자식보다 앞에 있고, 사이에 낀 것은 전부 그 부모의 다른 자손이다.
   * 그래서 처음 만나는 `wanted` 깊이가 곧 그 조상이다. */
  const path = [rows[index]];
  let wanted = rows[index].depth - 1;

  for (let i = index - 1; i >= 0 && wanted >= 0; i--) {
    if (rows[i].depth === wanted) {
      path.unshift(rows[i]);
      wanted--;
    }
  }

  return path;
}
