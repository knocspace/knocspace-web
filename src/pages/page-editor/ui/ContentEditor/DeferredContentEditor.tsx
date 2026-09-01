import { lazy, Suspense } from "react";
import { Skeleton } from "@/shared/ui";
import type { ContentEditorProps } from "./ContentEditor";

/**
 * 에디터를 첫 화면 번들에서 떼어낸다.
 *
 * BlockNote 는 ProseMirror · Mantine · Shiki 를 같이 들고 온다. 문서를 여는
 * 화면에서만 필요한 무게라, 사이드바와 상단바가 그걸 기다릴 이유가 없다
 * (docs/roadmap/sprint-3.md §3).
 *
 * 이 파일 자체는 가벼워야 한다. ContentEditor 를 값으로 import 하면 그 순간
 * 지연 로드가 무의미해지므로, 타입만 가져온다.
 */

const ContentEditor = lazy(() =>
  import("./ContentEditor").then((module) => ({ default: module.ContentEditor })),
);

export function DeferredContentEditor(props: ContentEditorProps) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <ContentEditor {...props} />
    </Suspense>
  );
}

/**
 * 불러오는 동안의 자리표시.
 *
 * 줄 길이를 섞는 이유는 TreeSkeleton 과 같다 — 전부 같은 폭이면 문단이 아니라
 * 표로 보인다.
 *
 * 18px 은 글자 높이다. 블록 한 줄이 실제로 차지하는 자리는 그보다 커서
 * (16px × 1.5 에 상하 3px, 30px), 로드가 끝나면 본문이 아래로 조금 밀린다.
 * 막대를 30px 로 키우면 안 밀리지만 문단이 아니라 벽돌로 보여서, 밀리는 쪽을
 * 택했다.
 */
function EditorSkeleton() {
  return (
    <div className="flex flex-col gap-dense-3" aria-busy="true">
      {[100, 92, 74, 96, 61].map((widthPercent, index) => (
        <Skeleton key={index} width={`${widthPercent}%`} height={18} />
      ))}
    </div>
  );
}
