import type { FloatingUIOptions } from "@blocknote/react";

/**
 * 사이드 메뉴(＋ · ⠿)의 세로 가운데를 그 블록 **첫 줄의 세로 가운데**에 맞춘다.
 *
 * BlockNote 는 이걸 레벨별 상수로 갖고 있다 — 제목1 은 39, 제목2 는 27,
 * 제목3 은 18.5, 나머지 제목은 0 (SideMenuController 의 getBlockOffset).
 * 자기 기본 크기(48 · 32 · 20.8px)에 맞춰 손으로 계산해 넣은 숫자라, 우리가
 * 제목을 30 · 24 · 20px 로 바꾸는 순간 전부 틀린다.
 *
 * getBlockOffset 은 export 가 아니라 갈아 끼울 수가 없다. 대신 그 값을 만드는
 * middleware 배열을 통째로 덮는다 — 컨트롤러가 우리 useFloatingOptions 를
 * **나중에** 스프레드하므로 이쪽이 이긴다.
 *
 * 숫자를 다시 적지 않고 그 자리에서 잰다. 그래야 다음에 제목 크기를 또 바꿔도
 * 여기를 안 고친다 — 크기의 출처는 knocspace.css 하나로 남는다.
 *
 * 재는 것 셋:
 *   패딩 위    블록 첫 줄이 시작하는 자리 (제목은 18px, 문단은 3px)
 *   줄 높이    첫 줄의 높이
 *   메뉴 높이  ＋ 와 ⠿ 가 든 상자
 * 사이드 메뉴 가운데를 첫 줄 가운데에 맞추면 `패딩 + (줄 높이 − 메뉴 높이) / 2`.
 *
 * 이 식은 BlockNote 의 상수를 그대로 되만든다 — 기본 크기를 넣으면 제목1 은
 * 18 + (72−30)/2 = 39, 제목2 는 27, 제목3 은 18.6, 문단은 3 + (24−30)/2 = 0.
 * 우리 크기에서는 22.5 · 18.6 · 16 이 된다.
 *
 * 줄이 없는 블록은 잰 값이 뜻을 잃는다(표 · 파일 · 오디오). 그것들만 BlockNote
 * 가 쓰던 상수를 그대로 옮겨 둔다. 옮겨 적은 값이라 출처를 같이 적는다.
 */

/** 사이드 메뉴 높이. 못 재면 쓰는 값이고, BlockNote 주석의 30px 과 같다. */
const FALLBACK_MENU_HEIGHT = 30;

/** 첫 줄이 없는 블록들 — 출처는 BlockNote 의 getBlockOffset 이다. */
const BLOCKS_WITHOUT_A_FIRST_LINE: Record<string, number> = {
  table: 15,
  audio: 15,
  file: 4,
};

/** 파일을 아직 안 고른 블록. 종류와 무관하게 같은 "파일 추가" 버튼이 그려진다. */
const EMPTY_FILE_BLOCK_OFFSET = 12;

/**
 * floating-ui 가 넘겨주는 참조에서 진짜 엘리먼트를 꺼낸다.
 *
 * **참조는 DOM 엘리먼트가 아니다.** GenericPopover 가 setPositionReference 로
 * `{ getBoundingClientRect, contextElement }` 를 넘기기 때문에, 들어오는 것은
 * 가상 엘리먼트고 `instanceof Element` 가 false 다. 엘리먼트는 contextElement
 * 에 들어 있다. 여기서 안 꺼내면 이 파일 전체가 조용히 아무 일도 안 한다 —
 * 사이드 메뉴가 BlockNote 기본 자리에도 못 가고 오프셋 0 — 블록 위 여백 꼭대기에 붙는다.
 */
function elementOf(reference: unknown): Element | null {
  if (reference instanceof Element) {
    return reference;
  }
  const context = (reference as { contextElement?: unknown } | null)?.contextElement;
  return context instanceof Element ? context : null;
}

/**
 * 참조 엘리먼트에서 블록 본체를 찾는다.
 *
 * contextElement 로 오는 것이 블록 컨테이너일 수도 본체일 수도 있어서 양쪽을
 * 다 받는다. 자식 블록(토글 안에 접힌 것들)까지 내려가지 않도록 직계부터 찾는다.
 */
function blockContentOf(element: Element): HTMLElement | null {
  if (element.matches?.("[data-content-type]")) {
    return element as HTMLElement;
  }
  return (
    element.querySelector?.<HTMLElement>(":scope > [data-content-type]") ??
    element.querySelector?.<HTMLElement>("[data-content-type]") ??
    null
  );
}

/**
 * 사이드 메뉴를 아래로 얼마나 내릴지. 못 재면 null 이고, 그때는 BlockNote 가 잡아 둔
 * 자리를 그대로 둔다 — 어긋난 값을 새로 만드는 것보다 낫다.
 *
 * export 하는 것은 테스트 때문이 아니라, 이 계산이 이 파일에서 유일하게 값이
 * 있는 부분이라서다. 미들웨어 쪽은 floating-ui 에 값을 건네는 껍데기다.
 */
export function firstLineOffset(reference: unknown, menuHeight: number): number | null {
  const element = elementOf(reference);
  if (!element) {
    return null;
  }

  const content = blockContentOf(element);
  if (!content) {
    return null;
  }

  if (content.querySelector(".bn-add-file-button")) {
    return EMPTY_FILE_BLOCK_OFFSET;
  }

  const type = content.getAttribute("data-content-type") ?? "";
  if (type in BLOCKS_WITHOUT_A_FIRST_LINE) {
    return BLOCKS_WITHOUT_A_FIRST_LINE[type];
  }

  const style = getComputedStyle(content);
  const lineHeight = parseFloat(style.lineHeight);
  const paddingTop = parseFloat(style.paddingTop);
  /* line-height: normal 이면 숫자가 아니다. */
  if (!Number.isFinite(lineHeight) || !Number.isFinite(paddingTop)) {
    return null;
  }

  return paddingTop + (lineHeight - menuHeight) / 2;
}

export const sideMenuFloatingOptions: Partial<FloatingUIOptions> = {
  useFloatingOptions: {
    middleware: [
      {
        name: "knocFirstLineOffset",
        fn: ({ y, elements }) => {
          const menuHeight = elements.floating.offsetHeight || FALLBACK_MENU_HEIGHT;
          const offset = firstLineOffset(elements.reference, menuHeight);
          return offset === null ? {} : { y: y + offset };
        },
      },
    ],
  },
};
