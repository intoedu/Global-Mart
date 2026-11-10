"use client";

import Link from "next/link";
import mapData from "@/lib/map-data.json";
import { asset } from "@/lib/paths";
import { REGION_MAP, type RegionId } from "@/lib/regions";
import type { Locale } from "@/lib/i18n";

type Anchor = { id: RegionId; x: number; y: number };

/**
 * 붐비는 지역(인도·서남아·중동·북아프리카, 중앙아·동북아, 동남아) 이름표를 지도 단위(120×60)로 조금씩 옮겨
 * 겹치지 않게 합니다. 이름표 크기는 글자 크기로 고정이고 지도는 화면에 따라 커지므로,
 * 지도가 가장 좁은 lg(1024px, 지도 폭 약 880px)에서 영어 이름표 기준으로 맞췄습니다.
 * (지도는 lg 미만에서는 보이지 않고, 대신 지역 버튼 줄을 씁니다.)
 */
const NUDGE: Partial<Record<RegionId, [number, number]>> = {
  india: [1, 2.9],
  southeast: [3, 3.6],
  northeast: [2.5, -0.9],
  southwest: [0, 0.4],
  middleeast: [-3, 4.5],
  northafrica: [-2.5, 0],
  easteurope: [0, -0.7],
};

/** 해외 Biz정보 — 세계 지도에서 지역을 눌러 고르기 */
export function RegionMap({
  locale,
  active,
  counts,
  hrefFor,
  onPick,
}: {
  locale: Locale;
  active: RegionId;
  counts: Record<string, number>;
  hrefFor: (id: RegionId) => string;
  /** 이름표를 누른 뒤 (예: 목록 위치로 스크롤) */
  onPick?: () => void;
}) {
  const { width, height, anchors } = mapData as { width: number; height: number; anchors: Anchor[] };
  return (
    <div className="relative overflow-hidden rounded-3xl bg-paper p-5 ring-1 ring-line">
      <div className="relative">
        {/* 점 지도는 정적 이미지 (HTML 무게를 줄이기 위해) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("/images/world-dots.svg")}
          alt=""
          aria-hidden
          className="block h-auto w-full opacity-[0.15]"
          style={{ aspectRatio: `${width}/${height}` }}
        />
        {anchors.map((a) => {
          const on = active === a.id;
          const n = counts[a.id] ?? 0;
          const [dx, dy] = NUDGE[a.id] ?? [0, 0];
          return (
            <Link
              key={a.id}
              href={hrefFor(on ? "all" : a.id)}
              scroll={false}
              onClick={onPick}
              aria-current={on ? "true" : undefined}
              className={`absolute flex min-h-6 -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-bold ring-1 transition ${
                on ? "z-10 bg-accent text-ink ring-accent" : "bg-white text-ink ring-line hover:ring-ink"
              }`}
              style={{ left: `${((a.x + dx) / width) * 100}%`, top: `${((a.y + dy) / height) * 100}%` }}
            >
              <span className={`size-1.5 rounded-full ${on ? "bg-ink" : "bg-accent"}`} aria-hidden />
              {REGION_MAP[a.id].label[locale]}
              {n > 0 && (
                <span className={`rounded-full px-1 text-[10px] ${on ? "bg-white/50" : "bg-accent/10"}`}>
                  <span className="sr-only">{locale === "ko" ? ", 글 " : ", posts: "}</span>
                  {n}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <p className="mt-2 text-center text-caption text-muted">
        {locale === "ko" ? "지도에서 지역을 누르면 그 지역 글만 볼 수 있습니다." : "Click a region on the map to filter posts."}
      </p>
    </div>
  );
}
