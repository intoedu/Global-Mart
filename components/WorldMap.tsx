"use client";

import { useMemo, useState } from "react";
import mapData from "@/lib/map-data.json";
import offices from "@/lib/offices.json";
import type { Locale } from "@/lib/i18n";

type Pin = { id: string; region: string; x: number; y: number };

const LEFT_LABELS = new Set(["mumbai", "egypt", "turkey", "usa", "indonesia"]);

const officeById = new Map<string, { ko: string; en: string; email?: string }>([
  [offices.headOffice.id, offices.headOffice],
  ...offices.regions.flatMap((r) => r.offices.map((o) => [o.id, o] as [string, { ko: string; en: string; email?: string }])),
]);

/**
 * 점(dot)으로 그린 세계지도 + 서울 본사에서 각 해외 거점으로 이어지는 연결선
 * - activeRegion 을 주면 해당 권역 거점만 강조
 */
export function WorldMap({
  locale,
  activeRegion,
  dark = true,
  showArcs = true,
  labels,
  animated = false,
  className = "",
}: {
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
  const { width, height, dots, pins } = mapData as { width: number; height: number; dots: number[][]; pins: Pin[] };
  const [hover, setHover] = useState<Pin | null>(null);
  const hq = pins.find((p) => p.region === "hq")!;

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

  const dotColor = dark ? "rgb(255 255 255 / 0.16)" : "rgb(13 14 18 / 0.2)";
  const pinColor = dark ? "#8fb2ff" : "#0d0e12";
  const arcColor = dark ? "#8fb2ff" : "#2d3f7a";
  const isOn = (region: string) => !activeRegion || region === activeRegion || region === "hq";
  const label = hover ? officeById.get(hover.id)?.[locale] : null;

  return (
    <div className={`relative ${className}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={locale === "ko" ? "글로벌마트 해외 거점 지도" : "Globalmart global network map"}>
        <defs>
          <linearGradient id="arc" x1="0" x2="1">
            <stop offset="0" stopColor={arcColor} stopOpacity="0.05" />
            <stop offset="1" stopColor={arcColor} stopOpacity={dark ? 0.9 : 0.75} />
          </linearGradient>
        </defs>
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={0.24} fill={dotColor} />
        ))}
        {showArcs &&
          arcs.map((a, i) => (
            <path
              key={a.id}
              d={a.d}
              pathLength={1}
              fill="none"
              stroke="url(#arc)"
              strokeWidth={0.12}
              style={animated ? { animationDelay: `${0.4 + i * 0.07}s` } : undefined}
              data-draw={animated ? "" : undefined}
              opacity={isOn(a.region) ? 0.9 : 0.12}
              className="transition-opacity duration-500"
            />
          ))}
        {animated &&
          showArcs &&
          arcs
            .filter((_, i) => i % 2 === 0)
            .map((a, i) => (
              <circle key={`pk-${a.id}`} r={0.32} fill={i % 3 === 0 ? "#e8a33d" : dark ? "#ffffff" : "#0d0e12"} className="map-packet" opacity={0}>
                <animateMotion dur={`${3.2 + (i % 4) * 0.7}s`} begin={`${2 + i * 0.35}s`} repeatCount="indefinite" path={a.d} keyPoints={i % 2 ? "0;1" : "1;0"} keyTimes="0;1" calcMode="linear" />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur={`${3.2 + (i % 4) * 0.7}s`} begin={`${2 + i * 0.35}s`} repeatCount="indefinite" />
              </circle>
            ))}
        {pins.map((p, i) => {
          const on = isOn(p.region);
          const isHq = p.region === "hq";
          return (
            <g
              key={p.id}
              data-pop={animated ? "" : undefined}
              style={animated ? { animationDelay: `${isHq ? 0.2 : 0.5 + i * 0.06}s` } : undefined}
              onMouseEnter={() => setHover(p)}
              onMouseLeave={() => setHover(null)}
              className="cursor-default transition-opacity duration-500"
              opacity={on ? 1 : 0.2}
            >
              {on && <circle cx={p.x} cy={p.y} r={0.5} fill="none" stroke={isHq ? "#e8a33d" : pinColor} strokeWidth={0.1} className="animate-pulse-ring" />}
              <circle cx={p.x} cy={p.y} r={isHq ? 0.75 : 0.5} fill={isHq ? "#e8a33d" : pinColor} stroke={dark ? "none" : "#fff"} strokeWidth={0.12} />
              <circle cx={p.x} cy={p.y} r={1.6} fill="transparent" />
            </g>
          );
        })}
        {labels &&
          pins
            .filter((p) => labels.includes(p.id))
            .map((p) => {
              const name = officeById.get(p.id)?.[locale] ?? "";
              const isHq = p.region === "hq";
              const w = name.length * (locale === "ko" ? 1.3 : 0.8) + 2.2;
              // 이웃 거점과 겹치는 이름표는 왼쪽에 표시
              const left = LEFT_LABELS.has(p.id);
              const lx = left ? p.x - 1.1 - w : p.x + 1.1;
              return (
                <g
                  key={`l-${p.id}`}
                  className="pointer-events-none"
                  opacity={isOn(p.region) ? 1 : 0.25}
                  data-pop={animated ? "" : undefined}
                  style={animated ? { animationDelay: `${isHq ? 0.3 : 1.2 + labels.indexOf(p.id) * 0.12}s` } : undefined}
                >
                  <rect x={lx} y={p.y - 3.3} width={w} height={2.6} rx={1.3} fill={isHq ? "#e8a33d" : dark ? "rgb(15 24 48 / 0.85)" : "#0d0e12"} stroke={dark ? "rgb(143 178 255 / 0.4)" : "none"} strokeWidth={0.08} />
                  <text x={lx + 1.2} y={p.y - 1.55} fontSize={1.45} fontWeight={700} fill={isHq ? "#0d0e12" : "#fff"} fontFamily="inherit">
                    {name}
                  </text>
                </g>
              );
            })}
      </svg>
      {hover && label && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-lift"
          style={{ left: `${(hover.x / width) * 100}%`, top: `calc(${(hover.y / height) * 100}% - 8px)` }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
