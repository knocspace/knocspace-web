import { type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * 사이드바 폭 조절.
 *
 * 치수는 하나도 여기서 정하지 않는다. knocspace.css 의 --knoc-sidebar-* 를
 * 런타임에 읽는다. 값을 바꾸려면 CSS 만 고치면 된다.
 */

const STORAGE_KEY = "knoc.sidebar";

interface SidebarDimensions {
  /** 기본 폭 */
  base: number;
  min: number;
  max: number;
  /** 접혔을 때의 아이콘 레일 폭 */
  rail: number;
}

interface PersistedState {
  width: number;
  collapsed: boolean;
}

export interface UseSidebarResizeResult {
  /** 실제로 렌더할 폭. 접힌 상태면 레일 폭이다. */
  width: number;
  collapsed: boolean;
  /** 드래그 중인지. 트랜지션을 끌 때 쓴다. */
  resizing: boolean;
  /** 레일에서 기본 폭으로 복귀 */
  expand: () => void;
  /** 사이드바 우측 경계에 스프레드한다 */
  handleProps: {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
  };
}

function readDimension(name: string): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  return Number.parseFloat(raw);
}

function readDimensions(): SidebarDimensions {
  const rail = readDimension("--knoc-sidebar-rail");
  const min = readDimension("--knoc-sidebar-min");
  const max = readDimension("--knoc-sidebar-max");
  const base = readDimension("--knoc-sidebar-default");

  // CSS 변수가 없으면 값을 지어내지 않는다. 폭이 0 으로 보이는 편이
  // 조용히 다른 숫자로 굴러가는 것보다 낫다.
  return {
    rail: Number.isFinite(rail) ? rail : 0,
    min: Number.isFinite(min) ? min : 0,
    max: Number.isFinite(max) ? max : Number.POSITIVE_INFINITY,
    base: Number.isFinite(base) ? base : rail,
  };
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    const { width, collapsed } = parsed as Partial<PersistedState>;
    if (typeof width !== "number" || !Number.isFinite(width)) return null;
    if (typeof collapsed !== "boolean") return null;

    return { width, collapsed };
  } catch {
    // 사파리 프라이빗 모드, 저장 용량 초과, 손상된 JSON.
    // 저장된 폭이 없다고 보고 기본값으로 시작한다.
    return null;
  }
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function useSidebarResize(): UseSidebarResizeResult {
  const dimensions = useMemo(() => readDimensions(), []);

  const [state, setState] = useState<PersistedState>(() => {
    const persisted = loadPersisted();
    if (!persisted) {
      return { width: dimensions.base, collapsed: false };
    }
    return {
      width: clamp(persisted.width, dimensions.min, dimensions.max),
      collapsed: persisted.collapsed,
    };
  });

  const [resizing, setResizing] = useState(false);

  // 드래그 시작 시점의 좌표와 폭. 매 프레임 리렌더를 유발하면 안 되므로 ref.
  const dragOrigin = useRef<{ x: number; width: number } | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 저장 실패는 조용히 넘긴다. 이번 세션에서만 폭이 유지될 뿐이다.
    }
  }, [state]);

  // 드래그 중에는 문서 전체의 텍스트 선택을 막고 커서를 고정한다.
  // 포인터가 사이드바 밖으로 나가도 커서가 col-resize 로 유지된다.
  useEffect(() => {
    if (!resizing) return;

    const { body } = document;
    const previousUserSelect = body.style.userSelect;
    const previousCursor = body.style.cursor;

    body.style.userSelect = "none";
    body.style.cursor = "col-resize";

    return () => {
      body.style.userSelect = previousUserSelect;
      body.style.cursor = previousCursor;
    };
  }, [resizing]);

  const expand = useCallback(() => {
    setState((current) =>
      current.collapsed ? { width: dimensions.base, collapsed: false } : current,
    );
  }, [dimensions.base]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;

      // 기본 드래그 동작(텍스트 선택, 이미지 끌기)을 먼저 끊는다.
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);

      dragOrigin.current = {
        x: event.clientX,
        // 레일에서 시작하면 레일 폭부터 늘어난다.
        width: state.collapsed ? dimensions.rail : state.width,
      };
      setResizing(true);
    },
    [dimensions.rail, state.collapsed, state.width],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const origin = dragOrigin.current;
      if (!origin) return;

      const next = origin.width + (event.clientX - origin.x);

      // min 아래로 끌면 레일로 접는다. 폭 자체는 마지막 확장 폭을 기억해 둬야
      // 다시 펼쳤을 때 원래 자리로 돌아온다.
      if (next < dimensions.min) {
        setState((current) =>
          current.collapsed ? current : { ...current, collapsed: true },
        );
        return;
      }

      setState({
        width: clamp(next, dimensions.min, dimensions.max),
        collapsed: false,
      });
    },
    [dimensions.max, dimensions.min],
  );

  const endDrag = useCallback((event: PointerEvent<HTMLElement>) => {
    if (!dragOrigin.current) return;

    dragOrigin.current = null;
    setResizing(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return {
    width: state.collapsed ? dimensions.rail : state.width,
    collapsed: state.collapsed,
    resizing,
    expand,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
