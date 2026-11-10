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

      <section className="dark-section bg-ink py-section-sm text-white">
        <div className="container-x">
          <SectionTitle
            eyebrow="IRDCA & Globalmart"
            title={ko ? "전문가 양성에서 해외지사대행까지" : "From training to branch agency"}
            center
          />
          <ol className="mx-auto mt-stack grid max-w-[max(64rem,70vw)] gap-grid md:grid-cols-3">
            {PARTNERS.steps.map((s, i) => (
              <li key={i} data-reveal style={{ "--d": `${i * 0.12}s` } as React.CSSProperties} className="relative rounded-2xl border border-white/10 bg-ink-2 p-[clamp(24px,1.95vw,40px)]">
                <span className="text-[clamp(40px,2rem+1vw,60px)] font-black leading-none text-orange">0{i + 1}</span>
                <h3 className="mt-2 text-h3">{t(s.title)}</h3>
                <p className="mt-2 text-body text-white/60">{t(s.body)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
