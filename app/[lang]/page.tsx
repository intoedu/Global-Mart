import Image from "next/image";
import Link from "next/link";
import { photo, type PhotoKey } from "@/lib/photos";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { HOME, PROCESS, SOFTWARE } from "@/lib/content";
import { SITE } from "@/lib/site";
import { REGION_MAP, bizCategoryLabel, isRegionId } from "@/lib/regions";
import { getBizPosts } from "@/lib/biz";
import { WorldMap } from "@/components/WorldMap";
import { TradeTicker } from "@/components/TradeTicker";
import { NetworkSection } from "@/components/NetworkSection";
import { CountUp } from "@/components/CountUp";
import { Icon } from "@/components/Icon";
import { SectionTitle } from "@/components/PageHero";
import { formatDate } from "@/lib/format";

const SERVICE_ICONS = ["briefcase", "chart", "handshake"];
const HERO_LABELS = ["seoul", "vietnam", "mumbai", "russia", "uzbekistan", "egypt", "indonesia"];
const SERVICE_PHOTOS: PhotoKey[] = ["meeting", "ship", "tax"];
const SOFTWARE_PHOTOS: PhotoKey[] = ["devices", "blockchain", "dashboard"];

export default async function HomePage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  const ko = locale === "ko";
  const latest = getBizPosts().slice(0, 5);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-ink text-white">
        {/* 배경: 화면 전체 세계 지도 (서울 → 해외 거점 항로) */}
        <div className="bg-grid absolute inset-0 opacity-70" aria-hidden />
        <div className="absolute -left-40 top-10 size-[560px] rounded-full bg-brand/40 blur-[140px]" aria-hidden />
        <div className="reveal absolute right-[-70%] top-[46%] w-[200%] -translate-y-1/2 opacity-70 sm:right-[-30%] sm:w-[140%] lg:right-[3%] lg:top-[47%] lg:w-[74%] lg:opacity-100">
          <WorldMap locale={locale} labels={HERO_LABELS} animated />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/0 lg:from-ink lg:via-ink/40" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" aria-hidden />

        <div className="container-x relative pb-24 pt-28 lg:pb-40 lg:pt-44">
          <div className="max-w-2xl">
            <p className="eyebrow reveal !text-sky">Globalmart Inc. · Since 2004</p>
            <h1 className="reveal mt-5 whitespace-pre-line text-[40px] font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-[64px]">
              {t(HOME.heroTitle)}
            </h1>
            <p className="reveal mt-6 max-w-xl text-[17px] leading-relaxed text-white/75 lg:text-lg">{t(HOME.heroLead)}</p>
            <div className="reveal mt-9 flex flex-wrap gap-3">
              <Link href={lp(locale, "/contact#inquiry")} className="btn-light btn-shine">
                {ko ? "무료 상담 신청" : "Free consultation"} <Icon name="arrow-right" className="size-4" />
              </Link>
              <a href={SITE.telHref} className="btn-outline-light">
                <Icon name="phone" className="size-4" /> {ko ? SITE.tel : SITE.telIntl}
              </a>
            </div>
            <p className="reveal mt-10 text-xs text-white/50">
              <span className="text-accent">●</span> {ko ? "서울 본사" : "Seoul HQ"}
              <span className="ml-3 text-sky">●</span> {ko ? "해외 거점" : "Overseas offices"}
            </p>
          </div>
        </div>

        <div className="relative">
          <TradeTicker locale={locale} />
        </div>
        <div className="relative">
          <dl className="container-x grid grid-cols-2 lg:grid-cols-4">
            {HOME.stats.map((s, i) => (
              <div
                key={i}
                className={`py-6 lg:py-8 ${i % 2 ? "pl-6" : ""} ${i > 1 ? "border-t border-white/10 lg:border-t-0" : ""} ${
                  i > 0 ? "lg:border-l lg:border-white/10 lg:pl-8" : ""
                }`}
              >
                <dt className="text-[13px] text-white/50">{t(s.label)}</dt>
                <dd className="mt-1 text-2xl font-extrabold tracking-tight lg:text-3xl">
                  {typeof s.value === "string" ? <CountUp value={s.value} /> : t(s.value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------- SERVICES (PPT 3쪽) ---------------- */}
      <section className="bg-paper py-20 lg:py-28">
        <div className="container-x">
          <SectionTitle
            eyebrow={ko ? "What we do" : "What we do"}
            title={ko ? "해외시장진출,\n세 가지 방법으로 함께합니다" : "Three ways we take\nyou abroad"}
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {HOME.services.map((s, i) => (
              <Link
                key={s.no}
                href={lp(locale, s.href)}
                data-reveal
                style={{ "--d": `${i * 0.12}s` } as React.CSSProperties}
                className="card group relative flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={photo(SERVICE_PHOTOS[i], 800)}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-7 lg:p-8">
                <div className="flex items-center justify-between">
                  <span className="-mt-14 grid size-12 place-items-center rounded-2xl bg-white text-brand shadow-card ring-4 ring-white transition group-hover:bg-brand group-hover:text-white">
                    <Icon name={SERVICE_ICONS[i]} className="size-6" />
                  </span>
                  <span className="text-3xl font-black text-line">{s.no}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-ink">{t(s.title)}</h3>
                <ul className="mt-4 flex-1 space-y-2.5">
                  {s.points.map((p, j) => (
                    <li key={j} className="flex gap-2.5 text-[15px] text-ink-3">
                      <Icon name="check" className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={2.4} />
                      {t(p)}
                    </li>
                  ))}
                </ul>
                <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                  {ko ? "자세히 보기" : "Learn more"}
                  <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-1" />
                </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl bg-ink px-7 py-6 text-white sm:flex-row sm:items-center lg:px-8">
            <p className="flex items-center gap-3 text-[16px] font-medium">
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-ink">{ko ? "수수료" : "Fee"}</span>
              {t(HOME.fee)}
            </p>
            <a href={SITE.telHref} className="flex items-center gap-2 text-lg font-bold text-sky hover:text-white">
              <Icon name="phone" className="size-5" />
              {ko ? "상담신청" : "Call"} {SITE.tel}
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- GLOBAL NETWORK (세계 지도) ---------------- */}
      <NetworkSection locale={locale} />

      {/* ---------------- PROCESS ---------------- */}
      <section className="py-20 lg:py-28">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionTitle
              eyebrow="Process"
              title={ko ? "조사에서 계약, 그 이후까지" : "From research to contract and beyond"}
              lead={
                ko
                  ? "현지 주재원이 귀사의 해외지사가 되어 단계별로 움직입니다."
                  : "Our local staff act as your branch office, step by step."
              }
            />
            <Link href={lp(locale, "/business/agency")} className="btn-ghost self-start lg:self-auto">
              {ko ? "사업내용 전체 보기" : "All services"} <Icon name="arrow-right" className="size-4" />
            </Link>
          </div>
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {PROCESS.map((p, i) => (
              <li key={p.key} data-reveal style={{ "--d": `${i * 0.12}s` } as React.CSSProperties}>
                <Link href={lp(locale, p.href)} className="group relative block h-full rounded-2xl border border-line p-7 transition hover:border-brand">
                  <span className="text-sm font-bold text-brand">STEP {i + 1}</span>
                  <h3 className="mt-2 text-xl font-bold">{t(p.title)}</h3>
                  <p className="mt-1 text-sm text-muted">{t(p.period)}</p>
                  {i < PROCESS.length - 1 && (
                    <span className="absolute -right-3 top-1/2 z-10 hidden size-6 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-brand md:grid">
                      <Icon name="chevron-right" className="size-3.5" strokeWidth={2.5} />
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ol>
          <Link
            href={lp(locale, "/business/field-research")}
            className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-brand-soft px-7 py-5 text-ink transition hover:bg-brand hover:text-white"
          >
            <span className="flex items-center gap-3 font-semibold">
              <Icon name="plane" className="size-5" />
              {ko ? "해외출장조사 — 현지를 직접 보고 바이어를 만나는 프로그램" : "Field research trips — see the market and meet buyers in person"}
            </span>
            <Icon name="arrow-right" className="size-5 shrink-0" />
          </Link>
        </div>
      </section>

      {/* ---------------- REGIONS (PPT 4쪽) ---------------- */}
      <section className="relative overflow-hidden bg-ink-2 py-20 text-white lg:py-28">
        <Image src={photo("earth", 2400)} alt="" fill sizes="100vw" className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-2/80 via-ink-2/60 to-ink-2/90" aria-hidden />
        <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow !text-sky">Coverage</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">{t(HOME.regionsTitle)}</h2>
            <p className="mt-5 text-[16px] leading-relaxed text-white/70">{t(HOME.regionsLead)}</p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {HOME.regions.map((r, i) => (
                <li key={i} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[15px] font-semibold">
                  {t(r)}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={lp(locale, "/offices")} className="btn-light">
                {ko ? "해외지사 현황" : "Our offices"} <Icon name="arrow-right" className="size-4" />
              </Link>
              <Link href={lp(locale, "/company/partners")} className="btn-outline-light">
                {ko ? "제휴기관 소개" : "About IRDCA"}
              </Link>
            </div>
          </div>
          <WorldMap locale={locale} showArcs={false} />
        </div>
      </section>

      {/* ---------------- PROMISING ITEMS + BIZ INFO (PPT 5쪽) ---------------- */}
      <section className="py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-16 [&>*]:min-w-0">
          <div>
            <SectionTitle eyebrow="Opportunities" title={t(HOME.itemsTitle)} />
            <ol className="mt-10 space-y-4">
              {HOME.items.map((it, i) => (
                <li key={i} data-reveal style={{ "--d": `${i * 0.1}s` } as React.CSSProperties} className="flex gap-5 rounded-2xl border border-line p-6">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
                  <div>
                    <h3 className="text-lg font-bold">{t(it.title)}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{t(it.body)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div data-reveal className="flex flex-col rounded-3xl bg-paper p-7 lg:p-9">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Global Biz Info</p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight lg:text-3xl">{t(HOME.bizCta.title)}</h2>
              </div>
              <Link href={lp(locale, "/biz")} className="btn-primary shrink-0 !px-4 !py-2.5 !text-sm">
                {ko ? "전체 보기" : "View all"}
              </Link>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{t(HOME.bizCta.body)}</p>
            <ul className="mt-6 flex-1 divide-y divide-line rounded-2xl bg-white">
              {latest.length === 0 && (
                <li className="p-6 text-center text-sm text-muted">{ko ? "등록된 글이 없습니다." : "No posts yet."}</li>
              )}
              {latest.map((p) => (
                <li key={p.id}>
                  <Link href={lp(locale, `/biz/${p.id}`)} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-brand-soft/50">
                    <span
                      className={`w-[68px] shrink-0 rounded-md py-1 text-center text-[11px] font-bold ${
                        p.category === "inquiry" ? "bg-accent/15 text-[#a8661a]" : "bg-brand-soft text-brand"
                      }`}
                    >
                      {t(bizCategoryLabel(p.category))}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold group-hover:text-brand">{p.title}</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {isRegionId(p.region) ? t(REGION_MAP[p.region].label) : p.region}
                        {p.country && ` · ${p.country}`} · {formatDate(p.created_at)}
                      </span>
                    </span>
                    <Icon name="chevron-right" className="size-4 shrink-0 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- SOFTWARE ---------------- */}
      <section className="bg-paper py-20 lg:py-24">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[1fr_1.3fr]">
          <SectionTitle eyebrow="Software Trading" title={ko ? "한국 소프트웨어를\n세계로" : "Korean software,\nworldwide"} lead={t(SOFTWARE.lead)} />
          <div className="grid gap-4 sm:grid-cols-3">
            {SOFTWARE.sections.map((s, i) => (
              <Link
                key={s.id}
                data-reveal
                style={{ "--d": `${i * 0.12}s` } as React.CSSProperties}
                href={lp(locale, `/business/software#${s.id}`)}
                className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={photo(SOFTWARE_PHOTOS[i], 600)} alt="" fill sizes="(min-width: 640px) 25vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-bold">{t(s.title)}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{t(s.paragraphs[0])}</p>
                <span className="mt-4 text-sm font-semibold text-brand">{ko ? "자세히" : "More"} →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CONTACT (PPT 6쪽) ---------------- */}
      <section className="py-20 lg:py-28">
        <div className="container-x">
          <div data-reveal className="relative overflow-hidden rounded-[28px] bg-brand px-7 py-12 text-white sm:px-12 lg:px-16 lg:py-16">
            <Image src={photo("cranes", 2000)} alt="" fill sizes="100vw" className="object-cover opacity-20 mix-blend-luminosity" />
            <div className="absolute -right-24 -top-24 size-80 rounded-full bg-white/10" aria-hidden />
            <div className="absolute -bottom-32 right-32 size-64 rounded-full bg-ink/20" aria-hidden />
            <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
                  {ko ? "지금 해외시장 진출을 상담하세요" : "Let's talk about your next market"}
                </h2>
                <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-white/80">
                  {ko
                    ? "아이템과 목표 국가를 알려 주시면 가능한 진행 방식과 예상 일정을 안내해 드립니다."
                    : "Tell us about your product and target countries, and we will suggest how to proceed and a likely timeline."}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={lp(locale, "/contact#inquiry")} className="btn-light">
                    {ko ? "온라인 상담 신청" : "Send an inquiry"} <Icon name="arrow-right" className="size-4" />
                  </Link>
                  <a href={`mailto:${SITE.email}`} className="btn-outline-light">
                    <Icon name="mail" className="size-4" /> {SITE.email}
                  </a>
                </div>
              </div>
              <dl className="space-y-4 rounded-2xl bg-white/10 p-6 text-[15px] backdrop-blur lg:p-7">
                <div className="flex gap-3">
                  <Icon name="pin" className="mt-0.5 size-5 shrink-0 text-white/70" />
                  <div>
                    <dt className="sr-only">{ko ? "주소" : "Address"}</dt>
                    <dd>
                      {t(SITE.address)}
                      <span className="mt-0.5 block text-sm text-white/65">{t(SITE.directions)}</span>
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Icon name="phone" className="mt-0.5 size-5 shrink-0 text-white/70" />
                  <dd>
                    <a href={SITE.telHref} className="font-bold hover:underline">
                      {SITE.tel}
                    </a>
                    <span className="ml-2 text-sm text-white/65">{t(SITE.hours)}</span>
                  </dd>
                </div>
                <div className="flex gap-3 border-t border-white/15 pt-4">
                  <Icon name="handshake" className="mt-0.5 size-5 shrink-0 text-white/70" />
                  <dd className="text-sm leading-relaxed text-white/80">
                    {ko ? "제휴기업" : "Partner firm"} · {t(SITE.partners.company)}
                    <br />
                    {ko ? "제휴기관" : "Partner institution"} · {t(SITE.partners.institution)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
