"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { WorldMap } from "./WorldMap";

/**
 * 첫 화면 무대
 * - 헤드라인 첫 단어가 해외 → 베트남 → 인도 → 중국 → 말레이시아 순으로 바뀌고
 * - 같은 순간 지도에서 서울→해당 거점 항로가 주황색으로 빛나며
 * - 지도 위 고정 자리의 실적 카드 내용이 바뀝니다 (카드는 항로·이름표를 가리지 않는 아프리카 쪽 바다 위)
 * - PC: 지도는 본문 폭의 76% 로 글자와 함께 커지고 작아짐 / 휴대폰·태블릿: 제목 아래 지도 띠
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
  const paused = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    let cur = -1;
    const schedule = () => {
      const next = cur + 1 >= SPOTS.length ? -1 : cur + 1;
      timer = setTimeout(
        () => {
          // 마우스를 올려두었거나 탭이 숨겨져 있으면 잠시 멈춤
          if (paused.current || document.hidden) return schedule();
          cur = next;
          setIdx(next);
          schedule();
        },
        next === 0 ? 3200 : 3600
      );
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  const spot = idx >= 0 ? SPOTS[idx] : null;
  const L = (v: { ko: string; en: string }) => v[locale];

  // 카드는 항상 같은 자리에 있고 내용만 바뀜 (기본 상태: 설립·거점 요약)
  const year = spot ? spot.year : "2004";
  const chip = spot ? (ko ? "수행 실적" : "Track record") : ko ? "설립" : "Founded";
  const place = spot ? L(spot.place) : ko ? `서울 본사 · 해외 거점 ${officeCount}곳` : `Seoul HQ · ${officeCount} overseas offices`;
  const items = spot ? L(spot.items) : ko ? "말레이시아 · 중국 · 인도 · 베트남 시장개척" : "Market entry in Malaysia · China · India · Vietnam";
  const card = (
    <div className="w-[clamp(204px,24cqw,320px)] rounded-2xl bg-ink p-[clamp(14px,1.7cqw,24px)] text-white shadow-float ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3">
        <span key={year} className="word-in text-[clamp(26px,3cqw,42px)] font-black leading-none tracking-tight tabular-nums text-orange">
          {year}
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold">{chip}</span>
      </div>
      <p key={place} className="word-in mt-2.5 block truncate text-[clamp(14px,1.45cqw,20px)] font-bold">
        {place}
      </p>
      <p className="mt-1 line-clamp-2 min-h-[2lh] text-[clamp(12px,1.15cqw,15px)] leading-relaxed text-white/65">{items}</p>
      <p className="mt-2 flex h-[1.4em] items-center gap-1.5 truncate text-[clamp(11px,1.05cqw,14px)] font-semibold text-sky">
        {spot && (
          <>
            <span className="size-1.5 shrink-0 rounded-full bg-orange" /> {ko ? "서울 본사" : "Seoul HQ"} → {L(spot.place)}
          </>
        )}
      </p>
    </div>
  );

  const textCol = "relative z-10 w-full lg:w-[52%] xl:w-1/2";

  return (
    <div
      className="hero-stage container-x relative flex flex-col lg:justify-center"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
    >
      <div className={textCol}>
        <p className="eyebrow eyebrow-ko reveal !text-[clamp(13px,12px+0.2vw,17px)] text-ink">{tag}</p>
        <h1
          className="reveal mt-4 text-display sm:mt-[clamp(16px,0.5rem+1vw,32px)]"
          style={ko ? undefined : { fontSize: "calc(var(--text-display) * 0.9)" }}
        >
          {ko ? (
            <span className="block whitespace-nowrap">
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
            <span className="block whitespace-nowrap">{defaultLine}</span>
          )}
          <span className="relative inline-block whitespace-nowrap">
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
      </div>

      {/* 지도: PC 는 오른쪽 배경, 휴대폰·태블릿은 제목 아래 띠 */}
      <figure className="hero-figure @container" aria-hidden>
        <WorldMap
          locale={locale}
          labels={LABELS}
          animated
          strong
          dark={false}
          focusId={spot?.pin ?? null}
          focusCard={card}
          cardSlot={{ x: 40, y: 52 }}
        />
        <figcaption className="hero-legend">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-orange ring-4 ring-orange/20" /> {ko ? "서울 본사" : "Seoul HQ"}
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-ink" /> {ko ? `해외 거점 ${officeCount}곳` : `${officeCount} overseas offices`}
          </span>
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-5 rounded-full bg-accent" /> {ko ? "무역 항로" : "Trade routes"}
          </span>
        </figcaption>
      </figure>

      {/* 휴대폰·태블릿: 지도 아래 한 줄 설명 (높이 고정 → 아래 내용이 움직이지 않음) */}
      <p className="hero-chip relative z-10 mt-2 flex h-6 items-center overflow-hidden whitespace-nowrap text-small text-ink-3 lg:hidden" aria-hidden>
        <span key={spot?.pin ?? "legend"} className="word-in min-w-0">
          <span className="flex min-w-0 items-center gap-2">
          {spot ? (
            <>
              <span className="size-2 shrink-0 rounded-full bg-orange" />
              <b className="tabular-nums text-ink">{spot.year}</b>
              <b className="text-ink">{L(spot.place)}</b>
              <span className="truncate text-muted">{L(spot.items)}</span>
            </>
          ) : (
            <>
              <span className="size-2 shrink-0 rounded-full bg-orange" /> {ko ? "서울 본사" : "Seoul HQ"}
              <span className="ml-2 size-2 shrink-0 rounded-full bg-ink" /> {ko ? `해외 거점 ${officeCount}곳` : `${officeCount} overseas offices`}
              <span className="ml-2 h-0.5 w-4 shrink-0 rounded-full bg-accent" /> {ko ? "무역 항로" : "Trade routes"}
            </>
          )}
          </span>
        </span>
      </p>

      <div className={textCol}>{children}</div>
    </div>
  );
}
