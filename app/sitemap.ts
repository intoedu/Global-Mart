import type { MetadataRoute } from "next";
import { NAV, SITE } from "@/lib/site";
import { LOCALES } from "@/lib/i18n";
import { lp } from "@/lib/paths";

export const dynamic = "force-static";

/** 비밀번호로 잠긴(회원 전용) 공간은 검색엔진 사이트맵에서 제외 — 하위 메뉴(?cat=…)도 포함 */
const PRIVATE = ["/resident"];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = new Set<string>(["/", "/contact", "/privacy"]);
  for (const n of NAV) {
    if (PRIVATE.some((p) => n.href.startsWith(p))) continue;
    paths.add(n.href);
    n.children?.forEach((c) => {
      if (!c.href.includes("?") && !c.href.includes("#")) paths.add(c.href);
    });
  }
  return LOCALES.flatMap((l) => [...paths].map((p) => ({ url: `${SITE.url}${lp(l, p)}`, priority: p === "/" ? 1 : 0.7 })));
}
