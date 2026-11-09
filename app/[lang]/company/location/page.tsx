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
    { icon: "phone", label: ko ? "전화" : "Phone", value: `${SITE.tel} (${SITE.telIntl})`, href: SITE.telHref },
    { icon: "fax", label: ko ? "팩스" : "Fax", value: SITE.fax },
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

      <section className="py-16 lg:py-24">
        <div className="container-x grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-line bg-paper">
            <iframe
              title={ko ? "글로벌마트 위치 지도" : "Map to Globalmart"}
              src={SITE.map.embed}
              className="aspect-[4/3] h-full min-h-[320px] w-full lg:aspect-auto"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div>
            <p className="eyebrow">Head Office</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight">{ko ? "서울 본사" : "Seoul Head Office"}</h2>
            <dl className="mt-8 divide-y divide-line border-y border-line">
              {rows.map((r) => (
                <div key={r.label} className="flex gap-4 py-4">
                  <Icon name={r.icon} className="mt-0.5 size-5 shrink-0 text-brand" />
                  <div>
                    <dt className="text-xs font-semibold text-muted">{r.label}</dt>
                    <dd className="mt-0.5 text-[15px] font-medium text-ink">
                      {r.href ? (
                        <a href={r.href} className="hover:text-brand">
                          {r.value}
                        </a>
                      ) : (
                        r.value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <a href={SITE.map.naver} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-3 !text-sm">
                {ko ? "네이버지도" : "Naver Map"}
              </a>
              <a href={SITE.map.kakao} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-3 !text-sm">
                {ko ? "카카오맵" : "Kakao Map"}
              </a>
              <a href={SITE.map.google} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-3 !text-sm">
                Google
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
