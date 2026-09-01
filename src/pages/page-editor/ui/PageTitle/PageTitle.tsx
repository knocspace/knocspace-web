import type { KeyboardEvent } from "react";
import { editorPlaceholders } from "@/shared/config";

/**
 * 문서 한 장의 이름. 본문 맨 위, 첫 블록 바로 위에 선다.
 *
 * **본문 안의 제목1 과는 다른 것이다.** 제목1·2·3 은 문서에 넣는 블록이고
 * BlockNote 가 맡지만, 이 줄은 블록이 아니라 `Page.title` 이다. BlockNote 에는
 * 페이지 제목이라는 개념이 아예 없다 — 문서가 블록 배열 하나가 전부다.
 * 그래서 에디터 밖에 따로 선다. 여기에 BlockNote 는 한 줄도 안 들어간다.
 *
 * ── h1 이 아니다
 *
 * 크기만 보면 제목이지만 heading 태그를 안 쓴다. 코어가 제목 블록을
 * `document.createElement(`h${level}`)` 로 그려서, 본문에 제목1 을 두 개 쓴
 * 문서에는 이미 h1 이 둘이다. 여기까지 h1 이면 셋이 되고 문서 구조가 뜻을 잃는다.
 *
 * h1 안에 편집 필드를 넣는 것도 문제다. 그 heading 의 접근가능한 이름이
 * 구현에 달린다 — accname 에 "embedded control 이면 값을 쓴다" 는 규칙이 있지만
 * 보장이 아니다. 확실하지 않은 것을 문서 구조의 뿌리에 둘 이유가 없다.
 *
 * 대신 `aria-label` 로 이름을 준다. 읽어 주는 쪽에는 "문서 제목, 편집" 이고,
 * 문서의 목차는 본문 제목 블록들이 만든다.
 *
 * ── InlineInput 을 안 쓴다
 *
 * 트리 행의 이름 바꾸기와 같은 물건처럼 보이지만 셋이 어긋난다.
 *
 * - **`truncate` 가 두 상태 모두에 박혀 있다.** 그건 그 컴포넌트가 지키기로 한
 *   것("읽기 ↔ 편집에 글자가 1px 도 안 움직인다")을 지키는 방법이다. 한 줄로
 *   고정하면 상태가 바뀌어도 상자가 안 움직인다. **제목은 정반대를 요구한다** —
 *   40px 글자가 잘리면 뒷부분을 영영 못 본다
 * - **평상시가 더블클릭이다.** 이미 열려 있는 문서의 제목은 한 번에 들어가야
 *   한다. 여기는 아예 상태가 없다 — 늘 쓸 수 있는 자리다
 * - **캐럿이 브라우저 기본 자리에 선다** (`selectOnEdit={false}` 일 때
 *   `setSelectionRange` 를 안 부른다). DESIGN.md §10 은 문서 제목에서
 *   "클릭한 자리에 캐럿" 이라고 정해 뒀다
 *
 * 한 컴포넌트가 두 계약을 다 지킬 수는 없어서 가른다. 되돌릴 수 있는 결정이다 —
 * 나중에 트리 행에서도 줄바꿈이 필요해지면 그때 합친다.
 *
 * ── 왜 textarea 인가
 *
 * `input` 은 CSS 로 뭘 해도 한 줄이다. 긴 제목이 접히려면 편집 중에도
 * `textarea` 여야 한다. 대신 **제목에 줄바꿈은 담기지 않는다** — Enter 로도,
 * 붙여넣기로도 안 들어간다. 그 값이 그대로 `Page.title` 이 되어 사이드바 트리와
 * 브레드크럼까지 나가기 때문이다.
 *
 * 높이는 스크립트로 안 잰다. 같은 글자를 안 보이게 한 겹 깔고 그 위에
 * textarea 를 겹쳐서, 상자 높이를 글자가 스스로 정하게 둔다. 그래서 이
 * 컴포넌트에는 effect 도 ref 도 없다. (`field-sizing: content` 가 자리 잡으면
 * 이 겹도 지울 수 있는데, 파이어폭스·사파리가 아직이다.)
 *
 * 테두리도 배경도 없다 (DESIGN.md §10). 40px 글자는 자기 영역이 뚜렷해서
 * 상자를 더하면 문서가 양식처럼 보인다. 편집 중에도 캐럿만 선다.
 */
