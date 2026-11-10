"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BIZ_CATEGORIES, REGIONS, REGION_MAP, bizCategoryLabel, isRegionId, type RegionId } from "@/lib/regions";
import { formatDate } from "@/lib/format";
import { lp } from "@/lib/paths";
import { listKey, rememberList } from "@/lib/board";
import type { Locale } from "@/lib/i18n";
import type { BizPost } from "@/lib/types";
import { Icon } from "../Icon";
import { Pagination } from "./Pagination";
import { RegionMap } from "./RegionMap";

const PAGE_SIZE = 15;

type ViewProps = { posts: BizPost[]; locale: Locale; region: RegionId; category?: string; q: string; page: number; live?: boolean };

/** 해외 Biz정보 목록 — 지역·종류·검색·페이지는 주소(?region=…)로 유지 */
export function BizBoard({ posts, locale }: { posts: BizPost[]; locale: Locale }) {
  const sp = useSearchParams();
  const region: RegionId = isRegionId(sp.get("region")) ? (sp.get("region") as RegionId) : "all";
  const category = BIZ_CATEGORIES.some((c) => c.id === sp.get("category")) ? sp.get("category")! : undefined;
  const q = sp.get("q")?.trim() || "";
  const page = Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1);
  return <BizBoardView posts={posts} locale={locale} region={region} category={category} q={q} page={page} live />;
}

/**
 * 정적 HTML(자바스크립트 실행 전)에 들어가는 목록 — '전체' 첫 페이지.
 * 주소에 ?region= 등이 있으면 화면이 뜬 뒤 그 조건으로 바뀝니다. (정적 사이트라 피할 수 없음)
 */
export function BizBoardFallback({ posts, locale }: { posts: BizPost[]; locale: Locale }) {
  return <BizBoardView posts={posts} locale={locale} region="all" q="" page={1} />;
}

