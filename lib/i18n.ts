import { cookies } from "next/headers";

export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export type L = { ko: string; en: string };

export const LOCALE_COOKIE = "gm_lang";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const v = store.get(LOCALE_COOKIE)?.value;
  return v === "en" ? "en" : "ko";
}

/** 다국어 텍스트 선택 */
export function tr(text: L, locale: Locale): string {
  return text[locale] ?? text.ko;
}

/** 서버 컴포넌트용: 현재 언어로 바로 꺼내 쓰는 함수 반환 */
export async function getT() {
  const locale = await getLocale();
  return { locale, t: (text: L) => tr(text, locale) };
}
