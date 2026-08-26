import IconChevronRightLine from "@karrotmarket/react-monochrome-icon/IconChevronRightLine";
import { breadcrumbMessages } from "./ui/messages";

/**
 * 조상 경로 — DESIGN.md §10, 시안 5번 아트보드.
 *
 * 상단바 44px 안에 산다. props 만 받는다 — 라우터도 서버도 모른다.
 * F2 에서 PageSummary 조상 배열을 여기 모양으로 바꿔 넘긴다.
 *
 * 문서 아이콘을 넣지 않는다. 16px 넷 + 간격이면 80px 이고 그건 조상 제목
 * 하나가 더 들어갈 폭이다. icon 이 null 인 페이지가 섞이면 리듬도 깨진다.
 * 현재 페이지 아이콘은 바로 아래 제목 옆에 52px 로 이미 있다 (§2).
 */

export interface BreadcrumbItem {
  id: string;
  title: string;
}

export interface BreadcrumbProps {
  /** 루트부터 현재 페이지까지. 마지막이 현재 페이지다 */
  items: BreadcrumbItem[];
  /** 조상을 누르면 부른다. 없으면 글자로만 그린다 */
  onSelect?: (id: string) => void;
}

/**
 * 이 수를 넘으면 접는다. 4 는 그대로 다 그리고 5 부터 접힌다 —
 * 첫 항목 + … + 마지막 둘이라 접은 결과도 항목 셋이다.
 */
const COLLAPSE_AFTER = 4;

const ELLIPSIS = "…";

/** 조상과 구분자가 공유하는 색. 마지막 항목만 fg-neutral 로 선다 */
const ANCESTOR = "t3-regular shrink-0 whitespace-nowrap text-fg-neutral-subtle";

/**
 * 구분자는 chevron 이다. 슬래시는 제목 안의 `/` 와 구별이 안 된다 —
 * `디자인 / 토큰 대조표` 가 페이지 둘인지 제목 하나인지 알 수 없다.
 */
function Separator() {
  return (
    <IconChevronRightLine
      size={16}
      aria-hidden
      className="shrink-0 text-fg-neutral-subtle"
    />
  );
}

export function Breadcrumb({ items, onSelect }: BreadcrumbProps) {
  if (items.length === 0) return null;

  const current = items[items.length - 1];
  /* 접기 대상은 조상뿐이다. 현재 페이지는 언제나 끝에 남는다. */
  const ancestors = items.slice(0, -1);
  const collapsed = items.length > COLLAPSE_AFTER;

  /* 5단계 이상 — 첫 항목 + … + 마지막 둘.
   * 마지막 둘 중 하나가 current 라서 조상 쪽에서 가져오는 건 하나다. */
  const shown = collapsed
    ? [ancestors[0], ancestors[ancestors.length - 1]]
    : ancestors;
  const hidden = collapsed ? ancestors.slice(1, -1) : [];

  return (
    <nav aria-label={breadcrumbMessages.label} className="flex min-w-0 items-center">
      <ol className="flex min-w-0 items-center gap-x2">
        {shown.map((item, index) => (
          <li key={item.id} className="flex shrink-0 items-center gap-x2">
            {index > 0 && <Separator />}

            {/* 접힌 자리 — 첫 항목 바로 뒤 한 곳뿐이다. 누를 수 없다:
              * 감춘 조상으로 가는 길은 왼쪽 트리에 이미 있고, 여기에 메뉴를
              * 하나 더 만들면 44px 안에서 열리는 것이 둘이 된다.
              * 무엇을 접었는지는 title 로 보여준다. */}
            {collapsed && index === 1 && (
              <>
                <span className={ANCESTOR} title={hidden.map((h) => h.title).join(" · ")}>
                  {ELLIPSIS}
                </span>
                <Separator />
              </>
            )}

            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={`${ANCESTOR} knoc-focus-ring rounded-r1 hover:text-fg-neutral-muted`}
              >
                {item.title}
              </button>
            ) : (
              <span className={ANCESTOR}>{item.title}</span>
            )}
          </li>
        ))}

        {/* 현재 페이지. 링크가 아니라서 버튼으로 만들지 않는다.
          *
          * 줄이는 것은 여기 하나뿐이다 (§10). 조상은 안 줄인다 — 접기가 이미
          * 폭을 벌어 줬고, 조상까지 줄이면 어느 것도 못 읽는 채로 넷이 남는다. */}
        <li className="flex min-w-0 items-center gap-x2">
          {shown.length > 0 && <Separator />}
          <span aria-current="page" className="t3-regular truncate text-fg-neutral">
            {current.title}
          </span>
        </li>
      </ol>
    </nav>
  );
}
