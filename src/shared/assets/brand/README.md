# 브랜드 에셋

| 파일 | 용도 |
| --- | --- |
| `knocspace-icon-tile.svg` | 보라 타일 + 흰 심볼. 파비콘 · 앱 아이콘 · 워크스페이스 아바타. `public/favicon.svg` 가 이것의 사본이다. |
| `knocspace-symbol.svg` | 선 심볼 24px 기준(stroke 2). |
| `knocspace-symbol-18.svg` | 18px 렌더용(stroke 2.2). |
| `knocspace-symbol-16.svg` | 16px 렌더용(stroke 2.4). |
| `knocspace-symbol-dark.svg` | 다크모드 색(purple-500) 고정본. |

UI 안에서는 이 파일들을 `<img>` 로 불러오지 말고 `src/shared/ui/BrandMark/BrandMark.tsx` 를 쓴다.
`BrandMark` 는 `currentColor` 로 그리므로 `text-fg-brand` 하나로 라이트/다크가 같이 맞는다
(`-dark.svg` 는 이 컴포넌트를 못 쓰는 외부 반출용으로만 남겨둔다).
색은 `#8361E8` 하드코딩 대신 SEED semantic 토큰을 따른다 — DESIGN.md 참고.
