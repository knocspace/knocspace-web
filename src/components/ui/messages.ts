/**
 * UI 문구 한 곳. 컴포넌트 안에 문자열을 하드코딩하지 않는다 (DESIGN.md §8).
 *
 * 여기 있는 값은 전부 DESIGN.md §9 에서 확정된 것이다. 문구를 고칠 일이
 * 생기면 §9 를 먼저 고치고 여기로 옮긴다. 반대 방향은 안 된다.
 *
 * 아이콘 이름은 여기 두지 않는다. 이 파일은 "문구" 만 담는다.
 * 아이콘은 화면을 그리는 쪽이 §9 를 보고 고른다.
 */

/** 을 / 를 — 받침이 있으면 "을". */
function objectParticle(word: string): "을" | "를" {
  const last = word.charCodeAt(word.length - 1);
  // 한글 음절 블록(0xAC00~0xD7A3)은 28개 단위로 종성이 한 바퀴 돈다.
  // 나머지가 0이면 종성이 없다. 한글이 아니면 "를" 로 둔다.
  if (Number.isNaN(last) || last < 0xac00 || last > 0xd7a3) return "를";
  return (last - 0xac00) % 28 === 0 ? "를" : "을";
}

export interface Message {
  title: string;
  /**
   * 문장 단위로 나눠 담는다. 하나의 문자열에 \n 을 박지 않는다.
   *
   * 줄바꿈은 폭이 아니라 문장이 정하기 때문이다 (DESIGN.md §8). default 는
   * 문장 사이를 <br> 로 끊고, 한 줄로 붙여야 하는 compact 는 공백으로 잇는다.
   * \n 을 박아 두면 compact 에서 되돌릴 수가 없다.
   */
  description?: readonly string[];
  /** 다음 행동이 그 화면 안에 있을 때만 넣는다 (DESIGN.md §9). */
  action?: string;
}

/* ── 빈 화면 ─────────────────────────────────────────────────── */

export const emptyMessages = {
  /** 첫 실행 — 페이지가 하나도 없음 */
  firstRun: {
    title: "페이지가 아직 없어요",
    description: ["첫 페이지를 만들면 왼쪽 목록에 쌓여요."],
    action: "페이지 만들기",
  },

  /**
   * 검색 결과 없음.
   *
   * "본문까지 넓히거나" 가 버튼과 겹치지만 그대로 둔다. "A거나 B" 는 두
   * 선택지를 나란히 놓는 문장이라 A 를 빼면 B 가 붕 뜬다 (DESIGN.md §9).
   */
  searchNoResult: (query: string) => ({
    title: `‘${query}’와 맞는 페이지가 없어요`,
    description: [
      "제목만 찾고 있어요.",
      "본문까지 넓히거나 다른 단어로 찾아보세요.",
    ],
    action: "본문까지 찾기",
  }),

  /** 검색 결과 없음 — compact. 검색어가 바로 위 입력창에 이미 보이므로 되풀이하지 않는다. */
  searchNoResultCompact: {
    title: "제목에서는 못 찾았어요",
    action: "본문까지 찾기",
  },

  /** 즐겨찾기 섹션이 빔 — compact. 다음 행동(별 표시)이 이 자리에 없어서 버튼이 없다. */
  favoritesEmpty: {
    title: "즐겨찾기한 페이지가 없어요",
  },

  trashEmpty: {
    title: "휴지통이 비어 있어요",
    description: [
      "삭제한 페이지는 30일 동안 여기 머물러요.",
      "그 뒤에는 사라져요.",
    ],
  },

  /** 없는 페이지 (404). 에러가 아니라 빈 화면으로 다룬다 — 주소를 잘못 짚었을 뿐이다. */
  notFound: {
    title: "없는 페이지예요",
    description: ["주소가 바뀌었거나 삭제됐어요.", "왼쪽 목록에서 찾아보세요."],
    action: "홈으로",
  },
} as const satisfies Record<string, Message | ((...args: never[]) => Message)>;

/** 빈 문서(에디터). 빈 화면 컴포넌트를 쓰지 않고 제목·첫 줄 자리표시로만 그린다. */
export const editorPlaceholders = {
  title: "제목 없음",
  firstLine: "바로 쓰거나, / 를 눌러 블록을 넣으세요",
} as const;

