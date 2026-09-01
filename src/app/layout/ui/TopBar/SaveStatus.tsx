import { useEffect, useState } from "react";
import { Spinner } from "@/shared/ui";
import { saveStatusMessages } from "@/shared/config";

/**
 * 저장 상태 — DESIGN.md §10, 시안 8번 아트보드.
 *
 * 상단바 오른쪽. 상태 문자열만 받아 그린다. 실제 저장은 F3 이다.
 *
 * 넷 다 조용한 회색 한 줄이다. 색도 굵기도 버튼도 없다. 이 자리가 답하는
 * 질문은 하나뿐이라서다 — "내 글이 저장됐나."
 *
 * **실패는 여기서 안 다룬다.** 자동 재시도까지 실패해서 사람이 손대야 하는
 * 상황은 본문 위 배너(§9 PageBanner · ErrorState inline)로 올린다. 손이
 * 필요한 알림을 아무도 안 보는 자리에 두면 그 자리를 억지로 키워야 하고,
 * 그러고도 눈에 안 들어온다. 실패는 원인별로 할 말도 다르다.
 *
 * 재시도 중인 동안은 여전히 saving 이다. 저장이 아직 안 끝났고, 몇 번째
 * 시도인지는 사용자가 쓸 정보가 아니다.
 */

export type SaveState =
  /** 변경 없음 — 아무것도 안 그린다 */
  | "idle"
  /** 저장하는 중. 자동 재시도 중인 동안도 여기다 */
  | "saving"
  | "saved"
  /** 연결이 없어 대기. 연결되면 앱이 알아서 저장한다 */
  | "offline";

export interface SaveStatusProps {
  status: SaveState;
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

export function SaveStatus({ status }: SaveStatusProps) {
  /* aria-live 영역은 늘 붙어 있어야 한다. 상태가 바뀔 때 요소째로 넣었다
   * 뺐다 하면 브라우저가 "바뀐 내용" 을 못 잡아서 안 읽히는 경우가 있다.
   * 그래서 idle 에서도 껍데기는 남기고 안을 비운다 — 빈 flex 요소라
   * 자리를 차지하지 않으므로 "아무것도 안 그린다" 는 그대로 지켜진다. */
  return (
    <div aria-live="polite" className="flex shrink-0 items-center gap-x2">
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
    </div>
  );
}
