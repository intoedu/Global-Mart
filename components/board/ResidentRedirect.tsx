"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LEGACY_CATEGORY } from "@/lib/board";
import { lp } from "@/lib/paths";
import type { Locale } from "@/lib/i18n";

/**
 * 예전 '해외주재원 전용' 글 번호 → 통합 게시판(해외Biz정보) 글 번호.
 * 2026-11 통합 때 예전 글 1·2·3 을 6·7·8 로 옮겼습니다. (그 뒤로는 /resident 에 새 글이 생기지 않음)
 */
const RESIDENT_ID_MAP: Record<string, number> = { "1": 6, "2": 7, "3": 8 };

/** 예전 /resident/ 주소 → /biz/ (?cat=items|notice|software, ?id=번호, ?q=, ?tab= 도 받음) */
export function residentTarget(search: string) {
  const sp = new URLSearchParams(search);
  const p = new URLSearchParams();
  const id = sp.get("id");
  if (id && RESIDENT_ID_MAP[id]) p.set("post", String(RESIDENT_ID_MAP[id]));
  else {
    const cat = LEGACY_CATEGORY[sp.get("cat") ?? sp.get("tab") ?? ""];
    p.set("cat", cat === "notice" ? "notice" : "items");
    const q = sp.get("q");
    if (q) p.set("q", q);
  }
  return `/biz?${p.toString()}`;
}

/** 해외주재원 전용은 해외Biz정보(해외주재원 전용)에 합쳐졌습니다 — 같은 카테고리로 바로 넘어갑니다. */
export function ResidentRedirect({ locale }: { locale: Locale }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(lp(locale, residentTarget(window.location.search)));
  }, [router, locale]);
  const ko = locale === "ko";
  return (
    <section className="py-section-sm">
      <div className="container-x max-w-lg text-center">
        <p className="text-body text-muted" role="status">
          {ko ? "해외주재원 전용 게시판은 해외Biz정보(해외주재원 전용)로 합쳐졌습니다. 잠시 후 이동합니다." : "The overseas staff board has moved to Global Biz Info (Overseas Staff Only). Redirecting…"}
        </p>
        <Link href={lp(locale, "/biz?cat=items")} className="btn-primary mt-6">
          {ko ? "해외Biz정보로 이동" : "Go to Global Biz Info"}
        </Link>
      </div>
    </section>
  );
}
