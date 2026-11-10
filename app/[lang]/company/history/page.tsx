import type { Metadata } from "next";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { HISTORY } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { SectionNav } from "@/components/SectionNav";

const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2018.08" → 한국어 "2018. 08" / English "Aug 2018" */
function historyDate(date: string, ko: boolean) {
  const [y, m] = date.split(".");
  return ko ? `${y}. ${m}` : `${EN_MONTHS[Number(m) - 1] ?? m} ${y}`;
}

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "연혁" : "History" };
}

export default async function HistoryPage({ params }: LangParams) {
  const { locale } = getT((await params).lang);
  const ko = locale === "ko";
  const byYear = HISTORY.reduce<Record<string, typeof HISTORY>>((acc, h) => {
    const y = h.date.slice(0, 4);
    (acc[y] ??= []).push(h);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));

  return (
    <>
      <PageHero locale={locale} image="hcmc"
        eyebrow="History"
        title={ko ? "연혁" : "History"}
        lead={ko ? "전 세계로 뻗어 나가는 글로벌 비즈니스 기업" : "A global business reaching across the world"}
        crumbs={[{ label: ko ? "회사소개" : "Company" }, { label: ko ? "연혁" : "History" }]}
      />
      <SectionNav section="/company" current="/company/history" locale={locale} />

      <section className="py-section-sm">
        <div className="container-x max-w-4xl">
          <ol className="relative border-l-2 border-ink pl-8 sm:pl-12">
            {years.map((y) => (
              <li key={y} data-reveal className="relative pb-12 last:pb-0">
                <span className="absolute -left-[41px] top-1.5 grid size-5 place-items-center rounded-full border-4 border-white bg-orange ring-2 ring-ink sm:-left-[57px]" />
                <p className="text-[clamp(32px,2vw+12px,56px)] font-black leading-none tracking-tight tabular-nums text-ink">{y}</p>
                <ul className="mt-4 space-y-3">
                  {[...byYear[y]].sort((a, b) => b.date.localeCompare(a.date)).map((h) => (
                    <li key={h.date + h.ko} className="flex flex-col gap-1 rounded-2xl border border-line p-5 sm:flex-row sm:gap-6">
                      <span className="w-20 shrink-0 text-small font-semibold tabular-nums text-muted">{historyDate(h.date, ko)}</span>
                      <span className="text-body font-medium text-ink">{ko ? h.ko : h.en}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
