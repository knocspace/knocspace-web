import type { EmojiMartData } from "@emoji-mart/data";
import { BlockNoteEditor } from "@blocknote/core";
import { getDefaultEmojiPickerItems } from "@blocknote/core/extensions";

/**
 * 이모지 목록과 검색. **데이터를 우리가 안 들고 다닌다.**
 *
 * 목록과 검색이 출처가 다르다. 갈라 놓은 이유가 각각 있다.
 *
 * ── 검색은 BlockNote 것을 부른다
 *
 * 코어가 슬래시 메뉴의 이모지 피커에 쓰는 함수가 그대로 우리가 필요한 것이다.
 * 질의를 넘기면 emoji-mart 의 SearchIndex 가 걸러 준다 — 이름뿐 아니라 키워드와
 * 축약어까지 보는 색인이라, 우리가 keywords 를 직접 훑는 것보다 낫다.
 * 돌려주는 항목의 `id` 가 이모지 문자 그 자체라(`emoji.skins[0].native`)
 * `onItemClick` 만 버리면 된다 — 그건 에디터 본문에 이모지를 꽂는 함수라
 * 문서 밖 아이콘에는 쓸 데가 없다.
 *
 * ── 목록은 데이터를 직접 읽는다
 *
 * 같은 함수에 빈 질의를 주면 전체가 오지만 **순서가 쓸 수 없다.** 코어가
 * `Object.values(emojiData.emojis)` 를 그대로 주는데 그건 데이터의 키 순서라
 * 💯 · 🔢 로 시작한다. 카테고리도 안 온다 — 항목이 `{id, onItemClick}` 뿐이다.
 * 1,870개를 구분선 없이 한 덩어리로 두면 스크롤해도 어디쯤인지 알 수 없다.
 *
 * 그래서 목록은 `data.categories` 를 읽는다. 표정과 사람 → 자연 → 음식 순으로
 * 오고, 각 묶음이 화면의 한 구획이 된다.
 *
 * **무게는 0이다.** `@emoji-mart/data` 는 이미 우리 번들에 있다 — 슬래시 메뉴가
 * 쓰기 때문이다. package.json 에 적은 것은 안 적혀 있던 것을 적은 것이지 새로
 * 들인 것이 아니다. 동적 import 라 문서를 열 때가 아니라 피커를 열 때 받는다.
 *
 * **한글로는 안 찾아진다.** 데이터의 키워드가 영어뿐이라 `책` · `로켓` 은 0개다.
 * 자리 문구로 영어를 쓰라고 알린다 (messages.ts).
 *
 * ── 왜 features/editor 인가
 *
 * 검색이 에디터 인스턴스를 필요로 하는데, 에디터를 features/editor 밖으로
 * 내보내지 않기로 했다 (architecture.md). 그래서 인스턴스는 이 파일 안에만 있고
 * 밖으로는 문자열만 나간다.
 *
 * 인스턴스가 하는 일은 스키마 검사 하나다 — 코어가 "인라인 콘텐츠가 기본
 * text 인가" 를 보고 아니면 빈 배열을 준다. 그래서 문서용 에디터를 끌어오지 않고
 * 여기서 기본 스키마로 하나 만든다. 첫 검색 때 한 번만 만들고 계속 쓴다.
 */

/** 피커의 한 구획. `id` 는 emoji-mart 의 카테고리 id 다 (people · nature · …). */
export interface EmojiCategory {
  id: string;
  emojis: string[];
}

let lookupEditor: ReturnType<typeof BlockNoteEditor.create> | undefined;
let dataPromise: Promise<EmojiMartData> | undefined;

function loadEmojiData(): Promise<EmojiMartData> {
  /* 코어도 같은 모듈을 동적 import 하고 자기 Promise 를 캐시한다. 둘 중 어느
   * 쪽을 먼저 열든 번들러가 준 청크 하나를 나눠 쓴다. */
  dataPromise ??= import("@emoji-mart/data").then(
    (module) => ("default" in module ? module.default : module) as EmojiMartData,
  );
  return dataPromise;
}

/** 카테고리 순서대로. 아무것도 안 친 상태에서 보여줄 목록이다. */
export async function listEmojiCategories(): Promise<EmojiCategory[]> {
  const data = await loadEmojiData();

  return data.categories.map((category) => ({
    id: category.id,
    /* 데이터에 없는 id 가 목록에 남아 있는 경우가 있다. 그대로 두면 빈 칸이
     * 격자에 구멍으로 남는다. */
    emojis: category.emojis
      .map((id) => data.emojis[id]?.skins[0]?.native)
      .filter((native): native is string => Boolean(native)),
  }));
}

/** 질의에 걸리는 것만. 빈 질의는 여기로 오지 않는다 — 그건 listEmojiCategories 다. */
export async function searchEmoji(query: string): Promise<string[]> {
  lookupEditor ??= BlockNoteEditor.create();
  const items = await getDefaultEmojiPickerItems(lookupEditor, query);
  return items.map((item) => item.id);
}
