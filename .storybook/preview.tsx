/* 이 import 가 맨 위인 것이 중요하다. 아래로 내리면 스토리북에서 SEED
 * 컴포넌트의 색·여백이 통째로 사라진다.
 *
 * index.css 첫 줄의 @layer 선언이 layer 순서를 정하는데, CSS 는 layer 를
 * "처음 나타난 순서" 로 등록한다. ToastProvider 를 먼저 import 하면 SEED
 * Snackbar 의 @layer seed-components 가 먼저 실려서 seed-components 가
 * 1순위(=가장 약한 layer)로 박히고, 뒤늦게 온 선언은 이미 등록된 layer 를
 * 다시 정렬하지 못한다. 결과 순서가 seed-components → … → base 라
 * Tailwind preflight 의 button{background-color:transparent;border:0;
 * padding:0} 이 SEED 버튼을 이긴다. 토큰이 안 붙은 것처럼 보이는 정체가 이것.
 *
 * 앱의 main.tsx 도 같은 이유로 index.css 를 App 보다 먼저 import 한다. */
import "@/app/styles/global.css";

import type { Preview } from "@storybook/react-vite";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { ToastProvider } from "@/shared/ui";

/**
 * 모든 스토리에 공통으로 깔리는 것.
 *
 * 컬러 모드는 <html> 에만 건다 — DESIGN.md §4.
 *
 * 스토리를 감싼 <div> 에 걸면 SEED 컴포넌트만 뒤집히고 Tailwind 색
 * 유틸리티는 라이트로 남는다. @seed-design/tailwind4-theme 이 inline 이
 * 아닌 @theme 로 --color-fg-neutral: var(--seed-color-fg-neutral) 을
 * :root 에 한 번 계산해 두기 때문이다. 자손에서 --seed-color-* 를 바꿔도
 * --color-* 는 :root 에서 상속된 값 그대로다. 결과가 흰 배경 + 어두운 SEED
 * 컴포넌트라 토큰이 안 붙은 것처럼 보인다.
 *
 * withThemeByDataAttribute 의 parentSelector 기본값이 "html" 이라 그대로 맞는다.
 */
const preview: Preview = {
  /**
   * 컴포넌트마다 Docs 를 한 장씩 만든다.
   *
   * 스토리 파일마다 따로 적지 않고 여기서 한 번에 켠다 — 새 컴포넌트를
   * 만들었을 때 "설명이 왜 안 보이지" 를 다시 겪지 않기 위해서다.
   * 특정 스토리를 Docs 에서 빼고 싶으면 그 스토리에만
   * `tags: ["!autodocs"]` 를 붙인다.
   */
  tags: ["autodocs"],

  parameters: {
    // 표면은 아래 데코레이터가 깐다. 스토리북이 자기 여백을 덧대지 않게 한다.
    layout: "fullscreen",

    /* 속성 표를 펼쳐 둔다. 접혀 있으면 이름과 입력칸만 보여서, 애써 적어
     * 둔 props 주석을 아무도 안 읽는다. */
    controls: { expanded: true },

    docs: {
      // 긴 Docs 페이지 오른쪽에 목차. 스토리가 넷을 넘으면 이게 있어야 훑힌다.
      toc: true,
    },

    /**
     * 사이드바 순서. 안 적으면 스토리 파일을 읽어들인 순서 — 즉 폴더
     * 이름 알파벳순 — 이 그대로 나온다. 제목에 `UI/1 Spinner` 처럼 번호를
     * 붙여도 소용없다. 스토리북은 그 번호로 정렬하지 않고 라벨에 그대로
     * 찍어 보여줄 뿐이다.
     *
     * 순서는 삭제된 UiCatalogRoute 의 섹션 차례를 그대로 옮긴 것이다.
     * 기준은 의존 관계도 난이도도 아니고 "어떤 상황의 화면이냐" 다.
     *
     *   Spinner · Skeleton                        기다리는 동안
     *   EmptyState · ErrorState · ErrorBoundary   내용이 없거나 실패했을 때
     *   Menu · Toast · Dialog                     떠 있는 것
     *   IconButton · InlineInput                  화면 안에 박히는 조각
     *
     * 그래서 뒤로 갈수록 복잡해지지 않는다. 제일 단순한 IconButton 이
     * 맨 뒤고, SEED 파트를 제일 많이 쓰는 Dialog 가 가운데다.
     *
     * 에디터 는 문서 **안쪽** 이야기라 맨 뒤다. 컴포넌트가 아니라 블록 종류로
     * 나뉘고, 한 종류에 스토리 한 장이다.
     *
     *   문서 한 장                       다 같이 (BlockEditor 자체)
     *   문단 … 구분선                     블록 하나씩. 문서를 쓸 때 손이 가는 차례다
     *   인라인 서식 · 블록 만들기          블록이 아닌 것 — 글자에 붙는 것과 만드는 법
     *
     * 여기 없는 이름은 뒤에 알파벳순으로 붙는다. 컴포넌트를 새로 만들면
     * 이 배열에도 한 줄 넣는다.
     */
    options: {
      storySort: {
        order: [
          "UI",
          [
            "Spinner",
            "Skeleton",
            "EmptyState",
            "ErrorState",
            "ErrorBoundary",
            "Menu",
            "Toast",
            "Dialog",
            "IconButton",
            "InlineInput",
          ],
          "레이아웃",
          ["PageNavigation", "Breadcrumb", "SaveStatus"],
          "문서",
          ["PageTitle", "PageIcon", "PageIconPicker"],
          "에디터",
          [
            "문서 한 장",
            /* 블록 — 슬래시 메뉴에 뜨는 차례에 가깝게. 목차는 우리가 만든
             * 블록이라 기본 블록 뒤에 붙는다. */
            "문단",
            "제목",
            "목록",
            "인용",
            "코드",
            "표",
            "파일과 미디어",
            "구분선",
            "목차",
            "인라인 서식",
            /* 블록 하나가 아니라 다루는 법 — 만들고, 고르고, 메뉴로 바꾼다. */
            "블록 만들기",
            "블록 선택",
            "블록 메뉴",
          ],
        ],
      },
    },
  },

  /* 라이트↔다크는 위 툴바의 테마 스위처(addon-themes)로 바꾼다. 스토리 안에
   * 같은 버튼을 또 두지 않는다 — 한 값을 두 곳에서 누르게 되고, 스토리
   * 미리보기 안에 컴포넌트가 아닌 UI 가 섞인다. */
  decorators: [
    (Story, context) => (
      <ToastProvider>
        {/* 토스트·다이얼로그는 이 안에서 뜬다. 배경 토큰을 깔아야
          * 회색 위 회색(Skeleton)이 구별된다.
          *
          * 높이는 보는 곳에 따라 다르다. 캔버스(스토리 하나만 보는 탭)에서는
          * 화면을 채워야 하단 가운데 토스트가 제자리에 뜬다. Docs 는 스토리를
          * 세로로 죽 이어 붙이는 페이지라, 거기서도 min-h-screen 이면 스토리
          * 하나에 한 화면씩 먹어서 아래 설명이 안 보인다. */}
        <div
          className={[
            context.viewMode === "docs" ? "min-h-0" : "min-h-screen",
            "bg-bg-layer-default p-x4 text-fg-neutral",
          ].join(" ")}
        >
          <Story />
        </div>
      </ToastProvider>
    ),

    withThemeByDataAttribute({
      themes: { light: "light-only", dark: "dark-only" },
      defaultTheme: "light",
      attributeName: "data-seed-color-mode",
    }),
  ],
};

export default preview;
