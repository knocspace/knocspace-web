import { useEffect, useState } from "react";
import IconMagnifyingglassLine from "@karrotmarket/react-monochrome-icon/IconMagnifyingglassLine";
import type { EmojiCategory } from "../lib/page-icon-emoji";
import { emojiCategoryLabels, pageIconLabels } from "@/shared/config";

/**
 * 이모지 고르는 판 — DESIGN.md §10 PageIcon.
 *
 * 목록과 검색을 자기가 안 갖는다. 받아서 부르기만 한다 — 이모지 데이터는
 * features/editor 안에 있다(emojiSearch.ts). 그쪽이 에디터 인스턴스를 쥐고 있는
 * 유일한 자리이기 때문이다.
 *
 * **아무것도 안 쳤을 때와 검색했을 때가 다른 목록이다.** 전자는 카테고리 순서로
 * 구획을 나눠 보여주고, 후자는 구획 없이 결과만 준다. 1,870개를 구분선 없이 한
 * 덩어리로 두면 스크롤해도 어디쯤인지 알 수 없다.
 */
export interface PageIconPickerProps {
  /** 지금 고른 것. 격자에서 눌린 상태로 보인다 */
  value?: string;
  /** 고르거나 랜덤을 눌렀을 때. 제거는 undefined 로 온다 */
  onPick: (next: string | undefined) => void;
  /** 아무것도 안 쳤을 때 보여줄 목록. 카테고리 순서다 */
  listCategories: () => Promise<EmojiCategory[]>;
  /** 질의에 걸리는 것만 */
  searchEmoji: (query: string) => Promise<string[]>;
}

/** 화면의 한 구획. 검색 결과에는 이름이 없다 — 나눌 기준이 없기 때문이다. */
interface Section {
  key: string;
  label?: string;
  emojis: string[];
}

/* 액션 줄 버튼과 같은 규격(§10). 판 윗줄이 그 줄과 한 식구로 보여야 한다. */
const TEXT_BUTTON =
  "t3-regular flex h-x5 shrink-0 items-center rounded-r1 px-dense-2 text-fg-neutral-muted hover:bg-bg-neutral-weak-alpha knoc-focus-ring";

