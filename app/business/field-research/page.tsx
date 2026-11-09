import type { Metadata } from "next";
import { getT, getLocale } from "@/lib/i18n";
import { FIELD } from "@/lib/content";
import { BusinessShell, FeatureGrid } from "@/components/BusinessShell";
import { Icon } from "@/components/Icon";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getLocale()) === "ko" ? "해외출장조사" : "Field Research Trips" };
}

export default async function FieldResearchPage() {
  const { locale, t } = await getT();
  const ko = locale === "ko";
  return (
    <BusinessShell image="plane" locale={locale} current="/business/field-research" eyebrow="Overseas Field Research" lead={t(FIELD.lead)}>
      <section className="py-16 lg:py-24">
        <div className="container-x">
          <FeatureGrid items={FIELD.points} locale={locale} numbered cols={4} />
          <div className="mt-6 flex items-start gap-4 rounded-2xl bg-brand-soft p-7">
            <Icon name="info" className="mt-0.5 size-6 shrink-0 text-brand" />
            <div>
              <p className="font-bold text-ink">{ko ? "회계·세무 고객 특전" : "Perk for accounting clients"}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-3">{t(FIELD.perk)}</p>
            </div>
          </div>
        </div>
      </section>
    </BusinessShell>
  );
}
