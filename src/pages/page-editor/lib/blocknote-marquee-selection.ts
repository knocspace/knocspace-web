import { createExtension } from "@blocknote/core";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import type { EditorState } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import {
  blockRangeAround,
  releaseBlockRange,
  selectBlockRange,
  selectedBlockRange,
  type BlockRange,
} from "./block-selection";

/* **확장보다 먼저 선언한다.** 아래 `createExtension` 이 불리는 순간 플러그인이
 * 만들어지고, 그때 이 값을 읽는다. 뒤에 두면 초기화 전에 닿아서 에디터가 아예
 * 안 선다. */
const marqueeKey = new PluginKey<boolean>("knocMarqueeSelection");

/**
 * **여백에서 끌어 여러 블록 고르기** — 끄는 동안 사각형이 따라온다 (Notion 규격).
 *
 * blocknote-block-selection.ts 의 「넓히기」와 짝이지만 **닿는 자리가 다르다.**
 * 저쪽은 글자 위에서 시작한 끌기를 상대한다 — 브라우저가 만든 글자 선택을 읽어
 * 블록 경계로 밀어 낼 뿐이라 마우스 코드가 한 줄도 없다. 그 방식이 못 닿는
 * 자리가 둘 있었다.
 *
 * | | 넓히기 | 여기 |
 * | --- | --- | --- |
 * | 시작한 자리 | 글자 위 | 여백 · 블록 사이 |
 * | 한 블록만 훑었을 때 | 그 블록 **안의 글자 선택** | 그 블록을 **통째로** |
 * | 끄는 동안 보이는 것 | 잡힌 블록의 면 | 면 **+ 사각형** |
 *
 * 두 번째 줄이 진짜 차이다. Notion 은 왼쪽 여백에서 한 줄만 짧게 훑어도 그 줄이
 * 통째로 잡히는데, 넓히기는 「줄을 넘어갔나」 하나로 갈리므로 그 경우를 못 잡는다.
 * 여백에서 시작했다는 것은 **`mousedown` 을 직접 들어야만** 알 수 있다.
 *
 * ## 어디까지가 여백인가
 *
 * **문서 좌우의 빈 판까지 전부다.** 에디터 자기 거터(54px)만이 아니다 — 창이
 * 넓으면 720px 짜리 문서 양옆에 수백 px 이 남는데, Notion 은 거기서 끌어도
 * 잡힌다. 사용자가 「여백」이라고 보는 것이 그 판 전체다.
 *
 * 그래서 `mousedown` 을 **문서 전체에서** 듣는다. `handleDOMEvents` 로는 안 된다 —
 * 그건 `view.dom`(`.bn-editor`) 안에서 난 것만 오고, 빈 판은 그 밖이다.
 *
 * 대신 **무엇이 눌렸을 때 여백인지**를 좁게 정한다. 둘 중 하나여야 한다.
 *
 * | | 무엇 | 왜 |
 * | --- | --- | --- |
 * | 에디터 **바깥** 껍데기 | 눌린 것이 에디터를 **품고 있다** (`contains`) | 스크롤 판 · `<main>` · `.bn-container` 가 다 여기 걸린다. 글이 아니라 자리를 잡는 상자들이다 |
 * | 에디터 **안쪽** 뼈대 | `.bn-block-outer` · `.bn-block` · `.bn-block-group` | 블록 사이 · 목록 들여쓰기. 글이 실린 상자는 `.bn-block-content` 하나뿐이다 |
 *
 * 이 규칙 하나로 사이드바 · 상단바 · 떠 있는 메뉴가 전부 빠진다. 그것들은
 * 에디터를 품고 있지도, BlockNote 의 뼈대도 아니다. 위쪽은 스크롤 판까지만
 * 올라간다 — `<body>` 는 판 밖이라 안 센다.
 *
 * **`.bn-block-content` 를 뒤집어 짚지 않는다.** 「글 상자 안이 아니면 여백」으로
 * 두면 BlockNote 가 글 상자 밖에 무언가를 그리기로 하는 순간 그것까지 여백이
 * 된다. 껍데기는 이름이 곧 뜻이라 그런 식으로 흔들리지 않는다.
 *
 * ## 왜 기본 동작을 막는가
 *
 * `preventDefault` 를 안 하면 브라우저가 자기 글자 선택을 같이 늘린다. 그러면
 * 한 번 끌 때마다 우리가 세운 선택과 브라우저가 세운 선택이 번갈아 들어와
 * 선택이 떨린다. ProseMirror 도 `view.dom` 에서 `mousedown` 을 듣고 자기 끌기를
 * 시작하는데, **저쪽만 `handleDOMEvents` 로 비껴 간다.**
 *
 * **`stopPropagation` 으로 하면 안 된다.** 처음에 그렇게 썼다가 걸렸다 — 캡처
 * 단계에서 끊으면 이벤트가 `document` 까지 못 가서, 열려 있던 `⠿` 메뉴가 거터를
 * 눌러도 안 닫힌다. 그 닫힘은 문서에 걸린 바깥 클릭 감지가 하는 일이다.
 *
 * 대신 **에디터 안에서 눌렸을 때만** 브라우저가 하던 일을 대신한다 — 커서를 누른
 * 자리에 놓고(`posAtCoords`) 포커스를 준다. 그래서 거터를 그냥 눌렀다 뗀 것은
 * 전과 똑같다. 바깥 빈 판은 원래 눌러도 아무 일이 없던 자리라 그대로 둔다.
 *
 * `shift` 를 누른 채는 손대지 않는다. 그건 있는 선택을 늘리는 것이고, 넓히기가
 * 이미 블록 경계까지 맡고 있다.
 *
 * ## 바깥을 누르면 풀린다
 *
 * `mousedown` 을 문서 전체에서 듣게 되면서 **이것도 여기 얹혔다.** 전에는 `Esc`
 * 와 본문 클릭으로만 풀렸고, 문서 옆 빈 판 · 사이드바 · 상단바 · 문서 제목을
 * 눌러도 블록이 파랗게 남아 있었다. Notion 은 아무 데나 누르면 풀린다.
 *
 * 가르는 선은 **`.bn-container`** 하나다. `⠿` 사이드 메뉴 · 슬래시 메뉴 · 포맷
 * 툴바가 전부 그 안에 그려져서, 「그 상자 밖을 눌렀나」로 물으면 **여러 줄을
 * 고른 채 `⠿` 메뉴를 여는 길이 안 끊긴다.**
 *
 * 안 푸는 것 셋. **스크롤 막대**는 화면을 굴리는 일이고, **오른쪽 버튼**은 메뉴를
 * 여는 일이며, **조합키를 누른 클릭**은 「다른 데로 간다」가 아니라 「늘린다 ·
 * 다르게 연다」다. 창을 옮기거나 탭을 바꾸는 것도 안 푼다 — `blur` 가 아니라
 * `mousedown` 을 듣기 때문에 저절로 그렇게 된다.
 *
 * ## 사각형
 *
 * 확장이 만드는 `div` 하나다 — 붙이는 자리도 좌표 계산도 BlockNote 의 드롭
 * 삽입선(prosemirror-dropcursor)과 같은 방법이다. `view.dom.offsetParent` 에
 * 붙고, 우리 화면에서 그건 `<body>` 다. 색은 blocknote-bridge.css 맨 아래다.
 *
 * **화면 밖까지 자동으로 스크롤하지는 않는다.** 보이는 데까지 끌고 나머지는
 * `shift`+`↓` 다 (docs/roadmap/sprint-3.md 백로그).
 */
