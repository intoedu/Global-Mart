import type { Metadata } from "next";
import { Suspense } from "react";
import { getT, type LangParams } from "@/lib/i18n";
import { RESIDENT_INTRO } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { ResidentApp, ResidentFallback } from "@/components/board/ResidentApp";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "해외주재원 전용" : "For Overseas Staff", robots: { index: false } };
}

export default async function ResidentPage({ params }: LangParams) {
  const { locale, ko, t } = getT((await params).lang);
  return (
    <>
      <PageHero locale={locale} image="warehouse" eyebrow="For Overseas Staff" title={ko ? "해외주재원 전용" : "For Overseas Staff"} lead={t(RESIDENT_INTRO)} crumbs={[{ label: ko ? "해외주재원 전용" : "For Overseas Staff" }]} />
      {/* 정적 HTML 에도 비밀번호 입력 화면이 들어가도록 (빈 칸·화면 밀림 방지) */}
      <Suspense fallback={<ResidentFallback locale={locale} />}>
        <ResidentApp locale={locale} />
      </Suspense>
    </>
  );
}
