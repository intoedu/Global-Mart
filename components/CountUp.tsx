"use client";

import { useEffect, useRef, useState } from "react";

/** 화면에 보이면 숫자가 올라가는 효과. "20+" 처럼 뒤 글자도 유지 */
export function CountUp({ value, from }: { value: string; from?: number }) {
  const m = value.match(/^(\d+)(.*)$/);
  const target = m ? Number(m[1]) : NaN;
  const suffix = m ? m[2] : "";
  const start = from ?? (target > 1000 ? target - 60 : 0);
  const [n, setN] = useState<number | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (Number.isNaN(target) || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setN(start);
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const dur = 1600;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(start + (target - start) * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(ref.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, start]);

  if (Number.isNaN(target)) return <>{value}</>;
  return (
    <span ref={ref} className="tabular-nums">
      {n ?? target}
      {suffix}
    </span>
  );
}
