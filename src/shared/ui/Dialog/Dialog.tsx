import { useEffect, useRef } from "react";
import {
  ActionButton,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
} from "@seed-design/react";

/**
 * 확인 · 취소 다이얼로그 — DESIGN.md §10.
 *
 * SEED Dialog 를 감싸되 폭과 밀도를 덮는다. SEED 기본값은 모바일 시트
 * 기준이라 셋이 안 맞는다.
 *
 * ① 폭 — max-width 272px 안에서는 "하위 페이지 4개도 함께 삭제돼요" 가
 *    네 줄이 된다. 400px 로 넓힌다. 이때 content 의 `flex: 1` 을 같이
 *    끄지 않으면 max-width 만 풀린 채로 positioner 폭을 다 먹어서
 *    다이얼로그가 화면을 가로지른다.
 * ② 액션 — SEED footer 는 세로 스택(모바일 풀폭 버튼)이다. 데스크톱은
 *    오른쪽 정렬 가로 배치, 취소가 왼쪽.
 * ③ 줄바꿈 — content 에 word-break: break-all 이 걸려 있어 body 의
 *    keep-all 을 덮는다. 한글이 어절 안쪽에서 갈리므로 되돌린다 (§8).
 *
 * !important 나 자손 선택자를 쓰지 않는다. style prop 으로 넘긴다 (§1).
 *
 * 제목은 질문, 설명은 결과. 되돌릴 수 없으면 그 말을 문장으로 적는다.
 */

export interface DialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** 질문형 */
  title: string;
  /** 결과. 문장 단위로 나눠 담는다 (§8) */
  description?: readonly string[];
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  /** danger = 되돌릴 수 없는 것 */
  tone?: "default" | "danger";
}

// SEED 값을 덮는 자리. 여기 밖에서 다이얼로그 치수를 쓰지 않는다.
const CONTENT_STYLE = {
  // flex 를 끄지 않으면 width 400 이 flex-basis 에 밀린다 (SEED 는 flex: 1).
  flex: "0 0 auto",
  width: 400,
  maxWidth: "calc(100vw - 48px)",
  // max-width 가 이미 24px 씩 띄우므로 SEED 의 32px 마진은 좁은 창에서만
  // 겹쳐 넘친다. 같은 24px 로 맞춘다.
  marginInline: "var(--knoc-space-comfy-5)",
  wordBreak: "keep-all",
} as const;

const HEADER_STYLE = {
  // 제목과 설명 8px (SEED 6px)
  gap: "var(--knoc-space-comfy-1)",
} as const;

const FOOTER_STYLE = {
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: "var(--knoc-space-comfy-1)",
  // 액션 위 20px (SEED 16px)
  paddingTop: "var(--knoc-space-comfy-4)",
} as const;

export function Dialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  tone = "default",
}: DialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  /* 초기 포커스가 상황에 따라 갈린다. 파괴적이면 취소, 아니면 확인.
   * 늘 취소로 두면 저장 확인 같은 흔한 경우에 Tab 이 한 번 더 든다.
   *
   * autoFocus 로는 안 된다. SEED 가 FocusScope 의 onMountAutoFocus 에서
   * content 컨테이너로 포커스를 되가져가므로, 그 뒤 프레임에 잡아야 한다. */
  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => {
      const target = tone === "danger" ? cancelRef.current : confirmRef.current;
      target?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, tone]);

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent style={CONTENT_STYLE}>
          {/* 제목과 설명은 header 안에 둔다. 밖에 두면 SEED 의 20px
            * 패딩이 안 걸려 글자가 모서리에 붙는다. */}
          <DialogHeader style={HEADER_STYLE}>
            <DialogTitle className="t6-bold text-balance">{title}</DialogTitle>
            {description && (
              <DialogDescription className="t4-regular text-pretty text-fg-neutral-muted">
                {description.map((sentence, index) => (
                  <span key={sentence}>
                    {index > 0 && <br />}
                    {sentence}
                  </span>
                ))}
              </DialogDescription>
            )}
          </DialogHeader>

          <DialogFooter style={FOOTER_STYLE}>
            {/* 취소가 왼쪽 */}
            <ActionButton
              ref={cancelRef}
              size="medium"
              variant="neutralWeak"
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </ActionButton>
            <ActionButton
              ref={confirmRef}
              size="medium"
              variant={tone === "danger" ? "criticalSolid" : "brandSolid"}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
