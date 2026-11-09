import type { Metadata } from "next";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { PARTNERS } from "@/lib/content";
import { PageHero, SectionTitle } from "@/components/PageHero";
import { SectionNav } from "@/components/SectionNav";
import { Icon } from "@/components/Icon";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "제휴사" : "Partners" };
}

export default async function PartnersPage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  const ko = locale === "ko";
  return (
    <>
      <PageHero locale={locale} image="training"
        eyebrow="Partners"
        title={ko ? "제휴사" : "Partners"}
        lead={t(PARTNERS.lead)}
        crumbs={[{ label: ko ? "회사소개" : "Company" }, { label: ko ? "제휴사" : "Partners" }]}
      />
      <SectionNav section="/company" current="/company/partners" locale={locale} />

      <section className="py-16 lg:py-24">
        <div className="container-x">
          <div className="grid gap-5 md:grid-cols-2">
            {PARTNERS.orgs.map((o, i) => (
              <article key={i} className="card p-8 lg:p-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
                  <Icon name={i === 0 ? "globe" : "building"} className="size-3.5" />
                  {t(o.kind)}
                </span>
                <h2 className="mt-5 text-2xl font-extrabold tracking-tight">{t(o.name)}</h2>
                <p className="mt-3 text-[16px] leading-relaxed text-muted">{t(o.body)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 lg:py-24">
        <div className="container-x">
          <SectionTitle
            eyebrow="IRDCA & Globalmart"
            title={ko ? "전문가 양성에서 해외지사대행까지" : "From training to branch agency"}
            center
          />
          <ol className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
            {PARTNERS.steps.map((s, i) => (
              <li key={i} className="relative rounded-2xl bg-white p-7 shadow-card">
                <span className="text-5xl font-black text-brand/15">0{i + 1}</span>
                <h3 className="mt-2 text-lg font-bold">{t(s.title)}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{t(s.body)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
