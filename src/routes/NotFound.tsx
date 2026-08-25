import { ActionButton } from "@seed-design/react";
import { useNavigate } from "react-router";
import { emptyMessages } from "@/components/ui/messages";

/**
 * 매칭되는 라우트가 없을 때 — DESIGN.md §9 "없는 페이지 (404)".
 *
 * 셸 안에 그린다. 사이드바는 남는다. 주소를 잘못 짚었을 뿐
 * 워크스페이스 밖으로 나간 게 아니다.
 *
 * 지금은 라우팅 골격이라 여기까지만 그린다. F1-3 에서 EmptyState 가 생기면
 * 그걸로 갈아끼우면서 아이콘(icon_search_regular 24px)이 붙는다.
 * 문구는 이미 messages.ts 에 있어서 그때 옮길 것이 없다.
 */

const message = emptyMessages.notFound;

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-x4 text-center">
      {/* 320px 을 넘기지 않는다. 안 잡아 두면 넓은 창에서 설명 한 줄이
        * 화면을 가로질러 가운데 정렬이 무의미해진다. */}
      <div className="flex max-w-empty flex-col items-center">
        <span className="t5-bold text-balance text-fg-neutral">
          {message.title}
        </span>

        {/* 문장 사이는 <br> 로 직접 끊는다 — 폭에 맡기면 구가 갈린다 (§8) */}
        <span className="t4-regular mt-x1 text-pretty text-fg-neutral-muted">
          {message.description.map((sentence, index) => (
            <span key={sentence}>
              {index > 0 && <br />}
              {sentence}
            </span>
          ))}
        </span>

        <div className="mt-x4">
          <ActionButton
            size="small"
            variant="neutralWeak"
            onClick={() => navigate("/")}
          >
            {message.action}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
