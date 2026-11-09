import type { Metadata } from "next";
import Link from "next/link";
import { getT, getLocale } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/PageHero";
import { OfficesExplorer } from "@/components/OfficesExplorer";
import { Icon } from "@/components/Icon";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getLocale()) === "ko" ? "해외지사" : "Global Offices" };
}

export default async function OfficesPage() {
  const { locale, t } = await getT();
  const ko = locale === "ko";
  return (
    <>
      <PageHero image="earth"
        eyebrow="Our Overseas Offices"
        title={ko ? "해외지사 현황" : "Global Offices"}
        lead={
          ko
            ? "서울 본사를 중심으로 동남아, 중국·동북아, 서남아, 중동, 러시아·CIS, 아프리카 등 세계 각지의 거점과 함께합니다."
            : "From our Seoul head office, we work with bases across Southeast Asia, China & Northeast Asia, South Asia, the Middle East, Russia & CIS, Africa and beyond."
        }
        crumbs={[{ label: ko ? "해외지사" : "Global Offices" }]}
      />
      <section className="py-12 lg:py-20">
        <div className="container-x">
          <OfficesExplorer locale={locale} />

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-paper p-7">
              <p className="text-xs font-bold uppercase tracking-widest text-brand">Head Office</p>
              <p className="mt-2 text-lg font-bold">{t(SITE.address)}</p>
              <p className="mt-2 text-[15px] text-muted">
                Tel {SITE.telIntl} · Fax {SITE.fax} · {SITE.email}
              </p>
            </div>
            <Link href="/contact#inquiry" className="group flex items-center justify-between gap-4 rounded-2xl bg-brand p-7 text-white">
              <div>
                <p className="text-lg font-bold">{ko ? "원하는 국가가 목록에 없나요?" : "Your country isn't listed?"}</p>
                <p className="mt-1 text-[15px] text-white/75">
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
