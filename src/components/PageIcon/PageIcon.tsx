import { useEffect, useRef, useState } from "react";
import IconFaceSmileCircleLine from "@karrotmarket/react-monochrome-icon/IconFaceSmileCircleLine";
import type { EmojiCategory } from "@/features/editor/emojiSearch";
import { pageIconLabels } from "@/lib/messages";
import { EmojiPicker } from "./EmojiPicker";

/**
 * 문서 아이콘 — DESIGN.md §10 PageIcon.
 *
 * 두 얼굴이다. 아이콘이 있으면 52px 이모지, 없으면 「아이콘 추가」 한 줄.
 * 둘 다 누르면 같은 판이 열린다.
 *
 * **이모지는 여기서만 예외다.** DESIGN.md §8 이 UI 크롬에 이모지를 금지하지만
 * 유저가 고르는 문서 아이콘은 콘텐츠라 빠진다. 그래서 「아이콘 추가」 버튼의
 * 아이콘은 이모지가 아니라 seed-icon 이다.
 *
 * ── 호버는 이 컴포넌트가 안 갖는다
 *
 * 아이콘이 없을 때 이 줄은 평상시 안 보이고 제목 언저리에 마우스를 올려야
 * 나타난다. 그런데 "제목 언저리" 는 이 컴포넌트 밖이라, 감추고 드러내는 것은
 * 감싸는 쪽(PageRoute)이 한다. 여기는 자기 높이(24px)만 책임진다.
 *
 * ── 떠 있는 층을 안 쓴다
 *
 * 판은 이 컴포넌트에 붙은 position: absolute 다. 아이콘이 문서 맨 위라 아래로
 * 열 자리가 늘 있고, 본문과 같이 스크롤되는 편이 맞다. SEED 에는 팝오버가 없고
 * Menu(§10)는 200px 항목 목록이라 격자에 안 맞는다 — 그거 하나 때문에
 * floating-ui 를 새로 들일 값이 없다.
 */
export interface PageIconProps {
  /** 지금 아이콘. 없으면 「아이콘 추가」 로 보인다 */
  value?: string;
  /** 고르거나 지웠을 때. 지우면 undefined */
  onChange?: (next: string | undefined) => void;
  /** 끄면 읽기 전용 — 눌러도 안 열리고, 아이콘이 없으면 아무것도 안 그린다 */
  editable?: boolean;
  /** 아무것도 안 쳤을 때 보여줄 목록. features/editor 에서 온다 */
  listCategories: () => Promise<EmojiCategory[]>;
  /** 질의에 걸리는 것만. 같은 곳에서 온다 */
  searchEmoji: (query: string) => Promise<string[]>;
}

export function PageIcon({
  value,
  onChange,
  editable = true,
  listCategories,
  searchEmoji,
}: PageIconProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  /* 바깥 클릭과 Escape 로 닫는다. 열려 있을 때만 듣는다 — 안 그러면 문서를 여는
   * 내내 document 리스너 둘이 붙어 있다. */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      /* 포커스를 트리거로 되돌린다. 안 그러면 body 로 떨어져서 다음 Tab 이
       * 문서 맨 앞에서 다시 시작한다. */
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /* 읽기 전용인데 아이콘도 없으면 그릴 것이 없다. 「아이콘 추가」는 고를 수
   * 있는 사람에게만 뜬다. */
  if (!editable && !value) return null;

  const pick = (next: string | undefined) => {
    onChange?.(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative w-fit">
      {value ? (
        <button
          ref={triggerRef}
          type="button"
          aria-label={pageIconLabels.change}
          aria-expanded={open}
          disabled={!editable}
          onClick={() => setOpen((was) => !was)}
          /* 52px 은 글자 크기지 상자 크기가 아니다 (§2). leading-none 이 없으면
           * 줄상자가 글자보다 커져서 아래 제목과의 간격이 어긋난다.
           *
           * -m-dense-2 가 p-dense-2 를 상쇄한다. 호버 배경은 이모지보다 사방
           * 4px 크게 두되, **자리 계산에서는 이모지 크기 그대로**여야 한다 —
           * 안 그러면 이모지가 제목보다 4px 오른쪽에 서고 아래 간격도 4px
           * 넓어진다. 제목과의 10px 은 감싸는 쪽이 잰다 (PageRoute). */
          className="-m-dense-2 flex rounded-r1_5 p-dense-2 text-doc-icon leading-none hover:bg-bg-neutral-weak-alpha disabled:pointer-events-none knoc-focus-ring"
        >
          {value}
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((was) => !was)}
          /* 왼쪽만 상쇄한다. 아이콘이 있을 때의 이모지와 같은 자리에서
           * 시작해야, 아이콘을 넣고 빼도 왼쪽 끝이 안 움직인다. */
          className="-ml-dense-2 t3-regular flex h-x6 items-center gap-dense-3 rounded-r1 px-dense-2 text-fg-neutral-muted hover:bg-bg-neutral-weak-alpha knoc-focus-ring"
        >
          <IconFaceSmileCircleLine size={16} aria-hidden />
          {pageIconLabels.add}
        </button>
      )}

      {open && (
        <div className="absolute left-0 top-full z-10 mt-dense-2">
          <EmojiPicker
            value={value}
            onPick={pick}
            listCategories={listCategories}
            searchEmoji={searchEmoji}
          />
        </div>
      )}
    </div>
  );
}
