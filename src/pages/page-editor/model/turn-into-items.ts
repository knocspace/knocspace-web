import { blockTypeSelectItems, type IconType } from "@blocknote/react";
import type { KnocEditor, KnocPartialBlock } from "./blocknote-schema";

/**
 * 「전환」 서브메뉴에 뜨는 것들. 슬래시 메뉴와 같은 자리에서 만든다
 * (slash-menu-items.tsx) — 이름도 아이콘도 묶음도 우리가 짓지 않는다.
 *
 * **슬래시 메뉴와 같은 목록이 아니다.** 저쪽은 블록을 **넣는** 곳이라 표 ·
 * 이미지 · 목차까지 있고, 이쪽은 이미 있는 블록을 **바꾸는** 곳이다. 글자를
 * 담는 블록끼리만 오갈 수 있어서 제목 · 본문 · 인용 · 목록 열두 줄이고, 표나
 * 목차로 바꾸면 그 블록의 글이 갈 데가 없다. BlockNote 도 같은 자리에서 같은
 * 열둘을 쓴다 (blockTypeSelectItems — 포맷 툴바의 블록 타입 선택).
 *
 * 열둘 중 접히는 변형이 넷이고, 목록 끝에 나란히 모여 있다 — 접을 수 있는 목록 ·
 * 접을 수 있는 제목1·2·3. 뒤의 셋은 **슬래시 메뉴에 없어서 이 메뉴에만 있다**
 * (TOGGLE_HEADING_KEY).
 *
 * 코드 블록은 뺐다. 글자를 담기는 하지만 언어 · 줄바꿈이 딸린 다른 표면이고,
 * BlockNote 의 전환 목록에도 없다.
 *
 * TODO(백로그): 「페이지」 — 블록을 하위 페이지로 바꾸는 줄이 Notion 에 있다
 * (mvp.md 빼는 것 · DESIGN.md §9). 한 줄 더하는 일이 아니라서 미뤄 둔다:
 *
 *   1. 페이지를 가리키는 블록이 없다. BlockNote 에 없어서 목차처럼 우리가 만든다
 *   2. 그 자리에서 하위 페이지를 만들어야 한다 — shared/api 를 부르는 유일한 전환이다
 *   3. **글자가 문서 밖으로 나가는 유일한 전환이다.** 되돌리기(⌘Z)가 만들어진
 *      페이지까지 되돌려야 하는지가 같이 정해져야 한다
 *
 * 나머지 열둘은 블록 하나를 제자리에서 바꾸는 일이라 이 목록 안에서 닫힌다.
 */
export interface TurnIntoItem {
  /** 사전이 준 이름 — "제목1" · "본문" */
  title: string;
  /** 머리말. 슬래시 메뉴와 같은 묶음이다 — "제목" · "기본 블록" */
  group: string;
  /** 그리는 것은 쓰는 쪽이다. 크기를 그 자리에서 정해야 해서 그림이 아니라 부품으로 준다 */
  icon: IconType;
  /** 눌렀을 때 이 블록이 된다 */
  to: KnocPartialBlock;
}

/**
 * 제목 레벨 → 사전 키.
 *
 * 스키마가 1·2·3 으로 좁혀 둔 것과 짝이다(blocknote-schema.ts). 사전에는
 * heading_4·5·6 도 있지만 우리 문서에 그 블록이 없으므로 여기서 닫는다 —
 * 코어의 슬래시 메뉴도 같은 자리에서 `level <= 3` 으로 자른다.
 */
const HEADING_KEY = { 1: "heading", 2: "heading_2", 3: "heading_3" } as const;

/**
 * 접을 수 있는 제목의 사전 키. 같은 `heading` 블록이고 `isToggleable` 하나만 다르다.
 *
 * **이 셋은 슬래시 메뉴에 없다.** 코어가 슬래시 메뉴를 만들 때 접을 수 있는 제목을
 * 안 넣기 때문이고(getDefaultSlashMenuItems), 그래서 `/` 로는 만들 수가 없다.
 * 전환에만 있는 것이 이상해 보이지만 Notion 도 같다 — 「토글 제목」은 전환
 * 목록에만 있다. 일단 제목을 쓰고 접을 수 있게 바꾸는 순서다.
 */