export interface PageTitleProps {
  /** 지금 제목. 빈 문자열이면 자리 문구가 보인다. */
  value: string;
  /** 글자가 바뀔 때마다. 저장 시점은 이 컴포넌트가 정하지 않는다. */
  onChange?: (next: string) => void;
  /** 끄면 읽기 전용 — F5 의 보기 권한이 여기로 온다. */
  editable?: boolean;
  /** 제목에서 Enter. 줄바꿈 대신 본문으로 나가는 자리다 (F3 §3). */
  onEnter?: () => void;
}

/** 스크린리더가 읽을 이름. 눈으로는 40px 글자가 곧 제목이라 라벨이 따로 없다. */
const FIELD_LABEL = "문서 제목";

/* 세 곳이 같은 글자여야 한다 — 안 보이는 겹, textarea, 읽기 전용일 때의 글자.
 * 하나라도 다르면 상자 높이가 글자와 어긋난다. */
const TYPE = "text-doc-title leading-doc-title tracking-doc-title font-bold";

/**
 * 줄바꿈을 공백 하나로 누른다. 여러 줄을 붙여넣어도 제목은 한 줄이다.
 *
 * Enter 를 막는 것만으로는 모자란다. 붙여넣기가 남고, 그 값이 트리·브레드크럼·
 * 문서 목록까지 줄바꿈을 달고 나간다. 한 줄이라는 건 Enter 의 규칙이 아니라
 * 이 필드 전체의 규칙이다.
 */
function toSingleLine(text: string): string {
  return text.replace(/\s*[\r\n]+\s*/g, " ");
}

export function PageTitle({ value, onChange, editable = true, onEnter }: PageTitleProps) {
  if (!editable) {
    return (
      <p className={`${TYPE} ${value ? "text-fg-neutral" : "text-fg-neutral-subtle"}`}>
        {value || editorPlaceholders.title}
      </p>
    );
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") return;
    /* 여기서 안 막으면 textarea 가 줄을 늘린다. */
    event.preventDefault();
    onEnter?.();
  };

  return (
    /* 한 칸짜리 격자에 둘을 겹친다. grid-cols-1 을 적는 것은 암시 열(auto)이
     * 자유 공간을 늘려 준다는 스펙에 기대지 않기 위해서다 — 안 적으면 짧은
     * 제목에서 클릭 영역이 글자 폭까지인지 매번 다시 따져야 한다. */
    <div className={`${TYPE} grid grid-cols-1 text-fg-neutral`}>
      {/* 상자 높이를 정하는 겹. 안 보이지만 자리는 차지한다.
        *
        * 끝에 폭 없는 공백을 붙인다. 마지막 글자가 공백이면 브라우저가 줄 끝
        * 공백을 접어서 겹이 한 줄만큼 덜 자라고, 그때 캐럿이 상자 밖에 선다. */}
      <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-pre-wrap break-words">
        {value || editorPlaceholders.title}
        {"\u200b"}
      </span>

      <textarea
        aria-label={FIELD_LABEL}
        value={value}
        rows={1}
        placeholder={editorPlaceholders.title}
        spellCheck={false}
        onChange={(event) => onChange?.(toSingleLine(event.currentTarget.value))}
        onKeyDown={handleKeyDown}
        className={`${TYPE} col-start-1 row-start-1 m-0 w-full resize-none overflow-hidden border-0 bg-bg-transparent p-0 text-fg-neutral outline-none placeholder:text-fg-neutral-subtle`}
      />
    </div>
  );
}
