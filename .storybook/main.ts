import type { StorybookConfig } from "@storybook/react-vite";

/**
 * 스토리북 설정 — sprint-1 §5.
 *
 * 컴포넌트를 앱 밖에서 격리해 띄우고,
 * props 를 패널에서 바꿔 가며 확인한다.
 *
 * **vite.config.ts 를 여기 옮겨 적지 않는다.** @storybook/react-vite 는
 * 프로젝트의 vite 설정을 그대로 읽어 자기 것과 합친다. 그래서 `@` 별칭,
 * Tailwind, 그리고 SEED 의 `seed-layered` resolve 조건이 저절로 따라온다 —
 * 한쪽만 고쳤을 때 앱은 도는데 스토리북만 깨지는 일이 없다.
 */
const config: StorybookConfig = {
  // 컴포넌트 옆에 둔다. 파일을 열면 스토리가 같이 보여야 안 썩는다.
  stories: ["../src/**/*.stories.tsx"],
  addons: [
    /* Docs 탭. 이게 없으면 스토리에 적어 둔 설명이 화면에 안 나온다 —
     * 스토리북에는 캔버스만 뜨고, 컴포넌트 위 주석도 스토리 위 주석도
     * 코드를 열어야만 보인다. 실제로 그 상태였다.
     *
     * 붙이면 preview.tsx 의 tags: ["autodocs"] 가 컴포넌트마다 Docs 를
     * 한 장씩 만든다. 그 안에 들어가는 것:
     *   - meta 위 주석            → 페이지 머리말
     *   - 스토리 위 주석          → 스토리마다 설명
     *   - props 인터페이스의 주석 → 속성 표 (react-docgen 이 읽는다)
     * 설명을 스토리 파일이 아니라 컴포넌트 쪽에 적어도 여기로 따라온다. */
    "@storybook/addon-docs",
    // 스토리마다 axe 를 돌린다. 지우기로 한 자동 테스트의 빈자리를 여기가
    // 일부 메운다 — role · 이름 · 대비를 사람이 안 보고도 잡는다.
    "@storybook/addon-a11y",
    // 툴바의 라이트/다크 토글. 카탈로그가 손으로 갖고 있던 useState 를 대신한다.
    "@storybook/addon-themes",
  ],
  // 익명 사용 통계를 보내지 않는다.
  core: { disableTelemetry: true },
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};

export default config;
