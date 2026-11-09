import type { Metadata } from "next";
import { getT, getLocale } from "@/lib/i18n";
import { BRANCH } from "@/lib/content";
import { BusinessShell, FeatureGrid } from "@/components/BusinessShell";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getLocale()) === "ko" ? "해외지사 운영대행" : "Branch Operation" };
}

export default async function BranchPage() {
  const { locale, t } = await getT();
  return (
    <BusinessShell image="towers" locale={locale} current="/business/branch" eyebrow="The Agency of Overseas Branch Work" lead={t(BRANCH.lead)}>
      <section className="py-16 lg:py-24">
        <div className="container-x">
          <FeatureGrid items={BRANCH.points} locale={locale} cols={3} />
        </div>
      </section>
    </BusinessShell>
  );
}
