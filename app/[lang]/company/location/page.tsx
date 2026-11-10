import type { Metadata } from "next";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/PageHero";
import { SectionNav } from "@/components/SectionNav";
import { Icon } from "@/components/Icon";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "오시는 길" : "Location" };
}

export default async function LocationPage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  const ko = locale === "ko";
  const rows = [
    { icon: "pin", label: ko ? "주소" : "Address", value: t(SITE.address) },
    { icon: "plane", label: ko ? "교통" : "Directions", value: t(SITE.directions) },
    { icon: "phone", label: ko ? "전화" : "Phone", value: ko ? SITE.tel : SITE.telIntl, href: SITE.telHref },
    { icon: "fax", label: ko ? "팩스" : "Fax", value: ko ? SITE.fax : SITE.faxIntl },
    { icon: "mail", label: ko ? "이메일" : "Email", value: SITE.email, href: `mailto:${SITE.email}` },
    { icon: "clock", label: ko ? "상담시간" : "Hours", value: t(SITE.hours) },
  ];
  return (
    <>
      <PageHero locale={locale} image="seoul"
        eyebrow="Location"
        title={ko ? "오시는 길" : "Location"}
        crumbs={[{ label: ko ? "회사소개" : "Company" }, { label: ko ? "주소" : "Location" }]}
      />
      <SectionNav section="/company" current="/company/location" locale={locale} />

      <section className="py-section-sm">
        <div className="container-x grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-line bg-paper">
            <iframe
              title={ko ? "글로벌마트 위치 지도" : "Map to Globalmart"}
              src={SITE.map.embed}
              className="aspect-[4/3] h-full min-h-[clamp(320px,32vw,560px)] w-full lg:aspect-auto"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div>
            <p className="eyebrow">Head Office</p>
            <h2 className="mt-3 text-[clamp(1.5rem,1.2rem+0.5vw,2rem)] font-extrabold tracking-tight">{ko ? "서울 본사" : "Seoul Head Office"}</h2>
            <dl className="mt-8 divide-y divide-line border-y border-line">
              {rows.map((r) => (
                <div key={r.label} className="relative py-4 pl-9">
                  <dt className="text-caption font-semibold text-muted">
                    <Icon name={r.icon} className="absolute left-0 top-[1.125rem] size-5 text-ink-3" />
                    {r.label}
                  </dt>
                  <dd className="mt-0.5 text-body font-medium text-ink">
                    {r.href ? (
                      <a href={r.href} className="hover:underline decoration-accent underline-offset-4">
                        {r.value}
                      </a>
                    ) : (
                      r.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <a href={SITE.map.naver} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm !px-3">
                {ko ? "네이버지도" : "Naver Map"}
              </a>
              <a href={SITE.map.kakao} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm !px-3">
                {ko ? "카카오맵" : "Kakao Map"}
              </a>
              <a href={SITE.map.google} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm !px-3">
                {ko ? "구글 지도" : "Google Maps"}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
