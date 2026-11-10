"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import mapData from "@/lib/map-data.json";
import offices from "@/lib/offices.json";
import type { Locale } from "@/lib/i18n";
import { asset } from "@/lib/paths";

type Pin = { id: string; region: string; x: number; y: number };
type Place = "left" | "right" | "below-left";

/** 이웃 거점과 겹치지 않도록 이름표 위치 지정 (기본: 오른쪽) */
const LABEL_PLACE: Record<string, Place> = {
  mumbai: "left",
  egypt: "left",
  turkey: "left",
  usa: "left",
  indonesia: "left",
  malaysia: "left",
  dalian: "below-left",
};

const officeById = new Map<string, { ko: string; en: string; email?: string }>([
  [offices.headOffice.id, offices.headOffice],
  ...offices.regions.flatMap((r) => r.offices.map((o) => [o.id, o] as [string, { ko: string; en: string; email?: string }])),
]);

/**
 * 점(dot)으로 그린 세계지도 + 서울 본사에서 각 해외 거점으로 이어지는 연결선
 * - 점 3천여 개는 정적 이미지(public/images/world-dots.svg)로 깔고, 그 위에 항로·거점·이름표를 SVG 로 그립니다
 * - activeRegion 을 주면 해당 권역 거점만 강조
 * - 화면 밖에 있을 때는 애니메이션을 멈춥니다
 */
