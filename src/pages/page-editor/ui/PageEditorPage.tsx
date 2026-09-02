import { useRef, useState } from "react";
import { useParams } from "react-router";
import { EditorSurface } from "./EditorSurface/EditorSurface";
import { PageIcon } from "./PageIcon/PageIcon";
import { PageTitle, type PageTitleHandle } from "./PageTitle/PageTitle";
import type { ContentEditorHandle } from "./ContentEditor/ContentEditor";
import { listEmojiCategories, searchEmoji } from "../lib/page-icon-emoji";
import { LazyContentEditor } from "./ContentEditor/LazyContentEditor";
import { samplePageContent } from "../model/sample-page-content";

/**
 * /p/:pageId — 문서 한 장.
 *
 * TODO(F2): 제목과 내용의 출처가 `usePage(pageId)` 로 바뀐다. 그때 samplePageContent 과
 * 아래 useState 가 사라지고, 로딩(Skeleton) · 404 · 에러 갈래가 이 자리에 생긴다.
 * TODO(F3): 자동 저장. 지금은 제목도 본문도 바뀐 값을 받아만 두고 안 보낸다.
 *
 * ── 제목과 본문을 잇는 자리
 *
 * Notion 은 제목과 본문이 한 판이라 `Enter` `↑` `↓` `Backspace` 가 그냥
 * 이어진다. 우리는 제목이 `textarea` 고 본문이 ProseMirror 라 판이 둘이고,
 * **그 사이를 잇는 유일한 자리가 여기다.**
 *
 * 양쪽 다 핸들만 연다 — `textarea` 도 에디터 인스턴스도 밖으로 안 나온다
 * (architecture.md). 이 화면이 아는 것은 「위에 제목이 있고 아래에 본문이
 * 있다」는 것뿐이고, 언제 넘어갈지는 각자가 정한다.
 */

export function PageEditorPage() {
  const { pageId } = useParams();

  /* 서버가 없어서 라우트가 잠깐 들고 있는다. F2 에서 usePage 로 바뀐다. */
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState<string | undefined>(undefined);

  const titleRef = useRef<PageTitleHandle>(null);
  const bodyRef = useRef<ContentEditorHandle>(null);

  /* 라우트가 :pageId 를 보장하지만 useParams 의 타입은 그걸 모른다.
   * 없을 수 있는 값으로 다뤄서 에디터에 undefined 가 흘러가지 않게 한다. */
  if (!pageId) return null;

  return (
    <EditorSurface>
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
        <PageTitle
          ref={titleRef}
          value={title}
          onChange={setTitle}
          /* Enter 는 **줄을 만들고**, ↓ 는 있는 줄로 **내려간다.** Notion 에서
           * 제목 끝의 Enter 가 「다음 줄」인 것과 같다 — 그 줄이 없으면 생긴다.
           *
           * 본문이 아직 안 실렸으면(지연 로드) 아무 일도 안 일어난다. 제목을
           * 칠 수 있을 때쯤이면 이미 서 있다. */
          onEnter={() => bodyRef.current?.insertStart()}
          onArrowDown={() => bodyRef.current?.focusStart()}
        />
      </div>
      <LazyContentEditor
        ref={bodyRef}
        pageId={pageId}
        content={samplePageContent()}
        onLeaveStart={() => titleRef.current?.focusEnd()}
      />
    </EditorSurface>
  );
}
