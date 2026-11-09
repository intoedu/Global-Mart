import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { photo } from "@/lib/photos";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { AGENCY, PROCESS } from "@/lib/content";
import { BusinessShell } from "@/components/BusinessShell";
import { SectionTitle } from "@/components/PageHero";
import { Icon } from "@/components/Icon";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "해외지사대행" : "Overseas Branch Agency" };
}

export default async function AgencyPage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  const ko = locale === "ko";
  return (
    <BusinessShell image="meeting" locale={locale} current="/business/agency" eyebrow="Overseas Branch Agency" lead={t(AGENCY.lead)}>
      <section className="py-16 lg:py-24">
        <div className="container-x">
          <SectionTitle eyebrow={ko ? "두 가지 방식" : "Two models"} title={ko ? "해외지사대행의 종류" : "How we can work together"} />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {AGENCY.types.map((ty, i) => (
              <article key={i} data-reveal style={{ "--d": `${i * 0.12}s` } as React.CSSProperties} className={`rounded-3xl p-8 lg:p-10 ${i === 0 ? "bg-ink text-white" : "border-2 border-ink bg-white"}`}>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${i === 0 ? "bg-orange text-ink" : "bg-ink text-white"}`}>
                  {t(ty.tag)}
                </span>
                <h3 className="mt-5 text-2xl font-extrabold tracking-tight">{t(ty.title)}</h3>
                <p className={`mt-3 text-[16px] leading-relaxed ${i === 0 ? "text-white/70" : "text-muted"}`}>{t(ty.body)}</p>
                <ul className="mt-6 space-y-2.5">
                  {ty.points.map((p, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-[15px] font-medium">
                      <Icon name="check" className={`size-4 ${i === 0 ? "text-orange" : "text-accent"}`} strokeWidth={2.4} />
                      {t(p)}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="container-x">
        <div className="relative aspect-[21/8] overflow-hidden rounded-3xl">
          <Image src={photo("docs", 1800)} alt="" fill sizes="100vw" className="object-cover" />
        </div>
      </div>
      <section className="bg-paper py-16 lg:py-24 mt-16 lg:mt-24">
        <div className="container-x">
          <SectionTitle eyebrow="Process" title={ko ? "업무 진행 절차" : "Our process"} lead={ko ? "업무는 다음 절차에 따라 진행됩니다." : "Engagements follow these steps."} />
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {PROCESS.map((p, i) => (
              <li key={p.key}>
                <Link href={lp(locale, p.href)} className="group flex h-full flex-col rounded-2xl bg-white p-7 shadow-card transition hover:-translate-y-1 hover:shadow-lift">
                  <span className="text-sm font-bold text-brand">STEP {i + 1}</span>
                  <span className="mt-2 text-xl font-bold">{t(p.title)}</span>
                  <span className="mt-1 text-sm text-muted">{t(p.period)}</span>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                    {ko ? "자세히" : "Details"} <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-1" />
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
