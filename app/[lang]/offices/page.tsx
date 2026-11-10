import type { Metadata } from "next";
import Link from "next/link";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/PageHero";
import { OfficesExplorer } from "@/components/OfficesExplorer";
import { Icon } from "@/components/Icon";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "해외지사" : "Global Offices" };
}

export default async function OfficesPage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  const ko = locale === "ko";
  return (
    <>
      <PageHero locale={locale} image="earth"
        eyebrow="Overseas Offices"
        title={ko ? "해외지사 현황" : "Global Offices"}
        lead={
          ko
            ? "서울 본사를 중심으로 동남아시아, 중국·동북아, 인도·서남아, 중동, 러시아·중앙아, 북아프리카, 동유럽·미주의 해외지사와 함께합니다."
            : "From our Seoul head office, we work with offices across Southeast Asia, China & Northeast Asia, India & South Asia, the Middle East, Russia & Central Asia, North Africa, Eastern Europe and the Americas."
        }
        crumbs={[{ label: ko ? "해외지사" : "Global Offices" }]}
      />
      <section className="py-section-sm">
        <div className="container-x">
          <OfficesExplorer locale={locale} />

          <div className="mt-stack grid gap-grid lg:grid-cols-2">
            <div className="rounded-2xl bg-paper p-[clamp(24px,1.95vw,40px)]">
              <p className="eyebrow">Head Office</p>
              <p className="mt-2 text-h3">{t(SITE.address)}</p>
              <p className="mt-2 text-body text-muted">
                <span className="whitespace-nowrap">Tel {ko ? SITE.tel : SITE.telIntl}</span>
                {" · "}
                <span className="whitespace-nowrap">Fax {ko ? SITE.fax : SITE.faxIntl}</span>
                {" · "}
                <a href={`mailto:${SITE.email}`} className="whitespace-nowrap decoration-accent underline-offset-4 hover:text-ink hover:underline">
                  {SITE.email}
                </a>
              </p>
            </div>
            <Link href={lp(locale, "/contact#inquiry")} className="group flex items-center justify-between gap-4 rounded-2xl bg-ink p-[clamp(24px,1.95vw,40px)] text-white">
              <div>
                <p className="text-h3">{ko ? "원하는 국가가 목록에 없나요?" : "Your country isn't listed?"}</p>
                <p className="mt-1 text-body text-white/75">
                  {ko ? "제휴기관 네트워크를 통해 진행 가능 여부를 확인해 드립니다." : "We'll check availability through our partner network."}
                </p>
              </div>
              <Icon name="arrow-right" className="size-6 shrink-0 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
