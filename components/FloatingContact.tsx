import Link from "next/link";
import { SITE } from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import { Icon } from "./Icon";

/** 모바일 하단 고정 상담 바 (전화 / 상담신청) */
export function FloatingContact({ locale }: { locale: Locale }) {
  const ko = locale === "ko";
  return (
    <>
      <div className="h-16 sm:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-line bg-white/95 p-2 backdrop-blur sm:hidden">
        <a href={SITE.telHref} className="btn-ghost !py-3">
          <Icon name="phone" className="size-4" /> {ko ? "전화 상담" : "Call us"}
        </a>
        <Link href="/contact#inquiry" className="btn-primary !py-3">
          <Icon name="mail" className="size-4" /> {ko ? "상담 신청" : "Inquire"}
        </Link>
      </div>
    </>
  );
}
