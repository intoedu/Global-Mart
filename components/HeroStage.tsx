"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { WorldMap } from "./WorldMap";

/**
 * 첫 화면 무대
 * - 헤드라인 첫 단어가 해외 → 베트남 → 인도 → 중국 → 말레이시아 순으로 바뀌고
 * - 같은 순간 지도에서 서울→해당 거점 항로가 주황색으로 빛나며
 * - 그 옆에 실제 수행 실적(연혁 기준) 카드가 뜹니다.
 */
type Spot = { pin: string; word: { ko: string; en: string }; year: string; place: { ko: string; en: string }; items: { ko: string; en: string } };

const SPOTS: Spot[] = [
  { pin: "vietnam", word: { ko: "베트남", en: "Vietnam" }, year: "2016", place: { ko: "베트남 호치민", en: "Ho Chi Minh City" }, items: { ko: "화장품 · 수산물 · 대리석 · 엔진오일", en: "Cosmetics · Seafood · Marble · Engine oil" } },
  { pin: "mumbai", word: { ko: "인도", en: "India" }, year: "2010", place: { ko: "인도 뭄바이", en: "Mumbai, India" }, items: { ko: "건축자재 · 엔진오일", en: "Building materials · Engine oil" } },
  { pin: "dalian", word: { ko: "중국", en: "China" }, year: "2009", place: { ko: "중국 대련", en: "Dalian, China" }, items: { ko: "의류 · 건축자재", en: "Apparel · Building materials" } },
  { pin: "malaysia", word: { ko: "말레이시아", en: "Malaysia" }, year: "2008", place: { ko: "말레이시아", en: "Malaysia" }, items: { ko: "ITS 정부 프로젝트", en: "Government ITS project" } },
];

const LABELS = ["seoul", "vietnam", "mumbai", "russia", "uzbekistan", "egypt", "indonesia"];

export function HeroStage({
  locale,
  tag,
  highlight,
  rest,
  defaultLine,
  officeCount,
  children,
}: {
  locale: Locale;
  /** 맨 위 한 줄 소개 (한국 기업 해외지사대행 · 해외시장개척 전문) */
  tag: string;
  /** 둘째 줄 강조 단어 (글로벌마트) */
  highlight: string;
  rest: string;
  /** 첫 줄 기본 문구 (해외시장진출은 / Your partner for) */
  defaultLine: string;
  officeCount: number;
  children: React.ReactNode;
}) {
  const ko = locale === "ko";
  // -1 = 기본(해외), 0..n = 실적 국가
  const [idx, setIdx] = useState(-1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    const step = (next: number) => {
      timer = setTimeout(
        () => {
          setIdx(next);
          step(next + 1 >= SPOTS.length ? -1 : next + 1);
        },
        next === 0 ? 3200 : 3600
      );
    };
    step(0);
    return () => clearTimeout(timer);
  }, []);

  const spot = idx >= 0 ? SPOTS[idx] : null;

  const card = spot ? (
    <div className="w-60 rounded-2xl bg-ink p-4 text-white shadow-[0_24px_48px_-20px_rgb(13_14_18/0.6)] ring-1 ring-white/10">
      <div className="flex items-center justify-between">
        <span className="text-3xl font-black tracking-tight text-orange">{spot.year}</span>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold">{ko ? "수행 실적" : "Track record"}</span>
      </div>
      <p className="mt-2 text-[15px] font-bold">{spot.place[locale]}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-white/65">{spot.items[locale]}</p>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-sky">
        <span className="size-1.5 rounded-full bg-orange" /> {ko ? "서울 본사" : "Seoul HQ"} → {spot.place[locale]}
      </p>
    </div>
  ) : null;

  return (
    <div className="container-x relative pb-12 pt-[88px] lg:flex lg:min-h-[calc(100svh-52px)] lg:items-center lg:pb-16 lg:pt-28">
      {/* 지도: 본문 영역 기준으로 함께 커지고 작아짐 */}
      <div
        className="hero-map pointer-events-none absolute right-[-60%] top-[34%] w-[215%] opacity-50 sm:right-[-20%] sm:top-1/2 sm:w-[125%] sm:-translate-y-1/2 sm:opacity-70 lg:pointer-events-auto lg:right-[-3%] lg:top-[calc(50%+24px)] lg:w-[min(74%,calc((100svh_-_190px)*2))] lg:opacity-100"
        aria-hidden
      >
        <WorldMap locale={locale} labels={LABELS} animated strong dark={false} focusId={spot?.pin ?? null} focusCard={card} />
      </div>
      {/* 글자 쪽만 살짝 밝게 */}
      <div
        className="pointer-events-none absolute inset-y-0 -left-[50vw] right-0 bg-[linear-gradient(90deg,var(--color-paper)_55%,rgb(244_244_241/0.8)_68%,transparent_85%)] lg:right-auto lg:w-[calc(50vw+52%)] lg:bg-[linear-gradient(90deg,var(--color-paper)_70%,transparent)]"
        aria-hidden
      />

      <div className="relative w-full max-w-[600px] 2xl:max-w-[720px]">
        <p className="eyebrow reveal !text-[14px] !normal-case !tracking-[0.08em] sm:!text-[15px]">{tag}</p>
        <h1 className="reveal mt-5 text-[min(40px,10.4vw)] font-extrabold leading-[1.12] tracking-[-0.025em] sm:text-6xl lg:mt-6 lg:text-[64px] 2xl:text-[80px]">
          {ko ? (
            <span className="block">
              {spot ? (
                <>
                  <span key={spot.word.ko} className="word-in text-accent">
                    {spot.word.ko}
                  </span>{" "}
                  시장진출은
                </>
              ) : (
                <span key="default" className="word-in">
                  {defaultLine}
                </span>
              )}
            </span>
          ) : (
            <span className="block">{defaultLine}</span>
          )}
          <span className="relative inline-block">
            {/* 영어: 밑줄 단어가 국가 이름으로 바뀜 (global → Vietnam → India …) */}
            <span key={ko ? "hl" : spot?.word.en ?? "hl"} className={`relative z-10 ${!ko && spot ? "word-in" : ""}`}>
              {!ko && spot ? spot.word.en : highlight}
            </span>
            <span
              className="absolute inset-x-0 bottom-[0.08em] z-0 h-[0.32em] origin-left animate-[underline_1s_0.6s_cubic-bezier(0.6,0,0.2,1)_both] bg-orange"
              aria-hidden
            />
          </span>
          {/* 영어는 단어 길이가 달라도 높이가 변하지 않도록 항상 3줄 */}
          {ko ? rest : <span className="block">{rest.trim()}</span>}
        </h1>
        {children}
      </div>

      {/* 지도 범례: 본문 영역 오른쪽 아래 */}
      <div className="absolute bottom-6 right-4 z-10 hidden items-center gap-5 rounded-2xl bg-white/90 px-5 py-3 text-[13px] font-semibold text-ink-3 shadow-card ring-1 ring-line backdrop-blur sm:right-6 lg:right-8 lg:flex">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-orange ring-4 ring-orange/20" /> {ko ? "서울 본사" : "Seoul HQ"}
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-ink" /> {ko ? `해외 거점 ${officeCount}곳` : `${officeCount} overseas bases`}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-5 rounded-full bg-accent" /> {ko ? "무역 항로" : "Trade routes"}
        </span>
      </div>
    </div>
  );
}
