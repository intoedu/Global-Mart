import type { Metadata } from "next";
import { Suspense } from "react";
import { getT, type LangParams } from "@/lib/i18n";
import { BIZ_INTRO } from "@/lib/content";
import { getBizPosts } from "@/lib/biz";
import { PageHero } from "@/components/PageHero";
import { BizBoard, BizBoardFallback } from "@/components/board/BizBoard";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "해외 Biz정보" : "Global Biz Info" };
}

export default async function BizListPage({ params }: LangParams) {
  const { locale, ko, t } = getT((await params).lang);
  const posts = getBizPosts();
  return (
    <>
      <PageHero locale={locale} image="mumbai" eyebrow="Global Biz Info" title={ko ? "해외 Biz정보" : "Global Biz Info"} lead={t(BIZ_INTRO)} crumbs={[{ label: ko ? "해외 Biz정보" : "Global Biz Info" }]} />
      <section className="pb-section-sm pt-10 lg:pt-14">
        {/* 정적 HTML 에도 목록이 들어가도록 fallback 에 첫 화면을 그려 둡니다 (빈 칸·화면 밀림 방지) */}
        <Suspense fallback={<BizBoardFallback posts={posts} locale={locale} />}>
          <BizBoard posts={posts} locale={locale} />
        </Suspense>
      </section>
    </>
  );
}
