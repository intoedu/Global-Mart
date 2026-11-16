import type { Metadata } from "next";
import { getT, type LangParams } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import offices from "@/lib/offices.json";
import { PageHero } from "@/components/PageHero";
import { Icon } from "@/components/Icon";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "Contact Us · 상담 문의" : "Contact Us" };
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
      <section className="py-section-sm">
        <div className="container-x grid gap-grid md:grid-cols-2 lg:grid-cols-3">
            <a href={SITE.telHref} className="block rounded-3xl bg-ink p-[clamp(24px,1.95vw,40px)] text-white transition hover:bg-ink-2">
              <p className="text-sm text-white/60">{ko ? "전화 상담" : "Call us"}</p>
              <p className="mt-1 flex items-center gap-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                <Icon name="phone" className="size-6 shrink-0 text-sky" />
                <span className="whitespace-nowrap">{ko ? SITE.tel : SITE.telIntl}</span>
              </p>
              <p className="mt-3 text-sm text-white/60">{t(SITE.hours)}</p>
            </a>
            <a href={`mailto:${SITE.email}`} className="group block rounded-3xl border border-line bg-white p-[clamp(24px,1.95vw,40px)] transition hover:border-ink">
              <p className="text-sm text-muted">{ko ? "이메일 문의" : "Email us"}</p>
              <p className="mt-1 flex items-center gap-3 text-xl font-extrabold tracking-tight sm:text-2xl">
                <Icon name="mail" className="size-6 shrink-0 text-accent" />
                <span className="break-all decoration-accent underline-offset-4 group-hover:underline">{SITE.email}</span>
              </p>
              <p className="mt-3 text-sm text-muted">
                {ko ? "아이템과 목표 국가를 적어 보내 주시면 담당자가 회신드립니다." : "Tell us about your product and target countries and we will reply."}
              </p>
            </a>
            <dl className="divide-y divide-line rounded-3xl border border-line px-7 md:col-span-2 lg:col-span-1">
              {[
                { icon: "fax", k: ko ? "팩스" : "Fax", v: ko ? SITE.fax : SITE.faxIntl, nowrap: true },
                { icon: "pin", k: ko ? "주소" : "Address", v: t(SITE.address), sub: t(SITE.directions) },
              ].map((r) => (
                // dt/dd 가 행(div)의 바로 아래에 오도록 아이콘은 dt 안에 둡니다 (보이는 모양은 그대로)
                <div key={r.k} className="relative py-5 pl-9">
                  <dt className="text-xs font-semibold text-muted">
                    <Icon name={r.icon} className="absolute left-0 top-5.5 size-5 text-accent" />
                    {r.k}
                  </dt>
                  <dd className={`mt-0.5 font-medium ${"nowrap" in r && r.nowrap ? "whitespace-nowrap" : ""}`}>
                    {r.v}
                    {r.sub && <span className="mt-0.5 block text-sm font-normal text-muted">{r.sub}</span>}
                  </dd>
                </div>
              ))}
            </dl>
        </div>
      </section>

      <section className="bg-paper py-section-sm">
        <div className="container-x">
          <h2 className="text-xl font-extrabold tracking-tight">{ko ? "해외 사무소 이메일" : "Overseas office emails"}</h2>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {emails.map((o) => (
              <li key={o.id}>
                <a href={`mailto:${o.email}`} className="flex flex-col rounded-xl bg-white px-4 py-3 shadow-card ring-accent/40 transition hover:text-ink hover:ring-2">
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
