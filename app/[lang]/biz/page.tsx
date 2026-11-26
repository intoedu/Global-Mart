import type { Metadata } from "next";
import { Suspense } from "react";
import { getT, type LangParams } from "@/lib/i18n";
import { BIZ_INTRO } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { BizApp, BizFallback } from "@/components/board/BizApp";

const TITLE = { ko: "해외Biz정보(해외주재원 전용)", en: "Global Biz Info (Overseas Staff Only)" };

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? TITLE.ko : TITLE.en };
}

/**
 * 해외Biz정보(해외주재원 전용) — 회원 전용 통합 게시판 (회원 비밀번호 하나, 회원가입 없음)
 * 카테고리: 해외시장·해외입찰(나라별) · 국내우수 Item · 공지 (?cat=market|tender|items|notice)
 * 글은 암호화된 public/data/biz.json 에서 브라우저가 풀어 보여 주므로, 이 정적 페이지에는 글 제목·내용이 없습니다.
 * 글 보기도 같은 페이지(/biz/?post=번호)에서 합니다. 예전 /resident/ 주소는 이곳으로 넘어옵니다.
 */
export default async function BizPage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  const [p1, p2] = BIZ_INTRO[locale];
  return (
    <>
      {/* 4차 수정 요청: 사진 없는 낮은 머리말 — 1440×900 첫 화면에서 카테고리 탭과 게시판 목록 일부가 보이도록 */}
      <PageHero locale={locale} noPhoto eyebrow="Global Biz Info" title={t(TITLE)} lead={p1} crumbs={[{ label: t(TITLE) }]}>
        {/* 소개 둘째 문단 — PageHero 의 lead 와 같은 모양 (글을 열면 함께 숨김: globals.css .page-hero-lead) */}
        <p className="page-hero-lead reveal mt-2 max-w-[60em] text-[clamp(0.9375rem,0.85rem+0.2vw,1.125rem)] leading-[1.65] text-ink-3">{p2}</p>
      </PageHero>
      <Suspense fallback={<BizFallback locale={locale} />}>
        <BizApp locale={locale} />
      </Suspense>
    </>
  );
}
