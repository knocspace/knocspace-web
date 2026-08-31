import { useState } from "react";
import { useParams } from "react-router";
import { DocumentSurface } from "@/components/DocumentSurface/DocumentSurface";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { LazyBlockEditor } from "@/features/editor/LazyBlockEditor";
import { sampleDoc } from "@/features/editor/sampleDoc";

/**
 * /p/:pageId — 문서 한 장.
 *
 * TODO(F2): 제목과 내용의 출처가 `usePage(pageId)` 로 바뀐다. 그때 sampleDoc 과
 * 아래 useState 가 사라지고, 로딩(Skeleton) · 404 · 에러 갈래가 이 자리에 생긴다.
 * TODO(F3): 자동 저장. 지금은 제목도 본문도 바뀐 값을 받아만 두고 안 보낸다.
 * TODO(F3): 제목에서 Enter 로 본문 첫 블록으로 가기. BlockEditor 가 핸들을
 * 열어야 한다 — 에디터 인스턴스는 밖으로 안 내보낸다(architecture.md).
 */

export function PageRoute() {
  const { pageId } = useParams();

  /* 서버가 없어서 라우트가 잠깐 들고 있는다. F2 에서 usePage 로 바뀐다. */
  const [title, setTitle] = useState("");

  /* 라우트가 :pageId 를 보장하지만 useParams 의 타입은 그걸 모른다.
   * 없을 수 있는 값으로 다뤄서 에디터에 undefined 가 흘러가지 않게 한다. */
  if (!pageId) return null;

  return (
    <DocumentSurface>
      {/* 제목과 본문 사이 16px. 여백을 PageTitle 이 안 갖는 것은 그게 이 컴포넌트의
        * 값이 아니라 **둘 사이의** 값이기 때문이다 — 제목 혼자 서는 자리(스토리북)
        * 에서는 아래가 비어 있으면 안 된다.
        *
        * 실제로 보이는 간격은 이보다 넓다. 첫 블록이 자기 위 여백을 갖고 있어서다
        * (제목 블록 18px · 문단 3px). 그건 BlockNote 에 남기기로 한 값이다 (§7). */}
      <div className="mb-x4">
        <PageTitle value={title} onChange={setTitle} />
      </div>
      <LazyBlockEditor pageId={pageId} content={sampleDoc()} />
    </DocumentSurface>
  );
}