export function PageIconPicker({ value, onPick, listCategories, searchEmoji }: PageIconPickerProps) {
  const [query, setQuery] = useState("");
  const [sections, setSections] = useState<Section[]>([]);

  /* 질의가 바뀔 때마다 다시 만든다. 첫 호출에서 이모지 데이터를 받아 오므로
   * (동적 import) 늦게 올 수 있고, 그 사이 질의가 또 바뀔 수 있다. cancelled 로
   * 늦게 온 답을 버린다 — 안 버리면 지운 검색어의 결과가 나중에 덮어쓴다. */
  useEffect(() => {
    let cancelled = false;
    const trimmed = query.trim();

    const load = trimmed
      ? searchEmoji(trimmed).then((found): Section[] => [{ key: "found", emojis: found }])
      : listCategories().then((categories): Section[] =>
          categories.map((category) => ({
            key: category.id,
            /* 데이터가 카테고리를 늘리면 여기 없는 id 가 온다. 그때는 이름 없이
             * 그린다 — 이모지가 안 보이는 것보다 이름이 없는 편이 낫다. */
            label: emojiCategoryLabels[category.id],
            emojis: category.emojis,
          })),
        );

    load.then((next) => {
      if (!cancelled) setSections(next);
    });
    return () => {
      cancelled = true;
    };
  }, [query, listCategories, searchEmoji]);

  const isEmpty = sections.every((section) => section.emojis.length === 0);

  return (
    /* 폭을 격자에 맡기지 않는다. width: fit-content 안에서는 1fr 열이 무너져
     * 칸이 서로 겹친다 — 폭이 곧 열 수라, 값의 출처는 knocspace.css 다. */
    /* 떠 있는 것이라 layer-floating 과 s3 다 — §3 "그림자 금지. 떠 있는 것만
     * 그림자를 쓴다", §10 Menu 가 쓰는 것과 같은 값이다. shadow-lg 는 Tailwind
     * 기본값이라 우리 것도 SEED 것도 아니었다. */
    <div className="w-icon-picker rounded-r2 border border-solid border-stroke-neutral-weak bg-bg-layer-floating p-dense-4 shadow-s3">
      <div className="flex justify-end gap-dense-2">
        <button
          type="button"
          className={TEXT_BUTTON}
          onClick={() => onPick(pickRandom(sections, value))}
        >
          {pageIconLabels.random}
        </button>
        {value && (
          <button type="button" className={TEXT_BUTTON} onClick={() => onPick(undefined)}>
            {pageIconLabels.remove}
          </button>
        )}
      </div>

      {/* 상자가 없다. 테두리도 배경도 밑줄도 없이 깜빡이는 캐럿만 남긴다 —
        * 문서 제목(PageTitle)과 같은 원칙이고 DESIGN.md §10 이 정한 것이다.
        * 판이 이미 테두리를 두르고 있어서 안에 상자를 또 두면 상자 안의 상자가 된다.
        *
        * SEED TextField 를 안 쓴다. recipe 가 주는 것이 우리에게 다 어긋난다 —
        * 밑줄(:after border-bottom), 16px 글자(t5), 그리고 입력을 컨테이너 높이만큼
        * 늘리는 align-self: stretch. 마지막 것 때문에 13px 글자 옆에 32px 짜리
        * 캐럿이 섰다. 셋을 다 되돌리면 남는 것이 없어서 감쌀 값이 없다.
        * (§10 의 24px IconButton 과 같은 자리다 — 덮는 게 아니라 다른 물건이다.)
        *
        * 포커스 링도 없다. 판이 열리면 여기로 포커스가 오고 이 판에 입력이 하나뿐이라,
        * 캐럿이 곧 "여기에 친다" 는 표시다. */}
      <div className="flex items-center gap-dense-3 py-dense-2 text-fg-neutral-subtle">
        <IconMagnifyingglassLine size={16} aria-hidden />
        <input
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder={pageIconLabels.search}
          aria-label={pageIconLabels.search}
          /* 판이 열리면 바로 칠 수 있어야 한다. 여는 동작이 곧 "고르겠다" 다. */
          autoFocus
          className="t3-regular w-full min-w-0 border-0 bg-bg-transparent p-0 text-fg-neutral outline-none placeholder:text-fg-neutral-subtle"
        />
      </div>

      {isEmpty ? (
        <p className="t3-regular flex h-x16 items-center justify-center text-fg-neutral-subtle">
          {pageIconLabels.empty}
        </p>
      ) : (
        /* 높이를 고정하고 안에서 스크롤한다. 안 그러면 1,870개가 화면을 넘긴다. */
        <div className="mt-dense-4 max-h-icon-picker overflow-y-auto overscroll-contain">
          {sections.map((section) => (
            <section key={section.key}>
              {section.label && (
                /* 스크롤해도 지금 어느 묶음인지 보여야 한다. 판 배경과 같은 색을
                 * 깔지 않으면 아래 이모지가 글자 뒤로 비친다. */
                <h3 className="t2-bold sticky top-0 z-10 bg-bg-layer-floating py-dense-2 text-fg-neutral-subtle">
                  {section.label}
                </h3>
              )}
              <div className="grid grid-cols-8">
                {section.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    aria-label={emoji}
                    aria-pressed={emoji === value}
                    onClick={() => onPick(emoji)}
                    /* 칸 크기를 값으로 안 적는다. 열 수가 정하고, 스크롤바가
                     * 생기면 그만큼 같이 줄어든다. */
                    className="flex aspect-square items-center justify-center rounded-r1 text-doc-icon-choice leading-none hover:bg-bg-neutral-weak-alpha aria-pressed:bg-bg-neutral-weak-alpha knoc-focus-ring"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/** 지금 것과 다른 것 하나. 같은 게 다시 나오면 눌린 것처럼 안 보인다. */
function pickRandom(sections: Section[], exclude?: string): string | undefined {
  const pool = sections.flatMap((section) => section.emojis).filter((each) => each !== exclude);
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}