export const knocMarqueeSelection = createExtension({
  key: "knocMarqueeSelection",
  prosemirrorPlugins: [marqueePlugin()],
});

/**
 * **지금 사각형을 끌고 있나.**
 *
 * 화면이 이걸 보고 포맷 툴바를 접어 둔다 (ContentEditor). BlockNote 는 에디터
 * 안에서 시작한 끌기라면 스스로 접는데 — `view.dom` 의 `pointerdown` 을 듣는다 —
 * **바깥 빈 판에서 시작한 끌기는 그 귀에 안 들어온다.** 그대로 두면 끌고 있는
 * 내내 툴바가 따라다닌다.
 *
 * 끌기 한 번에 트랜잭션이 여러 번 가지만 이 값이 바뀌는 것은 처음과 끝 한 번씩
 * 이라, 화면이 다시 그려지는 것도 두 번이다.
 */
export function isMarqueeDragging(state: EditorState) {
  return marqueeKey.getState(state) === true;
}

/** 사각형이 나타나기까지 움직여야 하는 거리. 이보다 덜 움직이면 그냥 클릭이다. */
const DRAG_THRESHOLD = 4;

/** 에디터 **안쪽**의 뼈대 — 글이 실린 상자는 `.bn-block-content` 하나뿐이다. */
const INNER_PARTS = ".bn-block-outer, .bn-block, .bn-block-group";

