import Link from "next/link";
import offices from "@/lib/offices.json";
import type { Locale } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { WorldMap } from "./WorldMap";
import { Icon } from "./Icon";
import { CountUp } from "./CountUp";
import { HOME } from "@/lib/content";
import { SectionTitle } from "./PageHero";

const LABELS = ["seoul", "vietnam", "mumbai", "russia", "uzbekistan", "egypt", "indonesia", "turkey", "usa", "mongolia"];

/** 메인 — 화면 전체 폭 글로벌 네트워크 세계 지도 */
export function NetworkSection({ locale }: { locale: Locale }) {
  const ko = locale === "ko";
  const total = offices.regions.reduce((n, r) => n + r.offices.length, 0);
  return (
    <section className="relative overflow-hidden bg-paper py-section text-ink">
      <div className="bg-grid-light absolute inset-0" aria-hidden />
      <div className="container-x relative">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-[46rem]">
            <SectionTitle
              eyebrow="Global Network"
              title={ko ? "서울에서 세계로,\n글로벌마트 무역 네트워크" : "From Seoul to the world:\nour trade network"}
              lead={HOME.regionsLead[locale]}
            />
            <div className="mt-6">
              <p className="text-caption font-bold text-muted">{HOME.regionsTitle[locale]}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {HOME.regions.map((r, i) => (
                  <li key={i} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-small font-semibold text-ink-3">
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

        <div className="mt-stack grid gap-grid xl:grid-cols-[minmax(0,1fr)_clamp(240px,17vw,320px)] xl:items-start">
          <div data-reveal className="rounded-3xl bg-white p-[clamp(12px,2vw,40px)] shadow-card ring-1 ring-line">
            <WorldMap locale={locale} labels={LABELS} animated dark={false} />
          </div>

          <div>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7 xl:grid-cols-1 xl:content-start xl:gap-0 xl:divide-y xl:divide-line xl:rounded-3xl xl:bg-white xl:px-6 xl:py-2 xl:shadow-card xl:ring-1 xl:ring-line">
              {offices.regions.map((r, i) => (
                <div
                  key={r.id}
                  data-reveal
                  style={{ "--d": `${i * 0.06}s` } as React.CSSProperties}
                  className="rounded-2xl bg-white px-4 py-3 shadow-card ring-1 ring-line xl:flex xl:items-baseline xl:justify-between xl:rounded-none xl:bg-transparent xl:px-0 xl:py-3.5 xl:shadow-none xl:ring-0"
                >
                  <dt className="text-caption text-muted xl:text-small xl:font-semibold xl:text-ink-3">{r[locale]}</dt>
                  <dd className="mt-0.5 text-xl font-extrabold tabular-nums text-ink xl:mt-0">
                    <CountUp value={String(r.offices.length)} />
                    <span className="ml-1 text-xs font-medium text-muted">{ko ? "곳" : "offices"}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-right text-caption text-muted">
              {ko ? `서울 본사 + 해외 거점 ${total}곳` : `Seoul HQ + ${total} overseas offices`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
