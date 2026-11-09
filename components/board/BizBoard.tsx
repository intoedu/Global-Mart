"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BIZ_CATEGORIES, REGIONS, REGION_MAP, bizCategoryLabel, isRegionId, type RegionId } from "@/lib/regions";
import { formatDate } from "@/lib/format";
import { lp } from "@/lib/paths";
import type { Locale } from "@/lib/i18n";
import type { BizPost } from "@/lib/types";
import { Icon } from "../Icon";
import { Pagination } from "./Pagination";
import { RegionMap } from "./RegionMap";

const PAGE_SIZE = 15;

/** 해외 Biz정보 목록 — 지역·종류·검색·페이지는 주소(?region=…)로 유지 */
export function BizBoard({ posts, locale }: { posts: BizPost[]; locale: Locale }) {
  const sp = useSearchParams();
  const router = useRouter();
  const ko = locale === "ko";
  const t = (l: { ko: string; en: string }) => l[locale];

  const region: RegionId = isRegionId(sp.get("region")) ? (sp.get("region") as RegionId) : "all";
  const category = BIZ_CATEGORIES.some((c) => c.id === sp.get("category")) ? sp.get("category")! : undefined;
  const q = sp.get("q")?.trim() || "";
  const page = Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1);
  const [draft, setDraft] = useState(q);

  const href = (o: { region?: string; category?: string | null; q?: string | null; page?: number }) => {
    const p = new URLSearchParams();
    const r = o.region ?? region;
    if (r !== "all") p.set("region", r);
    const c = o.category === null ? undefined : (o.category ?? category);
    if (c) p.set("category", c);
    const qq = o.q === null ? "" : (o.q ?? q);
    if (qq) p.set("q", qq);
    if (o.page && o.page > 1) p.set("page", String(o.page));
    const s = p.toString();
    return `${lp(locale, "/biz")}${s ? `?${s}` : ""}`;
  };

  const filtered = useMemo(() => {
    let list = posts;
    if (region !== "all") list = list.filter((p) => p.region === region || p.region === "all");
    if (category) list = list.filter((p) => p.category === category);
    if (q) {
      const k = q.toLowerCase();
      list = list.filter((p) => [p.title, p.body, p.country].some((v) => v.toLowerCase().includes(k)));
    }
    return list;
  }, [posts, region, category, q]);

  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  // 지도에 표시할 지역별 글 수 ('전체' 글은 모든 지역에 포함)
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of REGIONS) c[r.id] = posts.filter((p) => r.id === "all" || p.region === r.id || p.region === "all").length;
    return c;
  }, [posts]);
  const current = REGION_MAP[region];
  const regionLabel = (r: string) => (isRegionId(r) ? t(REGION_MAP[r].label) : r);
  const detail = (id: number) => lp(locale, `/biz/${id}`);

  return (
    <div className="container-x">
    <div className="mb-10">
      <RegionMap locale={locale} active={region} counts={counts} hrefFor={(id) => href({ region: id, page: 1 })} />
    </div>
    <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
      <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <p className="mb-3 hidden text-xs font-bold uppercase tracking-widest text-muted lg:block">{ko ? "지역" : "Region"}</p>
        <nav className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:px-0" aria-label={ko ? "지역" : "Regions"}>
          {REGIONS.map((r) => {
            const active = r.id === region;
            return (
              <Link
                key={r.id}
                href={href({ region: r.id, page: 1 })}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-full px-4 py-2 text-[15px] font-semibold transition lg:rounded-xl ${
                  active ? "bg-ink text-white" : "bg-paper text-ink-3 hover:bg-brand-soft hover:text-brand lg:bg-transparent"
                }`}
              >
                {t(r.label)}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        <div className="rounded-2xl bg-paper p-6 lg:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-extrabold tracking-tight">{t(current.label)}</h2>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">{ko ? `총 ${filtered.length}건` : `${filtered.length} posts`}</span>
          </div>
          {current.countries ? (
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{t(current.countries)}</p>
          ) : region === "all" ? (
            <p className="mt-2 text-[15px] text-muted">{ko ? "모든 지역의 정보를 모아 봅니다." : "Posts from every region."}</p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div className="flex gap-1.5">
            {[{ id: undefined as string | undefined, label: { ko: "전체", en: "All" } }, ...BIZ_CATEGORIES].map((c) => (
              <Link
                key={c.id ?? "all"}
                href={href({ category: c.id ?? null, page: 1 })}
                scroll={false}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                  category === c.id ? "border-ink bg-ink text-white" : "border-line text-ink-3 hover:border-ink hover:text-ink"
                }`}
              >
                {t(c.label)}
              </Link>
            ))}
          </div>
          <form
            className="relative lg:w-80"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(href({ q: draft.trim() || null, page: 1 }), { scroll: false });
            }}
          >
            <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={ko ? "제목·내용·국가 검색" : "Search title, content, country"}
              className="input !rounded-full !py-2.5 !pl-11"
              maxLength={50}
              aria-label={ko ? "검색" : "Search"}
            />
          </form>
        </div>

        {q && (
          <p className="mt-4 text-sm text-muted">
            {ko ? `'${q}' 검색 결과 ${filtered.length}건` : `${filtered.length} results for '${q}'`} ·{" "}
            <Link href={href({ q: null, page: 1 })} scroll={false} onClick={() => setDraft("")} className="font-semibold text-brand">
              {ko ? "검색 해제" : "Clear"}
            </Link>
          </p>
        )}

        {/* PC: 지역 | 주·국가 | 종류 | 제목 | 게시일 — 게시자는 숨김 */}
        <div className="mt-6 hidden overflow-hidden rounded-2xl border border-line md:block">
          <table className="w-full table-fixed text-[15px]">
            <thead className="bg-ink text-left text-[13px] font-semibold text-white/85">
              <tr>
                <th className="w-28 px-5 py-3.5">{ko ? "지역" : "Region"}</th>
                <th className="w-36 px-3 py-3.5">{ko ? "주 / 국가" : "State / Country"}</th>
                <th className="w-28 px-3 py-3.5">{ko ? "종류" : "Type"}</th>
                <th className="px-3 py-3.5">{ko ? "제목" : "Title"}</th>
                <th className="w-32 px-5 py-3.5 text-right">{ko ? "게시일" : "Date"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((p) => (
                <tr key={p.id} className={`transition hover:bg-brand-soft/40 ${p.is_pinned ? "bg-paper" : ""}`}>
                  <td className="px-5 py-4 font-medium text-ink-3">{regionLabel(p.region)}</td>
                  <td className="truncate px-3 py-4 text-muted">{p.country || "-"}</td>
                  <td className="px-3 py-4">
                    <CategoryBadge category={p.category} label={t(bizCategoryLabel(p.category))} />
                  </td>
                  <td className="px-3 py-4">
                    <Link href={detail(p.id)} className="flex items-center gap-2 font-semibold text-ink hover:text-brand">
                      {p.is_pinned && <Icon name="pin" className="size-4 shrink-0 text-brand" />}
                      <span className="truncate">{p.title}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-right text-sm tabular-nums text-muted">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <Empty ko={ko} />}
        </div>

        <ul className="mt-6 divide-y divide-line border-y border-line md:hidden">
          {items.map((p) => (
            <li key={p.id}>
              <Link href={detail(p.id)} className="block py-4">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <CategoryBadge category={p.category} label={t(bizCategoryLabel(p.category))} />
                  <span>{regionLabel(p.region)}</span>
                  {p.country && <span>· {p.country}</span>}
                </div>
                <p className="mt-1.5 font-semibold leading-snug text-ink">{p.title}</p>
                <p className="mt-1 text-xs tabular-nums text-muted">{formatDate(p.created_at)}</p>
              </Link>
            </li>
          ))}
          {items.length === 0 && (
            <li>
              <Empty ko={ko} />
            </li>
          )}
        </ul>

        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} makeHref={(n) => href({ page: n })} />
      </div>
    </div>
    </div>
  );
}

export function CategoryBadge({ category, label }: { category: string; label: string }) {
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-[12px] font-bold ${category === "inquiry" ? "bg-accent/15 text-[#a8661a]" : "bg-brand-soft text-brand"}`}>
      {label}
    </span>
  );
}

function Empty({ ko }: { ko: boolean }) {
  return <p className="px-6 py-16 text-center text-[15px] text-muted">{ko ? "등록된 글이 없습니다." : "No posts yet."}</p>;
}