interface Point {
  left: number;
  top: number;
}

function marqueePlugin() {
  /** 끄는 동안만 있는 뒷정리. 두 번 불러도 괜찮다. */
  let drag: MarqueeDrag | undefined;

  /* 부르기 **전에** 비운다. 저쪽도 끝나면서 이 함수를 도로 부르는데, 그때
   * 남아 있으면 둘이 서로를 부른다. */
  const stop = () => {
    const pending = drag;
    drag = undefined;
    pending?.stop();
  };

  /** 에디터가 없어지는 길. 이때는 트랜잭션을 안 보낸다 — 받을 데가 없다. */
  const abandon = () => {
    const pending = drag;
    drag = undefined;
    pending?.abandon();
  };

  /** 우리가 맡은 `mousedown`. ProseMirror 를 비껴가게 하는 데만 쓴다. */
  let taken: MouseEvent | undefined;

  return new Plugin<boolean>({
    key: marqueeKey,

    /** 끄는 중인지 하나. 바꾸는 것은 meta 뿐이다. */
    state: {
      init: () => false,
      apply(tr, dragging) {
        const next = tr.getMeta(marqueeKey);
        return typeof next === "boolean" ? next : dragging;
      },
    },

    props: {
      /**
       * **ProseMirror 만 비껴가게 한다.**
       *
       * 여백에서 시작한 끌기는 우리가 맡으므로 저쪽의 `mousedown` 처리가 같이
       * 돌면 안 된다(자기 끌기를 시작한다). `true` 를 돌려주면 저쪽만 건너뛴다.
       *
       * **`stopPropagation` 으로 하면 안 된다.** 캡처 단계에서 끊으면 이벤트가
       * `document` 까지 못 가서, 열려 있던 `⠿` 메뉴가 안 닫힌다 — 그 닫힘은
       * 문서에 걸린 바깥 클릭 감지가 한다.
       */
      handleDOMEvents: {
        mousedown: (_view, event) => event === taken,
      },
    },

    /**
     * `mousedown` 을 **문서에서** 듣는다. `props.handleDOMEvents` 가 아닌 이유는
     * 위에 적었다 — 그쪽은 `view.dom` 안에서 난 것만 오는데, 문서 좌우의 빈 판이
     * 그 밖이다.
     *
     * **캡처 단계**다. ProseMirror 도 `view.dom` 에서 같은 이벤트를 듣고 자기
     * 끌기를 시작하므로, 먼저 서서 거기까지 안 내려보내야 한다.
     */
    view(view) {
      const press = (event: MouseEvent) => {
        const target = event.target;

        /* 왼쪽 버튼만 센다. 오른쪽은 메뉴고, 가운데는 리눅스의 붙여넣기다.
         * 스크롤 막대는 화면을 굴리는 일이라 고른 것을 건드리지 않는다.
         * 조합키는 「다른 데로 간다」가 아니라 「늘린다 · 다르게 연다」라
         * 역시 지나간다. */
        if (
          !(target instanceof Element) ||
          event.button !== 0 ||
          event.shiftKey ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          onScrollbar(target, event)
        ) {
          return;
        }

        if (startsInMargin(view, target)) {
          event.preventDefault();
          taken = event;

          stop();

          /* 에디터 안(거터 · 블록 사이)에서 눌렀으면 커서를 옮긴다 — 그것이
           * 곧 고른 블록을 푸는 일이기도 하다. 바깥 빈 판은 눌러도 원래
           * 아무 일이 없던 자리라 커서는 그대로 두고 풀기만 한다. */
          if (view.dom.contains(target)) {
            placeCursor(view, event);
          } else {
            releaseBlocks(view);
          }

          drag = beginMarquee(view, event, stop);
          return;
        }

        /* 에디터 UI **밖**을 눌렀다 — 사이드바 · 상단바 · 문서 제목. 고른
         * 블록을 푼다 (Notion 규격). 기본 동작은 안 막는다: 저쪽에서 하려던
         * 일은 그대로 되어야 한다. */
        if (!editorUi(view).contains(target)) {
          releaseBlocks(view);
        }
      };

      document.addEventListener("mousedown", press, true);

      /* 에디터가 없어질 때 걸어 둔 것을 걷는다 — 페이지를 옮기면 에디터가
       * 통째로 새로 만들어진다 (content-editor.ts 의 deps 가 [pageId]). */
      return {
        destroy() {
          document.removeEventListener("mousedown", press, true);
          abandon();
        },
      };
    },
  });
}

