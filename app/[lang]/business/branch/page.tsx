import type { Metadata } from "next";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { BRANCH } from "@/lib/content";
import { BusinessShell, FeatureGrid } from "@/components/BusinessShell";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "해외지사 운영대행" : "Branch Operation" };
}

export default async function BranchPage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  return (
    <BusinessShell image="towers" locale={locale} current="/business/branch" eyebrow="Overseas Branch Operation" lead={t(BRANCH.lead)}>
      <section className="py-section-sm">
        <div className="container-x">
          <FeatureGrid items={BRANCH.points} locale={locale} cols={3} />
        </div>
      </section>
    </BusinessShell>
  );
}
