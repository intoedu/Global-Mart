import type { Metadata } from "next";
import { getT, type LangParams } from "@/lib/i18n";
import { BRANCH } from "@/lib/content";
import { BusinessShell, FeatureGrid } from "@/components/BusinessShell";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "해외지사운영" : "Branch Operation" };
}

export default async function BranchPage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  return (
    <BusinessShell image="towers" locale={locale} current="/business/branch" eyebrow="Overseas Branch Operation" lead={t(BRANCH.lead)}>
      <section className="py-section-sm">
        <div className="container-x">
          <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="rounded-full bg-ink px-4 py-2 text-small font-bold text-white">{t(BRANCH.chip)}</span>
            <span className="text-body font-medium text-ink-3">{t(BRANCH.chipText)}</span>
          </div>
          <FeatureGrid items={BRANCH.points} locale={locale} cols={3} />
        </div>
      </section>
    </BusinessShell>
  );
}
