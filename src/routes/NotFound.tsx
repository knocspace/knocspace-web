import IconMagnifyingglassLine from "@karrotmarket/react-monochrome-icon/IconMagnifyingglassLine";
import { useNavigate } from "react-router";
import { EmptyState } from "@/components/ui/EmptyState";
import { emptyMessages } from "@/components/ui/messages";

/**
 * 매칭되는 라우트가 없을 때 — DESIGN.md §9 "없는 페이지 (404)".
 *
 * 셸 안에 그린다. 사이드바는 남는다. 주소를 잘못 짚었을 뿐
 * 워크스페이스 밖으로 나간 게 아니다.
 *
 * 404 를 에러가 아니라 빈 화면으로 다룬다 — 뭐가 실패한 게 아니다.
 * 그래서 ErrorState 가 아니라 EmptyState 다.
 *
 * 배럴(@karrotmarket/react-monochrome-icon)이 아니라 개별 경로로 집는다. 배럴을 쓰면
 * 아이콘 하나 때문에 dev 서버가 600개 모듈을 더 변환한다.
 */

export function NotFound() {
  const navigate = useNavigate();

  return (
    <EmptyState
      {...emptyMessages.notFound}
      icon={IconMagnifyingglassLine}
      onAction={() => navigate("/")}
    />
  );
}
