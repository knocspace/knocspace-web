import { useParams } from "react-router";
import { DocumentSurface } from "@/components/DocumentSurface/DocumentSurface";

/**
 * /p/:pageId — 문서 한 장.
 *
 * 지금은 URL 에서 꺼낸 id 를 글자로 확인만 한다. F2 에서 이 pageId 가
 * usePage(pageId) 의 인자가 되고, 안쪽이 실제 문서로 바뀐다.
 */

export function PageRoute() {
  const { pageId } = useParams();

  return (
    <DocumentSurface>
      <div className="flex flex-col gap-x2">
        <span className="t2-regular text-fg-neutral-subtle">pageId</span>
        <span className="t9-bold text-fg-neutral">{pageId}</span>
      </div>
    </DocumentSurface>
  );
}