/* ── 여백에서 눌렀나 ─────────────────────────────────────────────────────── */

function startsInMargin(view: EditorView, target: Element) {
  if (!documentCanvas(view).contains(target)) {
    return false;
  }

  /* 에디터를 품고 있는 껍데기이거나(바깥), BlockNote 의 뼈대이거나(안쪽).
   * `contains` 는 자기 자신도 세므로 `.bn-editor` 가 직접 눌린 것 — 좌우 54px
   * 거터 — 도 앞쪽에 걸린다. */
  return target.contains(view.dom) || target.matches(INNER_PARTS);
}

/**
 * **고른 블록을 푼다.** 아무것도 안 골라져 있으면 아무 일도 안 한다.
 *
 * 내려앉는 자리는 `Esc` 와 같다 — 마지막 줄 끝이다 (block-selection.ts).
 * 포커스는 안 건드린다. 여기로 오는 길이 「에디터 밖을 눌렀다」라, 포커스는
 * 누른 쪽으로 가는 것이 맞다.
 */
function releaseBlocks(view: EditorView) {
  const range = selectedBlockRange(view.state);
  if (!range) {
    return;
  }

  const tr = view.state.tr;
  releaseBlockRange(tr, range);
  view.dispatch(tr);
}

/**
 * 에디터와 **그 위에 뜨는 것들**이 같이 든 상자.
 *
 * `⠿` 사이드 메뉴 · 슬래시 메뉴 · 포맷 툴바가 전부 `.bn-container` 안에
 * 그려진다(`<body>` 로 나가지 않는다). 그래서 이 상자 하나로 「에디터 UI 를
 * 눌렀나」가 갈린다 — **여러 줄을 고른 채 `⠿` 메뉴를 여는 길이 안 끊긴다.**
 */
function editorUi(view: EditorView): Element {
  return view.dom.closest(".bn-container") ?? view.dom;
}

/**
 * 눌린 자리가 그 상자의 스크롤 막대인가.
 *
 * `clientWidth` · `clientHeight` 는 막대를 빼고 잰 것이고 `getBoundingClientRect`
 * 는 넣고 잰 것이다. 그 차이만큼이 막대 자리다.
 */
function onScrollbar(target: Element, event: MouseEvent) {
  const rect = target.getBoundingClientRect();
  return (
    event.clientX > rect.left + target.clientWidth ||
    event.clientY > rect.top + target.clientHeight
  );
}

/**
 * 문서가 놓인 판 — 여백을 세는 자리의 **위쪽 끝**이다.
 *
 * 에디터에서 위로 올라가며 처음 만나는 스크롤 상자다. 우리 화면에서 그건
 * 상단바와 문서를 같이 담은 셸이고(app/ui/AppLayout.tsx), 문서 좌우의 빈 판이
 * 바로 그 상자의 몸이다. 사이드바는 그 형제라 여기 안 들어온다.
 *
 * 못 찾으면 `<body>` 다 — 스토리처럼 셸 없이 에디터만 있을 때다.
 */
function documentCanvas(view: EditorView): Element {
  for (let at = view.dom.parentElement; at; at = at.parentElement) {
    if (/auto|scroll|overlay/.test(getComputedStyle(at).overflowY)) {
      return at;
    }
  }
  return document.body;
}

/**
 * 브라우저가 하던 일 — 누른 자리에 커서를 놓고 포커스를 준다.
 *
 * `preventDefault` 로 막은 것을 도로 해 주는 자리다. 거터를 그냥 눌렀다 뗀
 * 것은 전과 똑같아야 한다.
 */
function placeCursor(view: EditorView, event: MouseEvent) {
  const found = view.posAtCoords({ left: event.clientX, top: event.clientY });

  if (found) {
    const selection = TextSelection.near(view.state.doc.resolve(found.pos));
    if (!selection.eq(view.state.selection)) {
      view.dispatch(view.state.tr.setSelection(selection));
    }
  }

  view.focus();
}

/* ── 끌기 ────────────────────────────────────────────────────────────────── */

/** 끌고 있는 동안의 손잡이. `stop` 은 제대로 끝내고, `abandon` 은 조용히 걷는다. */
interface MarqueeDrag {
  stop(): void;
  abandon(): void;
}