/* ── 에러 화면 ───────────────────────────────────────────────── */

/**
 * 원인별로 가른다. "다시 시도" 가 답이 아닌 경우가 있기 때문이다 —
 * 권한이 없으면 백 번 눌러도 같다 (DESIGN.md §9).
 *
 * 404 는 여기 없다. emptyMessages.notFound 를 쓴다.
 */
export const errorMessages = {
  offline: {
    title: "인터넷에 연결되어 있지 않아요",
    description: ["연결을 확인하고 다시 시도해 주세요."],
    action: "다시 시도",
  },

  /** 5xx · timeout. subject 는 못 불러온 대상 — 트리면 "목록", 문서면 "페이지". */
  server: (subject: string) => ({
    title: `${subject}${objectParticle(subject)} 불러오지 못했어요`,
    description: ["서버가 응답하지 않았어요.", "잠시 뒤 다시 시도해 주세요."],
    action: "다시 시도",
  }),

  /**
   * 재시도 후에도 실패. 눌렀는데 똑같은 화면이 다시 뜨면 사용자는 자기가
   * 뭘 잘못했나 싶어진다. 두 번째부터는 "다시 시도" 를 접는다.
   */
  retryFailed: {
    title: "여전히 안 되네요",
    description: ["지금은 서버 쪽 문제로 보여요.", "조금 뒤에 다시 열어 주세요."],
    action: "홈으로",
  },

  forbidden: {
    title: "이 페이지를 볼 수 없어요",
    description: ["접근 권한이 없어요.", "소유자에게 요청해 보세요."],
    action: "홈으로",
  },

  /** 영역 하나만 실패 — SEED PageBanner. subject 는 위와 같다. */
  inline: (subject: string) => ({
    title: `${subject}${objectParticle(subject)} 불러오지 못했어요`,
    action: "다시 시도",
  }),
} as const satisfies Record<string, Message | ((...args: never[]) => Message)>;

/**
 * ErrorBoundary — 라우트 단위.
 *
 * 설명이 없는 것이 확정이다. 제목이 무슨 일인지 말했고 버튼이 뭘 할 수
 * 있는지 말한다. 그 사이에 "새로 고치면 다시 열려요" 를 끼우면 버튼을
 * 소리 내어 읽는 것이다 (DESIGN.md §9).
 *
 * 저장 상태도 약속하지 않는다. 렌더가 죽은 순간 저장 안 된 편집은 실제로
 * 없어졌을 수 있어서, "저장된 내용은 그대로 있어요" 는 지킬 수 없는 약속이다.
 */
export const boundaryMessages = {
  title: "이 페이지를 열지 못했어요",
  refresh: "새로 고치기",
  home: "홈으로",
  /** 개발 빌드에서만. 기본 접힘. */
  detail: "기술 정보 보기",
} as const;

/* ── 레이아웃 ────────────────────────────────────────────────── */

/**
 * 상단바 — 여기부터는 §9 가 아니라 DESIGN.md §10 에서 온 문구다.
 *
 * §9 는 빈 화면과 에러 화면만 다룬다. 상단바 문구는 화면이 아니라 상태
 * 표시라 §10 의 컴포넌트 규격 쪽에 적혀 있고, 값의 출처는 거기다.
 */

export const breadcrumbMessages = {
  /** nav 의 이름. 화면에는 안 보이고 스크린리더만 읽는다 */
  label: "현재 위치",
} as const;

/**
 * 문서가 아닌 화면의 이름. 상단바 왼쪽에 한 항목으로 뜬다.
 *
 * 문서 화면(/p/:pageId)은 여기 없다. 그건 경로가 서버에서 오기 때문이다 —
 * 이 표에 적을 수 있는 건 주소만 보고 이미 아는 이름뿐이다.
 */
export const routeMessages = {
  home: "홈",
  uiCatalog: "컴포넌트 카탈로그",
} as const;

/**
 * 저장 상태 — DESIGN.md §10.
 *
 * "변경 없음" 에 해당하는 문구가 없는 것이 확정이다. 아무것도 안 그린다.
 */
export const saveStatusMessages = {
  saving: "저장 중",
  saved: "저장됨",
  offline: "오프라인 — 연결되면 저장할게요",
  failed: "저장 안 됨",
  retry: "다시 시도",
} as const;
