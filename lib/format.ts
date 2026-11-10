import type { Locale } from "./i18n";

/**
 * 게시일 표시 (한국 시간 기준)
 * - 한국어(기본): 2026.11.03
 * - 영어: Nov 3, 2026
 */
export function formatDate(iso: string, locale?: Locale) {
  const d = new Date(iso);
  if (locale === "en") {
    return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", year: "numeric", month: "short", day: "numeric" }).format(d);
  }
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}.${get("month")}.${get("day")}`;
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}
