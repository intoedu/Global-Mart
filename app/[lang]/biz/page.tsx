import type { Metadata } from "next";
import { Suspense } from "react";
import { getT, type LangParams } from "@/lib/i18n";
import { BIZ_INTRO } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { BizApp, BizFallback } from "@/components/board/BizApp";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "해외 Biz정보" : "Global Biz Info" };
}

/**
 * 해외 Biz정보 — 회원 전용 (회원 비밀번호, 회원가입 없음)
 * 글은 암호화된 public/data/biz.json 에서 브라우저가 풀어 보여 주므로, 이 정적 페이지에는 글 제목·내용이 없습니다.
 * 글 보기도 같은 페이지(/biz/?post=번호)에서 합니다.
 */
export default async function BizPage({ params }: LangParams) {
  const { locale, ko, t } = getT((await params).lang);
  return (
    <>
      <PageHero locale={locale} image="mumbai" eyebrow="Global Biz Info" title={ko ? "해외 Biz정보" : "Global Biz Info"} lead={t(BIZ_INTRO)} crumbs={[{ label: ko ? "해외 Biz정보" : "Global Biz Info" }]} />
      <Suspense fallback={<BizFallback locale={locale} />}>
        <BizApp locale={locale} />
      </Suspense>
    </>
  );
}
