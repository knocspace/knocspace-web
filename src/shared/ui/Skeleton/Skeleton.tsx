import { Skeleton as SeedSkeleton } from "@seed-design/react";

/**
 * 자리표시 회색 블록 — SEED Skeleton 을 감싼다.
 *
 * 흩어져 있던 자리표시 코드가 전부 여기로 모인다. 지금 Sidebar 와
 * EditorSurface 가 각자 rounded-r1 bg-bg-neutral-weak-alpha 로 그리고 있는데,
 * 그건 shimmer 도 없고 prefers-reduced-motion 도 안 본다.
 *
 * 반경은 SEED 가 0 / 8 / 16 / full 만 준다. 트리 행이 쓰는 r1(4px)이 없어서
 * 텍스트 줄에는 8 을 쓴다 — 12px 짜리 줄에서 4 와 8 은 눈으로 안 갈린다.
 *
 * block 도 8 이다. 16 은 34px 문서 제목 바에서 양 끝이 알약처럼 말려서,
 * 자리표시가 아니라 칩으로 보인다. 시안 값(6px)에 가까운 쪽은 8 이다.
 */

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  /** text = 글자 줄 · block = 카드·썸네일 · circle = 아바타 */
  shape?: "text" | "block" | "circle";
}

const RADIUS = { text: "8", block: "8", circle: "full" } as const;

/** SEED 는 치수를 토큰 문자열로 받는다. 숫자는 px 로 붙여서 넘긴다. */
const px = (value: number | string | undefined) =>
  typeof value === "number" ? `${value}px` : value;

export function Skeleton({ width, height, shape = "text" }: SkeletonProps) {
  return (
    <SeedSkeleton
      width={px(width)}
      height={px(height)}
      radius={RADIUS[shape]}
      tone="neutral"
      // 자리표시는 읽을 내용이 아니다. 로딩 사실은 부모가 aria-busy 로 알린다.
      aria-hidden
    />
  );
}

/**
 * 트리 자리표시 — 28px 행을 그대로 차지한다.
 *
 * 로드 후 레이아웃이 흔들리면 여기 값이 틀린 것이다. 행 높이·들여쓰기는
 * PageNavigationItem 과 같은 토큰을 읽는다.
 */
export function TreeSkeleton({ rows = 4 }: { rows?: number }) {
  // 실제 목록처럼 보이도록 길이와 깊이를 섞는다. 전부 같은 폭이면 표처럼 보인다.
  const shape = [
    { width: 118, depth: 0 },
    { width: 84, depth: 1 },
    { width: 136, depth: 1 },
    { width: 72, depth: 0 },
  ];

  return (
    <div className="flex flex-col gap-dense-1" aria-busy="true">
      {Array.from({ length: rows }, (_, index) => {
        const row = shape[index % shape.length];
        return (
          <div
            key={index}
            className="flex h-tree-row items-center gap-x1"
            style={{
              paddingLeft: `calc(var(--knoc-space-dense-2) + var(--knoc-tree-indent) * ${row.depth})`,
            }}
          >
            <Skeleton width={16} height={16} />
            <Skeleton width={row.width} height={12} />
          </div>
        );
      })}
    </div>
  );
}
