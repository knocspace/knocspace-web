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
  /**
   * 제목 자리 문구이면서, 이름 없는 페이지를 트리·브레드크럼이 부르는 이름이다
   * (PageNavigationItem). 두 자리가 한 문자열을 쓴다 — 문서에서 본 자리 문구와
   * 트리에 뜬 이름이 다르면 같은 페이지로 안 읽힌다.
   *
   * 그래서 `제목 없음` 이 아니라 `새 페이지` 다. 트리에 서는 순간 이 글자는
   * 자리 문구가 아니라 그 페이지의 이름으로 읽히는데, 「없음」은 이름 자리에서
   * 상태 설명처럼 들린다. Notion 도 같은 자리에 같은 글자를 쓴다.
   */
  title: "새 페이지",
  firstLine: "바로 쓰거나, / 를 눌러 블록을 넣으세요",
} as const;

/**
 * 목차 블록 — DESIGN.md §9 "목차 블록" · F3 §3.
 *
 * 슬래시 메뉴 문구가 여기 있는 유일한 블록이다. 나머지 20항목의 이름과 설명은
 * BlockNote 의 ko 사전이 준다(content-editor.ts). 목차는 BlockNote 에 없는
 * 블록이라 사전에도 없다.
 *
 * **subtext 만 합니다체다.** §8 은 해요체지만, 이 줄이 앉는 자리는 우리 화면이
 * 아니라 ko 사전이 쓴 메뉴 한가운데다 — 위아래가 "번호가 매겨진 목록을
 * 추가합니다." · "이미지 파일을 업로드합니다." 인데 여기만 해요체면 그 한 줄이
 * 남의 글처럼 읽힌다. 사전은 우리가 고쳐 쓰는 것이 아니므로 이 줄을 사전 쪽에
 * 맞춘다. 예외는 이 자리 하나이고, 같은 블록의 empty 는 문서 본문에 앉는
 * 문구라 해요체 그대로다.
 *
 * 얹는 것은 이름이 못 담는 쪽이다 (§8). "목차" 는 결과의 이름이고, 사용자가
 * 모르는 것은 그게 **페이지 전체를 훑는 개요** 라는 쪽이다.
 *
 * empty 는 빈 화면 컴포넌트를 쓰지 않는다. 빈 문서 첫 줄과 같은 자리이고
 * (§9 "빈 문서"), 블록 하나가 EmptyState 골격을 들고 본문 한가운데 서면
 * 문서가 아니라 화면처럼 읽힌다.
 */
export const tableOfContentsLabels = {
  title: "목차",
  subtext: "페이지의 개요를 표시합니다.",
  empty: "제목을 넣으면 여기에 모여요.",
} as const;

/**
 * 블록 메뉴 — DESIGN.md §9 "블록 메뉴" · F3 §2.
 *
 * ⠿ 를 눌렀을 때 뜨는 네 줄이다. **네 줄 다 여기 있다.**
 *
 * 처음에는 둘만 여기 두고 색깔 · 삭제는 BlockNote 의 ko 사전을 그대로 썼다
 * (`drag_handle` 항목). 사전에 있는 말을 덮지 않으려던 것인데, 사전의 "색깔" 을
 * "색상" 으로 고치는 순간 그 규칙이 반이 되어 버린다 — 한 줄만 우리가 쓰고
 * 옆줄은 사전이 쓰면, 말투가 어긋나도 어디를 고쳐야 하는지가 흐려진다.
 * 그래서 넷을 다 여기로 가져왔다. 「삭제」는 사전과 같은 말이지만 출처가
 * 우리 쪽이라는 것이 중요하다.
 *
 * 넷 다 **결과의 이름**이다 — "블록 바꾸기" 가 아니라 "전환", "아래에 하나 더"
 * 가 아니라 "복제". 한 판에 나란히 서는 줄이라 같은 꼴로 맞춘다.
 *
 * 「색상」은 Notion 의 "색" 보다 한 글자 길다. 우리 화면에서 색을 고르는 자리는
 * 여기뿐이 아니고(문서 아이콘 · DB 태그가 뒤에 온다), 그쪽과 같은 말이어야
 * 한다 — "색" 은 한 글자라 다른 곳에서 버튼 이름으로 서면 약하다.
 */
export const blockMenuLabels = {
  turnInto: "전환",
  colors: "색상",
  duplicate: "복제",
  remove: "삭제",
} as const;

