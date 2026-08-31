import type { ReactNode } from "react";
import { editorPlaceholders } from "@/lib/messages";

/**
 * 문서 표면. measure 720px 중앙 정렬 + 좌우 거터 54px.
 * DB 화면(Grid·Board·Calendar)은 measure 를 무시하므로 이걸 쓰지 않는다.
 *
 * 위아래 64px 은 문서가 시작하고 끝나는 자리다 (DESIGN.md §2). 상단바 44px
 * 바로 밑에서 제목이 시작하면 셸과 문서가 한 덩어리로 보인다 — 40px 제목이
 * 자기 자리를 가지려면 그만한 위가 비어 있어야 한다.
 */

export interface DocumentSurfaceProps {
  children?: ReactNode;
}

export function DocumentSurface({ children }: DocumentSurfaceProps) {
  return (
    <main className="mx-auto w-full max-w-measure px-doc-gutter py-x16">
      {children ?? <DocumentPlaceholder />}
    </main>
  );
}

function DocumentPlaceholder() {
  return (
    <div className="flex flex-col gap-x4">
      {/* 자리표시라도 크기는 진짜 제목과 같아야 한다. 다르면 이 표면 위에
        * PageTitle 이 앉는 순간 문서가 한 번 튄다. */}
      <span className="text-doc-title leading-doc-title tracking-doc-title font-bold text-fg-neutral-subtle">
        {editorPlaceholders.title}
      </span>

      {/* 에디터 자리표시. 실제 표면은 BlockNote 가 맡는다. */}
      {[100, 92, 74, 96, 61].map((widthPercent, index) => (
        <span
          key={index}
          aria-hidden
          className="h-x5 rounded-r1 bg-bg-neutral-weak-alpha"
          style={{ width: `${widthPercent}%` }}
        />
      ))}
    </div>
  );
}
