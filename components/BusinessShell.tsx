import Link from "next/link";
import { NAV, SITE } from "@/lib/site";
import { lp } from "@/lib/paths";
import type { Locale } from "@/lib/i18n";
import { PageHero } from "./PageHero";
import { SectionNav } from "./SectionNav";
import { Icon } from "./Icon";

/** 사업내용 공통 레이아웃: 상단 제목 + 하위 탭 + 본문 + 이전/다음 + 상담 CTA */
export function BusinessShell({
  locale,
  current,
  eyebrow,
  lead,
  image,
  children,
}: {
  image?: import("@/lib/photos").PhotoKey;
  locale: Locale;
  current: string;
  eyebrow: string;
  lead?: string;
  children: React.ReactNode;
}) {
  const ko = locale === "ko";
  const items = NAV.find((n) => n.href.startsWith("/business"))!.children!;
  const idx = items.findIndex((i) => i.href === current);
  const prev = items[idx - 1];
  const next = items[idx + 1];

  return (
    <>
      <PageHero
        locale={locale}
        image={image}
        eyebrow={eyebrow}
        title={items[idx].label[locale]}
        lead={lead}
        crumbs={[{ label: ko ? "사업내용" : "Services" }, { label: items[idx].label[locale] }]}
      />
      <SectionNav section="/business" current={current} locale={locale} />
      {children}
      <section className="border-t border-line py-[clamp(40px,1.5rem+2vw,72px)]">
        <div className="container-x grid gap-grid sm:grid-cols-2">
          {prev ? (
            <Link href={lp(locale, prev.href)} className="group rounded-2xl border border-line p-[clamp(20px,1.6vw,28px)] transition hover:border-ink">
              <span className="flex items-center gap-1 text-small text-muted">
                <Icon name="chevron-left" className="size-4 text-accent" /> {ko ? "이전" : "Previous"}
              </span>
              <span className="mt-1 block text-h3 text-ink decoration-accent underline-offset-4 group-hover:underline">{prev.label[locale]}</span>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          {next && (
            <Link href={lp(locale, next.href)} className="group rounded-2xl border border-line p-[clamp(20px,1.6vw,28px)] text-right transition hover:border-ink">
              <span className="flex items-center justify-end gap-1 text-small text-muted">
                {ko ? "다음" : "Next"} <Icon name="chevron-right" className="size-4 text-accent" />
              </span>
              <span className="mt-1 block text-h3 text-ink decoration-accent underline-offset-4 group-hover:underline">{next.label[locale]}</span>
            </Link>
          )}
        </div>
        <div className="container-x mt-grid">
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-ink px-[clamp(28px,2.4vw,48px)] py-[clamp(28px,2vw,40px)] text-white sm:flex-row sm:items-center">
            <div>
              <p className="text-h3">{ko ? "우리 회사 아이템도 가능할까요?" : "Could this work for your product?"}</p>
              <p className="mt-1 text-body text-white/65">
                {ko ? `전화 ${SITE.tel} 또는 온라인으로 문의해 주세요.` : `Call ${SITE.telIntl} or send us an inquiry online.`}
              </p>
            </div>
            <Link href={lp(locale, "/contact#inquiry")} className="btn-light btn-lg shrink-0">
              {ko ? "상담 신청" : "Send an inquiry"} <Icon name="arrow-right" className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function FeatureGrid({
  items,
  locale,
  numbered,
  cols = 2,
}: {
  items: { title: { ko: string; en: string }; body: { ko: string; en: string } }[];
  locale: Locale;
  numbered?: boolean;
  cols?: 2 | 3 | 4;
}) {
  const grid = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[cols];
  return (
    <ol className={`grid gap-grid ${grid}`}>
      {items.map((it, i) => (
        <li key={i} data-reveal style={{ "--d": `${i * 0.1}s` } as React.CSSProperties} className="card relative p-[clamp(24px,1.95vw,40px)]">
          {numbered ? (
            <span className="grid size-10 place-items-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
          ) : (
            <span className="grid size-10 place-items-center rounded-xl bg-ink text-accent">
              <Icon name="check" className="size-5" strokeWidth={2.4} />
            </span>
          )}
          <h3 className="mt-5 text-h3">{it.title[locale]}</h3>
          <p className="mt-2 text-body text-muted">{it.body[locale]}</p>
        </li>
      ))}
    </ol>
  );
}