/**
 * 문서 아이콘 — DESIGN.md §10 PageIcon.
 *
 * add 는 명령이 아니라 자리 이름이다. "아이콘을 추가하세요" 로 늘리지 않는다 —
 * 24px 줄에 문장을 넣으면 그 줄이 본문처럼 읽힌다 (§8).
 *
 * change 는 화면에 안 보이고 스크린리더만 읽는다. 눈으로는 이모지 자체가
 * 버튼이라 이름이 필요 없지만, 읽어 주는 쪽에는 이모지 하나가 전부다.
 *
 * search 는 Notion 과 같은 말을 쓴다. 이 자리에서 사용자가 하는 일이 "찾기" 가
 * 아니라 "좁히기" 라서다 — 목록이 이미 눈앞에 다 있고, 치는 만큼 줄어든다.
 *
 * **다만 한글로는 하나도 안 걸린다.** 이모지 데이터의 키워드가 영어뿐이다
 * (page-icon-emoji.ts). 자리 문구로는 그 사실을 알릴 방법이 없어서, 한글을 치면
 * 아무것도 없다고 나온다 — 빈 결과 문구 쪽에서 알린다.
 */
export const pageIconLabels = {
  add: "아이콘 추가",
  change: "문서 아이콘 바꾸기",
  search: "필터…",
  random: "랜덤",
  remove: "제거",
  empty: "없어요 — 이모지는 영어로만 찾을 수 있어요",
} as const;

/**
 * 이모지 구획 이름 — 키는 emoji-mart 의 카테고리 id 다.
 *
 * 데이터가 주는 이름은 영어(Smileys & People …)라 여기서 갈아 끼운다. 데이터가
 * 카테고리를 늘리면 여기 없는 id 가 오는데, 그때는 구획 이름 없이 그린다 —
 * 이모지가 안 보이는 것보다 이름이 없는 편이 낫다 (PageIcon).
 */
export const emojiCategoryLabels: Record<string, string> = {
  people: "표정과 사람",
  nature: "자연",
  foods: "음식",
  activity: "활동",
  places: "여행과 장소",
  objects: "사물",
  symbols: "기호",
  flags: "깃발",
};

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
} as const;

/**
 * 저장 상태 — DESIGN.md §10.
 *
 * 넷뿐이고 "변경 없음" 에 해당하는 문구가 없는 것이 확정이다. 아무것도 안 그린다.
 *
 * 실패 문구도 여기 없다. 자동 재시도까지 실패해서 사람이 손대야 하는 상황은
 * 상단바가 아니라 본문 위 배너로 올라가고, 그 문구는 원인별로 갈린
 * errorMessages 가 갖는다 (§9). 재시도 중인 동안은 저장이 아직 안 끝난
 * 것이므로 saving 을 그대로 쓴다.
 */
export const saveStatusMessages = {
  saving: "저장 중",
  saved: "저장됨",
  offline: "오프라인 — 연결되면 저장할게요",
} as const;

/**
 * 사이드바 — DESIGN.md §10.
 *
 * 검색 · 새 페이지 · 즐겨찾기는 F8 · F2 · F8 에서 진짜 버튼이 된다. 지금은
 * 트리 행과 같은 리듬(28px)만 잡아 두는 자리표시라 문구만 여기 둔다.
 *
 * 워크스페이스 이름은 F5 에서 서버가 준다. 그때 이 값은 폴백이 된다.
 */
export const sidebarMessages = {
  workspace: "워크스페이스",
  /** 트리 위 섹션 라벨 */
  pages: "페이지",
  shortcuts: ["검색", "새 페이지", "즐겨찾기"],
  /** 레일을 눌렀을 때 — 화면에는 안 보이고 스크린리더만 읽는다 */
  expand: "사이드바 펼치기",
  /** 폭 조절 핸들. role="separator" 의 이름이다 */
  resizeHandle: "사이드바 폭 조절",
} as const;

/**
 * 페이지 트리 — DESIGN.md §10.
 *
 * 눈에 보이는 문구가 거의 없다. 트리는 제목이 곧 내용이라 라벨을 붙일 자리가
 * 없고, 여기 있는 것은 대부분 스크린리더만 읽는 이름이다.
 *
 * 액션 버튼 이름에 제목을 넣는 이유 — 페이지 50개면 "메뉴 열기" 버튼이
 * 50개다. 스크린리더 사용자가 버튼 목록을 열면 같은 이름 50개가 나온다.
 */
export const treeMessages = {
  /** tree 의 이름. 화면에는 안 보인다 */
  label: "페이지 목록",
  expand: "펼치기",
  collapse: "접기",
  more: (title: string) => `${title} 메뉴 열기`,
  addChild: (title: string) => `${title} 안에 하위 페이지 추가`,
} as const;
