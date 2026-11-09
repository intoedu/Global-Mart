import Link from "next/link";
import offices from "@/lib/offices.json";
import type { Locale } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { WorldMap } from "./WorldMap";
import { Icon } from "./Icon";

const LABELS = ["seoul", "vietnam", "mumbai", "dalian", "saudi", "russia", "uzbekistan", "egypt", "indonesia", "turkey", "usa", "mongolia"];

/** 메인 — 화면 전체 폭 글로벌 네트워크 세계 지도 */
export function NetworkSection({ locale }: { locale: Locale }) {
  const ko = locale === "ko";
  const total = offices.regions.reduce((n, r) => n + r.offices.length, 0);
  return (
    <section className="relative overflow-hidden bg-ink py-20 text-white lg:py-28">
      <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow !text-sky">Global Network</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              {ko ? "서울에서 세계로, 글로벌마트 무역 네트워크" : "From Seoul to the world: our trade network"}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-white/65">
              {ko
                ? "동남아에서 중동, 중앙아시아와 아프리카까지. 현지 거점과 주재원이 귀사의 해외지사 역할을 합니다."
                : "From Southeast Asia to the Middle East, Central Asia and Africa, our local bases and staff act as your overseas branch."}
            </p>
          </div>
          <Link href={lp(locale, "/offices")} className="btn-light self-start lg:self-auto">
            {ko ? "해외지사 전체 보기" : "See all offices"} <Icon name="arrow-right" className="size-4" />
          </Link>
        </div>

        <div className="mt-12 rounded-[28px] border border-white/10 bg-ink-2/60 p-3 sm:p-6 lg:p-10">
          <WorldMap locale={locale} labels={LABELS} />
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {offices.regions.map((r) => (
            <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <dt className="text-[12px] text-white/50">{r[locale]}</dt>
              <dd className="mt-0.5 text-xl font-extrabold">
                {r.offices.length}
                <span className="ml-1 text-xs font-medium text-white/40">{ko ? "곳" : "bases"}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-right text-xs text-white/40">
          {ko ? `서울 본사 + 해외 거점 ${total}곳` : `Seoul HQ + ${total} overseas bases`}
        </p>
      </div>
    </section>
  );
}
