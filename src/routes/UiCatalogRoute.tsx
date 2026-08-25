import { useEffect, useState } from "react";
import IconAddRegular from "@seed-design/icon/IconAddRegular";
import IconEditRegular from "@seed-design/icon/IconEditRegular";
import IconMoreVertRegular from "@seed-design/icon/IconMoreVertRegular";
import IconSearchRegular from "@seed-design/icon/IconSearchRegular";
import IconTrashRegular from "@seed-design/icon/IconTrashRegular";
import IconWriteRegular from "@seed-design/icon/IconWriteRegular";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { BreadcrumbItem } from "@/components/Breadcrumb";
import { SaveStatus } from "@/components/SaveStatus";
import type { SaveState } from "@/components/SaveStatus";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { IconButton } from "@/components/ui/IconButton";
import { InlineInput } from "@/components/ui/InlineInput";
import { Menu } from "@/components/ui/Menu";
import { Skeleton, TreeSkeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { emptyMessages, errorMessages } from "@/components/ui/messages";
import { useToast } from "@/components/ui/useToast";

/**
 * 컴포넌트 카탈로그 — sprint-1 §5.
 *
 * 개발 모드에서만 등록한다(router.tsx). 스토리북을 넣지 않는다 —
 * 라우트 하나로 충분하고 유지비가 안 든다.
 *
 * 완료 조건 두 개를 여기서 확인한다.
 * · 10종이 라이트·다크 양쪽에서 정상으로 보인다
 * · 10종 전부 마우스 없이 조작된다 (Tab 으로 훑어보면 된다)
 */

function Section({ title, note, children }: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-x3 border-t border-stroke-neutral-muted pt-x5">
      <div className="flex flex-col gap-x1">
        <h2 className="t5-bold text-fg-neutral">{title}</h2>
        {note && <p className="t3-regular text-pretty text-fg-neutral-subtle">{note}</p>}
      </div>
      {children}
    </section>
  );
}

