"use client";

import { useState } from "react";
import offices from "@/lib/offices.json";
import type { Locale } from "@/lib/i18n";
import { WorldMap } from "./WorldMap";

export function OfficesExplorer({ locale }: { locale: Locale }) {
  const [active, setActive] = useState<string | null>(null);
  const ko = locale === "ko";
  const total = offices.regions.reduce((n, r) => n + r.offices.length, 0);

  return (
    <>
      <div className="rounded-3xl bg-paper p-4 ring-1 ring-line sm:p-6 lg:px-10 lg:py-6">
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-pressed={!active}
            className={`rounded-full px-4 py-2 text-small font-semibold transition ${!active ? "bg-ink text-white" : "bg-white text-ink-3 ring-1 ring-line hover:text-ink hover:ring-ink/40"}`}
          >
            {ko ? "전체" : "All"} <span className="opacity-50">{total}</span>
          </button>
          {offices.regions.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActive(active === r.id ? null : r.id)}
              aria-pressed={active === r.id}
              className={`rounded-full px-4 py-2 text-small font-semibold transition ${
                active === r.id ? "bg-ink text-white" : "bg-white text-ink-3 ring-1 ring-line hover:text-ink hover:ring-ink/40"
              }`}
            >
              {r[locale]} <span className="opacity-50">{r.offices.length}</span>
            </button>
          ))}
        </div>
        {/* 지도는 2:1 비율 — 화면 높이에 맞춰 폭을 제한해 첫 화면에서 아래 지역 목록 일부가 보이게 함 */}
        <div className="mx-auto max-w-[max(min(100%,calc((100svh_-_540px)_*_2)),min(100%,34rem))]">
          <WorldMap locale={locale} activeRegion={active} animated dark={false} />
        </div>
      </div>

      <div className="mt-grid grid gap-grid sm:grid-cols-2 lg:grid-cols-3">
        {offices.regions.map((r) => (
          <section
            key={r.id}
            className={`rounded-2xl border p-[clamp(20px,1.6vw,32px)] transition ${active === r.id ? "border-ink bg-paper" : "border-line"}`}
            onMouseEnter={() => setActive(r.id)}
            onMouseLeave={() => setActive(null)}
          >
            <h2 className="flex items-center justify-between gap-3 text-h3">
              {r[locale]}
              <span className="rounded-full bg-paper px-2.5 py-0.5 text-caption font-semibold text-muted">{r.offices.length}</span>
            </h2>
            <ul className="mt-4 space-y-2.5">
              {r.offices.map((o) => (
                <li key={o.id} className="flex items-center gap-2 text-body font-medium text-ink">
                  <span className="size-1.5 shrink-0 rounded-full bg-orange" />
                  {o[locale]}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
