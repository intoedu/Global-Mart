import { NAV } from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import { SubNav } from "./PageHero";
import { lp } from "@/lib/paths";

/** NAV 의 하위 메뉴를 탭으로 표시 */
export function SectionNav({ section, current, locale }: { section: string; current: string; locale: Locale }) {
  const item = NAV.find((n) => n.href.startsWith(section));
  if (!item?.children) return null;
  return <SubNav current={current} items={item.children.map((c) => ({ href: lp(locale, c.href), label: c.label[locale] }))} />;
}
