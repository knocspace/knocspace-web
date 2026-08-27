import type { ReactNode } from "react";
import { editorPlaceholders } from "@/lib/messages";

/**
 * 문서 표면. measure 720px 중앙 정렬 + 좌우 거터 56px.
 * DB 화면(Grid·Board·Calendar)은 measure 를 무시하므로 이걸 쓰지 않는다.
 */

export interface DocumentSurfaceProps {
  children?: ReactNode;
}

export function DocumentSurface({ children }: DocumentSurfaceProps) {
  return (
    <main className="mx-auto w-full max-w-measure px-doc-gutter py-x6">
      {children ?? <DocumentPlaceholder />}
    </main>
  );
}

function DocumentPlaceholder() {
  return (
    <div className="flex flex-col gap-x4">
      <span className="t9-bold text-fg-neutral">{editorPlaceholders.title}</span>

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
