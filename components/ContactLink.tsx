"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { lp } from "@/lib/paths";

/**
 * '상담 신청' 링크 → /contact/#inquiry
 * 이미 상담 페이지에 있으면(주소에 #inquiry 가 이미 있어도) 상담 신청서로 부드럽게 스크롤합니다.
 * (Next Link 는 같은 주소로의 이동을 무시하기 때문)
 */
export function ContactLink({
  locale,
  className,
  children,
  onNavigate,
}: {
  locale: Locale;
  className?: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={lp(locale, "/contact#inquiry")}
      className={className}
      onClick={(e) => {
        onNavigate?.();
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const onContact = new RegExp(`/${locale}/contact/?$`).test(window.location.pathname);
        const form = document.getElementById("inquiry");
        if (!onContact || !form) return;
        e.preventDefault();
        if (window.location.hash !== "#inquiry") window.history.replaceState(window.history.state, "", "#inquiry");
        form.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      }}
    >
      {children}
    </Link>
  );
}
