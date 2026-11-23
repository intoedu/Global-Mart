import type { Metadata } from "next";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { PARTNERS } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { SectionNav } from "@/components/SectionNav";
import { Icon } from "@/components/Icon";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "제휴기관" : "Partner Institutions" };
}

export default async function PartnersPage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  const ko = locale === "ko";
  return (
    <>
      <PageHero locale={locale} image="training"
        eyebrow="Partners"
        title={ko ? "제휴기관" : "Partner Institutions"}
        lead={t(PARTNERS.lead)}
        crumbs={[{ label: ko ? "회사소개" : "Company" }, { label: ko ? "제휴기관" : "Partner Institutions" }]}
      />
      <SectionNav section="/company" current="/company/partners" locale={locale} />

      <section className="py-section-sm">
        <div className="container-x">
          <div className="grid gap-grid md:grid-cols-2">
            {PARTNERS.orgs.map((o, i) => (
              <article key={i} data-reveal style={{ "--d": `${i * 0.12}s` } as React.CSSProperties} className="card p-[clamp(32px,2.8vw,56px)]">
                <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">
                  <Icon name={i === 0 ? "globe" : "building"} className="size-3.5" />
                  {t(o.kind)}
                </span>
                <h2 className="mt-5 text-[clamp(1.5rem,1.2rem+0.5vw,2rem)] font-extrabold tracking-tight">{t(o.name)}</h2>
                <p className="mt-3 text-body text-muted">{t(o.body)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
