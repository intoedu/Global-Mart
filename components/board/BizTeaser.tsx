import Link from "next/link";
import { BIZ_CATEGORIES } from "@/lib/regions";
import { lp } from "@/lib/paths";
import type { Locale } from "@/lib/i18n";
import { Icon } from "../Icon";

/**
 * 메인 화면용 '해외 Biz정보' 입구 (회원 전용) — 글 제목·내용은 보여 주지 않습니다.
 * 서버·클라이언트 어디서든 쓸 수 있습니다:  <BizTeaser locale={locale} />
 * (제목·문구를 바꾸려면 title·body 를 넘기세요. 기본값은 해외 Biz정보 소개 문구)
 */
export function BizTeaser({ locale, title, body, className = "" }: { locale: Locale; title?: string; body?: string; className?: string }) {
  const ko = locale === "ko";
  return (
    <div className={`grid gap-6 rounded-3xl bg-paper p-6 sm:p-[clamp(28px,1.4rem+1.2vw,56px)] lg:grid-cols-[1.4fr_1fr] lg:items-center ${className}`}>
      <div>
        <p className="eyebrow">Global Biz Info</p>
        <h2 className="mt-3 text-h2">{title ?? (ko ? "해외 Biz정보" : "Global Biz Info")}</h2>
        <p className="mt-4 max-w-[38em] text-body text-muted">
          {body ??
            (ko
              ? "글로벌마트는 '해외시장정보'와 '해외입찰정보'를 바탕으로 국내기업과 함께 해외비즈니스를 수행하고자 합니다. 우수한 아이템은 해외 여러 나라에서 동시에 진행됩니다."
              : "Globalmart aims to carry out overseas business together with Korean companies, based on overseas market and tender information. Strong items are pursued in several countries at the same time.")}
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {BIZ_CATEGORIES.map((c) => (
            <li key={c.id} className="rounded-full bg-white px-3.5 py-1.5 text-small font-semibold text-ink-3 ring-1 ring-line">
              {c.label[locale]}
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
  );
}
