import { useSyncExternalStore } from "react";

/**
 * 지금 라이트인지 다크인지. BlockNote 에 넘길 한 글자짜리 답이다.
 *
 * 나머지 화면은 이걸 몰라도 된다 — SEED 토큰이 CSS 안에서 알아서 뒤집힌다.
 * BlockNote 만 예외다. 안 넘기면 CSS 가 아니라 OS 설정(prefers-color-scheme)을
 * 혼자 보기 때문에, 앱은 라이트인데 메뉴만 어두워지는 일이 생긴다.
 *
 * 출처는 SEED 가 정한 <html> 의 두 속성이다 (DESIGN.md §4).
 * 속성이 아예 없으면 SEED 기본값인 라이트다.
 */

const MODE = "data-seed-color-mode";
const USER = "data-seed-user-color-scheme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function read(): "light" | "dark" {
  const root = document.documentElement;

  switch (root.getAttribute(MODE)) {
    case "dark-only":
      return "dark";
    case "system": {
      /* system 은 "OS 를 따르되 사용자가 앱 안에서 고르면 그게 이긴다" 는 뜻이다.
       * 고른 게 없을 때만 OS 로 내려간다. */
      const chosen = root.getAttribute(USER);
      if (chosen === "dark" || chosen === "light") return chosen;
      return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
    }
    default:
      return "light";
  }
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [MODE, USER],
  });

  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);

  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

/* 세 번째 인자는 SSR·하이드레이션용이라 지금은 불리지 않는다. SSR 이 없기
 * 때문이다. 그래도 라이트로 고정해 두는 것은, 나중에 프리렌더를 붙였을 때
 * read() 가 document 를 만지지 않게 하려는 대비다. */
export function useSeedColorScheme() {
  return useSyncExternalStore(subscribe, read, () => "light" as const);
}
