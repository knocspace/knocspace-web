import type { EditorDoc } from "../doc";
import type { KnocPartialBlock } from "../schema";

/**
 * 스토리에서만 쓰는 도우미. **앱 코드에서 import 하지 않는다.**
 *
 * 이 폴더(features/editor/stories)에 스토리를 몰아 둔 이유는 단순하다 — 위층에
 * 두면 에디터 소스 일곱 개와 스토리 열한 개가 한 자리에서 섞인다. 대신
 * features/editor 밖으로는 안 나간다. 문서를 만드는 코드가 밖으로 나가면 그게
 * 두 번째 원본이 되기 때문이고, 그건 sampleDoc 과 같은 이유다.
 *
 * 블록 스토리는 종류마다 파일이 갈리지만, 문서를 담는 방법과 에디터를 다시
 * 만드는 요령은 하나여야 한다. 그 하나가 여기다.
 */

/** 블록 몇 개를 문서 한 장으로 담는다. */
export function storyDoc(blocks: KnocPartialBlock[]): EditorDoc {
  return { format: "blocknote", schemaVersion: 1, blocks };
}

/**
 * 견본 본문 한 줄.
 *
 * 블록만 떼어 놓고 보면 큰지 작은지, 여백이 넉넉한지 알 수 없다. 본문 16px 을
 * 옆에 둬야 비율이 보인다.
 */
export function bodyBlock(text = "본문은 16px 이에요. 블록 크기는 이 줄 옆에 둬야 보여요."): KnocPartialBlock {
  return { type: "paragraph", content: text };
}

/**
 * 컨트롤 값들을 이어 붙여 만든 pageId. **블록 스토리의 요령이 이것이다.**
 *
 * useEditorDoc 은 content 를 처음 한 번만 읽고 deps 가 [pageId] 다. 그래서
 * 컨트롤을 바꿔도 pageId 가 그대로면 에디터가 그대로 남아 화면이 안 바뀐다.
 * 문서를 만든 값들을 그대로 이어 붙이면, 컨트롤이 바뀔 때마다 다른 페이지로
 * 간 것과 같아져서 에디터가 새 문서로 다시 선다.
 *
 * 대신 한쪽으로만 흐른다. 컨트롤을 건드리면 그 전에 타이핑한 것은 사라지고,
 * 에디터에서 바꾼 블록도 컨트롤로 되돌아오지 않는다. onChange 로 arg 를 다시
 * 쓰면 되돌릴 수는 있지만, 그 순간 에디터를 다시 만드는 고리가 된다.
 */
export function storyPageId(...parts: unknown[]): string {
  return parts.map(String).join("·");
}

/**
 * 포맷 툴바에 뜨는 색 열 개. BlockNote 는 색을 자유 문자열로 받지만, 실제로 쓰는
 * 것은 이 열이다(Notion 은 아예 고정 enum 이다).
 *
 * 갈색 · 분홍이 섞여 있는 것이 중요하다. SEED 팔레트에 없어서 브릿지가 넘기지
 * 못한 둘이고, 없는 색을 새로 만들면 그게 곧 시스템 밖의 색이 된다(DESIGN.md §1).
 */
export const PALETTE = [
  "default",
  "gray",
  "brown",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
] as const;

export type PaletteColor = (typeof PALETTE)[number];

export const PALETTE_LABELS: Record<PaletteColor, string> = {
  default: "기본",
  gray: "회색",
  brown: "갈색 (SEED 밖)",
  red: "빨강",
  orange: "주황 (SEED carrot)",
  yellow: "노랑",
  green: "초록",
  blue: "파랑",
  purple: "보라",
  pink: "분홍 (SEED 밖)",
};
