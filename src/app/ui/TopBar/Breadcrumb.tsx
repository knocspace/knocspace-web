import IconChevronRightLine from "@karrotmarket/react-monochrome-icon/IconChevronRightLine";
import { breadcrumbMessages } from "@/shared/config";

/**
 * 조상 경로 — DESIGN.md §10, 시안 5번 아트보드.
 *
 * 상단바 44px 안에 산다. props 만 받는다 — 라우터도 서버도 모른다.
 * F2 에서 PageSummary 조상 배열을 여기 모양으로 바꿔 넘긴다.
 *
 * **없는 아이콘을 채우지 않는다.** 유저가 고른 이모지가 있으면 그리고,
 * 없으면 그 자리는 없다 — 기본 문서 아이콘으로 메우면 유저가 안 고른 것을
 * 그리는 셈이다(§10 문서 아이콘). 트리 행은 반대로 늘 채운다. 거기서는
 * 아이콘이 행의 시작점을 맞추는 격자지만 여기서는 글자 사이에 끼는 군더더기다.
 *
 * §10 이 한때 여기에 아이콘을 **아예** 넣지 않기로 정해 뒀었다 — 16px 넷 +
 * 간격이면 80px 이고 그건 조상 제목 하나가 더 들어갈 폭이라는 이유였다. 지금은
 * 연다. 같은 페이지가 사이드바와 상단바에서 같은 얼굴로 보이는 것이 폭보다
 * 먼저이고, 아이콘이 없는 페이지는 자리를 안 쓰므로 실제로 늘어나는 폭도 작다.
 */

export interface BreadcrumbItem {
  id: string;
  title: string;
  /**
   * 유저가 고른 문서 아이콘 이모지. **없으면 아이콘 자리도 없다** — 채우지 않는다.
   * 앱에서는 AppLayout 이 조상 배열에서 그대로 넘긴다.
   */
  icon?: string | null;
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

/**
 * 문서 아이콘 한 칸. 트리 행과 같은 16px 칸이라 왼쪽 트리와 위 경로에서
 * 같은 페이지가 다른 크기로 보이지 않는다. 없으면 아무것도 안 그린다.
 */
function PageEmoji({ icon }: { icon?: string | null }) {
  if (!icon) return null;

  return (
    <span
      aria-hidden
      className="flex size-x4 shrink-0 items-center justify-center leading-none"
    >
      {icon}
    </span>
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

            {/* 아이콘이 없으면 DocIcon 이 null 이라 gap 도 안 생긴다 —
              * inline-flex 는 빈 자식에 간격을 두지 않는다. */}
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={`${ANCESTOR} knoc-focus-ring inline-flex items-center gap-x1 rounded-r1 hover:text-fg-neutral-muted`}
              >
                <PageEmoji icon={item.icon} />
                {item.title}
              </button>
            ) : (
              <span className={`${ANCESTOR} inline-flex items-center gap-x1`}>
                <PageEmoji icon={item.icon} />
                {item.title}
              </span>
            )}
          </li>
        ))}

        {/* 현재 페이지. 링크가 아니라서 버튼으로 만들지 않는다.
          *
          * 줄이는 것은 여기 하나뿐이다 (§10). 조상은 안 줄인다 — 접기가 이미
          * 폭을 벌어 줬고, 조상까지 줄이면 어느 것도 못 읽는 채로 넷이 남는다. */}
        <li className="flex min-w-0 items-center gap-x2">
          {shown.length > 0 && <Separator />}
          {/* truncate 는 글자에만 건다. 아이콘까지 같이 줄이면 반쪽만 남는다 */}
          <span
            aria-current="page"
            className="t3-regular flex min-w-0 items-center gap-x1 text-fg-neutral"
          >
            <PageEmoji icon={current.icon} />
            <span className="truncate">{current.title}</span>
          </span>
        </li>
      </ol>
    </nav>
  );
}
