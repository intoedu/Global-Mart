export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export type L = { ko: string; en: string };

export function isLocale(v: unknown): v is Locale {
  return v === "ko" || v === "en";
}

export function toLocale(v: unknown): Locale {
  return v === "en" ? "en" : "ko";
}

/** 다국어 텍스트 선택 */
export function tr(text: L, locale: Locale): string {
  return text[locale] ?? text.ko;
}

/** 페이지에서 쓰는 번역 도우미 */
export function getT(lang: unknown) {
  const locale = toLocale(lang);
  return { locale, ko: locale === "ko", t: (text: L) => tr(text, locale) };
}

export type LangParams = { params: Promise<{ lang: string }> };

export function generateLangParams() {
  return LOCALES.map((lang) => ({ lang }));
}
