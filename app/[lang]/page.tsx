import Image from "next/image";
import Link from "next/link";
import { photo, type PhotoKey } from "@/lib/photos";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { HOME, INDUSTRIES, PROCESS, SOFTWARE, TRACK_RECORD } from "@/lib/content";
import { SITE } from "@/lib/site";
import { REGION_MAP, bizCategoryLabel, isRegionId } from "@/lib/regions";
import { getBizPosts } from "@/lib/biz";
import { TradeTicker } from "@/components/TradeTicker";
import { HeroStage } from "@/components/HeroStage";
import { NetworkSection } from "@/components/NetworkSection";
import { CountUp } from "@/components/CountUp";
import { Icon } from "@/components/Icon";
import { SectionTitle } from "@/components/PageHero";
import { formatDate } from "@/lib/format";
import offices from "@/lib/offices.json";

const SERVICE_ICONS = ["briefcase", "chart", "handshake"];
const SERVICE_PHOTOS: PhotoKey[] = ["meeting", "ship", "tax"];
const SOFTWARE_PHOTOS: PhotoKey[] = ["devices", "blockchain", "dashboard"];

export default async function HomePage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  const ko = locale === "ko";
  // 헤드라인: 둘째 줄 첫 단어(글로벌마트)를 주황색으로 강조
  const heroLines = t(HOME.heroTitle).split("\n");
  const second = heroLines[1] ?? "";
  const cut = ko ? second.indexOf("와") : second.indexOf(" ");
  const heroFirst = cut > 0 ? second.slice(0, cut) : second;
  const heroRest = cut > 0 ? second.slice(cut) : "";
  const officeCount = offices.regions.reduce((n, r) => n + r.offices.length, 0);
  const latest = getBizPosts().slice(0, 5);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-paper text-ink">
        {/* 배경: 세계 지도 (서울 → 해외 거점 항로) */}
        <div className="bg-grid-light absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper to-transparent" aria-hidden />

        <HeroStage locale={locale} tag={t(HOME.heroTag)} defaultLine={heroLines[0]} highlight={heroFirst} rest={heroRest} officeCount={officeCount}>
            <p className="hero-lead reveal mt-3 max-w-[34em] text-pretty text-lead text-ink-3 lg:mt-[clamp(16px,0.6rem+1vw,36px)]">{t(HOME.heroLead)}</p>
            {/* 무엇을 하는 회사인지 한눈에: 핵심 서비스 4가지 */}
            <ul className="hero-tiles reveal mt-4 grid grid-cols-2 gap-[clamp(8px,0.3rem+0.5vw,16px)] sm:grid-cols-4 lg:mt-[clamp(24px,1rem+1.2vw,48px)] lg:grid-cols-2 xl:grid-cols-4">
              {HOME.heroServices.map((sv) => (
                <li key={sv.href}>
                  <Link
                    href={lp(locale, sv.href)}
                    className="group flex h-full items-center gap-3 rounded-2xl bg-white p-[clamp(12px,0.5rem+0.6vw,22px)] shadow-card ring-1 ring-line transition hover:-translate-y-0.5 hover:ring-ink sm:flex-col sm:items-start sm:gap-2.5"
                  >
                    <span className="grid size-[clamp(38px,1.8rem+0.7vw,52px)] shrink-0 place-items-center rounded-xl bg-ink text-sky transition group-hover:bg-accent group-hover:text-white">
                      <Icon name={sv.icon} className="size-[46%]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[clamp(14px,13px+0.2vw,18px)] font-bold leading-tight text-ink">{t(sv.label)}</span>
                      <span className="mt-0.5 block text-caption text-muted">{t(sv.sub)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="hero-ctas reveal mt-5 flex flex-wrap gap-3 lg:mt-[clamp(24px,1rem+1.4vw,52px)]">
              <Link href={lp(locale, "/contact#inquiry")} className="btn-primary btn-lg w-full sm:w-auto">
                {ko ? "상담 신청" : "Request a consultation"} <Icon name="arrow-right" className="size-4" />
              </Link>
              <a href={SITE.telHref} className="btn-ghost btn-lg hidden tabular-nums sm:inline-flex">
                <Icon name="phone" className="size-4" /> {ko ? SITE.tel : SITE.telIntl}
              </a>
            </div>
        </HeroStage>

        <div className="relative">
          <TradeTicker locale={locale} />
        </div>
      </section>

      {/* ---------------- SERVICES (PPT 3쪽) ---------------- */}
      <section className="relative bg-paper py-section">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionTitle eyebrow="What we do" title={ko ? "해외시장진출,\n세 가지 방법으로 함께합니다" : "Three ways we take\nyou abroad"} />
            <p data-reveal className="max-w-md text-body text-muted lg:text-right">
              {ko ? "아이템과 회사 상황에 맞는 방식을 고르세요. 어떤 방식이든 현지 전문 인력이 직접 움직입니다." : "Choose the model that fits your product and company. Whichever you choose, local specialists do the legwork."}
            </p>
          </div>
          <div className="mt-stack grid gap-grid md:grid-cols-3">
            {HOME.services.map((s, i) => (
              <Link
                key={s.no}
                href={lp(locale, s.href)}
                data-reveal
                style={{ "--d": `${i * 0.12}s` } as React.CSSProperties}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-line transition duration-500 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={photo(SERVICE_PHOTOS[i], 800)} alt="" fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                  <span className="absolute left-5 top-5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-widest text-white backdrop-blur">
                    {s.no}
                  </span>
                  <span className="absolute right-5 top-5 grid size-11 place-items-center rounded-2xl bg-white/90 text-ink shadow-card transition group-hover:bg-accent group-hover:text-white">
                    <Icon name={SERVICE_ICONS[i]} className="size-5" />
                  </span>
                  <h3 className="absolute inset-x-6 bottom-5 text-h3 font-extrabold text-white lg:text-[clamp(22px,0.8vw+12px,30px)]">{t(s.title)}</h3>
                </div>
                <div className="flex flex-1 flex-col p-[clamp(20px,1rem+0.6vw,32px)]">
                  <ul className="flex-1 space-y-2.5">
                    {s.points.map((pt, j) => (
                      <li key={j} className="flex gap-2.5 text-body text-ink-3">
                        <Icon name="check" className="mt-[0.3em] size-4 shrink-0 text-accent" strokeWidth={2.4} />
                        {t(pt)}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-6 border-t border-line pt-5">
                    <span className="link-arrow text-small">
                      {ko ? "자세히 보기" : "Learn more"}
                      <Icon name="arrow-right" className="size-4" />
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div data-reveal className="mt-grid flex flex-col items-start justify-between gap-4 rounded-2xl bg-ink px-[clamp(24px,2vw,40px)] py-[clamp(20px,1.4vw,28px)] text-white sm:flex-row sm:items-center">
            <p className="flex items-start gap-3 text-body font-medium sm:items-center">
              <span className="mt-[0.2em] shrink-0 whitespace-nowrap rounded-md bg-orange px-2.5 py-0.5 text-xs font-bold text-ink sm:mt-0">{ko ? "수수료" : "Fee"}</span>
              {t(HOME.fee)}
            </p>
            <a href={SITE.telHref} className="flex shrink-0 items-center gap-2 whitespace-nowrap text-lg font-bold tabular-nums text-sky hover:text-white">
              <Icon name="phone" className="size-5" />
              {ko ? "상담신청" : "Call"} {ko ? SITE.tel : SITE.telIntl}
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- TRACK RECORD (연혁 기반 실적) ---------------- */}
      <section className="dark-section bg-ink py-section text-white">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionTitle
              eyebrow="Track record"
              title={ko ? "현장에서 쌓아 온\n해외시장개척 실적" : "Proven on the ground,\nmarket by market"}
              lead={ko ? "2004년 설립 이후 아시아 각국에서 정부 프로젝트와 품목별 시장개척을 수행해 왔습니다." : "Since 2004 we have run government projects and product-by-product market development across Asia."}
            />
            <Link href={lp(locale, "/company/history")} className="btn-outline-light self-start lg:self-auto">
              {ko ? "연혁 전체 보기" : "Full history"} <Icon name="arrow-right" className="size-4" />
            </Link>
          </div>
          <div className="-mx-gutter mt-stack flex snap-x snap-mandatory scroll-px-gutter gap-grid overflow-x-auto px-gutter pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
            {TRACK_RECORD.map((r, i) => (
              <article
                key={r.year}
                data-reveal
                style={{ "--d": `${i * 0.1}s` } as React.CSSProperties}
                className="group relative aspect-[3/4] w-[78%] shrink-0 snap-start overflow-hidden rounded-3xl bg-ink sm:w-[45%] lg:w-auto"
              >
                <Image src={photo(r.photo, 900)} alt="" fill sizes="(min-width: 1024px) 22vw, 80vw" className="object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <div className="absolute inset-x-0 top-0 flex flex-col items-start gap-2 p-[clamp(20px,1rem+0.4vw,28px)]">
                  <span className="text-[clamp(32px,1.6rem+1.2vw,48px)] font-black leading-none tracking-[-0.04em] tabular-nums text-white/90">{r.year}</span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{t(r.place)}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-[clamp(20px,1rem+0.4vw,28px)] text-white">
                  <p className="text-h3 font-bold">{t(r.title)}</p>
                  <p className="mt-2 flex items-start gap-2 text-small text-white/75">
                    <Icon name="ship" className="mt-0.5 size-4 shrink-0 text-orange" />
                    {t(r.items)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- GLOBAL NETWORK + 개척 가능지역 (PPT 4쪽) ---------------- */}
      <NetworkSection locale={locale} />

      {/* ---------------- INDUSTRIES ---------------- */}
      <section className="relative overflow-hidden bg-paper py-section-sm">
        <div className="container-x grid gap-stack lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <SectionTitle
            eyebrow="Industries"
            title={ko ? "다뤄 온 품목과 관심 분야" : "Products and sectors we handle and target"}
            lead={
              ko
                ? "소비재부터 산업재, 정부 시스템과 소프트웨어까지. 유망한 중소기업 아이템이라면 분야를 가리지 않고 함께합니다."
                : "From consumer goods to industrial materials, government systems and software, we welcome promising SME products in any sector."
            }
          />
          <ul className="grid grid-cols-2 gap-[clamp(10px,0.4rem+0.5vw,18px)] sm:grid-cols-3 lg:grid-cols-5">
            {INDUSTRIES.map((it, i) => (
              <li
                key={i}
                data-reveal
                style={{ "--d": `${(i % 5) * 0.06}s` } as React.CSSProperties}
                className="group flex flex-col items-center gap-3 rounded-2xl bg-white px-3 py-[clamp(20px,1rem+0.6vw,32px)] text-center shadow-card ring-1 ring-line transition hover:-translate-y-0.5 hover:ring-ink"
              >
                <span className="grid size-[clamp(44px,2.4rem+0.6vw,56px)] place-items-center rounded-2xl bg-ink text-sky transition group-hover:bg-accent group-hover:text-white">
                  <Icon name={it.icon} className="size-[46%]" />
                </span>
                <span className="text-[clamp(14px,0.2vw+11px,16px)] font-semibold text-ink">{t(it.label)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- PROCESS (타임라인) ---------------- */}
      <section className="pt-section pb-section-sm">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionTitle
              eyebrow="Process"
              title={ko ? "조사에서 계약, 그 이후까지" : "From research to contract and beyond"}
              lead={ko ? "현지 주재원이 귀사의 해외지사가 되어 단계별로 움직입니다." : "Our local staff act as your branch office, step by step."}
            />
            <Link href={lp(locale, "/business/agency")} className="btn-ghost self-start lg:self-auto">
              {ko ? "사업내용 전체 보기" : "All services"} <Icon name="arrow-right" className="size-4" />
            </Link>
          </div>
          <ol className="relative mt-stack grid gap-8 md:grid-cols-4 md:gap-grid">
            <span className="absolute left-[clamp(22px,1.2rem+0.3vw,28px)] top-[clamp(22px,1.2rem+0.3vw,28px)] hidden h-0.5 w-[calc(100%-3rem)] bg-gradient-to-r from-accent via-sky to-orange md:block" aria-hidden />
            <span className="absolute bottom-6 left-[clamp(22px,1.2rem+0.3vw,28px)] top-6 w-0.5 bg-gradient-to-b from-accent via-sky to-orange md:hidden" aria-hidden />
            {[
              ...PROCESS.map((p) => ({ href: p.href, title: p.title, period: p.period })),
              { href: "/business/field-research", title: { ko: "해외출장조사", en: "Field research" }, period: { ko: "필요 시 · 회계 고객 연 1회", en: "As needed · yearly for accounting clients" } },
            ].map((p, i) => (
              <li key={i} data-reveal style={{ "--d": `${i * 0.12}s` } as React.CSSProperties} className="relative pl-[clamp(64px,3.5rem+0.6vw,76px)] md:pl-0">
                <span className="absolute left-0 top-0 grid size-[clamp(44px,2.4rem+0.6vw,56px)] place-items-center rounded-full bg-ink text-sm font-black tabular-nums text-orange ring-8 ring-white md:relative">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Link href={lp(locale, p.href)} className="group mt-0 block md:mt-6">
                  <span className="flex items-center gap-2 text-h3 font-bold decoration-accent underline-offset-4 group-hover:underline">
                    {t(p.title)}
                    <Icon name="arrow-up-right" className="size-4 text-accent opacity-0 transition group-hover:opacity-100" />
                  </span>
                  <span className="mt-1 block text-small text-muted">{t(p.period)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- PROMISING ITEMS + BIZ INFO (PPT 5쪽) ---------------- */}
      <section className="pb-section pt-section-sm">
        <div className="container-x grid gap-stack lg:grid-cols-2 lg:gap-[clamp(48px,2rem+2vw,96px)] [&>*]:min-w-0">
          <div>
            <SectionTitle eyebrow="Opportunities" title={t(HOME.itemsTitle)} />
            <ol className="mt-[clamp(28px,1.3rem+1.4vw,52px)] space-y-[clamp(12px,0.5rem+0.4vw,20px)]">
              {HOME.items.map((it, i) => (
                <li key={i} data-reveal style={{ "--d": `${i * 0.1}s` } as React.CSSProperties} className="flex gap-5 rounded-2xl border border-line p-[clamp(20px,1rem+0.6vw,32px)]">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
                  <div>
                    <h3 className="text-h3 font-bold">{t(it.title)}</h3>
                    <p className="mt-1.5 text-body text-muted">{t(it.body)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div data-reveal className="flex flex-col rounded-3xl bg-paper p-5 sm:p-[clamp(28px,1.4rem+1vw,48px)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Global Biz Info</p>
                <h2 className="mt-3 text-[clamp(24px,1.2rem+0.9vw,38px)] font-extrabold leading-tight tracking-tight">{t(HOME.bizCta.title)}</h2>
              </div>
              <Link href={lp(locale, "/biz")} className="btn-ghost btn-sm shrink-0">
                {ko ? "전체 보기" : "View all"}
              </Link>
            </div>
            <p className="mt-3 text-body text-muted">{t(HOME.bizCta.body)}</p>
            {!ko && <p className="mt-2 text-[13px] font-semibold text-orange-ink">Posts are written in Korean.</p>}
            <ul className="mt-6 flex-1 divide-y divide-line rounded-2xl bg-white">
              {latest.length === 0 && (
                <li className="p-6 text-center text-sm text-muted">{ko ? "등록된 글이 없습니다." : "No posts yet."}</li>
              )}
              {latest.map((p) => (
                <li key={p.id}>
                  <Link href={lp(locale, `/biz/${p.id}`)} className="group flex items-center gap-4 px-4 py-4 transition hover:bg-paper sm:px-5">
                    <span className="flex min-w-0 flex-1 flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                      <span
                        className={`shrink-0 rounded-md px-2 py-1 text-center text-[11px] font-bold sm:w-[68px] sm:px-0 ${
                          p.category === "inquiry" ? "bg-orange/15 text-orange-ink" : "bg-accent/10 text-ink"
                        }`}
                      >
                        {t(bizCategoryLabel(p.category))}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span lang={ko ? undefined : "ko"} className="line-clamp-2 text-[15px] font-semibold leading-snug decoration-accent underline-offset-4 group-hover:underline sm:line-clamp-1">
                          {p.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {isRegionId(p.region) ? t(REGION_MAP[p.region].label) : p.region}
                          {p.country && ` · ${p.country}`} · {formatDate(p.created_at, locale)}
                        </span>
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
      <section className="bg-paper py-section-sm">
        <div className="container-x grid items-center gap-stack lg:grid-cols-[1fr_1.3fr]">
          <SectionTitle eyebrow="Software Trading" title={ko ? "한국 소프트웨어를\n세계로" : "Korean software,\nworldwide"} lead={t(SOFTWARE.lead)} />
          <div className="grid gap-grid sm:grid-cols-3">
            {SOFTWARE.sections.map((s, i) => (
              <Link
                key={s.id}
                data-reveal
                style={{ "--d": `${i * 0.12}s` } as React.CSSProperties}
                href={lp(locale, `/business/software#${s.id}`)}
                className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={photo(SOFTWARE_PHOTOS[i], 600)} alt="" fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-[clamp(20px,1rem+0.4vw,28px)]">
                  <h3 className="text-h3 font-bold">{t(s.title)}</h3>
                  <p className="mt-2 line-clamp-3 text-small text-muted">{t(s.paragraphs[0])}</p>
                  <span className="mt-auto pt-4">
                    <span className="link-arrow text-small">
                      {ko ? "자세히" : "More"} <Icon name="arrow-right" className="size-4" />
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CONTACT (PPT 6쪽) ---------------- */}
      <section className="py-section">
        <div className="container-x">
          <div data-reveal className="relative overflow-hidden rounded-3xl bg-ink px-[clamp(24px,4vw,72px)] py-[clamp(48px,4.5vw,96px)] text-white">
            <Image src={photo("cranes", 2000)} alt="" fill sizes="(min-width: 1280px) 84vw, 100vw" className="object-cover opacity-25 grayscale" />
            <div className="absolute -right-24 -top-24 size-80 rounded-full bg-accent/20 blur-2xl" aria-hidden />
            <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <h2 className="text-h2 text-white">
                  {ko ? "지금 해외시장 진출을 상담하세요" : "Let's talk about your next market"}
                </h2>
                <p className="mt-4 max-w-[34em] text-lead text-white/75">
                  {ko
                    ? "아이템과 목표 국가를 알려 주시면 가능한 진행 방식과 예상 일정을 안내해 드립니다."
                    : "Tell us about your product and target countries, and we will suggest how to proceed and a likely timeline."}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={lp(locale, "/contact#inquiry")} className="btn-light btn-lg">
                    {ko ? "온라인 상담 신청" : "Send an inquiry"} <Icon name="arrow-right" className="size-4" />
                  </Link>
                  <a href={`mailto:${SITE.email}`} className="btn-outline-light btn-lg">
                    <Icon name="mail" className="size-4" /> {SITE.email}
                  </a>
                </div>
              </div>
              <dl className="space-y-4 rounded-2xl bg-white/10 p-[clamp(24px,1.2rem+0.6vw,36px)] text-body backdrop-blur">
                <div className="flex gap-3">
                  <dt className="mt-0.5 shrink-0">
                    <Icon name="pin" className="size-5 text-white/70" />
                    <span className="sr-only">{ko ? "주소" : "Address"}</span>
                  </dt>
                  <dd>
                    {t(SITE.address)}
                    <span className="mt-0.5 block text-sm text-white/65">{t(SITE.directions)}</span>
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="mt-0.5 shrink-0">
                    <Icon name="phone" className="size-5 text-white/70" />
                    <span className="sr-only">{ko ? "전화" : "Phone"}</span>
                  </dt>
                  <dd>
                    <a href={SITE.telHref} className="whitespace-nowrap font-bold tabular-nums hover:underline">
                      {ko ? SITE.tel : SITE.telIntl}
                    </a>
                    <span className="ml-2 text-sm text-white/65">{t(SITE.hours)}</span>
                  </dd>
                </div>
                <div className="flex gap-3 border-t border-white/15 pt-4">
                  <dt className="mt-0.5 shrink-0">
                    <Icon name="handshake" className="size-5 text-white/70" />
                    <span className="sr-only">{ko ? "제휴" : "Partners"}</span>
                  </dt>
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
