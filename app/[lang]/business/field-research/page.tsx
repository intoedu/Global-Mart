import type { Metadata } from "next";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { FIELD } from "@/lib/content";
import { BusinessShell, FeatureGrid } from "@/components/BusinessShell";
import { Icon } from "@/components/Icon";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "해외출장조사" : "Field Research Trips" };
}

export default async function FieldResearchPage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  const ko = locale === "ko";
  return (
    <BusinessShell image="plane" locale={locale} current="/business/field-research" eyebrow="Overseas Field Research" lead={t(FIELD.lead)}>
      <section className="py-section-sm">
        <div className="container-x">
          <FeatureGrid items={FIELD.points} locale={locale} numbered cols={4} />
          <div className="mt-grid flex items-start gap-4 rounded-2xl bg-ink p-[clamp(24px,1.95vw,40px)] text-white">
            <Icon name="info" className="mt-0.5 size-6 shrink-0 text-orange" />
            <div>
              <p className="text-h3">{ko ? "회계·세무 고객 특전" : "Perk for accounting clients"}</p>
              <p className="mt-1 text-body text-white/70">{t(FIELD.perk)}</p>
            </div>
          </div>
        </div>
      </section>
    </BusinessShell>
  );
}
