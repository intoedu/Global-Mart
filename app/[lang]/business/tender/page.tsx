import type { Metadata } from "next";
import { getT, type LangParams } from "@/lib/i18n";
import { TENDER } from "@/lib/content";
import { BusinessShell, FeatureGrid } from "@/components/BusinessShell";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "해외입찰대행" : "Overseas Tender Agency" };
}

export default async function TenderPage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  return (
    <BusinessShell image="towers" locale={locale} current="/business/tender" eyebrow="Overseas Tender Agency" lead={t(TENDER.lead)}>
      <section className="py-section-sm">
        <div className="container-x">
          <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="shrink-0 rounded-full bg-ink px-4 py-2 text-small font-bold text-white">{t(TENDER.chip)}</span>
            <span className="text-body font-medium text-ink-3">{t(TENDER.chipText)}</span>
          </div>
          <FeatureGrid items={TENDER.points} locale={locale} cols={3} />
        </div>
      </section>
    </BusinessShell>
  );
}
