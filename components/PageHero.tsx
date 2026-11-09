import Image from "next/image";
import Link from "next/link";
import { photo, type PhotoKey } from "@/lib/photos";
import { lp } from "@/lib/paths";
import type { Locale } from "@/lib/i18n";
import { Icon } from "./Icon";

type Crumb = { href?: string; label: string };

/** 서브페이지 상단 타이틀 영역 — 의뢰 요청사항: "'제목'을 페이지 상단에 위치" */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  image,
  locale = "ko",
  children,
}: {
  image?: PhotoKey;
  locale?: Locale;
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-paper pt-16 text-ink lg:pt-20">
      {image && (
        <div className="absolute inset-y-0 right-0 hidden w-[46%] md:block" aria-hidden>
          <Image src={photo(image, 1600)} alt="" fill priority sizes="46vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/40 to-transparent" />
        </div>
      )}
      <div className="bg-grid-light absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <div className="absolute -left-40 -top-40 size-[480px] rounded-full bg-brand-soft blur-[110px]" aria-hidden />
      <div className={`container-x relative ${image ? "py-16 lg:py-24" : "py-12 lg:py-16"}`}>
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
            <Link href={lp(locale, "/")} className="hover:text-brand" aria-label="Home">
              <Icon name="home" className="size-4" />
            </Link>
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <Icon name="chevron-right" className="size-3.5 opacity-60" />
                {c.href ? (
                  <Link href={lp(locale, c.href)} className="hover:text-brand">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-ink-3">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="reveal mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">{title}</h1>
        {lead && <p className="reveal mt-4 max-w-xl text-[16px] leading-relaxed text-ink-3 lg:text-lg">{lead}</p>}
        {children}
      </div>
      <div className="container-stripes relative" aria-hidden />
    </section>
  );
}

/** 섹션 내 하위 메뉴 탭 */
export function SubNav({ items, current }: { items: { href: string; label: string }[]; current: string }) {
  return (
    <div className="sticky top-16 z-30 bg-ink lg:top-20">
      <div className="container-x">
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0" aria-label="Section">
          {items.map((i) => {
            const active = i.href.replace(/\/$/, "").endsWith(current);
            return (
              <Link
                key={i.href}
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={`relative shrink-0 px-4 py-4 text-[15px] font-semibold transition ${
                  active ? "text-white" : "text-white/50 hover:text-white"
                }`}
              >
                {i.label}
                {active && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-accent" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function SectionTitle({ eyebrow, title, lead, center }: { eyebrow?: string; title: string; lead?: string; center?: boolean }) {
  return (
    <div data-reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 whitespace-pre-line text-2xl font-extrabold tracking-tight text-ink sm:text-3xl lg:text-[42px] lg:leading-[1.2] [.dark-section_&]:text-white">{title}</h2>
      {lead && <p className="mt-4 text-[16px] leading-relaxed text-muted lg:text-lg [.dark-section_&]:text-white/60">{lead}</p>}
    </div>
  );
}
