import type { Metadata } from "next";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { RESEARCH } from "@/lib/content";
import { BusinessShell, FeatureGrid } from "@/components/BusinessShell";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "해외시장조사" : "Market Research" };
}

export default async function ResearchPage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  const ko = locale === "ko";
  return (
    <BusinessShell image="analytics" locale={locale} current="/business/research" eyebrow="Overseas Market Research" lead={t(RESEARCH.lead)}>
      <section className="py-16 lg:py-24">
        <div className="container-x">
          <div className="mb-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-brand-soft px-4 py-2 text-sm font-bold text-brand">{ko ? "기간 · 약 1개월" : "Duration · about 1 month"}</span>
            <span className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-muted">{ko ? "고객사 판단에 따라 생략 가능" : "Optional, at your discretion"}</span>
          </div>
          <FeatureGrid items={RESEARCH.items} locale={locale} numbered cols={4} />
          <p className="mt-10 rounded-2xl border-l-4 border-brand bg-paper px-6 py-5 text-[16px] font-medium text-ink">{t(RESEARCH.outro)}</p>
        </div>
      </section>
    </BusinessShell>
  );
}