const TOGGLE_HEADING_KEY = {
  1: "toggle_heading",
  2: "toggle_heading_2",
  3: "toggle_heading_3",
} as const;

/**
 * 제목 말고 갈 수 있는 것들. **적힌 순서가 곧 메뉴 순서다.**
 *
 * 본문이 맨 앞인 것은 여기가 되돌아오는 자리이기 때문이다 — 제목이나 목록으로
 * 바꿔 놓고 다시 여는 경우가 제일 많고, Notion 도 BlockNote 도 전환 목록의
 * 첫 줄이 본문이다. 슬래시 메뉴에서는 본문이 뒤쪽에 있는데, 그쪽은 **넣는**
 * 목록이라 빈 줄을 본문으로 넣을 일이 없어서다.
 */
const PLAIN_TARGETS = [
  { key: "paragraph", type: "paragraph" },
  { key: "quote", type: "quote" },
  { key: "bullet_list", type: "bulletListItem" },
  { key: "numbered_list", type: "numberedListItem" },
  { key: "check_list", type: "checkListItem" },
  { key: "toggle_list", type: "toggleListItem" },
] as const;

/**
 * 전환 목록을 만든다. 컴포넌트 밖인 이유는 슬래시 메뉴와 같다 —
 * 목록은 순수 함수라 검사할 수 있고, 메뉴 본체는 jsdom 에서 안 뜬다.
 */
export function turnIntoItems(editor: KnocEditor): TurnIntoItem[] {
  const icons = blockTypeIcons(editor);
  const levels = headingLevels(editor);

  /* `isToggleable: false` 를 **적어서** 넘긴다. 접을 수 있는 제목이 목록에
   * 들어오면서 생긴 일이다 — 안 적으면 updateBlock 이 props 를 합치기만 해서,
   * 접을 수 있는 제목1 에서 「제목1」을 눌러도 접기가 안 풀린다. 체크가 어느
   * 줄에 서는지도 이 값이 정한다. */
  const headings = levels.map((level) =>
    toItem(editor, icons, HEADING_KEY[level], {
      type: "heading",
      props: { level, isToggleable: false },
    }),
  );

  /* 접을 수 있는 제목 셋은 **맨 아래**다. 「접을 수 있는 목록」 바로 뒤라,
   * 접히는 것 넷이 목록 끝에 모인다 — Notion 도 토글 제목을 전환 목록 끝에 둔다.
   *
   * **묶음은 「기본 블록」으로 맞춘다. 사전 그룹을 안 따르는 유일한 자리다.**
   * 이유가 둘이다.
   *
   * 하나는 사전의 그룹이 "소제목" 이라는 것이다. 그 이름은 제목4·5·6 을 담으려고
   * 지은 것이고 우리 문서에는 그 셋이 없어서(스키마가 1·2·3), 남는 것이 접을 수
   * 있는 제목뿐인데 그걸 "소제목" 이라 부르면 다른 블록처럼 읽힌다.
   *
   * 다른 하나는 머리말이 **묶음이 바뀌는 줄에만** 찍힌다는 것이다
   * (TurnIntoMenuItem). 맨 아래에서 "제목" 으로 되돌아가면 한 목록에 "제목"
   * 머리말이 두 번 선다. 앞 줄과 같은 묶음으로 두면 머리말 없이 이어진다. */
  const toggleHeadings = hasToggleHeadings(editor)
    ? levels.map((level) =>
        toItem(
          editor,
          icons,
          TOGGLE_HEADING_KEY[level],
          { type: "heading", props: { level, isToggleable: true } },
          editor.dictionary.slash_menu.paragraph.group,
        ),
      )
    : [];

  /* 스키마에 없는 블록은 뺀다. 지금은 여섯 다 있지만, 블록을 하나 빼는 날
   * 이 목록만 남아서 「전환」이 없는 블록을 가리키는 일이 없도록. */
  const plain = PLAIN_TARGETS.filter(({ type }) => type in editor.schema.blockSchema).map(
    ({ key, type }) => toItem(editor, icons, key, { type }),
  );

  return [...headings, ...plain, ...toggleHeadings];
}

