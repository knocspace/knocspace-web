import type { createCodeBlockConfig } from "@blocknote/core";
import { codeBlockOptions } from "@blocknote/code-block";
import type { ReactCustomBlockRenderProps } from "@blocknote/react";
import { CodeLanguageMenu, type CodeLanguage } from "./CodeLanguageMenu";

/**
 * 코드 블록이 그려지는 모양. 스펙에 꽂히는 자리는 codeBlock.ts 다.
 *
 * 코어의 `render` 와 나오는 DOM 이 같다 — `<div>` 하나와 `<pre><code>` 가 형제로
 * 선다. 안이 native `<select>` 에서 메뉴로 바뀐 것뿐이다.
 */

/** 메뉴에 뿌릴 목록. 스키마가 아는 언어와 같은 것이라 여기서 한 번만 편다. */
const languages: CodeLanguage[] = Object.entries(
  codeBlockOptions.supportedLanguages,
).map(([id, { name }]) => ({ id, name }));

export type CodeBlockRenderProps = ReactCustomBlockRenderProps<
  typeof createCodeBlockConfig
>;

export function CodeBlockView({
  block,
  editor,
  contentRef,
}: CodeBlockRenderProps) {
  return (
    <>
      {/* contentEditable={false} 를 빼면 안 된다. 메뉴가 본문 안에 그려지는데
        * (mantine 이 withinPortal={false} 로 연다), 이 표시가 없으면 ProseMirror
        * 가 메뉴 DOM 을 문서 내용으로 보고 커서를 들여보낸다. 코어의 `<select>`
        * 래퍼도 같은 이유로 이 값을 달고 있었다.
        *
        * `<div>` 한 겹인 것도 코어를 따른 것이다. BlockNote 의 코드 블록 CSS 가
        * `> div` 와 `> pre` 를 형제로 짚는다 — 한 겹을 더 두르면 `> pre` 의
        * 패딩 24px 과 가로 스크롤이 같이 떨어져 나간다. */}
      <div contentEditable={false}>
        <CodeLanguageMenu
          languages={languages}
          value={block.props.language}
          onChange={(language) =>
            editor.updateBlock(block.id, { props: { language } })
          }
          isDisabled={!editor.isEditable}
        />
      </div>
      <pre>
        {/* whiteSpace 를 인라인으로 박는 자리 — 여기서 제일 안 보이는 함정이다.
          *
          * React 스펙은 contentRef 가 닿는 요소에 `bn-inline-content` 클래스를
          * 강제로 붙인다. 그 클래스에 `white-space: pre-wrap` 이 걸려 있어서
          * (코어 Block.css), 그냥 두면 긴 코드 줄이 가로로 흐르지 않고 **접힌다.**
          * `<pre>` 의 `white-space: pre` 는 부모 것이라 자식의 선언에 진다.
          *
          * Tailwind `whitespace-pre` 로는 못 이긴다. Tailwind 유틸리티는
          * @layer utilities 안이고 BlockNote CSS 는 레이어 밖이라, 명시도와
          * 무관하게 레이어 밖이 이긴다 (SEED 를 이길 때와 반대 상황이다).
          * 그래서 인라인 스타일이다. */}
        <code ref={contentRef} style={{ whiteSpace: "pre" }} />
      </pre>
    </>
  );
}

/** 내보내는 HTML. 메뉴는 빼고 코어와 같은 `<pre><code>` 만 남긴다. */
export function CodeBlockExternalHTML({
  block,
  contentRef,
}: CodeBlockRenderProps) {
  return (
    <pre>
      <code
        ref={contentRef}
        className={`language-${block.props.language}`}
        data-language={block.props.language}
      />
    </pre>
  );
}
