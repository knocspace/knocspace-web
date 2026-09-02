import { useImperativeHandle, useRef, type KeyboardEvent, type Ref } from "react";
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
 * 컴포넌트에는 재는 코드도 effect 도 없다. (`field-sizing: content` 가 자리
 * 잡으면 이 겹도 지울 수 있는데, 파이어폭스·사파리가 아직이다.)
 *
 * 들고 있는 ref 하나는 높이와 무관하다 — 본문에서 커서가 올라올 때 받을 자리다
 * (`PageTitleHandle`).
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
  /**
   * 제목에서 `Enter` — 본문 맨 위에 **새 줄을 만드는** 자리다 (F3 §3).
   *
   * Notion 은 제목과 본문이 한 판이라 제목 끝의 `Enter` 가 그냥 「다음 줄」이고,
   * 그 줄은 없으면 생긴다. 우리는 판이 갈려 있어서 화면이 이어 준다
   * (PageEditorPage).
   */
  onEnter?: () => void;
  /**
   * 글 **끝**에서 `↓` — 본문 첫 줄로 **내려가는** 자리다.
   *
   * `Enter` 와 가는 곳은 같아도 하는 일이 다르다. 이쪽은 있는 줄로 옮겨 갈
   * 뿐이라 문서가 안 바뀐다.
   */
  onArrowDown?: () => void;
  /** 밖에서 커서를 놓기 위한 핸들. */
  ref?: Ref<PageTitleHandle>;
}

/**
 * 밖에서 이 줄에 커서를 놓는 길. **`textarea` 자체는 안 내보낸다.**
 *
 * 본문 첫 줄에서 `↑` 나 `Backspace` 로 올라올 때 화면이 부른다
 * (PageEditorPage). 엘리먼트를 내보내면 밖에서 값도 바꾸고 스타일도 건드릴 수
 * 있게 되는데, 여기서 여는 것은 「커서를 받는다」 하나다 — 에디터 인스턴스를
 * 안 내보내고 핸들만 여는 ContentEditor 와 같은 규칙이다.
 */
export interface PageTitleHandle {
  /** 글 끝에 커서를 놓고 포커스를 받는다. */
  focusEnd(): void;
}

/** 스크린리더가 읽을 이름. 눈으로는 40px 글자가 곧 제목이라 라벨이 따로 없다. */
const FIELD_LABEL = "문서 제목";

/* 세 곳이 같은 글자여야 한다 — 안 보이는 겹, textarea, 읽기 전용일 때의 글자.
 * 하나라도 다르면 상자 높이가 글자와 어긋난다. */
const TYPE = "text-doc-title leading-doc-title tracking-doc-title font-bold";

/**
 * 자리 문구의 색. SEED 의 fg 계열이 아니라 **`--knoc-color-doc-placeholder`**
 * 다 (knocspace.css · DESIGN.md §9).
 *
 * 같은 색이어도 40px 은 본문 크기와 다르게 존재한다 — 빈 문서를 열었을 때
 * 아직 아무도 안 쓴 글자가 화면에서 제일 큰 덩어리가 되면, 문서가 비었다는
 * 사실보다 그 글자가 먼저 읽힌다. SEED 에서 제일 옅은 `fg-placeholder` 로도
 * 아직 그렇고, 그 아래는 `fg-disabled` 뿐인데 이 줄은 비활성이 아니라 지금
 * 커서가 서 있는 줄이다. 그래서 색만 빌리지 않고 자리를 따로 만들었다.
 *
 * `textarea` 는 이 상수를 안 쓰고 `placeholder:text-doc-placeholder` 를
 * 그대로 적는다. Tailwind 는 소스에 **통째로 적힌 문자열** 만 보고 CSS 를
 * 만들어서, `placeholder:${TONE}` 처럼 이어 붙이면 그 클래스가 안 나온다.
 */
const PLACEHOLDER_TONE = "text-doc-placeholder";

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

export function PageTitle({
  value,
  onChange,
  editable = true,
  onEnter,
  onArrowDown,
  ref,
}: PageTitleProps) {
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focusEnd() {
      const field = fieldRef.current;
      /* 읽기 전용이면 `textarea` 가 아예 없다. 본문에서 올라오려던 커서는
       * 그냥 있던 자리에 남는다 — 읽기만 하는 문서에서 제목에 커서가 설 자리는
       * 어차피 없다. */
      if (!field) {
        return;
      }

      field.focus();
      field.setSelectionRange(field.value.length, field.value.length);
    },
  }));

  if (!editable) {
    return (
      <p className={`${TYPE} ${value ? "text-fg-neutral" : PLACEHOLDER_TONE}`}>
        {value || editorPlaceholders.title}
      </p>
    );
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    /* **한글을 조합하는 중에는 아무것도 안 한다.** 「제목」을 치는 동안 후보를
     * 확정하는 Enter 가 여기로 먼저 들어온다 — 막아 버리면 조합하던 글자가
     * 사라진 채로 본문으로 내려간다. 조합이 끝난 뒤의 Enter 만 우리 것이다. */
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (event.key === "Enter") {
      /* 여기서 안 막으면 textarea 가 줄을 늘린다. 나갈 곳이 없어도 막는 것은
       * 그대로다 — 제목에 줄바꿈이 안 담기는 것은 이 필드의 규칙이다. */
      event.preventDefault();
      onEnter?.();
      return;
    }

    /* `↓` 는 **글 끝에서만** 나간다. 접혀서 두 줄이 된 제목의 첫 줄에서 누르면
     * 브라우저가 아랫줄로 커서를 옮겨야 하고, 그건 아직 제목 안의 이동이다.
     *
     * 「마지막 줄인가」가 아니라 「글 끝인가」로 재는 것은 잴 방법이 없어서다 —
     * 제목에는 줄바꿈이 안 담기고(toSingleLine) 접히는 것은 그리는 쪽 사정이라,
     * 글자만 봐서는 몇 번째 줄인지 알 수 없다. 대신 접힌 제목에서도 `↓` 를
     * 한 번 더 누르면 나간다 — 첫 번째 `↓` 가 커서를 글 끝으로 옮기기 때문이다. */
    if (event.key === "ArrowDown" && !event.shiftKey && !event.altKey) {
      const field = event.currentTarget;
      if (field.selectionStart !== field.value.length || field.selectionEnd !== field.value.length) {
        return;
      }

      event.preventDefault();
      onArrowDown?.();
    }
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
        ref={fieldRef}
        aria-label={FIELD_LABEL}
        value={value}
        rows={1}
        placeholder={editorPlaceholders.title}
        spellCheck={false}
        onChange={(event) => onChange?.(toSingleLine(event.currentTarget.value))}
        onKeyDown={handleKeyDown}
        className={`${TYPE} col-start-1 row-start-1 m-0 w-full resize-none overflow-hidden border-0 bg-bg-transparent p-0 text-fg-neutral outline-none placeholder:text-doc-placeholder`}
      />
    </div>
  );
}