/** 표면 위에 올려 두는 칸. 배경이 있어야 회색 위 회색이 구별된다 */
function Slot({ label, children, wide, grow }: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
  /** 남는 폭을 채운다. 안쪽 치수가 % 라서 고유 폭이 0 인 예시에 붙인다 */
  grow?: boolean;
}) {
  return (
    <div className={["flex flex-col gap-x1", grow ? "min-w-0 flex-1" : ""].join(" ")}>
      <span className="t2-regular text-fg-neutral-subtle">{label}</span>
      <div
        className={[
          "flex items-center gap-x3 rounded-r1_5 border border-stroke-neutral-muted bg-bg-layer-default p-x3",
          wide ? "flex-col items-stretch" : "",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

/** 상단바 44px 흉내. Breadcrumb·SaveStatus 는 이 안에서만 제대로 보인다 */
function TopBarFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-topbar w-full items-center gap-x2 rounded-r1_5 border border-stroke-neutral-muted bg-bg-layer-default px-x4">
      {children}
    </div>
  );
}

/* 더미 경로. F2 에서 PageSummary 조상 배열이 이 자리에 온다. */
const CRUMBS: BreadcrumbItem[] = [
  { id: "ws", title: "워크스페이스" },
  { id: "product", title: "제품 기획" },
  { id: "design", title: "디자인" },
  { id: "tokens", title: "토큰 대조표" },
];

const DEEP_CRUMBS: BreadcrumbItem[] = [
  { id: "ws", title: "워크스페이스" },
  { id: "product", title: "제품 기획" },
  { id: "front", title: "프론트엔드" },
  { id: "design", title: "디자인" },
  { id: "tokens", title: "토큰 대조표" },
];

const LONG_CRUMBS: BreadcrumbItem[] = [
  ...DEEP_CRUMBS.slice(0, -1),
  { id: "long", title: "SEED 2.5 토큰 이름 대조표와 옛 이름 대응 기록, 그리고 남은 미결정 목록" },
];

const SAVE_STATES: SaveState[] = ["idle", "saving", "saved", "offline", "error"];

export function UiCatalogRoute() {
  const [mode, setMode] = useState<"light-only" | "dark-only">("light-only");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);
  const [name, setName] = useState("토큰 대조표");
  const [editing, setEditing] = useState(false);
  const [docTitle, setDocTitle] = useState("2분기 로드맵");
  const [titleEditing, setTitleEditing] = useState(false);
  const [selected, setSelected] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saving");
  const toast = useToast();

  /* 컬러 모드는 <html> 에만 건다 — DESIGN.md §4.
   *
   * 이 화면의 <div> 에 걸면 SEED 컴포넌트만 뒤집히고 Tailwind 색 유틸리티는
   * 라이트로 남는다. @seed-design/tailwind4-theme 이 inline 이 아닌 @theme 로
   * --color-fg-neutral: var(--seed-color-fg-neutral) 을 :root 에 한 번 계산해
   * 두기 때문이다. 자손에서 --seed-color-* 를 바꿔도 --color-* 는 :root 에서
   * 상속된 값 그대로다. 결과가 흰 배경 + 어두운 SEED 컴포넌트라 토큰이 안 붙은
   * 것처럼 보인다. */
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute("data-seed-color-mode");
    root.setAttribute("data-seed-color-mode", mode);
    return () => {
      if (previous === null) root.removeAttribute("data-seed-color-mode");
      else root.setAttribute("data-seed-color-mode", previous);
    };
  }, [mode]);

  return (
    <div className="min-h-full flex-1 bg-bg-layer-default">
      <div className="mx-auto flex w-full max-w-measure flex-col gap-x6 px-doc-gutter py-x6">
        <header className="flex items-center justify-between gap-x4">
          <div className="flex flex-col gap-x1">
            <h1 className="t9-bold text-fg-neutral">공통 UI 10종</h1>
            <p className="t3-regular text-fg-neutral-subtle">
              /dev/ui · 개발 모드에서만 보입니다
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setMode(mode === "light-only" ? "dark-only" : "light-only")
            }
            className="knoc-focus-ring t3-bold rounded-r1_5 border border-stroke-neutral-weak px-x3 py-x2 text-fg-neutral"
          >
            {mode === "light-only" ? "다크로" : "라이트로"}
          </button>
        </header>

        <Section
          title="1 · Spinner"
          note="SEED ProgressCircle. 0.5초 안에 끝나는 로딩에는 붙이지 않습니다."
        >
          <div className="flex gap-x4">
            <Slot label="small (16)">
              <Spinner size="small" label="불러오는 중" />
            </Slot>
            <Slot label="medium (24)">
              <Spinner size="medium" />
            </Slot>
            <Slot label="글자와 함께 — 13px 옆에서 안 커야 합니다">
              <Spinner size="small" />
              <span className="t3-regular text-fg-neutral-muted">
                불러오는 중이에요
              </span>
            </Slot>
            {/* 바탕 링이 주황이면 carrot 이 새는 것이다 (Spinner.tsx 주석) */}
            <Slot label="tone brand — 바탕 링까지 보라">
              <Spinner size="small" tone="brand" />
              <Spinner size="medium" tone="brand" />
            </Slot>
          </div>
        </Section>

        <Section
          title="2 · Skeleton"
          note="실제 콘텐츠와 같은 높이·줄수. 로드 후 레이아웃이 흔들리면 값이 틀린 것입니다."
        >
          <div className="flex items-start gap-x4">
            <Slot label="트리 4줄 (28px 행)" wide>
              <TreeSkeleton />
            </Slot>
            <Slot label="문서" wide grow>
              <div className="flex flex-col gap-x3">
                <Skeleton width="62%" height={34} shape="block" />
                <Skeleton width="100%" height={16} />
                <Skeleton width="92%" height={16} />
                <Skeleton width="61%" height={16} />
              </div>
            </Slot>
          </div>
        </Section>

        <Section
          title="3 · EmptyState"
          note="아이콘 24px, 원 배경 없음. default 와 compact 두 변형."
        >
          <Slot label="default — 첫 실행" wide>
            <div className="flex" style={{ minHeight: 220 }}>
              <EmptyState
                {...emptyMessages.firstRun}
                icon={IconWriteRegular}
                actionVariant="brandSolid"
                onAction={() => toast.show({ message: "페이지를 만들었어요" })}
              />
            </div>
          </Slot>
          <Slot label="default — 검색 결과 없음" wide>
            <div className="flex" style={{ minHeight: 220 }}>
              <EmptyState
                {...emptyMessages.searchNoResult("포커스 링")}
                icon={IconSearchRegular}
                onAction={() => toast.show({ message: "본문까지 찾았어요" })}
              />
            </div>
          </Slot>
          <Slot label="compact — 사이드바 240px" wide>
            <div className="w-sidebar rounded-r1 bg-bg-layer-basement">
              <EmptyState {...emptyMessages.favoritesEmpty} variant="compact" />
            </div>
          </Slot>
        </Section>

        <Section
          title="4 · ErrorState"
          note="빨간 아이콘을 쓰지 않습니다. 빈 화면과 구별되는 건 아이콘 모양과 버튼입니다. 색은 inline 에서만."
        >
          <Slot label="default — 5xx" wide>
            <div className="flex" style={{ minHeight: 220 }}>
              <ErrorState
                {...errorMessages.server("목록")}
                onAction={() => toast.show({ message: "다시 시도했어요" })}
              />
            </div>
          </Slot>
          <Slot label="inline — 영역 하나만 실패 (PageBanner)" wide>
            <ErrorState
              {...errorMessages.inline("표")}
              variant="inline"
              onAction={() => toast.show({ message: "다시 시도했어요" })}
            />
          </Slot>
          <Slot label="compact — 사이드바 240px" wide>
            <div className="w-sidebar rounded-r1 bg-bg-layer-basement">
              <ErrorState
                {...errorMessages.server("목록")}
                variant="compact"
                onAction={() => toast.show({ message: "다시 시도했어요" })}
              />
            </div>
          </Slot>
        </Section>

        <Section
          title="5 · ErrorBoundary"
          note="RootLayout 이 Outlet 안쪽을 감싸고 있습니다. 렌더 중 throw 된 것만 잡습니다 — fetch 실패는 ErrorState 자리입니다."
        >
          <Slot label="확인 방법">
            <span className="t3-regular text-fg-neutral-muted">
              여기서는 안 띄웁니다. 일부러 throw 하면 이 카탈로그가 통째로 죽어요.
            </span>
          </Slot>
        </Section>

        <Section
          title="6 · Menu"
          note="반경 8px · 항목 30px/13px 로 내렸습니다. 파괴적 항목은 구분선 아래 하나만. ↑↓ Enter Esc 로 조작됩니다."
        >
          <Slot label="트리거를 누르거나, 포커스 후 Enter">
            <Menu
              open={menuOpen}
              onOpenChange={setMenuOpen}
              items={[
                {
                  id: "rename",
                  label: "이름 바꾸기",
                  icon: IconEditRegular,
                  onSelect: () => setEditing(true),
                },
                {
                  id: "add",
                  label: "하위 페이지 추가",
                  icon: IconAddRegular,
                  onSelect: () => toast.show({ message: "하위 페이지를 만들었어요" }),
                },
                {
                  id: "delete",
                  label: "삭제",
                  icon: IconTrashRegular,
                  isDestructive: true,
                  onSelect: () => setDangerOpen(true),
                },
              ]}
            >
              <button
                type="button"
                className="knoc-focus-ring t3-bold rounded-r1_5 border border-stroke-neutral-weak px-x3 py-x2 text-fg-neutral"
              >
                행 메뉴 열기
              </button>
            </Menu>
          </Slot>
        </Section>

        <Section
          title="7 · Toast"
          note="하단 가운데. 동시에 하나만. 완료된 사실로 씁니다."
        >
          <Slot label="눌러 보세요">
            <button
              type="button"
              onClick={() => toast.show({ message: "변경 사항을 저장했어요" })}
              className="knoc-focus-ring t3-bold rounded-r1_5 border border-stroke-neutral-weak px-x3 py-x2 text-fg-neutral"
            >
              결과만
            </button>
            <button
              type="button"
              onClick={() =>
                toast.show({
                  message: "페이지를 삭제했어요",
                  actionLabel: "되돌리기",
                  onAction: () => toast.show({ message: "되돌렸어요" }),
                })
              }
              className="knoc-focus-ring t3-bold rounded-r1_5 border border-stroke-neutral-weak px-x3 py-x2 text-fg-neutral"
            >
              되돌리기까지
            </button>
          </Slot>
        </Section>

        <Section
          title="8 · Dialog"
          note="폭 400px. 초기 포커스는 파괴적이면 취소, 아니면 확인. Esc·딤으로 닫힙니다."
        >
          <Slot label="두 tone">
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="knoc-focus-ring t3-bold rounded-r1_5 border border-stroke-neutral-weak px-x3 py-x2 text-fg-neutral"
            >
              default
            </button>
            <button
              type="button"
              onClick={() => setDangerOpen(true)}
              className="knoc-focus-ring t3-bold rounded-r1_5 border border-stroke-neutral-weak px-x3 py-x2 text-fg-neutral"
            >
              danger
            </button>
          </Slot>
        </Section>

        <Section
          title="9 · IconButton"
          note="24 만 SEED 밖입니다. aria-label 없이는 렌더하지 않습니다."
        >
          <div className="flex gap-x4">
            <Slot label="24 · 트리 행">
              <IconButton
                icon={IconMoreVertRegular}
                ariaLabel="더 보기"
                size={24}
                onClick={() => setMenuOpen(true)}
              />
              <IconButton icon={IconAddRegular} ariaLabel="하위 페이지 추가" size={24} />
            </Slot>
            <Slot label="32 · 툴바">
              <IconButton icon={IconAddRegular} ariaLabel="추가" size={32} />
              <IconButton
                icon={IconSearchRegular}
                ariaLabel="검색"
                size={32}
                isSelected={selected}
                onClick={() => setSelected(!selected)}
              />
            </Slot>
            <Slot label="40 · 헤더">
              <IconButton icon={IconMoreVertRegular} ariaLabel="더 보기" size={40} />
              <IconButton icon={IconAddRegular} ariaLabel="추가" size={40} isDisabled />
            </Slot>
          </div>
        </Section>

        <Section
          title="10 · InlineInput"
          note="Enter 확정 / Esc 취소 / 포커스 아웃 확정. 세 상태의 박스 크기가 같습니다 — 글자가 1px 도 안 움직여야 합니다."
        >
          <Slot label="트리 행 안 (28px · 13px). 더블클릭하거나 위 메뉴의 ‘이름 바꾸기’" wide>
            <div className="w-sidebar rounded-r1 bg-bg-layer-basement p-x2">
              <div className="flex h-tree-row items-center gap-x1 px-x1">
                <InlineInput
                  value={name}
                  onCommit={setName}
                  isEditing={editing}
                  onEditingChange={setEditing}
                  ariaLabel="페이지 이름"
                  requiredMessage="이름을 비워 둘 수 없어요"
                  className="t3-regular"
                />
              </div>
            </div>
          </Slot>

          {/* 문서 제목 자리 — 테두리도 배경도 없이 캐럿만 (DESIGN.md §10).
            * 진짜 크기는 34px 인데 그 토큰은 아직 없다. SEED t 스케일 밖이라
            * F3 에서 --knoc- 로 만든다 (§2). 여기서는 제일 가까운 t12(32px)
            * 로 보인다 — 임의값 표기를 쓰지 않기 위해서다 (§4). */}
          <Slot label="문서 제목 (variant bare · 32px 자리표시). 더블클릭" wide>
            <div className="rounded-r1 bg-bg-layer-default p-x4">
              <InlineInput
                value={docTitle}
                onCommit={setDocTitle}
                isEditing={titleEditing}
                onEditingChange={setTitleEditing}
                ariaLabel="문서 제목"
                variant="bare"
                // 제목은 뒤에 덧붙이는 일이 많아 클릭한 자리에 캐럿을 둔다
                selectOnEdit={false}
                className="t12-bold"
              />
            </div>
          </Slot>
        </Section>

        {/* ── §4 레이아웃 ─────────────────────────────────────────
          * 공통 UI 10종이 아니라 sprint-1 §4 다. 도메인 화면이지만 아직
          * 데이터를 모르고, 더미 배열을 props 로 받아 그린다.
          * PageTree · TreeRow 는 백엔드와 트리 모양을 같이 정한 뒤에 만든다. */}

        <Section
          title="레이아웃 1 · Breadcrumb"
          note="상단바 44px 안. 4단계까지는 그대로, 5단계부터 첫 항목 + … + 마지막 둘로 접습니다. 줄이는 것은 마지막 항목 하나뿐입니다."
        >
          <Slot label="2단계" wide>
            <TopBarFrame>
              <Breadcrumb items={CRUMBS.slice(2)} onSelect={setPicked} />
            </TopBarFrame>
          </Slot>

          <Slot label="4단계 — 접기 직전" wide>
            <TopBarFrame>
              <Breadcrumb items={CRUMBS} onSelect={setPicked} />
            </TopBarFrame>
          </Slot>

          <Slot label="5단계 — 가운데가 접힙니다. … 위에 올리면 접힌 제목이 보입니다" wide>
            <TopBarFrame>
              <Breadcrumb items={DEEP_CRUMBS} onSelect={setPicked} />
            </TopBarFrame>
          </Slot>

          <Slot label="긴 제목 — 마지막만 줄입니다. 조상은 안 줄입니다" wide>
            <TopBarFrame>
              <Breadcrumb items={LONG_CRUMBS} onSelect={setPicked} />
            </TopBarFrame>
          </Slot>

          <Slot label="현재 페이지 하나 — 구분자가 안 붙습니다" wide>
            <TopBarFrame>
              <Breadcrumb items={CRUMBS.slice(3)} onSelect={setPicked} />
            </TopBarFrame>
          </Slot>

          <span className="t2-regular text-fg-neutral-subtle">
            마지막으로 누른 조상 — {picked ?? "없음"}
          </span>
        </Section>

        <Section
          title="레이아웃 2 · SaveStatus"
          note="상단바 오른쪽. 변경이 없으면 아무것도 안 그립니다. ‘저장됨’ 은 2초 뒤 사라집니다 — 버튼으로 상태를 바꿔서 확인하세요. 실패만 색과 굵기를 쓰고 버튼이 붙습니다."
        >
          <div className="flex flex-wrap gap-x2">
            {SAVE_STATES.map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => setSaveState(state)}
                className={[
                  "knoc-focus-ring t3-regular rounded-r1_5 border px-x3 py-x1",
                  state === saveState
                    ? "border-stroke-brand-solid text-fg-brand"
                    : "border-stroke-neutral-weak text-fg-neutral-muted",
                ].join(" ")}
              >
                {state}
              </button>
            ))}
          </div>

          <Slot label="상단바 오른쪽 — 브레드크럼과 같은 줄에 앉습니다" wide>
            <TopBarFrame>
              <Breadcrumb items={CRUMBS.slice(2)} />
              <div className="ml-auto">
                <SaveStatus
                  status={saveState}
                  onRetry={() => setSaveState("saving")}
                />
              </div>
            </TopBarFrame>
          </Slot>
        </Section>

        <Dialog
          isOpen={dialogOpen}
          onOpenChange={setDialogOpen}
          title="저장하지 않고 나갈까요?"
          description={["지금 나가면 방금 쓴 내용이 사라져요."]}
          cancelLabel="계속 쓰기"
          confirmLabel="나가기"
          onConfirm={() => toast.show({ message: "나갔어요" })}
        />

        <Dialog
          isOpen={dangerOpen}
          onOpenChange={setDangerOpen}
          tone="danger"
          title="‘2분기 로드맵’을 삭제할까요?"
          description={["하위 페이지 4개도 함께 삭제돼요.", "되돌릴 수 없어요."]}
          cancelLabel="취소"
          confirmLabel="삭제"
          onConfirm={() =>
            toast.show({
              message: "페이지를 삭제했어요",
              actionLabel: "되돌리기",
              onAction: () => toast.show({ message: "되돌렸어요" }),
            })
          }
        />
      </div>
    </div>
  );
}