function beginMarquee(view: EditorView, event: MouseEvent, done: () => void): MarqueeDrag {
  const parent = (view.dom.offsetParent as HTMLElement | null) ?? document.body;
  const origin = toParent(parent, event.clientX, event.clientY);

  /* 문턱을 넘기 전에는 안 만든다 — 여백을 그냥 클릭한 자리에 사각형이 깜빡이면 안 된다. */
  let box: HTMLElement | undefined;

  const move = (moved: MouseEvent) => {
    const at = toParent(parent, moved.clientX, moved.clientY);
    const started = box !== undefined;

    if (!box) {
      if (
        Math.abs(at.left - origin.left) < DRAG_THRESHOLD &&
        Math.abs(at.top - origin.top) < DRAG_THRESHOLD
      ) {
        return;
      }
      box = parent.appendChild(document.createElement("div"));
      box.className = "knoc-marquee";

      /* 끌기가 **정말로** 시작된 자리. 화면이 이걸 보고 포맷 툴바를 접는다. */
      view.dispatch(view.state.tr.setMeta(marqueeKey, true));
    }

    drawMarquee(box, origin, at);

    /* 자리를 화면 좌표로 되돌려 준다. 담아 둔 것이 **문서 좌표**라(스크롤이
     * 섞여 있다) 끌던 중에 화면이 밀려도 시작점이 문서에 붙어 있는다. */
    const offset = parentOrigin(parent);
    selectBand(
      view,
      Math.min(origin.top, at.top) + offset.top,
      Math.max(origin.top, at.top) + offset.top,
      origin.top > at.top,
    );

    /* 문턱을 넘은 **첫 번째**에 한 번만. 빈 판에서 시작한 끌기는 포커스가
     * 에디터 밖에 있는데, 놓고 나서 화살표 · Backspace 가 바로 들어야 한다.
     * 고를 것을 먼저 세우고 부른다 — 순서가 반대면 커서가 있던 옛 자리로
     * 화면이 한 번 굴러간다. */
    if (!started) {
      view.focus();
    }
  };

  /* **한 번만 돈다.** `done` 이 부르는 쪽(플러그인)도 이 함수를 들고 있어서,
   * 막지 않으면 마우스를 뗄 때마다 둘이 서로를 부르며 안 멈춘다. */
  let stopped = false;

  /**
   * `quiet` 는 에디터가 없어지는 길이다. 그때는 끝났다고 알리는 트랜잭션을
   * 안 보낸다 — 받을 에디터가 이미 없다.
   */
  const finish = (quiet: boolean) => {
    if (stopped) {
      return;
    }
    stopped = true;

    window.removeEventListener("mousemove", move, true);
    window.removeEventListener("mouseup", stop, true);
    window.removeEventListener("keydown", cancel, true);

    const dragged = box !== undefined;
    box?.remove();
    box = undefined;

    if (dragged && !quiet) {
      view.dispatch(view.state.tr.setMeta(marqueeKey, false));
    }

    done();
  };

  const stop = () => finish(false);

  /* `Esc` 로 끄는 것을 그만둔다 — 고른 것은 그대로 둔다. 그 뒤의 `Esc` 는
   * 확장이 받아서 선택을 푼다 (blocknote-block-selection.ts). */
  const cancel = (key: KeyboardEvent) => {
    if (key.key === "Escape") {
      stop();
    }
  };

  window.addEventListener("mousemove", move, true);
  window.addEventListener("mouseup", stop, true);
  window.addEventListener("keydown", cancel, true);

  return { stop, abandon: () => finish(true) };
}

/**
 * 사각형이 지나간 **세로 띠**에 걸린 블록을 고른다.
 *
 * 가로는 안 센다. 왼쪽 여백만 짧게 훑은 사각형은 글 상자와 가로로 한 점도 안
 * 겹치는데, 그때도 Notion 은 그 줄을 고른다 — 사용자가 재고 있는 것은 높이 하나다.
 */
function selectBand(view: EditorView, top: number, bottom: number, backward: boolean) {
  const range = bandRange(view, top, bottom);
  if (!range) {
    return;
  }

  const tr = view.state.tr;
  selectBlockRange(tr, range, backward);

  /* 끌면 마우스가 움직일 때마다 여기 오는데 자리는 블록 단위로만 바뀐다.
   * 같은 선택을 다시 세우면 되돌리기 기록만 는다. */
  if (!tr.selection.eq(view.state.selection)) {
    view.dispatch(tr);
  }
}

