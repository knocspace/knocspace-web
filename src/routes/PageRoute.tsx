import { useState } from "react";
import { useParams } from "react-router";
import { DocumentSurface } from "@/components/DocumentSurface/DocumentSurface";
import { PageIcon } from "@/components/PageIcon/PageIcon";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { listEmojiCategories, searchEmoji } from "@/features/editor/emojiSearch";
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
  const [icon, setIcon] = useState<string | undefined>(undefined);

  /* 라우트가 :pageId 를 보장하지만 useParams 의 타입은 그걸 모른다.
   * 없을 수 있는 값으로 다뤄서 에디터에 undefined 가 흘러가지 않게 한다. */
  if (!pageId) return null;

  return (
    <DocumentSurface>
      {/* 아이콘과 제목이 한 묶음이다. 아이콘이 없을 때 「아이콘 추가」 는
        * 평상시 안 보이고 이 묶음 어디에 마우스를 올려도 나타난다 — 제목 위에
        * 올렸을 때도 나와야 하므로 감추고 드러내는 것은 여기가 한다.
        *
        * 자리는 늘 잡는다(invisible). 호버할 때만 자리가 생기면 마우스를 올릴
        * 때마다 제목이 아래로 밀린다.
        *
        * :focus-within 도 같이 여는 것이 중요하다. 호버로만 열면 키보드로는 이
        * 버튼에 닿을 방법이 없다 — 감춰진 동안에도 탭 순서에는 남아 있다. */}
      <div className="group mb-x4">
        {/* 아이콘과 제목 사이 10px — DESIGN.md §2. PageIcon 이 자기 여백을
          * 상쇄해 두어서 여기 값이 그대로 눈에 보이는 간격이다. */}
        <div
          className={`mb-dense-5 ${icon ? "" : "invisible group-hover:visible group-focus-within:visible"}`}
        >
          <PageIcon
            value={icon}
            onChange={setIcon}
            listCategories={listEmojiCategories}
            searchEmoji={searchEmoji}
          />
        </div>
        <PageTitle value={title} onChange={setTitle} />
      </div>
      <LazyBlockEditor pageId={pageId} content={sampleDoc()} />
    </DocumentSurface>
  );
}
