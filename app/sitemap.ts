import type { MetadataRoute } from "next";
import { NAV, SITE } from "@/lib/site";
import { LOCALES } from "@/lib/i18n";
import { lp } from "@/lib/paths";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = new Set<string>(["/", "/contact", "/privacy"]);
  for (const n of NAV) {
    if (n.href !== "/resident") paths.add(n.href);
    n.children?.forEach((c) => paths.add(c.href));
  }
  return LOCALES.flatMap((l) => [...paths].map((p) => ({ url: `${SITE.url}${lp(l, p)}`, priority: p === "/" ? 1 : 0.7 })));
}
