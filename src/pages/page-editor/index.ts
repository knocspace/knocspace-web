/**
 * pages/page-editor 의 public API. 슬라이스 밖에서는 여기로만 들어온다.
 *
 * **안에서는 이 파일을 거치지 않는다.** 같은 슬라이스 안(스토리 포함)에서는
 * 상대경로로 가져간다 — 자기 index 를 거치면 순환이 되고, 슬라이스가 자기
 * 밖으로 뭘 내놓는지가 흐려진다.
 */

export { PageEditorPage } from "./ui/PageEditorPage";

/**
 * 화면이 아니라 문서 표면(measure 720px)이다. **F2 까지만 여기 있다.**
 *
 * 홈(`/`)이 아직 없어서 라우터가 이걸 자리표시로 그린다 (app/routes/router.tsx).
 * `pages/home` 이 생기면 이 줄은 지운다 — 페이지 부품을 슬라이스 밖으로
 * 내보내는 것은 홈이 없는 동안의 임시 조치다.
 */
export { EditorSurface } from "./ui/EditorSurface/EditorSurface";
