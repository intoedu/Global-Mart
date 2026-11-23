import type { Metadata } from "next";
import Link from "next/link";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { AGENCY, PROCESS } from "@/lib/content";
import { BusinessShell } from "@/components/BusinessShell";
import { Icon } from "@/components/Icon";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "해외지사대행" : "Overseas Branch Agency" };
}

export default async function AgencyPage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  const ko = locale === "ko";
  const { strategy } = AGENCY;
  return (
    <BusinessShell image="meeting" locale={locale} current="/business/agency" eyebrow="Overseas Branch Agency" lead={t(AGENCY.lead)}>
      {/* 해외지사대행 전략수립 및 수수료 — 1st ~ 4th 단계 */}
      {/* 한 화면에 들어오도록 간격·글자 크기를 촘촘하게 (의뢰인 요청) */}
      <section className="pb-[clamp(14px,0.5rem+0.5vw,28px)] pt-[clamp(18px,0.7rem+0.7vw,34px)]">
        <div className="container-x">
          <h2 className="text-[clamp(1.25rem,0.95rem+0.8vw,1.875rem)] font-extrabold tracking-tight text-ink">{t(strategy.title)}</h2>
          <ol className="mt-[clamp(12px,0.5rem+0.5vw,20px)] grid gap-[clamp(10px,0.4rem+0.5vw,20px)] md:grid-cols-2 xl:grid-cols-[1fr_1.7fr_1fr_1fr] xl:items-stretch">
            {strategy.steps.map((s, i) => (
              <li
                key={s.no}
                data-reveal
                style={{ "--d": `${i * 0.1}s` } as React.CSSProperties}
                className="card relative flex h-full flex-col p-[clamp(16px,0.7rem+0.5vw,24px)]"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-ink px-3.5 py-1 text-small font-bold tabular-nums text-white">{s.no}</span>
                  <span className="h-px flex-1 bg-line" aria-hidden />
                </div>
                <h3 className="mt-2.5 text-[clamp(1rem,0.9rem+0.25vw,1.1875rem)] font-bold leading-snug text-ink">{t(s.title)}</h3>
                {s.items.length > 0 &&
                  (s.dash ? (
                    <ul className="mt-2 space-y-1 text-small text-ink-3">
                      {s.items.map((it, j) => (
                        <li key={j} className="flex gap-2">
                          <span className="shrink-0 font-bold text-accent" aria-hidden>
                            -
                          </span>
                          <span>{t(it)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-2 space-y-1 text-small text-ink-3">
                      {s.items.map((it, j) => (
                        <p key={j}>{t(it)}</p>
                      ))}
                    </div>
                  ))}
                {i < strategy.steps.length - 1 && (
                  <span className="absolute -right-[calc(clamp(10px,0.4rem+0.5vw,20px)/2+0.75rem)] top-1/2 z-10 hidden size-6 -translate-y-1/2 place-items-center rounded-full bg-ink text-white xl:grid">
                    <Icon name="chevron-right" className="size-3.5" strokeWidth={2.5} />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 업무 진행 절차 */}
      <section className="bg-paper py-[clamp(20px,0.8rem+0.6vw,32px)]">
        <div className="container-x">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="text-[clamp(1.25rem,0.95rem+0.8vw,1.875rem)] font-extrabold tracking-tight text-ink">{ko ? "업무 진행 절차" : "Our process"}</h2>
            <p className="text-small text-muted">{ko ? "업무는 다음 절차에 따라 진행됩니다." : "Engagements follow these steps."}</p>
          </div>
          <ol className="mt-[clamp(12px,0.5rem+0.5vw,20px)] grid gap-[clamp(10px,0.4rem+0.5vw,20px)] md:grid-cols-3">
            {PROCESS.map((p, i) => (
              <li key={p.key}>
                <Link href={lp(locale, p.href)} className="group flex h-full items-center justify-between gap-4 rounded-2xl bg-white px-[clamp(16px,0.7rem+0.5vw,24px)] py-[clamp(12px,0.5rem+0.4vw,18px)] shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
                  <span className="min-w-0">
                    <span className="block text-caption font-bold text-orange-ink">STEP {i + 1}</span>
                    <span className="mt-0.5 block text-[clamp(1rem,0.9rem+0.25vw,1.1875rem)] font-bold">{t(p.title)}</span>
                    <span className="mt-0.5 block text-small text-muted">{t(p.period)}</span>
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper text-accent transition group-hover:bg-ink group-hover:text-white" aria-label={ko ? "자세히" : "Details"}>
                    <Icon name="arrow-right" className="size-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </BusinessShell>
  );
}
