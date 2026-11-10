import Link from "next/link";
import { getImageProps } from "next/image";
import { photo, type PhotoKey } from "@/lib/photos";
import { lp } from "@/lib/paths";
import type { Locale } from "@/lib/i18n";
import { Icon } from "./Icon";

export { SubNav } from "./SubNav";

type Crumb = { href?: string; label: string };

/** 1×1 투명 GIF — 휴대폰(사진을 숨기는 폭)에서는 사진을 내려받지 않도록 <img> 기본값으로 사용 */
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** 서브페이지 상단 타이틀 영역 — 의뢰 요청사항: "'제목'을 페이지 상단에 위치" */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  image,
  locale = "ko",
  titleAs = "h1",
  children,
}: {
  image?: PhotoKey;
  locale?: Locale;
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs?: Crumb[];
  /** 본문에 따로 h1 이 있는 페이지(게시글 등)는 "p" */
  titleAs?: "h1" | "p";
  children?: React.ReactNode;
}) {
  const Title = titleAs;
  // 사진은 md(768px) 이상에서만 보이므로 <picture> 로 그 폭에서만 내려받게 함 (미리 불러오기 없음)
  // 패널이 세로로 길어 object-cover 로 잘리므로 패널 폭보다 넉넉한 크기를 요청
  const sizes = "(min-width: 1280px) 50vw, 640px";
  const srcSet = image ? getImageProps({ src: photo(image, 1600), alt: "", fill: true, sizes }).props.srcSet : undefined;
  return (
    <section className="relative overflow-hidden bg-paper pt-(--header-h) text-ink">
      {image && (
        <div className="absolute inset-y-0 right-0 hidden w-[44%] md:block" aria-hidden>
          <picture>
            <source media="(min-width: 768px)" srcSet={srcSet} sizes={sizes} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BLANK} alt="" fetchPriority="high" decoding="async" className="absolute inset-0 size-full object-cover" />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-r from-ink/20 to-transparent to-30%" />
        </div>
      )}
      <div className="bg-grid-light absolute inset-0 [mask-image:linear-gradient(90deg,#000_30%,transparent_56%)]" aria-hidden />
      <div
        className={
          image
            ? "container-x relative flex flex-col justify-center py-[clamp(40px,1.5rem+3vw,96px)] md:min-h-[clamp(300px,15rem+12vw,560px)]"
            : "container-x relative py-[clamp(28px,1.6vw+12px,64px)]"
        }
      >
        <div className={image ? "md:max-w-[calc(56%-var(--spacing-gutter))]" : undefined}>
          {crumbs && (
            <nav aria-label={locale === "ko" ? "현재 위치" : "Breadcrumb"} className="mb-[clamp(16px,1rem+1vw,40px)] flex flex-wrap items-center gap-1.5 text-small text-muted">
              <Link href={lp(locale, "/")} className="hover:text-ink" aria-label={locale === "ko" ? "홈" : "Home"}>
                <Icon name="home" className="size-4" />
              </Link>
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <Icon name="chevron-right" className="size-3.5 opacity-60" />
                  {c.href ? (
                    <Link href={lp(locale, c.href)} className="hover:text-ink">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-ink-3" aria-current="page">
                      {c.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          )}
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <Title className="reveal mt-3 max-w-[16em] text-h1 text-ink">{title}</Title>
          {lead && <p className="reveal mt-4 max-w-[34em] text-lead text-ink-3">{lead}</p>}
          {children}
        </div>
      </div>
      <div className="container-stripes relative" aria-hidden />
    </section>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  lead,
  center,
  eyebrowClassName,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  center?: boolean;
  /** 소제목에 덧붙일 클래스 (예: 한글 소제목 "eyebrow-ko") */
  eyebrowClassName?: string;
}) {
  return (
    <div data-reveal className={center ? "mx-auto max-w-[46rem] text-center" : "max-w-[46rem]"}>
      {eyebrow && <p className={eyebrowClassName ? `eyebrow ${eyebrowClassName}` : "eyebrow"}>{eyebrow}</p>}
      <h2 className="mt-3 whitespace-pre-line text-h2 text-balance text-ink [.dark-section_&]:text-white">{title}</h2>
      {lead && (
        <p className={`mt-4 max-w-[36em] text-lead text-muted [.dark-section_&]:text-white/60 ${center ? "mx-auto" : ""}`}>{lead}</p>
      )}
    </div>
  );
}
