"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, SITE } from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import { asset, lp, swapLang } from "@/lib/paths";
import { Icon } from "./Icon";

export function Header({ locale }: { locale: Locale }) {
  const fullPath = usePathname();
  // 언어 접두어(/ko, /en)를 뺀 경로
  const pathname = fullPath.replace(/^\/(ko|en)(?=\/|$)/, "").replace(/\/$/, "") || "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = (l: { ko: string; en: string }) => l[locale];
  const L = (href: string) => lp(locale, href);
  const otherLang: Locale = locale === "ko" ? "en" : "ko";
  const isHome = pathname === "/";
  const solid = scrolled || !isHome || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => {
    const base = "/" + href.split("/")[1];
    return pathname === href || (base !== "/" && pathname.startsWith(base));
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "border-b border-line bg-white/90 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link href={L("/")} className="flex shrink-0 items-center" aria-label={t(SITE.name)}>
          <Image
            src={asset(solid ? "/images/logo-full.png" : "/images/logo-full-white.png")}
            alt={t(SITE.name)}
            width={480}
            height={96}
            priority
            className="h-7 w-auto lg:h-8"
          />
        </Link>

        {/* PC 메뉴 */}
        <nav className="hidden items-center lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <div key={item.href} className="group relative">
              <Link
                href={L(item.href)}
                className={`flex items-center gap-1 px-3.5 py-7 text-[15px] font-semibold transition xl:px-4 ${
                  solid ? "text-ink hover:text-brand" : "text-white/90 hover:text-white"
                } ${isActive(item.href) ? (solid ? "!text-brand" : "!text-white") : ""}`}
              >
                {t(item.label)}
                {item.children && <Icon name="chevron-down" className="size-3.5 opacity-50" />}
              </Link>
              {item.children && (
                <div className="invisible absolute left-1/2 top-full -translate-x-1/2 translate-y-1 opacity-0 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="min-w-52 rounded-2xl border border-line bg-white p-2 shadow-lift">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={L(c.href)}
                        className={`block rounded-xl px-4 py-2.5 text-[14px] font-medium transition hover:bg-brand-soft hover:text-brand ${
                          pathname === c.href ? "bg-brand-soft text-brand" : "text-ink-3"
                        }`}
                      >
                        {t(c.label)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href={swapLang(fullPath, otherLang)}
            className={`hidden rounded-full px-3 py-1.5 text-[13px] font-bold tracking-wide transition sm:inline-flex ${
              solid ? "text-ink-3 hover:bg-paper" : "text-white/85 hover:bg-white/10"
            }`}
            aria-label={locale === "ko" ? "Switch to English" : "한국어로 보기"}
          >
            <span className={locale === "ko" ? "" : "opacity-50"}>KO</span>
            <span className="mx-1 opacity-30">/</span>
            <span className={locale === "en" ? "" : "opacity-50"}>EN</span>
          </Link>
          <Link
            href={L("/contact#inquiry")}
            className={`hidden sm:inline-flex btn !py-2 !px-4 !text-[14px] ${solid ? "bg-brand text-white hover:bg-ink-2" : "bg-white text-ink hover:bg-brand-soft"}`}
          >
            {locale === "ko" ? "상담 신청" : "Get in touch"}
          </Link>
          <button
            type="button"
            className={`grid size-10 place-items-center rounded-full lg:hidden ${solid ? "text-ink hover:bg-paper" : "text-white hover:bg-white/10"}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <Icon name={open ? "x" : "menu"} className="size-6" />
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <div
        id="mobile-menu"
        className={`fixed inset-x-0 top-16 bottom-0 overflow-y-auto bg-white transition lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="container-x pb-10 pt-2" aria-label="Mobile">
          {NAV.map((item) => (
            <div key={item.href} className="border-b border-line py-3">
              <Link href={L(item.href)} className="block py-1.5 text-lg font-bold text-ink">
                {t(item.label)}
              </Link>
              {item.children && (
                <div className="mt-1 grid grid-cols-2 gap-x-3">
                  {item.children.map((c) => (
                    <Link
                      key={c.href}
                      href={L(c.href)}
                      className={`py-1.5 text-[15px] ${pathname === c.href ? "font-semibold text-brand" : "text-muted"}`}
                    >
                      {t(c.label)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <a href={SITE.telHref} className="btn-primary">
              <Icon name="phone" className="size-4" /> {SITE.tel}
            </a>
            <Link href={swapLang(fullPath, otherLang)} className="btn-ghost">
              {locale === "ko" ? "English" : "한국어"}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
