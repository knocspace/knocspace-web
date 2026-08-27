import { useRef } from "react";
import {
  Snackbar,
  SnackbarActionButton,
  SnackbarMessage,
  SnackbarRoot,
  useSnackbarAdapter,
} from "@seed-design/react";

/**
 * 토스트를 띄우는 쪽이 쓴다 — DESIGN.md §10.
 *
 * 표면은 ToastProvider 가 깐다. 여기는 내용과 시간만 정한다.
 *
 * 동시에 하나만 뜬다 — 새 토스트가 이전 것을 교체한다. 여러 개가 쌓이면
 * 방금 무슨 일이 있었는지가 아니라 목록을 읽게 된다.
 *
 * 예외가 하나 있다. 되돌리기가 떠 있는 동안에는 교체하지 않고 기다린다 —
 * 되돌리기는 그 토스트에만 있어서, 교체하면 되돌릴 방법이 같이 사라진다.
 * 삭제를 연달아 하면 앞의 것들을 전부 잃는다.
 *
 * 타이머를 호버·포커스에서 멈추는 것은 SEED 가 한다(pauseOnInteraction 기본값).
 *
 * 조회 실패에는 쓰지 않는다. 토스트는 사라지는데 실패는 사라지면 안 된다 —
 * 그건 ErrorState 나 PageBanner 자리다.
 */

export interface ToastOptions {
  /** 완료된 사실로 쓴다 — "삭제하시겠습니까" 가 아니라 "삭제했어요" */
  message: string;
  /** 동작은 하나까지 */
  actionLabel?: string;
  onAction?: () => void;
}

const PLAIN_TIMEOUT = 3000;
/** 되돌릴 기회가 있으면 읽고 누를 시간을 더 준다 */
const ACTION_TIMEOUT = 5000;

export function useToast() {
  const snackbar = useSnackbarAdapter();
  /* 아직 살아 있는 되돌리기 토스트 수. 0 이 아니면 교체하지 않는다.
   *
   * 큐에서 대기 중인 것까지 세므로 boolean 이 아니라 수다. 교체당한 토스트도
   * onClose 는 발화하니(dismissing → onClose → REMOVE) 새는 자리가 없다.
   * "immediate" 가 큐를 통째로 덮는 경우는 이 수가 0 일 때뿐이라,
   * 되돌리기가 대기 중인 채로 지워지는 일은 없다. */
  const liveUndo = useRef(0);

  return {
    show: ({ message, actionLabel, onAction }: ToastOptions) => {
      const hasUndo = Boolean(actionLabel && onAction);
      const strategy = liveUndo.current > 0 ? "queued" : "immediate";
      if (hasUndo) liveUndo.current += 1;

      snackbar.create({
        timeout: hasUndo ? ACTION_TIMEOUT : PLAIN_TIMEOUT,
        strategy,
        onClose: () => {
          if (hasUndo) liveUndo.current -= 1;
        },
        render: () => (
          /* 폭은 내용을 따른다 — DESIGN.md §10. SEED recipe 의 width:100% 를
           * 덮는다. region 이 화면 폭을 다 차지해서 그대로 두면 짧은 문구도
           * 560px(recipe 의 max-width)까지 늘어난다. max-width 는 그대로 둔다.
           *
           * 표면은 살짝 비친다 — bg-toast-surface 는 bg-neutral-inverted 에
           * 알파를 섞은 값이고, backdrop-blur-toast 가 뒤를 흐린다. 흐림이
           * 없으면 뒤의 글자가 그대로 비쳐서 메시지가 읽히지 않는다.
           *
           * 셋 다 유틸리티 레이어라 seed-components 보다 뒤에 와서
           * !important 없이 이긴다. */
          <SnackbarRoot className="w-auto bg-toast-surface backdrop-blur-toast">
            {/* SnackbarContent 를 빼면 안 된다. 이걸 안 씌우면 root 가 그냥
              * flex 라 메시지와 버튼 사이 간격이 사라진다.
              * content 가 flex-grow:1 · justify-content:space-between 이라
              * 메시지는 왼쪽, 버튼은 오른쪽 끝에 붙는다.
              * 최상위로는 안 내보내서 네임스페이스로 집는다.
              *
              * 되돌리기가 있으면 여백을 넓힌다 — DESIGN.md §10.
              * SEED 기본값은 문구 사이 10px · 오른쪽 16px 인데, 그러면
              * 되돌리기가 문장 끝에 붙은 낱말처럼 보인다. 버튼은 히트 영역이
              * 좌우로 8px 씩 더 나가니(recipe 의 :after) 화면에서 보이는
              * 여백보다 실제로는 더 좁다. 20px 씩 벌린다.
              * 되돌리기가 없으면 건드리지 않는다 — 글자만 있는 토스트는
              * 오른쪽 여백을 넓힐 이유가 없다. */}
            <Snackbar.Content className={hasUndo ? "gap-x5 pr-x2_5" : undefined}>
              <SnackbarMessage>{message}</SnackbarMessage>
              {actionLabel && onAction && (
                <SnackbarActionButton
                  onClick={() => {
                    onAction();
                    snackbar.dismiss();
                  }}
                >
                  {actionLabel}
                </SnackbarActionButton>
              )}
            </Snackbar.Content>
          </SnackbarRoot>
        ),
      });
    },
    dismiss: snackbar.dismiss,
  };
}
