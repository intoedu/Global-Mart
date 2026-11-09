import offices from "@/lib/offices.json";
import type { Locale } from "@/lib/i18n";

/** 서울 ⇄ 해외 거점 항로가 흐르는 띠 (국제 무역 분위기) */
export function TradeTicker({ locale }: { locale: Locale }) {
  const hq = locale === "ko" ? "서울" : "SEOUL";
  const routes = offices.regions.flatMap((r) => r.offices).map((o) => (locale === "ko" ? o.ko : o.en.toUpperCase()));
  const items = [...routes, ...routes];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-ink-2/80 py-3 backdrop-blur" aria-hidden>
      <div className="flex w-max animate-[ticker_60s_linear_infinite] gap-10 whitespace-nowrap text-[13px] font-semibold tracking-wider text-white/60">
        {items.map((name, i) => (
          <span key={i} className="flex items-center gap-3">
            <span className="text-accent">{hq}</span>
            <svg viewBox="0 0 24 12" className="h-3 w-6 text-sky" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M1 6h20M16 1l5 5-5 5" />
            </svg>
            <span className="text-white/85">{name}</span>
            <span className="ml-4 inline-block h-3 w-px bg-white/15" />
          </span>
        ))}
      </div>
    </div>
  );
}
