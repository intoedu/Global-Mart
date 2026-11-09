import type { Locale } from "./i18n";

/** basePath(예: /Global-Mart) — public 폴더 파일·데이터 경로에 붙여 씁니다. (Link 는 자동 처리) */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (p: string) => `${BASE_PATH}${p}`;

/** 언어별 경로: lp("ko", "/biz") → "/ko/biz/" */
export function lp(lang: Locale, path: string) {
  const [p, hash] = path.split("#");
  const clean = p === "/" ? "" : p.replace(/\/$/, "");
  const q = clean.includes("?") ? clean.replace("?", "/?") : `${clean}/`;
  return `/${lang}${q}${hash ? `#${hash}` : ""}`;
}

/** 현재 경로에서 언어만 바꾸기 */
export function swapLang(pathname: string, to: Locale) {
  const rest = pathname.replace(new RegExp(`^${BASE_PATH}`), "").replace(/^\/(ko|en)(?=\/|$)/, "");
  return `/${to}${rest || "/"}`;
}
