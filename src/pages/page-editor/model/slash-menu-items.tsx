import { insertOrUpdateBlockForSlashMenu } from "@blocknote/core/extensions";
import { getDefaultReactSlashMenuItems, type DefaultReactSuggestionItem } from "@blocknote/react";
import IconDocumentLine from "@karrotmarket/react-monochrome-icon/IconDocumentLine";
import { tableOfContentsLabels } from "@/shared/config";
import type { KnocEditor } from "./blocknote-schema";

/**
 * 슬래시 메뉴에 뜨는 것들. **목록을 만드는 곳은 컴포넌트 밖이다.**
 *
 * 밖에 두는 이유는 검사할 자리가 여기뿐이기 때문이다. 메뉴 본체는 jsdom 에서
 * 안 뜬다 — floating-ui 가 재는 rect 가 전부 0 이고 elementFromPoint 가 아예
 * 없다(docs/decisions/f3-blocknote-surface.md §6). 반면 이 함수는 순수 node 에서
 * `BlockNoteEditor.create()` 하나로 돌아서, 항목이 있는지 · 이름이 뭔지 ·
 * 어느 그룹인지를 그대로 확인할 수 있다.
 *
 * **표면은 아직 BlockNote 기본이다.** 여기서 하는 일은 기본 24항목 뒤에 우리
 * 블록 하나를 더하는 것뿐이고, 메뉴를 SEED 로 갈아 끼우는 것은 F3 §2 다
 * (아이콘 결정이 열려 있다 — DESIGN.md §6). 그때 바뀌는 것은 ContentEditor 의
 * `suggestionMenuComponent` 한 줄이고, 이 파일은 그대로 간다.
 */
export function knocSlashMenuItems(editor: KnocEditor): DefaultReactSuggestionItem[] {
  const items = getDefaultReactSlashMenuItems(editor);
  const tableOfContents = tableOfContentsItem(editor);

  /* 같은 그룹 옆에 끼워 넣는다. **뒤에 붙이면 안 된다.**
   *
   * 메뉴는 그룹으로 묶는 것이 아니라 **줄을 훑다가 group 이 바뀌면** 머리말을
   * 찍는다(SuggestionMenu.tsx). 기본 목록에서 "고급" 은 표 한 줄이고 그 뒤로
   * 미디어 · 기타가 오므로, 끝에 붙인 목차는 두 번째 "고급" 머리말을 달고
   * 맨 아래에 혼자 선다. 머리말의 React key 가 그룹 이름이라 같은 key 가 한
   * 목록에 둘 생기기도 한다.
   *
   * 못 찾으면 끝에 둔다. 사전이 그룹 이름을 바꾼 경우인데, 항목이 사라지는
   * 것보다 자리가 어긋나는 쪽이 낫다. */
  const lastOfGroup = items.findLastIndex((item) => item.group === tableOfContents.group);
  const at = lastOfGroup === -1 ? items.length : lastOfGroup + 1;

  return [...items.slice(0, at), tableOfContents, ...items.slice(at)];
}

/**
 * 목차 — 사전에 없는 유일한 항목이다.
 *
 * 나머지 24개는 BlockNote 의 ko 사전에서 이름 · 설명 · 별칭 · 그룹이 전부
 * 나온다(content-editor.ts 가 `dictionary: ko` 를 넘긴다). 목차는 BlockNote 에
 * 없는 블록이라 네 가지를 우리가 채운다.
 */
function tableOfContentsItem(editor: KnocEditor): DefaultReactSuggestionItem {
  return {
    title: tableOfContentsLabels.title,
    subtext: tableOfContentsLabels.subtext,
    /* 치는 말로도 걸리게 한다. Notion 을 쓰던 사람은 `/table of contents` 를,
     * 그전에 우리 화면을 보던 사람은 `/목차` 를 친다. `filterSuggestionItems`
     * 가 title 과 이 배열을 같이 훑는다. */
    aliases: ["목차", "toc", "table of contents", "tableofcontents", "개요", "outline"],
    /* 그룹 이름을 문자열로 적지 않는다. "고급" 은 ko 사전의 말이고(표가 그 그룹에
     * 있다), 사전이 번역을 다듬는 순간 우리 항목만 이름이 다른 그룹으로 떨어져
     * 나와 메뉴에 같은 뜻의 머리말이 두 줄 선다. */
    group: editor.dictionary.slash_menu.table.group,
    /* seed-icon — DESIGN.md §8. 680개 중 목차라는 뜻의 아이콘은 없지만, 이건
     * 이름이 뜻이 아니라 모양이라는 쪽에 걸린다: `IconDocumentLine` 은 둥근
     * 테두리 안에 가로선 셋이 든 모양이고 마지막 줄이 짧다 — Notion 의 목차
     * 아이콘과 같은 그림이다. 별칭도 문서 · 노트 · paper 쪽이다.
     *
     * 18px 은 BlockNote 가 기본 항목에 쓰는 크기다. 우리 것만 16px 로 두면
     * 이 한 줄의 아이콘이 작게 보인다. */
    icon: <IconDocumentLine size={18} />,
    onItemClick: () => {
      /* 지금 블록이 비어 있으면 그 자리를 목차로 바꾸고, 아니면 아래에 새로
       * 넣는다. `/` 를 치던 빈 줄이 그대로 목차가 되는 것이 이 헬퍼다 —
       * 기본 24항목도 전부 이걸로 들어간다. */
      insertOrUpdateBlockForSlashMenu(editor, { type: "tableOfContents" });
    },
  };
}
