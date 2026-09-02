import { useEffect, useRef, useState } from "react";
import IconMagnifyingglassLine from "@karrotmarket/react-monochrome-icon/IconMagnifyingglassLine";
import type { EmojiCategory } from "../../lib/page-icon-emoji";
import { emojiCategoryLabels, pageIconLabels } from "@/shared/config";

/**
 * 이모지 고르는 판 — DESIGN.md §10 PageIcon.
 *
 * 목록과 검색을 자기가 안 갖는다. 받아서 부르기만 한다 — 이모지 데이터는
 * pages/page-editor 안에 있다(page-icon-emoji.ts). 그쪽이 에디터 인스턴스를 쥐고 있는
 * 유일한 자리이기 때문이다.
 *
 * **아무것도 안 쳤을 때와 검색했을 때가 다른 목록이다.** 전자는 카테고리 순서로
 * 구획을 나눠 보여주고, 후자는 구획 없이 결과만 준다. 1,870개를 구분선 없이 한
 * 덩어리로 두면 스크롤해도 어디쯤인지 알 수 없다.
 *
 * ── 열고 닫는 것을 마운트로 안 한다
 *
 * `open` 을 prop 으로 받는다. 감싸는 쪽(PageIcon)이 닫힐 때 우리를 떼어내지 않고
 * 감추기만 하기 때문이다 — 1,870개를 열 때마다 다시 그리지 않으려는 것이다.
 * 그래서 마운트 시점에 기대던 두 가지를 `open` 에 다시 매단다:
 *
 * - **포커스.** `autoFocus` 는 마운트에만 걸려서 두 번째 열기부터 안 먹는다.
 * - **검색어 비우기.** 언마운트가 지우던 것을 닫힐 때 우리가 지운다. 닫힌 채로
 *   목록이 전체로 돌아가 있어야 다음에 열 때 결과가 한 프레임 깜빡이지 않는다.
 */
export interface PageIconPickerProps {
  /** 열려 있나. 닫혀도 떼어내지 않으므로 포커스와 검색어 초기화의 기준이 된다 */
  open: boolean;
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

/** 격자 한 칸의 변. knocspace.css 가 판 폭을 「8열 × 40px + 좌우 8px」 로 잡은 그 40 이다. */
const CELL_PX = 40;
/** 한 줄에 서는 칸 수. 아래 grid-cols-8 과 같은 값이다. */
const COLUMNS = 8;

export function PageIconPicker({
  open,
  value,
  onPick,
  listCategories,
  searchEmoji,
}: PageIconPickerProps) {
  const [query, setQuery] = useState("");
  /* `undefined` 는 「아직 안 왔다」, 빈 배열은 「없다」 다. 둘을 한 값으로 두면
   * 답을 기다리는 동안 "없어요" 가 뜬다 — 이모지 데이터가 처음에는 동적 import
   * 라 늦게 오므로 그 문구가 몇 초씩 서 있었다. */
  const [sections, setSections] = useState<Section[] | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  /* 닫힐 때 검색어를 비운다. 언마운트가 해 주던 것을 우리가 하는 것이다.
   *
   * effect 가 아니라 **렌더 중**에 한다. effect 로 하면 낡은 검색 결과가 한 번
   * 그려지고 나서야 지워져서 렌더가 두 번 돈다 — React 가 "이전 prop 과
   * 비교해서 렌더 중에 맞춘다" 를 권하는 자리가 이것이다.
   * 숨겨진 동안 일어나므로 눈에는 안 띈다. */
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) setQuery("");
  }

  /* 포커스는 DOM 을 직접 만지는 것이라 effect 가 맞다. `autoFocus` 를 못 쓰는
   * 이유는 위 주석에 있다 — 마운트가 첫 열기에만 일어난다. */
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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

  const loading = sections === undefined;
  const isEmpty = !loading && sections.every((section) => section.emojis.length === 0);

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
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder={pageIconLabels.search}
          aria-label={pageIconLabels.search}
          /* 판이 열리면 바로 칠 수 있어야 한다. 여는 동작이 곧 "고르겠다" 다.
           * `autoFocus` 가 아니라 위의 effect 가 한다 — 닫아도 안 떼어내므로
           * 마운트가 두 번째 열기부터는 안 일어난다. */
          className="t3-regular w-full min-w-0 border-0 bg-bg-transparent p-0 text-fg-neutral outline-none placeholder:text-fg-neutral-subtle"
        />
      </div>

      {loading ? (
        /* 아직 답이 안 왔다. **여기서 "없어요" 를 쓰면 안 된다** — 처음 열 때는
         * 이모지 데이터를 그때 받아오느라 몇 초가 걸리는데, 그 동안 "없어요" 가
         * 서 있으면 다 뒤진 끝에 없다는 말로 읽힌다.
         *
         * 문구도 spinner 도 안 놓는다. 곧 격자가 들어올 자리라 무엇을 놓든
         * 한 번 깜빡이고 사라진다. 자리만 잡아 두면 판 크기가 안 뛴다. */
        <div className="mt-dense-4 h-icon-picker" aria-busy />
      ) : isEmpty ? (
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
              {/* 화면 밖 구획은 브라우저가 통째로 건너뛴다.
                *
                * 1,870개가 다 DOM 에 있지만 240px 창에 보이는 것은 여덟 줄 남짓
                * (약 48개)이다. 나머지 1,800여 개까지 레이아웃하고 칠하는 것이
                * 판이 늦게 뜨던 가장 큰 이유였다 — 컬러 이모지 글리프는 글자가
                * 아니라 그림이라 래스터화가 비싸다.
                *
                * content-visibility 를 구획(section)이 아니라 격자에 건다.
                * 구획에 걸면 paint 격리가 생겨서 위의 sticky 머리글이 자기 구획
                * 안에 갇힌다. 머리글은 지금대로 두고 무거운 쪽만 건다.
                *
                * 건너뛴 격자도 자리는 차지해야 스크롤바가 안 요동친다. 그래서
                * 줄 수 × 칸 높이를 미리 알려준다. `auto` 를 앞에 붙였으므로 한 번
                * 그려진 뒤에는 브라우저가 실제 크기를 기억한다 — 스크롤바가
                * 칸을 조금 줄여도 어림값이 틀린 채로 남지 않는다. */}
              <div
                className="grid grid-cols-8 [content-visibility:auto]"
                style={{
                  containIntrinsicSize: `auto ${Math.ceil(section.emojis.length / COLUMNS) * CELL_PX}px`,
                }}
              >
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
function pickRandom(sections: Section[] | undefined, exclude?: string): string | undefined {
  const pool = (sections ?? [])
    .flatMap((section) => section.emojis)
    .filter((each) => each !== exclude);
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}
