import Link from "next/link";
import offices from "@/lib/offices.json";
import type { Locale } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { WorldMap } from "./WorldMap";
import { Icon } from "./Icon";
import { CountUp } from "./CountUp";
import { HOME } from "@/lib/content";

const LABELS = ["seoul", "vietnam", "mumbai", "russia", "uzbekistan", "egypt", "indonesia", "turkey", "usa", "mongolia"];

/** 메인 — 화면 전체 폭 글로벌 네트워크 세계 지도 */
export function NetworkSection({ locale }: { locale: Locale }) {
  const ko = locale === "ko";
  const total = offices.regions.reduce((n, r) => n + r.offices.length, 0);
  return (
    <section className="relative overflow-hidden bg-paper py-20 text-ink lg:py-28">
      <div className="bg-grid-light absolute inset-0" aria-hidden />
      <div className="container-x relative">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow">Global Network</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              {ko ? "서울에서 세계로, 글로벌마트 무역 네트워크" : "From Seoul to the world: our trade network"}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">{HOME.regionsLead[locale]}</p>
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">{HOME.regionsTitle[locale]}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {HOME.regions.map((r, i) => (
                  <li key={i} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-semibold text-ink-3">
                    {r[locale]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 self-start lg:self-auto">
            <Link href={lp(locale, "/offices")} className="btn-primary">
              {ko ? "해외지사 전체 보기" : "See all offices"} <Icon name="arrow-right" className="size-4" />
            </Link>
            <Link href={lp(locale, "/company/partners")} className="btn-ghost">
              {ko ? "제휴기관 소개" : "About IRDCA"}
            </Link>
          </div>
        </div>

        <div data-reveal className="mt-12 rounded-[28px] bg-white p-3 shadow-card ring-1 ring-line sm:p-6 lg:p-10">
          <WorldMap locale={locale} labels={LABELS} animated dark={false} />
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {offices.regions.map((r, i) => (
            <div key={r.id} data-reveal style={{ "--d": `${i * 0.06}s` } as React.CSSProperties} className="rounded-2xl bg-white px-4 py-3 shadow-card ring-1 ring-line">
              <dt className="text-[12px] text-muted">{r[locale]}</dt>
              <dd className="mt-0.5 text-xl font-extrabold text-ink">
                <CountUp value={String(r.offices.length)} />
                <span className="ml-1 text-xs font-medium text-muted">{ko ? "곳" : "bases"}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-right text-xs text-muted">
          {ko ? `서울 본사 + 해외 거점 ${total}곳` : `Seoul HQ + ${total} overseas bases`}
        </p>
      </div>
    </section>
  );
}
