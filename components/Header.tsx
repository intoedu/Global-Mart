"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV, SITE } from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import { BASE_PATH, asset, lp, swapLang } from "@/lib/paths";
import { ContactLink } from "./ContactLink";
import { Icon } from "./Icon";

/** 휴대폰·태블릿 메뉴가 쓰이는 폭의 끝 (Tailwind xl = 80rem = 1280px) */
const DESKTOP_MQ = "(min-width: 80rem)";

export function Header({ locale }: { locale: Locale }) {
  const router = useRouter();
  const fullPath = usePathname();
  // 언어 접두어(/ko, /en)를 뺀 경로
  const pathname = fullPath.replace(/^\/(ko|en)(?=\/|$)/, "").replace(/\/$/, "") || "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  /** Esc 로 닫은 PC 드롭다운 (마우스·포커스가 벗어나면 다시 열 수 있음) */
  const [dismissed, setDismissed] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = (l: { ko: string; en: string }) => l[locale];
  const L = (href: string) => lp(locale, href);
  const ko = locale === "ko";
  const otherLang: Locale = ko ? "en" : "ko";
  const isHome = pathname === "/";
  // 밝은 디자인: 글자는 항상 어두운 색, 메인 맨 위에서만 배경을 투명하게
  const bgSolid = scrolled || !isHome || open;
  const langHref = swapLang(fullPath, otherLang);

  // 문서 언어 (클라이언트에서 KO↔EN 으로 옮겨 갈 때도 맞게 유지)
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 헤더·메뉴의 링크로 다른 페이지에 가면 항상 맨 위에서 시작
  // (Next 는 새 페이지 첫 부분이 화면에 조금이라도 보이면 스크롤을 유지하므로)
  const navFromChrome = useRef(false);
  const onChromeClick = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest("a[href]");
    // 언어 전환(hreflang)은 보던 위치 유지, #이동 링크는 제외
    if (a && !a.hasAttribute("hreflang") && !a.getAttribute("href")!.includes("#")) navFromChrome.current = true;
  };

  // 다른 페이지로 이동하면 메뉴 닫기
  useEffect(() => {
    setOpen(false);
    if (navFromChrome.current) {
      navFromChrome.current = false;
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [fullPath]);

  // 화면이 PC 폭(1280px 이상)이 되면 메뉴 닫기 (태블릿 회전·창 크기 변경·브라우저 축소)
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // 메뉴가 열려 있는 동안: 뒤 페이지 스크롤 잠금, 뒤 내용은 키보드·스크린리더에서 제외(inert), Esc 로 닫기
  useEffect(() => {
    if (!open) return;
    const behind = Array.from(document.querySelectorAll<HTMLElement>("#main, body > footer, [data-floating-contact]"));
    document.body.style.overflow = "hidden";
    behind.forEach((el) => (el.inert = true));
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      behind.forEach((el) => (el.inert = false));
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => {
    const base = "/" + href.split("/")[1];
    return pathname === href || (base !== "/" && pathname.startsWith(base));
  };

  /** KO/EN 전환: 검색 조건(?region=…)과 #위치를 그대로 가지고 이동 */
  const onLangClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const extra = window.location.search + window.location.hash;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      // 새 탭으로 열기: 브라우저가 쓸 주소에 조건을 붙여 둠
      e.currentTarget.href = `${BASE_PATH}${langHref}${extra}`;
      return;
    }
    if (!extra) return; // 조건이 없으면 Link 기본 이동
    e.preventDefault();
    setOpen(false);
    router.push(langHref + extra);
  };

  const langLabel = (
    <>
      <span aria-hidden className={ko ? "" : "opacity-50"}>
        KO
      </span>
      <span aria-hidden className="mx-1 opacity-30">
        /
      </span>
      <span aria-hidden className={ko ? "opacity-50" : ""}>
        EN
      </span>
      <span className="sr-only" lang={otherLang}>
        {ko ? "KO / EN: English" : "KO / EN: 한국어"}
      </span>
    </>
  );

  return (
    <>
      <header
        onClickCapture={onChromeClick}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          bgSolid ? "border-b border-line bg-white/90 backdrop-blur-xl" : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-20 3xl:h-[88px]">
          <Link href={L("/")} className="flex shrink-0 items-center" aria-label={t(SITE.name)}>
            <Image
              src={asset("/images/logo-full.webp")}
              alt={t(SITE.name)}
              width={400}
              height={80}
              priority
              className="h-7 w-auto lg:h-8 3xl:h-9"
            />
          </Link>

          {/* PC 메뉴 */}
          <nav className="hidden items-center whitespace-nowrap xl:flex" aria-label={ko ? "주 메뉴" : "Main"}>
            {NAV.map((item) => {
              const active = isActive(item.href);
              const hidden = dismissed === item.href;
              return (
                <div
                  key={item.href}
                  className="group relative"
                  onMouseLeave={() => hidden && setDismissed(null)}
                  onBlur={(e) => {
                    if (hidden && !e.currentTarget.contains(e.relatedTarget as Node | null)) setDismissed(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape" && item.children) setDismissed(item.href);
                  }}
                >
                  <Link
                    href={L(item.href)}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={`flex items-center gap-1 px-3.5 py-7 text-[15px] font-semibold text-ink-3 transition hover:text-ink xl:px-4 3xl:px-5 3xl:py-8 3xl:text-base ${
                      active ? "!text-ink underline decoration-orange decoration-2 underline-offset-[10px]" : ""
                    }`}
                  >
                    {t(item.label)}
                    {item.children && <Icon name="chevron-down" className="size-3.5 opacity-50" />}
                  </Link>
                  {item.children && (
                    <div
                      className={`invisible absolute left-1/2 top-full -translate-x-1/2 translate-y-1 opacity-0 transition ${
                        hidden
                          ? ""
                          : "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
                      }`}
                    >
                      <div className="min-w-52 rounded-xl bg-white p-2 shadow-float ring-1 ring-ink/10">
                        {item.children.map((c) => (
                          <Link
                            key={c.href}
                            href={L(c.href)}
                            prefetch={false}
                            aria-current={pathname === c.href ? "page" : undefined}
                            className={`block rounded-lg px-4 py-2.5 text-[14px] transition hover:bg-paper hover:text-ink 3xl:text-[15px] ${
                              pathname === c.href ? "bg-paper font-semibold text-ink" : "font-medium text-ink-3"
                            }`}
                          >
                            {t(c.label)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href={langHref}
              hrefLang={otherLang}
              onClick={onLangClick}
              className="inline-flex rounded-full px-3 py-1.5 text-[13px] font-bold tracking-wide text-ink-3 transition hover:bg-paper 3xl:text-[14px]"
            >
              {langLabel}
            </Link>
            <ContactLink locale={locale} className="btn-primary btn-sm hidden sm:inline-flex">
              {ko ? "상담 신청" : "Get in touch"}
            </ContactLink>
            <button
              ref={toggleRef}
              type="button"
              className="grid size-10 place-items-center rounded-full text-ink hover:bg-paper xl:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? (ko ? "메뉴 닫기" : "Close menu") : ko ? "메뉴 열기" : "Open menu"}
            >
              <Icon name={open ? "x" : "menu"} className="size-6" />
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 — header(backdrop-filter) 밖에 두어야 화면 전체 높이로 열립니다 */}
      <div
        id="mobile-menu"
        ref={menuRef}
        onClickCapture={onChromeClick}
        className={`fixed inset-x-0 top-(--header-h) bottom-0 z-50 overflow-y-auto overscroll-contain border-t border-line bg-white transition xl:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {open && (
          <nav
            className="container-x pb-10 pt-2"
            aria-label={ko ? "모바일 메뉴" : "Mobile"}
            onClick={(e) => {
              // 같은 페이지 링크를 눌러도 메뉴 닫기 (다른 페이지는 주소 변경으로 닫힘)
              if ((e.target as HTMLElement).closest("a")) setOpen(false);
            }}
          >
            {NAV.map((item) => (
              <div key={item.href} className="border-b border-line py-3">
                <Link
                  href={L(item.href)}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="block py-1.5 text-lg font-bold text-ink"
                >
                  {t(item.label)}
                </Link>
                {item.children && (
                  <div className="mt-1 grid grid-cols-2 gap-x-3">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={L(c.href)}
                        prefetch={false}
                        aria-current={pathname === c.href ? "page" : undefined}
                        className={`py-1.5 text-[15px] ${pathname === c.href ? "font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4" : "text-muted"}`}
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
                <Icon name="phone" className="size-4" /> {ko ? SITE.tel : SITE.telIntl}
              </a>
              <Link href={langHref} hrefLang={otherLang} onClick={onLangClick} className="btn-ghost" lang={otherLang}>
                {ko ? "English" : "한국어"}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </>
  );
}
