import type { KnocBlock } from "./blocknote-schema";

/**
 * 목차가 문서에서 뽑아내는 것. **순수 함수만 있는 파일이다.**
 *
 * 컴포넌트 밖에 두는 이유는 검사할 자리가 여기뿐이기 때문이다. 에디터를 띄우는
 * 것은 jsdom 에서 안 되지만(레이아웃이 없다 — f3-blocknote-surface.md §6),
 * `BlockNoteEditor.create()` 로 문서를 만들고 블록 배열을 넘겨 보는 것은 순수
 * node 에서 그대로 돈다. 슬래시 메뉴 목록을 밖으로 뺀 것과 같은 이유다.
 */

export interface TocEntry {
  /**
   * 블록 id. 화면에서 그 제목을 찾는 열쇠다 — BlockNote 가 블록마다
   * `data-id` 로 달아 둔다.
   */
  id: string;
  /** 1 · 2 · 3. 스키마가 셋으로 닫아 뒀다 (blocknote-schema.ts) */
  level: number;
  /** 서식을 벗긴 글자만. 목차는 굵기도 색도 안 따라간다 */
  text: string;
}

/**
 * 인라인 내용에서 글자만 훑어 낸다.
 *
 * 링크가 든 제목 때문에 재귀가 필요하다. BlockNote 의 링크는 `text` 가 아니라
 * `content` 안에 글자 조각을 담고 있어서, 한 겹만 보면 링크로 된 제목이 목차에
 * 빈 줄로 뜬다.
 *
 * 타입을 unknown 으로 받는 것은 스키마를 늘릴 때를 위한 것이다. 커스텀 인라인
 * 내용이 생겨도 이 함수는 안 깨지고 모르는 것을 건너뛴다.
 */
function inlineText(content: unknown): string {
  if (!Array.isArray(content)) return "";

  return content
    .map((node) => {
      if (typeof node !== "object" || node === null) return "";
      if ("text" in node && typeof node.text === "string") return node.text;
      if ("content" in node) return inlineText(node.content);
      return "";
    })
    .join("");
}

/**
 * 문서에서 제목 블록을 순서대로 모은다.
 *
 * children 까지 내려간다. 제목은 대개 문서 맨 위 층에 있지만, 접을 수 있는
 * 목록이나 표 안에도 들어갈 수 있다 — 한 층만 보면 그것들이 목차에서 조용히
 * 사라진다.
 *
 * **글자가 빈 제목은 뺀다.** 제목 블록을 만들어 놓고 아직 안 친 상태가 문서에서
 * 흔한데(엔터 치고 `# ` 를 친 직후가 그것이다), 그걸 담으면 목차에 누를 수는
 * 있지만 아무 글자도 없는 줄이 생긴다. Notion 도 같다.
 */
export function collectHeadings(blocks: readonly KnocBlock[]): TocEntry[] {
  const entries: TocEntry[] = [];

  for (const block of blocks) {
    if (block.type === "heading") {
      const text = inlineText(block.content).trim();
      if (text) entries.push({ id: block.id, level: block.props.level, text });
    }

    if (block.children.length > 0) {
      entries.push(...collectHeadings(block.children));
    }
  }

  return entries;
}
