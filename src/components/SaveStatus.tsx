import { useEffect, useState } from "react";
import { Spinner } from "./ui/Spinner";
import { saveStatusMessages } from "./ui/messages";

/**
 * 저장 상태 — DESIGN.md §10, 시안 8번 아트보드.
 *
 * 상단바 오른쪽. 상태 문자열만 받아 그린다. 실제 저장은 F3 이다.
 *
 * 실패만 다르게 다룬다. 상단바 오른쪽 끝은 글을 쓰는 동안 아무도 안 보는
 * 자리라, 회색 글자 하나가 바뀌는 것으로는 실패를 아무도 못 알아챈다.
 * 실패일 때만 상태 표시가 아니라 버튼이 딸린 알림이 된다.
 */

export type SaveState = "idle" | "saving" | "saved" | "offline" | "error";

export interface SaveStatusProps {
  status: SaveState;
  /** error 에서만 쓴다. 없으면 "다시 시도" 를 안 그린다 */
  onRetry?: () => void;
}

/** "저장됨" 이 머무는 시간 (§10) */
const SAVED_VISIBLE_MS = 2000;

/**
 * "저장됨" 만 자기 타이머를 갖는다.
 *
 * 계속 띄워 두면 글자가 배경이 되어, 정작 바뀔 때 눈에 안 들어온다. 사라지는
 * 시점을 F3 의 훅에 맡기지 않는 이유는 알려 줄 사건이 없기 때문이다 — 저장은
 * 성공한 채로 끝났다. 훅더러 2초 뒤 idle 로 돌리게 하면 없는 사건을 지어내는
 * 것이 되고, 같은 타이머가 화면마다 하나씩 생긴다.
 *
 * 컴포넌트를 따로 뗀 것은 타이머를 되돌릴 필요를 없애려는 것이다. 이건
 * status 가 "saved" 인 동안에만 살아 있어서, 다음 저장은 새로 마운트되며
 * 2초를 처음부터 다시 센다.
 */
function SavedLabel() {
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setExpired(true), SAVED_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (expired) return null;

  return (
    <span className="t3-regular text-fg-neutral-subtle">
      {saveStatusMessages.saved}
    </span>
  );
}

export function SaveStatus({ status, onRetry }: SaveStatusProps) {
  /* aria-live 영역은 늘 붙어 있어야 한다. 상태가 바뀔 때 요소째로 넣었다
   * 뺐다 하면 브라우저가 "바뀐 내용" 을 못 잡아서 안 읽히는 경우가 있다.
   * 그래서 idle 에서도 껍데기는 남기고 안을 비운다 — 빈 flex 요소라
   * 자리를 차지하지 않으므로 "아무것도 안 그린다" 는 그대로 지켜진다. */
  return (
    <div
      aria-live="polite"
      className="flex shrink-0 items-center gap-x2"
    >
      {status === "saving" && (
        /* aria-hidden 이 핵심이다. live 영역 안이라도 hidden 인 것은 안
         * 읽는다. "저장 중" 까지 읽으면 타이핑할 때마다 스크린리더가
         * 말한다 — 읽는 것은 결과뿐이다 (§10). */
        <span aria-hidden className="t3-regular flex items-center gap-x2 text-fg-neutral-subtle">
          <Spinner size="small" />
          {saveStatusMessages.saving}
        </span>
      )}

      {status === "saved" && <SavedLabel />}

      {status === "offline" && (
        <span className="t3-regular text-fg-neutral-subtle">
          {saveStatusMessages.offline}
        </span>
      )}

      {status === "error" && (
        <>
          {/* 여기만 색과 굵기를 쓴다. 색으로만 나르지 않으려고 옆에
            * 버튼을 세운다 — 색각 이상 사용자에게는 버튼이 신호다. */}
          <span className="t3-bold text-fg-critical">{saveStatusMessages.failed}</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="t3-bold knoc-focus-ring shrink-0 rounded-r1 text-fg-brand"
            >
              {saveStatusMessages.retry}
            </button>
          )}
        </>
      )}
    </div>
  );
}
