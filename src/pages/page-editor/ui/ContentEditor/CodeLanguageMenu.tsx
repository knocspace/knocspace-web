import { useState } from "react";
import { useComponentsContext } from "@blocknote/react";

/**
 * 코드 블록의 언어 선택기 — 슬래시 메뉴 · 드래그 핸들 메뉴와 같은 표면.
 *
 * 원래 자리에는 native `<select>` 가 있었다. BlockNote 코어가
 * `document.createElement("select")` 로 직접 그리던 것이라(createCodeBlock.ts),
 * 트리거는 CSS 로 지워 놨어도 **펼친 목록은 OS 가 그린다** — 브라우저 기본
 * 흰 팝업 · OS 글꼴 · `option { color: black }`. 브리지로는 못 닿는 자리다
 * (DESIGN.md §7 "브라우저가 그리는 것").
 *
 * 그래서 SEED 컴포넌트가 아니라 **BlockNote 의 메뉴 표면**을 쓴다. 이유 둘.
 *
 * 1. 코드 블록 표면은 라이트에서도 검정 고정이라(DESIGN.md §6, 아직 열려 있음)
 *    SEED `Select` 트리거를 올리면 검은 면 위에 밝은 트리거가 앉는다. 그 결정을
 *    끌어들이지 않으려면 트리거를 지금 모습 그대로 둬야 한다
 * 2. `Generic.Menu` 는 이미 브리지가 칠하고 있다 — `--bn-colors-menu-*` ·
 *    `--bn-colors-hovered-*` 가 전부 SEED 토큰을 가리킨다. 드래그 핸들 메뉴와
 *    같은 표면이고, 슬래시 메뉴와 같은 배경·반경·호버색이 나온다
 *
 * F3 §2 에서 슬래시 메뉴를 SEED 표면으로 갈아 끼울 때 이 파일도 같이 간다.
 * 그때 바뀌는 것은 아래 `Components.Generic.Menu` 세 줄뿐이다.
 */

export interface CodeLanguage {
  /** 스키마에 저장되는 값. `block.props.language` 가 이것이다 */
  id: string;
  /** 사람이 읽는 이름 — "TypeScript" */
  name: string;
}

export interface CodeLanguageMenuProps {
  languages: CodeLanguage[];
  /** 지금 언어의 id */
  value: string;
  onChange: (id: string) => void;
  /** 읽기 전용 문서. 트리거는 남기고 열리지만 않게 한다 */
  isDisabled?: boolean;
}

export function CodeLanguageMenu({
  languages,
  value,
  onChange,
  isDisabled = false,
}: CodeLanguageMenuProps) {
  const Components = useComponentsContext()!;
  const [open, setOpen] = useState(false);

  /* 목록에 없는 언어면 id 를 그대로 보여준다.
   *
   * 코어는 이 경우 throw 했다 — `Language ${lang} is not supported.` 로 에디터가
   * 통째로 죽는다. 언어 목록은 우리가 고르는 것이고(blocknote-schema.ts), 목록에서 하나
   * 빼는 순간 그 언어로 저장된 옛 문서가 안 열린다. 문서가 라이브러리 설정보다
   * 오래 산다. */
  const selected = languages.find((language) => language.id === value);

  return (
    <Components.Generic.Menu.Root
      onOpenChange={setOpen}
      position="bottom-start"
    >
      <Components.Generic.Menu.Trigger>
        {/* 자리와 생김새는 BlockNote 가 `> div > select` 에 걸던 값 그대로다
          * (top 8 · left 18 · 0.8em · 흰 글자 · 평소 0, 호버 0.5). 코드 블록
          * 표면이 다크 고정인 동안은 이 값이 그 표면에 맞춰진 값이라,
          * SEED 토큰으로 바꾸는 것은 §6 을 닫은 다음이다.
          *
          * `.bn-block-content:hover &` 는 자손 선택자지만 브리지의 그것과
          * 다르다 — BlockNote 의 선언을 덮는 게 아니라 **우리 요소**를 부모의
          * 호버에 맞춰 여는 것뿐이다. 부모에 클래스를 못 달아서(그 div 는
          * BlockNote 의 BlockContentWrapper 가 만든다) group 을 못 쓴다. */}
        <button
          type="button"
          disabled={isDisabled}
          aria-label="코드 언어"
          className={`absolute top-2 left-[18px] cursor-pointer appearance-none border-none
            bg-transparent text-[0.8em] text-white outline-none select-none
            transition-opacity duration-150
            focus-visible:opacity-50 [.bn-block-content:hover_&]:opacity-50
            ${open ? "opacity-50" : "opacity-0"}`}
        >
          {selected?.name ?? value}
        </button>
      </Components.Generic.Menu.Trigger>
      <Components.Generic.Menu.Dropdown className="bn-menu-dropdown">
        {languages.map((language) => (
          <Components.Generic.Menu.Item
            key={language.id}
            className="bn-menu-item"
            /* 고른 것에 체크. native `<select>` 에서 OS 가 해 주던 일이라,
             * 안 넣으면 46개 목록에서 지금 언어가 어느 것인지 안 보인다.
             * false 를 넘기는 쪽은 체크 자리를 빈칸으로 잡아 줄이 안 어긋난다. */
            checked={language.id === value}
            onClick={() => onChange(language.id)}
          >
            {language.name}
          </Components.Generic.Menu.Item>
        ))}
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
}
