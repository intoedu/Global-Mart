import type { Metadata } from "next";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { SITE } from "@/lib/site";
import offices from "@/lib/offices.json";
import { PageHero } from "@/components/PageHero";
import { InquiryForm } from "@/components/InquiryForm";
import { Icon } from "@/components/Icon";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "Contact Us · 상담 신청" : "Contact Us" };
}

export default async function ContactPage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  const ko = locale === "ko";
  const emails = offices.regions.flatMap((r) => r.offices).filter((o): o is typeof o & { email: string } => "email" in o && !!o.email);

  return (
    <>
      <PageHero locale={locale} image="success"
        eyebrow="Contact Us"
        title="Contact Us"
        lead={ko ? "해외시장 진출에 관한 무엇이든 편하게 문의해 주세요." : "Ask us anything about taking your business abroad."}
        crumbs={[{ label: "Contact Us" }]}
      />
      <section className="py-14 lg:py-20">
        <div className="container-x grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <aside className="space-y-4">
            <a href={SITE.telHref} className="block rounded-3xl bg-ink p-7 text-white transition hover:bg-ink-2">
              <p className="text-sm text-white/60">{ko ? "전화 상담" : "Call us"}</p>
              <p className="mt-1 flex items-center gap-3 text-3xl font-extrabold tracking-tight">
                <Icon name="phone" className="size-6 text-sky" />
                {ko ? SITE.tel : SITE.telIntl}
              </p>
              <p className="mt-3 text-sm text-white/60">{t(SITE.hours)}</p>
            </a>
            <dl className="divide-y divide-line rounded-3xl border border-line px-7">
              {[
                { icon: "mail", k: ko ? "이메일" : "Email", v: SITE.email, href: `mailto:${SITE.email}` },
                { icon: "fax", k: ko ? "팩스" : "Fax", v: SITE.fax },
                { icon: "pin", k: ko ? "주소" : "Address", v: t(SITE.address), sub: t(SITE.directions) },
              ].map((r) => (
                <div key={r.k} className="flex gap-4 py-5">
                  <Icon name={r.icon} className="mt-0.5 size-5 shrink-0 text-brand" />
                  <div>
                    <dt className="text-xs font-semibold text-muted">{r.k}</dt>
                    <dd className="mt-0.5 font-medium">
                      {r.href ? <a href={r.href} className="hover:text-brand">{r.v}</a> : r.v}
                      {r.sub && <span className="mt-0.5 block text-sm font-normal text-muted">{r.sub}</span>}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </aside>

          <div id="inquiry" className="card scroll-mt-28 p-7 sm:p-9">
            <h2 className="text-2xl font-extrabold tracking-tight">{ko ? "온라인 상담 신청" : "Online inquiry"}</h2>
            <p className="mt-2 text-[15px] text-muted">
              {ko ? "남겨 주신 내용을 확인한 뒤 담당자가 연락드립니다." : "Our team will review your message and get back to you."}
            </p>
            <div className="mt-7">
              <InquiryForm locale={locale} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper py-14 lg:py-20">
        <div className="container-x">
          <h2 className="text-xl font-extrabold tracking-tight">{ko ? "해외 사무소 이메일" : "Overseas office emails"}</h2>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {emails.map((o) => (
              <li key={o.id}>
                <a href={`mailto:${o.email}`} className="flex flex-col rounded-xl bg-white px-4 py-3 shadow-card transition hover:text-brand">
                  <span className="text-[15px] font-semibold">{o[locale]}</span>
                  <span className="truncate text-[13px] text-muted">{o.email}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
