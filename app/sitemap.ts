import type { MetadataRoute } from "next";
import { NAV, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = new Set<string>(["/", "/contact", "/privacy"]);
  for (const n of NAV) {
    if (n.href !== "/resident") paths.add(n.href);
    n.children?.forEach((c) => paths.add(c.href));
  }
  return [...paths].map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: p === "/biz" ? "daily" : "monthly", priority: p === "/" ? 1 : 0.7 }));
}
