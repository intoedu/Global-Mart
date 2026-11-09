"use client";

import Link from "next/link";
import mapData from "@/lib/map-data.json";
import { REGION_MAP, type RegionId } from "@/lib/regions";
import type { Locale } from "@/lib/i18n";

type Anchor = { id: RegionId; x: number; y: number };

/** 해외 Biz정보 — 세계 지도에서 지역을 눌러 고르기 */
export function RegionMap({
  locale,
  active,
  counts,
  hrefFor,
}: {
  locale: Locale;
  active: RegionId;
  counts: Record<string, number>;
  hrefFor: (id: RegionId) => string;
}) {
  const { width, height, dots, anchors } = mapData as { width: number; height: number; dots: number[][]; anchors: Anchor[] };
  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink p-3 sm:p-5">
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" aria-hidden>
          {dots.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={0.24} fill="rgb(255 255 255 / 0.16)" />
          ))}
        </svg>
        {anchors.map((a) => {
          const on = active === a.id;
          const n = counts[a.id] ?? 0;
          return (
            <Link
              key={a.id}
              href={hrefFor(on ? "all" : a.id)}
              scroll={false}
              aria-current={on ? "true" : undefined}
              className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold shadow-lg transition sm:px-2.5 sm:py-1 sm:text-[12px] ${
                on
                  ? "z-10 scale-110 border-accent bg-accent text-ink"
                  : "border-sky/40 bg-ink-2/90 text-white hover:border-accent hover:bg-ink-3"
              }`}
              style={{ left: `${(a.x / width) * 100}%`, top: `${(a.y / height) * 100}%` }}
            >
              <span className={`size-1.5 rounded-full ${on ? "bg-ink" : "bg-sky"}`} />
              {REGION_MAP[a.id].label[locale]}
              {n > 0 && <span className={`rounded-full px-1 text-[9px] sm:text-[10px] ${on ? "bg-ink/15" : "bg-white/15"}`}>{n}</span>}
            </Link>
          );
        })}
      </div>
      <p className="mt-2 text-center text-[11px] text-white/45 sm:text-xs">
        {locale === "ko" ? "지도에서 지역을 누르면 그 지역 글만 볼 수 있습니다." : "Tap a region on the map to filter posts."}
      </p>
    </div>
  );
}
