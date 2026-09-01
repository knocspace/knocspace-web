import {
  createCodeBlockConfig,
  createCodeBlockSpec,
  parsePreCode,
  parsePreCodeContent,
} from "@blocknote/core";
import { codeBlockOptions } from "@blocknote/code-block";
import { createReactBlockSpec } from "@blocknote/react";
import { CodeBlockExternalHTML, CodeBlockView } from "../ui/CodeBlockView";

/**
 * 코드 블록. BlockNote 기본 스펙에서 **언어 선택기만** 우리 것으로 바꾼 것이다.
 *
 * 바꾸는 이유는 native `<select>` 하나다. 코어의 `render` 가 그걸 직접 그리는데
 * (createCodeBlock.ts), 펼친 목록을 OS 가 그려서 어떤 CSS 도 안 닿는다 —
 * DESIGN.md §7 "브라우저가 그리는 것" 표의 첫 줄이다. 선택기를 걷어내려면
 * `render` 를 통째로 가져오는 수밖에 없고, 그래서 이 파일이 있다.
 *
 * **바꾸는 것은 `render` 하나뿐이다.** 나머지는 전부 코어 것을 그대로 쓴다.
 *
 * | | 어디서 오나 |
 * |---|---|
 * | `config` (`type` · `propSchema.language` · `content`) | `createCodeBlockConfig` |
 * | 붙여넣기 · 마크다운 파싱 | `parsePreCode` · `parsePreCodeContent` |
 * | 단축키 (Tab 들여쓰기 · Enter 로 빠져나오기 · ``` 입력 규칙) | `baseSpec.extensions` |
 * | 하이라이트 | `meta.highlight` |
 *
 * `type` 도 `propSchema` 도 그대로라 **저장된 문서는 안 건드린다.** 마이그레이션이
 * 없다는 뜻이고, 되돌리고 싶으면 schema.ts 한 줄을 되돌리면 된다.
 */

/* 단축키 확장을 코어에서 꺼내오는 자리.
 *
 * `CodeKeyboardShortcutsExtension` 은 코어가 export 하지 않는다 —
 * blocks/index.ts 가 block · parse · toExternalHTML 셋만 내보낸다. 그런데 스펙을
 * 한 번 만들면 그 안에 **옵션이 이미 물린 확장 배열**이 들어 있다. 그걸 꺼내
 * 쓰면 단축키를 베껴 적을 필요가 없다.
 *
 * 베껴 적으면 안 되는 이유가 있다. 저 확장은 Tab · Enter · Shift-Enter 의 커서
 * 처리를 담고 있어서, 손으로 옮기는 순간 BlockNote 가 그 동작을 고칠 때 우리
 * 코드만 옛것으로 남는다. 스펙 하나를 버리는 비용으로 그걸 산다. */
const baseSpec = createCodeBlockSpec(codeBlockOptions);

export const knocCodeBlock = createReactBlockSpec(
  createCodeBlockConfig,
  () => ({
    /* 코어의 meta 를 그대로 옮긴다. 넷 다 뜻이 있다.
     *
     * `highlight` 가 Shiki 를 켜는 스위치다. 하이라이터는 render 를 안 보고
     * 이 콜백만 본다 — 스펙마다 이게 있으면 그 블록을 하이라이트 대상으로
     * 잡고, 칠하는 것은 ProseMirror decoration 이다. 그래서 render 를 React 로
     * 바꿔도 하이라이트는 그대로 산다. 대신 **이 줄을 빠뜨리면 조용히 꺼진다.** */
    meta: {
      code: true,
      defining: true,
      isolating: false,
      highlight: (block) => block.props.language,
    },
    parse: (el) => parsePreCode(el),
    parseContent: (opts) => parsePreCodeContent(opts, "codeBlock"),
    render: CodeBlockView,
    /* 안 넘기면 안 된다. React 스펙은 toExternalHTML 이 없으면 render 로
     * 대신하는데, 그러면 복사·내보내기한 HTML 에 언어 메뉴가 통째로 딸려간다. */
    toExternalHTML: CodeBlockExternalHTML,
  }),
  baseSpec.extensions ?? [],
)(codeBlockOptions);
