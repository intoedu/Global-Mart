import type { Metadata } from "next";
import { getT, type LangParams } from "@/lib/i18n";
import { ResidentRedirect } from "@/components/board/ResidentRedirect";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "해외Biz정보(해외주재원 전용)" : "Global Biz Info (Overseas Staff Only)", robots: { index: false } };
}

/**
 * 예전 '해외주재원 전용' 주소 — 해외Biz정보(해외주재원 전용) 통합 게시판(/biz/)으로 넘깁니다.
 * ?cat=items → 국내우수 Item, ?cat=notice → 공지, ?cat=software → 국내우수 Item, ?id=번호 → 옮긴 글 (?post=새 번호)
 */
export default async function ResidentPage({ params }: LangParams) {
  const { locale } = getT((await params).lang);
  return (
    <div className="pt-(--header-h)">
      <ResidentRedirect locale={locale} />
    </div>
  );
}
