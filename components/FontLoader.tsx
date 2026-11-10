/**
 * Pretendard 글꼴 CSS 를 화면 그리기를 막지 않고 불러옵니다.
 * (글꼴 자체가 font-display: swap 이라 CSS 를 기다릴 이유가 없음 → 첫 화면이 더 빨리 보임)
 * - 스크립트가 stylesheet 로 붙입니다. JS 가 꺼져 있으면 <noscript> 로 불러옵니다.
 * - (React 가 <noscript> 안 stylesheet 를 보고 <link rel=preload as=style> 를 자동으로 넣어 일찍 받아 둡니다)
 */
export const PRETENDARD_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

export function FontLoader() {
  return (
    <>
      <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var l=document.createElement("link");l.rel="stylesheet";l.href=${JSON.stringify(PRETENDARD_CSS)};document.head.appendChild(l)})();`,
        }}
      />
      <noscript>
        <link rel="stylesheet" href={PRETENDARD_CSS} />
      </noscript>
    </>
  );
}
