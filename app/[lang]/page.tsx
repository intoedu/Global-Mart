import Image from "next/image";
import Link from "next/link";
import { photo, type PhotoKey } from "@/lib/photos";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { HOME, TRACK_RECORD } from "@/lib/content";
import { SITE } from "@/lib/site";
import { TradeTicker } from "@/components/TradeTicker";
import { HeroStage } from "@/components/HeroStage";
import { NetworkSection } from "@/components/NetworkSection";
import { Icon } from "@/components/Icon";
import { SectionTitle } from "@/components/PageHero";
import offices from "@/lib/offices.json";

const SERVICE_ICONS = ["briefcase", "chart", "handshake"];
const SERVICE_PHOTOS: PhotoKey[] = ["meeting", "ship", "tax"];

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
              <Link href={lp(locale, "/contact")} className="btn-primary btn-lg w-full sm:w-auto">
                {ko ? "상담 문의" : "Contact us"} <Icon name="arrow-right" className="size-4" />
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
      <section className="relative bg-paper pb-section pt-[clamp(28px,1rem+1.6vw,56px)]">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionTitle eyebrow="What we do" title={ko ? "해외시장진출,\n세 가지 방법으로 함께합니다" : "Three ways we take\nyou abroad"} />
            <p data-reveal className="max-w-md text-body text-muted lg:text-right">
              {ko ? "아이템과 회사 상황에 맞는 방식을 고르세요. 어떤 방식이든 현지 전문 인력이 함께 합니다." : "Choose the model that fits your product and company. Whichever you choose, local specialists work with you."}
            </p>
          </div>
          <div className="mt-[clamp(24px,1rem+1.2vw,48px)] grid gap-grid md:grid-cols-3">
            {HOME.services.map((s, i) => (
              <Link
                key={s.no}
                href={lp(locale, s.href)}
                data-reveal
                style={{ "--d": `${i * 0.12}s` } as React.CSSProperties}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-line transition duration-500 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="relative aspect-[16/9] overflow-hidden lg:aspect-[2/1]">
                  <Image src={photo(SERVICE_PHOTOS[i], 800)} alt="" fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                  <span className="absolute left-5 top-5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-widest text-white backdrop-blur">
                    {s.no}
                  </span>
                  <span className="absolute right-5 top-5 grid size-11 place-items-center rounded-2xl bg-white/90 text-ink shadow-card transition group-hover:bg-accent group-hover:text-white">
                    <Icon name={SERVICE_ICONS[i]} className="size-5" />
                  </span>
                  <h3 className="absolute inset-x-6 bottom-4 whitespace-pre-line text-h3 font-extrabold leading-snug text-white lg:text-[clamp(20px,0.7vw+11px,28px)]">{t(s.title)}</h3>
                </div>
                <div className="flex flex-1 flex-col p-[clamp(18px,0.9rem+0.5vw,28px)]">
                  <ul className="flex-1 space-y-2">
                    {s.points.map((pt, j) => (
                      <li key={j} className="flex gap-2.5 text-body text-ink-3">
                        <Icon name="check" className="mt-[0.3em] size-4 shrink-0 text-accent" strokeWidth={2.4} />
                        {t(pt)}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-4 border-t border-line pt-4">
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

      {/* ---------------- 주요활동 (연혁 기반) ---------------- */}
      <section className="dark-section bg-ink py-section text-white">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionTitle
              eyebrow="Key activities"
              title={ko ? "현장에서 수행해 온\n해외시장개척 활동" : "Market development work\ncarried out on the ground"}
              lead={ko ? "2004년 설립 이후 말레이시아, 인도, 베트남, 터키 등에서 해외시장개척 활동을 수행해 왔습니다." : "Since 2004 we have carried out market development activities in Malaysia, India, Vietnam, Turkey and more."}
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

      {/* ---------------- PROCESS (타임라인) ---------------- */}
      <section className="pt-section pb-section-sm">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionTitle
              eyebrow="Process"
              title={ko ? "해외지사대행" : "Overseas Branch Agency"}
              lead={
                ko
                  ? "해외시장개척 전략을 “고객사-글로벌마트 본사-해외주재원”이 공동으로 수립한 후, 글로벌마트 해외주재원이 귀사의 해외주재원이 되어 해외시장개척 업무를 단계별로 수행합니다. 다음의 절차는 그 예시입니다."
                  : "Your company, Globalmart headquarters and our overseas staff draw up the market development strategy together. Globalmart's overseas staff then become your overseas staff and carry out the work step by step. The steps below are an example."
              }
            />
            <Link href={lp(locale, "/business/agency")} className="btn-ghost self-start lg:self-auto">
              {ko ? "사업내용 전체 보기" : "All services"} <Icon name="arrow-right" className="size-4" />
            </Link>
          </div>
          <ol className="relative mt-stack grid gap-8 md:grid-cols-4 md:gap-grid">
            <span className="absolute left-[clamp(22px,1.2rem+0.3vw,28px)] top-[clamp(22px,1.2rem+0.3vw,28px)] hidden h-0.5 w-[calc(100%-3rem)] bg-gradient-to-r from-accent via-sky to-orange md:block" aria-hidden />
            <span className="absolute bottom-6 left-[clamp(22px,1.2rem+0.3vw,28px)] top-6 w-0.5 bg-gradient-to-b from-accent via-sky to-orange md:hidden" aria-hidden />
            {[
              { href: "/business/agency", title: { ko: "해외지사대행 계획수립", en: "Branch agency planning" }, period: { ko: "약1개월", en: "About 1 month" } },
              { href: "/business/research", title: { ko: "해외시장조사", en: "Market research" }, period: { ko: "약1개월", en: "About 1 month" } },
              { href: "/business/buyers", title: { ko: "인허가, 바이어발굴 등 해외지사대행", en: "Branch agency: permits, buyer discovery, etc." }, period: { ko: "1개월-4개월", en: "1–4 months" } },
              { href: "/business/branch", title: { ko: "해외지사대행에서 무역대행으로 전환", en: "From branch agency to trade agency" }, period: null },
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
                  {p.period && <span className="mt-1 block text-small text-muted">{t(p.period)}</span>}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- 해외 Biz정보 (회원 전용 — 글 제목은 공개하지 않음) ---------------- */}
      <section className="pb-[clamp(32px,1rem+2vw,64px)] pt-0">
        <div className="container-x">
          <div data-reveal className="grid gap-6 rounded-3xl bg-paper p-6 sm:p-[clamp(28px,1.4rem+1.2vw,56px)] lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow">Global Biz Info</p>
              <h2 className="mt-3 text-h2">{t(HOME.bizCta.title)}</h2>
              <p className="mt-4 max-w-[38em] text-body text-muted">{t(HOME.bizCta.body)}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {[{ ko: "해외시장", en: "Overseas markets" }, { ko: "해외입찰", en: "Overseas tenders" }].map((c) => (
                  <li key={c.ko} className="rounded-full bg-white px-3.5 py-1.5 text-small font-semibold text-ink-3 ring-1 ring-line">
                    {t(c)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start gap-4 rounded-2xl bg-ink p-6 text-white lg:p-8">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-sky">
                <Icon name="lock" className="size-6" />
              </span>
              <p className="text-h3 font-bold">{ko ? "회원 전용 게시판" : "Members-only board"}</p>
              <p className="text-small text-white/65">
                {ko ? "글로벌마트에서 받은 회원 비밀번호를 입력한 후 이용할 수 있습니다." : "Enter the member password provided by Globalmart to view the posts."}
              </p>
              <Link href={lp(locale, "/biz")} className="btn-light btn-sm">
                {ko ? "회원 로그인" : "Member login"} <Icon name="arrow-right" className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- CONTACT (PPT 6쪽) ---------------- */}
      <section className="pb-section pt-0">
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
                  <a href={SITE.telHref} className="btn-light btn-lg tabular-nums">
                    <Icon name="phone" className="size-4" /> {ko ? `전화 상담 ${SITE.tel}` : `Call ${SITE.telIntl}`}
                  </a>
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