/**
 * 이 문서의 제목이 접힐 수 있는지. `createHeadingBlockSpec` 의
 * `allowToggleHeadings` 가 켜져 있으면 `isToggleable` props 가 생긴다
 * (지금은 기본값이라 켜져 있다 — blocknote-schema.ts).
 *
 * 스키마를 보고 정하는 것이 제목 레벨과 같은 이유다. 끄는 날 이 세 줄만
 * 메뉴에 남아서, 눌러도 아무 일도 안 나는 자리가 되면 안 된다.
 */
function hasToggleHeadings(editor: KnocEditor) {
  return "isToggleable" in (editor.schema.blockSchema.heading?.propSchema ?? {});
}

/**
 * 문서가 쓰는 제목 레벨. 배열 하나가 슬래시 메뉴 · 단축키 · 마크다운 입력규칙을
 * 같이 닫는 그 배열이다 (blocknote-schema.ts 의 `levels`).
 *
 * 값을 적어 두지 않는 이유가 그거다. 여기에 `[1, 2, 3]` 을 박으면 스키마를
 * 고쳐도 이 메뉴만 옛 목록을 들고 남는다.
 */
function headingLevels(editor: KnocEditor) {
  const values = editor.schema.blockSchema.heading?.propSchema.level.values ?? [];
  return values.filter((level): level is keyof typeof HEADING_KEY => level in HEADING_KEY);
}

/**
 * 아이콘 — **BlockNote 것을 그대로 쓴다.**
 *
 * seed-icon 으로 안 가는 이유는 §6 이 아직 열려 있어서다 (DESIGN.md §6
 * "슬래시 메뉴 아이콘"). 680개 안에 제목1·2·3 을 구별할 그림이 없고
 * (`IconHashLine` 하나뿐), 그 결정을 이 메뉴 하나 때문에 먼저 닫을 수는 없다.
 *
 * 그동안은 슬래시 메뉴와 **같은 그림**인 쪽이 낫다. 같은 블록을 가리키는 두
 * 메뉴에 다른 그림이 서면 사용자가 그 둘을 다른 것으로 읽는다. §6 이 닫히면
 * 두 목록이 같이 간다.
 *
 * 사전 이름으로 짚는다. `blockTypeSelectItems` 의 `name` 도 슬래시 메뉴의
 * `title` 도 같은 사전 한 줄에서 나오므로, 이름이 같으면 같은 블록이다.
 */
function blockTypeIcons(editor: KnocEditor) {
  return new Map(blockTypeSelectItems(editor.dictionary).map((item) => [item.name, item.icon]));
}

function toItem(
  editor: KnocEditor,
  icons: Map<string, IconType>,
  key:
    | (typeof HEADING_KEY)[keyof typeof HEADING_KEY]
    | (typeof TOGGLE_HEADING_KEY)[keyof typeof TOGGLE_HEADING_KEY]
    | (typeof PLAIN_TARGETS)[number]["key"],
  to: KnocPartialBlock,
  /** 사전 그룹을 안 쓸 때만 넘긴다 — 접을 수 있는 제목 셋뿐이다 */
  groupOverride?: string,
): TurnIntoItem {
  const { title, group } = editor.dictionary.slash_menu[key];

  /* `!` 인 이유는 두 이름이 같은 사전 한 줄에서 나오기 때문이다 — 못 찾는 경우가
   * 있다면 BlockNote 가 전환 목록에서 그 블록을 뺀 것이고, 그때는 이 목록도
   * 같이 손봐야 한다. 빈 아이콘으로 조용히 넘어가면 그 줄만 이름이 밀려 선다. */
  return { title, group: groupOverride ?? group, icon: icons.get(title)!, to };
}
