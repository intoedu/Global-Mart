"use client";

import { useState } from "react";
import offices from "@/lib/offices.json";
import type { Locale } from "@/lib/i18n";
import { WorldMap } from "./WorldMap";
import { Icon } from "./Icon";

export function OfficesExplorer({ locale }: { locale: Locale }) {
  const [active, setActive] = useState<string | null>(null);
  const ko = locale === "ko";
  const total = offices.regions.reduce((n, r) => n + r.offices.length, 0);

  return (
    <>
      <div className="rounded-3xl bg-paper p-4 ring-1 ring-line sm:p-8 lg:p-10">
        <div className="mb-4 flex flex-wrap gap-2">
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
        <WorldMap locale={locale} activeRegion={active} animated dark={false} />
      </div>

      <div className="mt-stack grid gap-grid sm:grid-cols-2 lg:grid-cols-3">
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
              {r.offices.map((o) => {
                const email = (o as { email?: string }).email;
                return (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-body">
                    <span className="flex items-center gap-2 font-medium text-ink">
                      <span className="size-1.5 rounded-full bg-orange" />
                      {o[locale]}
                    </span>
                    {email && (
                      <a href={`mailto:${email}`} className="flex items-center gap-1 text-small text-muted decoration-accent underline-offset-4 hover:text-ink hover:underline">
                        <Icon name="mail" className="size-3.5" />
                        {email}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
