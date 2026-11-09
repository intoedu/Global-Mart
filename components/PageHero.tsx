import Image from "next/image";
import Link from "next/link";
import { photo, type PhotoKey } from "@/lib/photos";
import { Icon } from "./Icon";

type Crumb = { href?: string; label: string };

/** 서브페이지 상단 타이틀 영역 — 의뢰 요청사항: "'제목'을 페이지 상단에 위치" */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  image,
  children,
}: {
  image?: PhotoKey;
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-ink pt-16 text-white lg:pt-20">
      {image && (
        <>
          <Image src={photo(image, 2000)} alt="" fill priority sizes="100vw" className="object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/25" aria-hidden />
        </>
      )}
      <div className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <div
        className="absolute -right-40 -top-40 size-[520px] rounded-full bg-brand/40 blur-[120px]"
        aria-hidden
      />
      <div className={`container-x relative ${image ? "py-16 lg:py-24" : "py-12 lg:py-16"}`}>
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-[13px] text-white/50">
            <Link href="/" className="hover:text-white" aria-label="Home">
              <Icon name="home" className="size-4" />
            </Link>
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <Icon name="chevron-right" className="size-3.5 opacity-60" />
                {c.href ? (
                  <Link href={c.href} className="hover:text-white">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-white/80">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="eyebrow !text-sky">{eyebrow}</p>}
        <h1 className="reveal mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
        {lead && <p className="reveal mt-4 max-w-2xl text-[16px] leading-relaxed text-white/70 lg:text-lg">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

/** 섹션 내 하위 메뉴 탭 */
export function SubNav({ items, current }: { items: { href: string; label: string }[]; current: string }) {
  return (
    <div className="sticky top-16 z-30 border-b border-line bg-white/95 backdrop-blur lg:top-20">
      <div className="container-x">
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0" aria-label="Section">
          {items.map((i) => {
            const active = i.href === current;
            return (
              <Link
                key={i.href}
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={`relative shrink-0 px-4 py-4 text-[15px] font-semibold transition ${
                  active ? "text-brand" : "text-muted hover:text-ink"
                }`}
              >
                {i.label}
                {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand" />}
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
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 whitespace-pre-line text-2xl font-extrabold tracking-tight text-ink sm:text-3xl lg:text-4xl">{title}</h2>
      {lead && <p className="mt-4 text-[16px] leading-relaxed text-muted lg:text-lg">{lead}</p>}
    </div>
  );
}