function BizBoardView({ posts, locale, region, category, q, page: rawPage, live }: ViewProps) {
  const router = useRouter();
  const ko = locale === "ko";
  const t = (l: { ko: string; en: string }) => l[locale];
  const [draft, setDraft] = useState(q);
  const navRef = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // 뒤로/앞으로 가기로 주소의 검색어가 바뀌면 입력칸도 맞춤
  useEffect(() => setDraft(q), [q]);

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

  // 글이 지워져 페이지 수가 줄었을 때 등: 마지막 페이지로
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(rawPage, pages);
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 글 상세의 '목록' 버튼이 지금 보던 조건으로 돌아오도록 기억
  const currentHref = href({ page });
  useEffect(() => {
    if (live) rememberList(listKey("biz", locale), currentHref);
  }, [live, locale, currentHref]);

  // 휴대폰: 가로로 넘기는 지역 버튼 줄에서 선택한 지역이 보이도록
  useEffect(() => {
    const nav = navRef.current;
    const el = nav?.querySelector<HTMLElement>("[aria-current]");
    if (!nav || !el || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollLeft = el.offsetLeft - (nav.clientWidth - el.offsetWidth) / 2;
  }, [region]);

  // 지도 글 수 ('전체' 글은 모든 지역에 포함)
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of REGIONS) c[r.id] = posts.filter((p) => r.id === "all" || p.region === r.id || p.region === "all").length;
    return c;
  }, [posts]);
  const current = REGION_MAP[region];
  const regionLabel = (r: string) => (isRegionId(r) ? t(REGION_MAP[r].label) : r);
  const detail = (id: number) => lp(locale, `/biz/${id}`);
  const postLang = ko ? undefined : "ko";

  const toBoardTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    boardRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="container-x">
      <div ref={boardRef} className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
        <aside className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
          <p className="mb-3 hidden text-xs font-bold uppercase tracking-widest text-muted lg:block">{ko ? "지역" : "Region"}</p>
          <nav
            ref={navRef}
            className="relative -mx-gutter flex scroll-px-gutter gap-1.5 overflow-x-auto px-gutter pb-1 [scrollbar-width:none] max-lg:[mask-image:linear-gradient(90deg,#000_88%,transparent)] lg:mx-0 lg:flex-col lg:px-0"
            aria-label={ko ? "지역" : "Regions"}
          >
            {REGIONS.map((r) => {
              const active = r.id === region;
              return (
                <Link
                  key={r.id}
                  href={href({ region: r.id, page: 1 })}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-full px-4 py-2 text-[15px] font-semibold transition lg:rounded-xl ${
                    active ? "bg-ink text-white" : "bg-paper text-ink-3 hover:bg-line/70 hover:text-ink lg:bg-transparent lg:hover:bg-paper"
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
              <h2 className="text-h3 font-extrabold">{t(current.label)}</h2>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">{ko ? `총 ${filtered.length}건` : `${filtered.length} posts`}</span>
            </div>
            {current.countries ? (
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{t(current.countries)}</p>
            ) : region === "all" ? (
              <p className="mt-2 text-[15px] text-muted">{ko ? "모든 지역의 정보를 모아 봅니다." : "Posts from every region."}</p>
            ) : null}
            {!ko && <p className="mt-2 text-[13px] font-semibold text-orange-ink">Posts on this board are written in Korean.</p>}
          </div>

          <div className="mt-6 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div className="flex gap-1.5">
              {[{ id: undefined as string | undefined, label: { ko: "전체", en: "All" } }, ...BIZ_CATEGORIES].map((c) => (
                <Link
                  key={c.id ?? "all"}
                  href={href({ category: c.id ?? null, page: 1 })}
                  scroll={false}
                  aria-current={category === c.id ? "true" : undefined}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                    category === c.id ? "border-ink bg-ink text-white" : "border-line text-ink-3 hover:border-ink hover:text-ink"
                  }`}
                >
                  {t(c.label)}
                </Link>
              ))}
            </div>
            <form
              role="search"
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
              <Link href={href({ q: null, page: 1 })} scroll={false} onClick={() => setDraft("")} className="font-semibold text-ink underline decoration-accent underline-offset-4">
                {ko ? "검색 해제" : "Clear"}
              </Link>
            </p>
          )}

          {/* 넓은 PC(1280px~): 지역 | 주·국가 | 종류 | 제목 | 게시일 — 게시자는 숨김. 그보다 좁으면 제목이 잘리지 않는 목록형 */}
          <div className="mt-6 hidden overflow-hidden rounded-2xl border border-line xl:block">
            <table className="w-full table-fixed text-[15px]">
              <thead className="bg-ink text-left text-[13px] font-semibold text-white/85">
                <tr>
                  <th className={`${ko ? "w-28" : "w-44"} px-5 py-3.5`}>{ko ? "지역" : "Region"}</th>
                  <th className="w-36 px-3 py-3.5">{ko ? "주 / 국가" : "State / Country"}</th>
                  <th className="w-28 px-3 py-3.5">{ko ? "종류" : "Type"}</th>
                  <th className="px-3 py-3.5">{ko ? "제목" : "Title"}</th>
                  <th className="w-32 px-5 py-3.5 text-right">{ko ? "게시일" : "Date"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((p) => (
                  <tr key={p.id} className={`transition hover:bg-paper ${p.is_pinned ? "bg-paper" : ""}`}>
                    <td className="truncate whitespace-nowrap px-5 py-4 font-medium text-ink-3">{regionLabel(p.region)}</td>
                    <td lang={postLang} className="truncate px-3 py-4 text-muted">{p.country || "-"}</td>
                    <td className="px-3 py-4">
                      <CategoryBadge category={p.category} label={t(bizCategoryLabel(p.category))} />
                    </td>
                    <td className="px-3 py-4">
                      <Link href={detail(p.id)} className="flex items-center gap-2 font-semibold text-ink decoration-accent underline-offset-4 hover:underline">
                        {p.is_pinned && <PinMark ko={ko} />}
                        <span lang={postLang} className="truncate">{p.title}</span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm tabular-nums text-muted">{formatDate(p.created_at, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <Empty ko={ko} search={!!q} />}
          </div>

          <ul className="mt-6 divide-y divide-line border-y border-line xl:hidden">
            {items.map((p) => (
              <li key={p.id}>
                <Link href={detail(p.id)} className="group block py-4">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                    <CategoryBadge category={p.category} label={t(bizCategoryLabel(p.category))} />
                    <span>{regionLabel(p.region)}</span>
                    {p.country && <span lang={postLang}>· {p.country}</span>}
                  </div>
                  <p className="mt-1.5 flex items-start gap-1.5 font-semibold leading-snug text-ink decoration-accent underline-offset-4 group-hover:underline">
                    {p.is_pinned && <PinMark ko={ko} className="mt-0.5" />}
                    <span lang={postLang}>{p.title}</span>
                  </p>
                  <p className="mt-1 text-xs tabular-nums text-muted">{formatDate(p.created_at, locale)}</p>
                </Link>
              </li>
            ))}
            {items.length === 0 && (
              <li>
                <Empty ko={ko} search={!!q} />
              </li>
            )}
          </ul>

          <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} makeHref={(n) => href({ page: n })} ko={ko} />
        </div>
      </div>

      {/* 지도는 목록 아래 — 첫 화면에서 글이 보이도록. 휴대폰·태블릿에서는 위의 지역 버튼 줄로 대신합니다. */}
      <div className="mx-auto mt-section-sm hidden max-w-[1100px] lg:block">
        <RegionMap locale={locale} active={region} counts={counts} hrefFor={(id) => href({ region: id, page: 1 })} onPick={toBoardTop} />
      </div>
    </div>
  );
}

function PinMark({ ko, className = "" }: { ko: boolean; className?: string }) {
  return (
    <>
      <Icon name="pin" className={`size-4 shrink-0 text-orange ${className}`} />
      <span className="sr-only">{ko ? "공지: " : "Pinned: "}</span>
    </>
  );
}

export function CategoryBadge({ category, label }: { category: string; label: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-bold ${category === "inquiry" ? "bg-orange/15 text-orange-ink" : "bg-accent/10 text-ink"}`}>
      {label}
    </span>
  );
}

function Empty({ ko, search }: { ko: boolean; search?: boolean }) {
  return (
    <p className="px-6 py-16 text-center text-[15px] text-muted">
      {search ? (ko ? "검색 결과가 없습니다." : "No matching posts.") : ko ? "등록된 글이 없습니다." : "No posts yet."}
    </p>
  );
}