/**
 * 띠에 **상자가 걸친** 블록들을 감싸는 자리. 하나도 안 걸치면 undefined.
 *
 * **좌표를 글자 자리로 바꿔 묻지 않는다.** `posAtCoords` 로 띠의 두 끝을 물어
 * 봤더니 **첫 줄이 빠졌다** — 문서 맨 위 여백에서 캐럿을 찾으면 브라우저가
 * 첫 줄을 건너뛰고 그 다음 줄을 집는다. 제목 블록은 위 padding 이 18px 이라
 * 그 구간이 넓어서 특히 잘 걸린다.
 *
 * 그래서 재는 방법을 바꾼다. **블록마다 자기 상자를 재서 띠와 겹치는지 본다** —
 * 사용자가 사각형으로 하고 있는 일이 그거고, 좌표를 글자로 옮기는 단계가 아예
 * 없어진다.
 *
 * 겹친 블록들의 **안쪽 자리**만 모아 나머지는 이미 있는 것에 맡긴다.
 * `blockRangeAround` 가 깊이를 맞추고(부모 줄과 자식 줄에 걸치면 부모 하나),
 * `selectBlockRange` 가 하나면 NodeSelection · 여럿이면 TextSelection 을 세운다
 * — 끌기와 `shift`+화살표가 만드는 선택과 한 글자도 다르지 않다.
 */
function bandRange(view: EditorView, top: number, bottom: number): BlockRange | undefined {
  const { doc } = view.state;
  let first: number | undefined;
  let last: number | undefined;

  doc.descendants((node, pos) => {
    if (!node.type.isInGroup("bnBlock")) {
      /* blockGroup 은 블록을 담기만 하니 지나간다. 그 밖(글이 실린 상자 ·
       * 글자)은 더 내려갈 이유가 없다. */
      return node.type.name === "blockGroup";
    }

    const row = blockRow(view, pos);
    if (row && row.bottom > top && row.top < bottom) {
      /* `pos + 1` 은 블록 **안쪽** 자리다. blockRangeAround 는 블록 사이 자리를
       * 받으면 한 칸씩 밀린다 — 그 함수의 주석이 말하는 그것이다. */
      first ??= pos + 1;
      last = pos + 1;
    }

    /* 자기 줄이 안 걸쳤어도 자식 줄은 걸칠 수 있다. 늘 안으로 들어간다. */
    return true;
  });

  return first === undefined || last === undefined
    ? undefined
    : blockRangeAround(doc, first, last);
}

/**
 * 그 블록 **자기 줄**의 상자.
 *
 * 바깥 상자(`.bn-block-outer`)를 그대로 쓰면 안 된다. 자식까지 품고 있어서,
 * 토글 **안쪽** 줄 하나만 지나간 띠가 토글 전체를 잡는다. 문서 순서로 첫 번째
 * `.bn-block-content` 가 그 블록 자신의 줄이다 — 자식의 것은 더 뒤에 온다.
 */
function blockRow(view: EditorView, pos: number): DOMRect | undefined {
  const dom = view.nodeDOM(pos);
  if (!(dom instanceof HTMLElement)) {
    return undefined;
  }
  return (dom.querySelector(".bn-block-content") ?? dom).getBoundingClientRect();
}

function drawMarquee(box: HTMLElement, from: Point, to: Point) {
  box.style.left = `${Math.min(from.left, to.left)}px`;
  box.style.top = `${Math.min(from.top, to.top)}px`;
  box.style.width = `${Math.abs(to.left - from.left)}px`;
  box.style.height = `${Math.abs(to.top - from.top)}px`;
}

/* ── 좌표 ────────────────────────────────────────────────────────────────── */

/**
 * `offsetParent` 안쪽 자리로 옮길 때 화면 좌표에서 뺄 값.
 *
 * prosemirror-dropcursor 가 삽입선을 놓을 때 쓰는 계산 그대로다. `<body>` 가
 * `static` 이면 그 안의 `absolute` 는 문서에 붙으므로 스크롤을 더한 자리가
 * 되고, 그 밖에는 부모의 상자에서 부모가 스크롤한 만큼을 뺀 자리가 된다.
 */
function parentOrigin(parent: HTMLElement): Point {
  if (parent === document.body && getComputedStyle(parent).position === "static") {
    return { left: -window.scrollX, top: -window.scrollY };
  }

  const rect = parent.getBoundingClientRect();
  return { left: rect.left - parent.scrollLeft, top: rect.top - parent.scrollTop };
}

function toParent(parent: HTMLElement, clientLeft: number, clientTop: number): Point {
  const origin = parentOrigin(parent);
  return { left: clientLeft - origin.left, top: clientTop - origin.top };
}
