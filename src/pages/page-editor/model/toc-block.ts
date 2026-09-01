import { createReactBlockSpec } from "@blocknote/react";
import {
  TableOfContentsExternalHTML,
  TableOfContentsView,
} from "../ui/ContentEditor/TableOfContentsView";

/**
 * 목차 블록. **BlockNote 에 없어서 우리가 만드는 첫 블록이다** (F3 §3).
 *
 * 담는 것이 없다 — `content: "none"`, `propSchema: {}`. 구분선과 같은 모양이고,
 * 저장된 문서에는 `{ "type": "tableOfContents" }` 한 줄만 남는다.
 *
 * **제목 글자를 props 로 안 들고 있는 것이 이 스펙의 전부다.** 들고 있으면
 * 문서에 같은 글자가 두 벌이 되고, 제목을 고칠 때마다 목차 블록도 같이 고쳐야
 * 한다 — 그 순간 "문서의 원본은 에디터 하나" 가 깨진다
 * (docs/roadmap/architecture.md). 목록은 그릴 때 문서에서 다시 센다
 * (table-of-contents.ts).
 *
 * 마크다운 입력 규칙과 단축키는 두지 않았다. Notion 에도 목차는 슬래시 메뉴로만
 * 들어가고, `/목차` 로 쓸 것을 굳이 두 번째 길로 늘리지 않는다 —
 * 항목은 slash-menu-items.tsx 에 있다.
 */
export const tableOfContentsConfig = {
  type: "tableOfContents",
  propSchema: {},
  content: "none",
} as const;

export const knocTableOfContents = createReactBlockSpec(tableOfContentsConfig, {
  /* 구분선과 같은 값이다. 담는 것이 없는 블록이라 커서가 이 안에 갇히면
   * 위아래로 빠져나올 방법이 없다. */
  meta: { isolating: false },
  render: TableOfContentsView,
  /* 안 넘기면 render 가 대신 불려서, 복사·내보내기한 HTML 에 버튼과 훅이
   * 통째로 딸려간다. 코드 블록과 같은 이유다 (code-block.ts). */
  toExternalHTML: TableOfContentsExternalHTML,
})();
