"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * '목록' 버튼 — 기억해 둔 목록 주소가 있으면 그곳으로, 없으면 기본 주소(fallback)로.
 * 정적 HTML 에는 기본 주소가 들어가고, 화면이 뜬 뒤 기억해 둔 주소로 바뀝니다.
 */
export function BackToList({ storageKey, fallback, prefix, className, children }: { storageKey: string; fallback: string; prefix: string; className?: string; children: React.ReactNode }) {
  const [href, setHref] = useState(fallback);
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      // 같은 게시판 주소만 받습니다.
      if (saved && saved.startsWith(prefix)) setHref(saved);
    } catch {}
  }, [storageKey, prefix]);
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
