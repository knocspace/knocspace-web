import { useRef, useState } from "react";

/**
 * 제자리 편집 — DESIGN.md §10.
 *
 * Enter 확정 / Esc 취소 / 포커스 아웃 확정.
 *
 * SEED 대응이 없다. TextInput 은 높이가 고정이고 라벨이 붙는 폼 입력인데,
 * 제자리 편집은 평상시에 "입력처럼 보이지 않아야" 해서 전제가 반대다.
 *
 * 높이를 고정하지 않는다. 맥락의 행 높이와 글자 크기를 따라간다 —
 * 이 컴포넌트가 F2 에서 처음 쓰이는 자리가 28px 트리 행이다.
 *
 * 세 상태 모두 같은 박스 크기다. 평상시에 1px 투명 테두리를 미리 잡아 두면
 * 편집으로 넘어갈 때 글자가 1px 도 안 움직인다.
 *
 * 상태(isEditing)는 호출하는 쪽이 가진다. 트리 행 메뉴의 "이름 바꾸기" 가
 * 바깥에서 편집을 시작시켜야 하기 때문이다.
 */

export interface InlineInputProps {
  value: string;
  onCommit: (next: string) => void;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
  /** 스크린리더가 읽을 이름 */
  ariaLabel: string;
  /**
   * 편집을 시작할 때 전체 선택할지.
   *
   * 이름 바꾸기는 통째로 갈아치우는 게 보통이라 true, 문서 제목은 뒤에
   * 덧붙이는 일이 많아서 false — 클릭한 자리에 캐럿을 둔다.
   */
  selectOnEdit?: boolean;
  /** 비어 있으면 확정하지 않고 이 문구를 띄운다 */
  requiredMessage?: string;
  /**
   * boxed  트리 행·목록. 테두리로 편집 중을 알린다
   * bare   문서 제목. 테두리도 배경도 없이 캐럿만
   *
   * 34px 글자는 그 자체로 자기 영역이 뚜렷해서, 상자를 더하면 문서가
   * 양식처럼 보인다. 대신 평상시 호버 배경도 없어서 "여기를 눌러 고친다"
   * 는 신호가 약한데, 문서 제목은 자리가 뻔해서 그걸로 충분하다.
   */
  variant?: "boxed" | "bare";
  /** 평상시·편집 중에 공통으로 붙는 글자 스타일. 맥락이 정한다 */
  className?: string;
}

export function InlineInput({
  value,
  onCommit,
  isEditing,
  onEditingChange,
  ariaLabel,
  selectOnEdit = true,
  variant = "boxed",
  requiredMessage,
  className = "",
}: InlineInputProps) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bare = variant === "bare";

  // 박스가 세 상태에서 같아야 한다. boxed 는 테두리 자리를 늘 잡아 둔다.
  const box = bare
    ? `w-full min-w-0 truncate ${className}`
    : `w-full min-w-0 truncate rounded-r1 border border-solid px-x1 ${className}`;

  if (!isEditing) {
    return (
      <span
        onDoubleClick={() => onEditingChange(true)}
        className={`${box} cursor-text ${
          bare ? "" : "border-transparent hover:bg-bg-neutral-weak-alpha"
        }`}
      >
        {value}
      </span>
    );
  }

  const finish = (next: string) => {
    const trimmed = next.trim();
    if (requiredMessage && trimmed === "") {
      // 값을 되돌리지 않는다. 편집 상태를 유지한 채 뭐가 잘못됐는지 말한다.
      setError(requiredMessage);
      inputRef.current?.focus();
      return;
    }
    setError(null);
    if (trimmed !== value) onCommit(trimmed);
    onEditingChange(false);
  };

  return (
    <span className="flex min-w-0 flex-1 flex-col">
      {/* key 로 다시 마운트한다. 편집을 시작할 때마다 원본에서 출발해야 하고,
        * 지난번 취소한 초안이 남아 있으면 안 된다. 그래서 비제어 입력이다 —
        * effect 로 초기값을 다시 넣지 않아도 된다. */}
      <input
        key={value}
        ref={inputRef}
        defaultValue={value}
        autoFocus
        aria-label={ariaLabel}
        aria-invalid={error ? true : undefined}
        onFocus={(event) => {
          if (selectOnEdit) event.currentTarget.select();
        }}
        onChange={() => {
          if (error) setError(null);
        }}
        onBlur={(event) => finish(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            finish(event.currentTarget.value);
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setError(null);
            onEditingChange(false);
          }
          // 트리 안에서 쓰이므로 화살표가 위로 새면 행이 같이 움직인다.
          if (event.key.startsWith("Arrow")) event.stopPropagation();
        }}
        className={`${box} text-fg-neutral outline-none ${
          bare
            ? "bg-bg-transparent"
            : `bg-bg-layer-default ${
                error ? "border-stroke-critical-solid" : "border-fg-brand"
              }`
        }`}
      />
      {error && (
        <span className="t3-regular mt-x1 text-fg-critical" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