export function WorldMap({
  locale,
  activeRegion,
  dark = true,
  showArcs = true,
  labels,
  animated = false,
  strong = false,
  focusId = null,
  focusCard,
  cardSlot,
  className = "",
}: {
  /** 강조할 거점 id: 서울→해당 거점 항로를 주황색으로 그리고 나머지는 흐리게 */
  focusId?: string | null;
  /** 지도 위에 띄울 카드 */
  focusCard?: ReactNode;
  /** 카드 고정 위치(지도 기준 %). 주면 카드는 항상 같은 자리에 있고 내용만 바뀝니다 */
  cardSlot?: { x: number; y: number };
  /** 배경용: 점·항로를 더 진하고 굵게 */
  strong?: boolean;
  /** 항로선이 그려지고 화물 점이 오가는 애니메이션 */
  animated?: boolean;
  /** 지도에 이름을 표시할 거점 id 목록 */
  labels?: string[];
  locale: Locale;
  activeRegion?: string | null;
  dark?: boolean;
  showArcs?: boolean;
  className?: string;
}) {
  const { width, height, pins } = mapData as { width: number; height: number; pins: Pin[] };
  const [hover, setHover] = useState<Pin | null>(null);
  const hq = pins.find((p) => p.region === "hq")!;
  const gid = `arc-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // 화면 밖이면 SVG(SMIL)·CSS 애니메이션 정지 → CPU 사용 감소
  useEffect(() => {
    const el = wrapRef.current;
    const svg = svgRef.current;
    if (!el || !svg || !animated || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          svg.unpauseAnimations?.();
          el.classList.remove("map-paused");
        } else {
          svg.pauseAnimations?.();
          el.classList.add("map-paused");
        }
      },
      { rootMargin: "100px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animated]);

  const arcs = useMemo(
    () =>
      pins
        .filter((p) => p.region !== "hq")
        .map((p) => {
          const mx = (hq.x + p.x) / 2;
          const my = (hq.y + p.y) / 2 - Math.max(3, Math.abs(hq.x - p.x) * 0.22);
          return { id: p.id, region: p.region, d: `M${hq.x},${hq.y} Q${mx},${my} ${p.x},${p.y}` };
        }),
    [pins, hq]
  );

  const pinColor = dark ? "#7cc4ff" : "#0d0e12";
  const arcColor = dark ? "#7cc4ff" : "#1e9bff";
  const isOn = (region: string) => !activeRegion || region === activeRegion || region === "hq";
  const label = hover ? officeById.get(hover.id)?.[locale] : null;
  const focusPin = focusId ? pins.find((p) => p.id === focusId) : undefined;
  // 강조 항로: 가까운 거점(예: 대련)도 눈에 띄도록 더 높이 휘게
  const focusD = focusPin
    ? (() => {
        const mx = (hq.x + focusPin.x) / 2;
        const my = (hq.y + focusPin.y) / 2 - Math.max(4.5, Math.abs(hq.x - focusPin.x) * 0.22);
        return `M${hq.x},${hq.y} Q${mx},${my} ${focusPin.x},${focusPin.y}`;
      })()
    : null;
  const labelIds = labels ? [...labels, ...(focusId && !labels.includes(focusId) ? [focusId] : [])] : [];
  const fs = strong ? 1.6 : 1.45;

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {/* 점 지도 (정적 이미지) */}
      <img
        src={asset(dark ? "/images/world-dots-light.svg" : "/images/world-dots.svg")}
        alt=""
        aria-hidden
        draggable={false}
        className="map-dots pointer-events-none absolute inset-0 h-full w-full select-none"
        style={{ opacity: dark ? 0.16 : strong ? 0.26 : 0.19 }}
      />
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="relative h-auto w-full"
        role="img"
        aria-label={locale === "ko" ? "글로벌마트 해외 거점 지도" : "Globalmart global network map"}
      >
        <defs>
          <linearGradient id={gid} x1="0" x2="1">
            <stop offset="0" stopColor={arcColor} stopOpacity="0.05" />
            <stop offset="1" stopColor={arcColor} stopOpacity={dark ? 0.9 : 0.75} />
          </linearGradient>
        </defs>
        {showArcs &&
          arcs.map((a, i) => (
            <path
              key={a.id}
              d={a.d}
              pathLength={1}
              fill="none"
              stroke={`url(#${gid})`}
              strokeWidth={strong ? 0.17 : 0.12}
              style={animated ? { animationDelay: `${0.4 + i * 0.07}s` } : undefined}
              data-draw={animated ? "" : undefined}
              opacity={!isOn(a.region) ? 0.12 : focusId && focusId !== a.id ? 0.28 : 0.9}
              className="transition-opacity duration-700"
            />
          ))}
        {focusD && (
          <g key={`focus-${focusId}`} className="pointer-events-none">
            <path d={focusD} pathLength={1} fill="none" stroke="#f59e2b" strokeOpacity={0.25} strokeWidth={0.9} strokeLinecap="round" className="focus-arc" />
            <path d={focusD} pathLength={1} fill="none" stroke="#f59e2b" strokeWidth={0.32} strokeLinecap="round" className="focus-arc" />
            <circle r={0.5} fill="#f59e2b">
              <animateMotion dur="1.6s" begin="0.2s" repeatCount="indefinite" path={focusD} calcMode="linear" />
            </circle>
          </g>
        )}
        {animated &&
          showArcs &&
          arcs
            .filter((_, i) => i % 4 === 0)
            .map((a, i) => {
              const dur = `${4.5 + (i % 3) * 0.8}s`;
              const begin = `${2 + i * 0.6}s`;
              return (
                <circle key={`pk-${a.id}`} r={0.32} fill={i % 2 === 0 ? "#f59e2b" : "#1e9bff"} className="map-packet" opacity={0}>
                  <animateMotion dur={dur} begin={begin} repeatCount="indefinite" path={a.d} keyPoints={i % 2 ? "0;1" : "1;0"} keyTimes="0;1" calcMode="linear" />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur={dur} begin={begin} repeatCount="indefinite" />
                </circle>
              );
            })}
        {pins.map((p, i) => {
          const on = isOn(p.region);
          const isHq = p.region === "hq";
          return (
            // 바깥 g: 흐리게/진하게(필터) — 안쪽 g: 등장 애니메이션 (서로 덮어쓰지 않도록 분리)
            <g
              key={p.id}
              onMouseEnter={() => setHover(p)}
              onMouseLeave={() => setHover(null)}
              className="cursor-default transition-opacity duration-500"
              opacity={on ? 1 : 0.2}
            >
              <g data-pop={animated ? "" : undefined} style={animated ? { animationDelay: `${isHq ? 0.2 : 0.5 + i * 0.06}s` } : undefined}>
                {isHq && <circle cx={p.x} cy={p.y} r={0.5} fill="none" stroke="#f59e2b" strokeWidth={1} vectorEffect="non-scaling-stroke" className="pulse-ring" />}
                <circle cx={p.x} cy={p.y} r={isHq ? 0.75 : 0.5} fill={isHq ? "#f59e2b" : pinColor} stroke={dark ? "none" : "#fff"} strokeWidth={0.12} />
                <circle cx={p.x} cy={p.y} r={1.6} fill="transparent" />
              </g>
            </g>
          );
        })}
        {focusPin && (
          <g key={`fp-${focusId}`} className="pointer-events-none">
            <circle cx={focusPin.x} cy={focusPin.y} r={1.5} fill="#f59e2b" fillOpacity={0.18} stroke="#f59e2b" strokeWidth={0.12} className="focus-pin" />
            <circle cx={focusPin.x} cy={focusPin.y} r={0.7} fill="#f59e2b" stroke="#fff" strokeWidth={0.15} />
          </g>
        )}
        {pins
          .filter((p) => labelIds.includes(p.id))
          .map((p) => {
            const name = officeById.get(p.id)?.[locale] ?? "";
            const isHq = p.region === "hq";
            const isFocus = p.id === focusId;
            // 고정 이름표가 아닌 강조 거점은 강조될 때만 보임
            const shown = labels!.includes(p.id) || isFocus;
            const w = (name.length * (locale === "ko" ? 1.3 : 0.8) + 2.2) * (fs / 1.45);
            const h = 2.6 * (fs / 1.45);
            const place = LABEL_PLACE[p.id] ?? "right";
            const lx = place === "right" ? p.x + 1.1 : p.x - 1.1 - w;
            const ly = place === "below-left" ? p.y + 0.9 : p.y - 0.7 - h;
            const hot = isHq || isFocus;
            return (
              <g key={`l-${p.id}`} data-pin={p.id} className="map-label pointer-events-none transition-opacity duration-500" opacity={!shown ? 0 : isOn(p.region) ? 1 : 0.25}>
                <g
                  data-pop={animated ? "" : undefined}
                  style={animated ? { animationDelay: `${isHq ? 0.3 : !labels!.includes(p.id) ? 0.35 : 1.2 + labelIds.indexOf(p.id) * 0.12}s` } : undefined}
                >
                  <rect
                    x={lx}
                    y={ly}
                    width={w}
                    height={h}
                    rx={h / 2}
                    fill={hot ? "#f59e2b" : dark ? "rgb(15 24 48 / 0.85)" : "#0d0e12"}
                    stroke={dark ? "rgb(143 178 255 / 0.4)" : "none"}
                    strokeWidth={0.08}
                    className="transition-[fill] duration-500"
                  />
                  <text x={lx + 1.2 * (fs / 1.45)} y={ly + h * 0.67} fontSize={fs} fontWeight={700} fill={hot ? "#0d0e12" : "#fff"} fontFamily="inherit">
                    {name}
                  </text>
                </g>
              </g>
            );
          })}
      </svg>
      {focusCard && cardSlot ? (
        <div className="map-focus-card pointer-events-none absolute z-10" data-slot="" style={{ left: `${cardSlot.x}%`, top: `${cardSlot.y}%` }}>
          {focusCard}
        </div>
      ) : (
        focusPin &&
        focusCard && (
          <div
            key={`fc-${focusId}`}
            className="map-focus-card pointer-events-none absolute z-10"
            style={{ left: `${(focusPin.x / width) * 100}%`, top: `${(focusPin.y / height) * 100}%` }}
          >
            {focusCard}
          </div>
        )
      )}
      {hover && label && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-lift"
          style={{ left: `${(hover.x / width) * 100}%`, top: `calc(${(hover.y / height) * 100}% - 8px)` }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
