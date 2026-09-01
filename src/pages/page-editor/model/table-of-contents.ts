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
  /**
   * 목차에서 몇 칸 들여 쓸지. 0 · 1 · 2 다.
   *
   * **`level - 1` 이 아니다.** 앞에 나온 제목들과의 관계로 정한다 — withDepth.
   */
  depth: number;
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
  return withDepth(flatten(blocks));
}

type Heading = Omit<TocEntry, "depth">;

function flatten(blocks: readonly KnocBlock[]): Heading[] {
  const headings: Heading[] = [];

  for (const block of blocks) {
    if (block.type === "heading") {
      const text = inlineText(block.content).trim();
      if (text) headings.push({ id: block.id, level: block.props.level, text });
    }

    if (block.children.length > 0) {
      headings.push(...flatten(block.children));
    }
  }

  return headings;
}

/**
 * 층수를 매긴다. **제목 크기가 아니라 앞에 나온 제목들과의 관계로 정한다.**
 *
 * `level - 1` 로 하면 안 되는 이유는 문서가 제목1 부터 쓰지 않기 때문이다.
 * 제목2·3 만 쓰는 문서가 흔한데(제목1 은 문서 제목이 이미 맡고 있다), 그러면
 * 목차 전체가 한 칸씩 밀린 채로 시작하고 첫 층이 비어 있게 된다.
 *
 * 지금 열려 있는 제목들을 쌓아 두고, 새 제목이 오면 자기보다 작지 않은 것을
 * 전부 닫는다. 남은 높이가 그 제목의 층이다. 건너뛴 크기는 층을 안 만든다 —
 * 제목1 다음의 제목3 은 두 칸이 아니라 한 칸이고, 그 뒤에 제목2 가 오면 그
 * 제목3 과 같은 한 칸이다. Notion 이 하는 것과 같다.
 *
 *   제목1 · 제목3 · 제목2 · 제목3 · 제목1  →  0 · 1 · 1 · 2 · 0
 */
function withDepth(headings: readonly Heading[]): TocEntry[] {
  /* 아직 안 닫힌 제목들의 크기. 늘 오름차순이라 맨 뒤만 보면 된다. */
  const open: number[] = [];

  return headings.map((heading) => {
    while (open.length > 0 && open[open.length - 1] >= heading.level) open.pop();

    const depth = open.length;
    open.push(heading.level);

    return { ...heading, depth };
  });
}
