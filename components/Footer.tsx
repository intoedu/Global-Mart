import Image from "next/image";
import Link from "next/link";
import { NAV, SITE } from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import { Icon } from "./Icon";
import { asset, lp } from "@/lib/paths";

export function Footer({ locale }: { locale: Locale }) {
  const t = (l: { ko: string; en: string }) => l[locale];
  const ko = locale === "ko";
  return (
    <footer className="bg-ink text-white/70">
      <div className="container-stripes" aria-hidden />
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr] lg:py-20">
        <div>
          <Image src={asset("/images/logo-full-white.png")} alt={t(SITE.name)} width={480} height={96} className="h-8 w-auto" />
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/60">{t(SITE.tagline)}</p>
          <div className="mt-8 space-y-3 text-[15px]">
            <a href={SITE.telHref} className="flex items-center gap-3 text-2xl font-bold text-white hover:text-sky">
              <Icon name="phone" className="size-5 text-sky" /> {SITE.tel}
            </a>
            <p className="flex items-center gap-3">
              <Icon name="clock" className="size-4 text-white/40" /> {t(SITE.hours)}
            </p>
            <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 hover:text-white">
              <Icon name="mail" className="size-4 text-white/40" /> {SITE.email}
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {NAV.filter((n) => n.children).map((n) => (
            <div key={n.href}>
              <p className="text-sm font-bold text-white">{t(n.label)}</p>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                {n.children!.map((c) => (
                  <li key={c.href}>
                    <Link href={lp(locale, c.href)} className="hover:text-white">
                      {t(c.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="text-sm font-bold text-white">{ko ? "바로가기" : "Quick links"}</p>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {NAV.filter((n) => !n.children).map((n) => (
                <li key={n.href}>
                  <Link href={lp(locale, n.href)} className="hover:text-white">
                    {t(n.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-4 py-8 text-[13px] leading-relaxed text-white/45 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <p>
              {t(SITE.name)} · {ko ? "대표" : "CEO"} {t(SITE.ceo)} · {ko ? "사업자등록번호" : "Business Reg. No."} {SITE.bizNo}
            </p>
            <p>{t(SITE.address)}</p>
            <p>
              Tel {SITE.tel} ({SITE.telIntl}) · Fax {SITE.fax} · {ko ? "개인정보보호책임자" : "Privacy Officer"} {t(SITE.privacyOfficer)}
            </p>
            <p>
              {ko ? "제휴기업" : "Partner firm"} {t(SITE.partners.company)} · {ko ? "제휴기관" : "Partner institution"} {t(SITE.partners.institution)}
            </p>
          </div>
          <div className="flex flex-col gap-2 lg:items-end">
            <Link href={lp(locale, "/privacy")} className="font-semibold text-white/80 hover:text-white">
              {ko ? "개인정보처리방침" : "Privacy Policy"}
            </Link>
            <p>
              © {new Date().getFullYear()} Globalmart Inc. All rights reserved. ·{" "}
              <Link href={lp("ko", "/admin")} className="hover:text-white">
                {ko ? "관리자" : "Admin"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
