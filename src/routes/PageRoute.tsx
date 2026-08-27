import { useParams } from "react-router";
import { DocumentSurface } from "@/components/DocumentSurface/DocumentSurface";
import { LazyBlockEditor } from "@/features/editor/LazyBlockEditor";
import { sampleDoc } from "@/features/editor/sampleDoc";

/**
 * /p/:pageId — 문서 한 장.
 *
 * TODO(F2): 내용의 출처가 `usePage(pageId)` 로 바뀐다. 그때 sampleDoc 이
 * 사라지고, 로딩(Skeleton) · 404 · 에러 갈래가 이 자리에 생긴다.
 * TODO(F3): 제목(PageTitle)과 자동 저장. 지금은 onChange 를 안 건다 —
 * 받을 곳이 없다.
 */

export function PageRoute() {
  const { pageId } = useParams();

  /* 라우트가 :pageId 를 보장하지만 useParams 의 타입은 그걸 모른다.
   * 없을 수 있는 값으로 다뤄서 에디터에 undefined 가 흘러가지 않게 한다. */
  if (!pageId) return null;

  return (
    <DocumentSurface>
      <LazyBlockEditor pageId={pageId} content={sampleDoc()} />
    </DocumentSurface>
  );
}
