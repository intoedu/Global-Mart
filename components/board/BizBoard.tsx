"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { REGIONS, REGION_MAP, isRegionId, type RegionId } from "@/lib/regions";
import { formatDate } from "@/lib/format";
import { lp } from "@/lib/paths";
import { CATEGORY_MAP, categoryLabel, isRegional, listKey, rememberList } from "@/lib/board";
import type { Locale } from "@/lib/i18n";
import type { BoardCategory, BoardPost } from "@/lib/types";
import { Icon } from "../Icon";
import { Pagination } from "./Pagination";
import { RegionMap } from "./RegionMap";
import { ClipIcon } from "./SecureContent";

const PAGE_SIZE = 15;

/** 목록에서 고른 카테고리 — "all" 은 모든 카테고리의 최신 글 */
export type BoardView = BoardCategory | "all";

/** 목록 주소 (/biz/?cat=…&region=…&q=…&page=…) */
export function boardHref(locale: Locale, o: { cat: BoardView; region?: string; q?: string; page?: number }) {
  const p = new URLSearchParams();
  if (o.cat !== "all") p.set("cat", o.cat);
  if (o.cat !== "all" && isRegional(o.cat) && o.region && o.region !== "all") p.set("region", o.region);
  if (o.q) p.set("q", o.q);
  if (o.page && o.page > 1) p.set("page", String(o.page));
  const s = p.toString();
  return `${lp(locale, "/biz")}${s ? `?${s}` : ""}`;
}

/**
 * 해외Biz정보(해외주재원 전용) 목록 — 회원 비밀번호로 푼 글
 * - 해외시장·해외입찰: 나라별 게시판 (지역 탭 + 국가 머리말 + 지도)
 * - 국내우수 Item·공지·전체: 단일 게시판
 * 지역·검색·페이지는 주소로 유지. 글 보기는 같은 페이지의 ?post=번호 (components/board/BizApp)
 */
export function BizBoard({ posts, view, locale, footer }: { posts: BoardPost[]; view: BoardView; locale: Locale; footer?: React.ReactNode }) {
  const sp = useSearchParams();
  const regional = view !== "all" && isRegional(view);
  const region: RegionId = regional && isRegionId(sp.get("region")) ? (sp.get("region") as RegionId) : "all";
  const q = sp.get("q")?.trim() || "";
  const page = Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1);
  return <BoardList key={view} posts={posts} view={view} regional={regional} locale={locale} region={region} q={q} page={page} footer={footer} />;
}

type ListProps = { posts: BoardPost[]; view: BoardView; regional: boolean; locale: Locale; region: RegionId; q: string; page: number; footer?: React.ReactNode };

function BoardList({ posts, view, regional, locale, region, q, page: rawPage, footer }: ListProps) {
  const router = useRouter();
  const ko = locale === "ko";
  const t = (l: { ko: string; en: string }) => l[locale];
  const [draft, setDraft] = useState(q);
  const navRef = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // 뒤로/앞으로 가기로 주소의 검색어가 바뀌면 입력칸도 맞춤
  useEffect(() => setDraft(q), [q]);

  const href = (o: { region?: string; q?: string | null; page?: number }) =>
    boardHref(locale, { cat: view, region: o.region ?? region, q: o.q === null ? "" : (o.q ?? q), page: o.page });

  const filtered = useMemo(() => {
    let list = posts;
    if (regional && region !== "all") list = list.filter((p) => p.region === region || p.region === "all");
    if (q) {
      const k = q.toLowerCase();
      list = list.filter((p) => [p.title, p.body, p.country, p.company, p.kind].some((v) => (v ?? "").toLowerCase().includes(k)));
    }
    return list;
  }, [posts, regional, region, q]);

  // 글이 지워져 페이지 수가 줄었을 때 등: 마지막 페이지로
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(rawPage, pages);
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 글 상세의 '목록' 버튼이 지금 보던 조건으로 돌아오도록 기억
  const currentHref = href({ page });
  useEffect(() => {
    rememberList(listKey(locale), currentHref);
  }, [locale, currentHref]);

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

  const regionLabel = (r?: string) => (r && isRegionId(r) ? t(REGION_MAP[r].label) : (r ?? ""));
  const detail = (id: number) => lp(locale, `/biz?post=${id}`);
  const postLang = ko ? undefined : "ko";
  const toBoardTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    boardRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  };

  // 머리말
  const current = REGION_MAP[region];
  const heading = regional ? `${t(categoryLabel(view as BoardCategory))} · ${t(current.label)}` : view === "all" ? (ko ? "전체 글" : "All posts") : t(categoryLabel(view));
  const intro = regional
    ? current.countries
      ? t(current.countries)
      : region === "all"
        ? ko
          ? "모든 지역의 정보를 모아 봅니다. 지역을 고르면 그 지역의 글만 볼 수 있습니다."
          : "Posts from every region. Choose a region to see only its posts."
        : ""
    : view === "all"
      ? ko
        ? "해외시장·해외입찰·국내우수 Item·공지의 최신 글을 모아 봅니다."
        : "The latest posts from every category."
      : t(CATEGORY_MAP[view].intro);

  // 열 구성 (넓은 화면 표)
  const showRegion = regional;
  const showCat = view === "all";
  const showItem = view === "items";
  const searchHint = regional
    ? ko
      ? "제목·내용·국가 검색"
      : "Search title, content, country"
    : showItem
      ? ko
        ? "회사명·제목·내용 검색"
        : "Search company, title, content"
      : ko
        ? "제목·내용 검색"
        : "Search title, content";

  const header = (
    <>
      <div className="rounded-2xl bg-paper p-6 lg:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-h3 font-extrabold">{heading}</h2>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">{ko ? `총 ${filtered.length}건` : `${filtered.length} posts`}</span>
        </div>
        {intro && <p className="mt-2 text-[15px] leading-relaxed text-muted">{intro}</p>}
        {!ko && <p className="mt-2 text-[13px] font-semibold text-orange-ink">Posts on this board are written in Korean.</p>}
      </div>

      <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row sm:items-center">
        <form
          role="search"
          className="relative sm:w-80"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(href({ q: draft.trim() || null, page: 1 }), { scroll: false });
          }}
        >
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={searchHint}
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
    </>
  );

  const table = (
    <>
      {/* 넓은 PC: 표 — 그보다 좁으면 제목이 잘리지 않는 목록형. 해외시장·해외입찰은 게시자를 숨김 */}
      <div className={`mt-6 hidden overflow-hidden rounded-2xl border border-line ${regional ? "xl:block" : "lg:block"}`}>
        <table className="w-full table-fixed text-[15px]">
          <thead className="bg-ink text-left text-[13px] font-semibold text-white/85">
            <tr>
              {showRegion && <th className={`${ko ? "w-28" : "w-44"} px-5 py-3.5`}>{ko ? "지역" : "Region"}</th>}
              {showRegion && <th className="w-36 px-3 py-3.5">{ko ? "주 / 국가" : "State / Country"}</th>}
              {showCat && <th className={`${ko ? "w-32" : "w-48"} px-5 py-3.5`}>{ko ? "구분" : "Category"}</th>}
              {showItem && <th className="w-28 px-5 py-3.5">{ko ? "종류" : "Type"}</th>}
              {showItem && <th className="w-44 px-3 py-3.5">{ko ? "회사명" : "Company"}</th>}
              <th className={`${showRegion || showCat || showItem ? "px-3" : "px-5"} py-3.5`}>{ko ? "제목" : "Title"}</th>
              <th className="w-32 px-5 py-3.5 text-right">{ko ? "게시일" : "Date"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((p) => (
              <tr key={p.id} className={`transition hover:bg-paper ${p.is_pinned ? "bg-paper" : ""}`}>
                {showRegion && <td className="truncate whitespace-nowrap px-5 py-4 font-medium text-ink-3">{regionLabel(p.region)}</td>}
                {showRegion && (
                  <td lang={postLang} className="truncate px-3 py-4 text-muted">
                    {p.country || "-"}
                  </td>
                )}
                {showCat && (
                  <td className="px-5 py-4">
                    <CategoryBadge category={p.category} label={t(categoryLabel(p.category))} />
                  </td>
                )}
                {showItem && (
                  <td lang={postLang} className="px-5 py-4">
                    {p.kind && <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[12px] font-bold text-ink">{p.kind}</span>}
                  </td>
                )}
                {showItem && (
                  <td lang={postLang} className="truncate px-3 py-4 font-medium text-ink-3">
                    {p.company || "-"}
                  </td>
                )}
                <td className={`${showRegion || showCat || showItem ? "px-3" : "px-5"} py-4`}>
                  <Link href={detail(p.id)} className="flex items-center gap-2 font-semibold text-ink decoration-accent underline-offset-4 hover:underline">
                    {p.is_pinned && <PinMark ko={ko} />}
                    <span lang={postLang} className="truncate">
                      {p.title}
                    </span>
                    {!!p.files?.length && <FilesMark ko={ko} />}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right text-sm tabular-nums text-muted">{formatDate(p.created_at, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <Empty ko={ko} search={!!q} />}
      </div>

      <ul className={`mt-6 divide-y divide-line border-y border-line ${regional ? "xl:hidden" : "lg:hidden"}`}>
        {items.map((p) => {
          const sub = showRegion
            ? [regionLabel(p.region), p.country].filter(Boolean)
            : showItem
              ? [p.kind, p.company].filter(Boolean)
              : [];
          return (
            <li key={p.id}>
              <Link href={detail(p.id)} className="group block py-4">
                {(showCat || sub.length > 0) && (
                  <div lang={showItem ? postLang : undefined} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                    {showCat && <CategoryBadge category={p.category} label={t(categoryLabel(p.category))} />}
                    {sub.map((s, i) => (
                      <span key={i} lang={i > 0 || showItem ? postLang : undefined}>
                        {i > 0 ? "· " : ""}
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-1.5 flex items-start gap-1.5 font-semibold leading-snug text-ink decoration-accent underline-offset-4 group-hover:underline">
                  {p.is_pinned && <PinMark ko={ko} className="mt-0.5" />}
                  <span lang={postLang}>{p.title}</span>
                  {!!p.files?.length && <FilesMark ko={ko} className="mt-1" />}
                </p>
                <p className="mt-1 text-xs tabular-nums text-muted">{formatDate(p.created_at, locale)}</p>
              </Link>
            </li>
          );
        })}
        {items.length === 0 && (
          <li>
            <Empty ko={ko} search={!!q} />
          </li>
        )}
      </ul>

      <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} makeHref={(n) => href({ page: n })} ko={ko} />
      {footer && <div className="mt-8 flex justify-end">{footer}</div>}
    </>
  );

  if (!regional)
    return (
      <div ref={boardRef} className="container-x">
        {header}
        {table}
      </div>
    );

  return (
    <div className="container-x">
      <div ref={boardRef} className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
        <aside className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+var(--subnav-h,0px)+1.5rem)] lg:self-start">
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
          {header}
          {table}
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
      <span className="sr-only">{ko ? "고정: " : "Pinned: "}</span>
    </>
  );
}

function FilesMark({ ko, className = "" }: { ko: boolean; className?: string }) {
  return (
    <span className={`shrink-0 text-muted ${className}`} title={ko ? "첨부 파일·이미지 있음" : "Has attachments"}>
      <ClipIcon className="size-3.5" />
      <span className="sr-only">{ko ? " (첨부 있음)" : " (attachments)"}</span>
    </span>
  );
}

const BADGE: Record<BoardCategory, string> = {
  market: "bg-accent/10 text-ink",
  tender: "bg-orange/15 text-orange-ink",
  items: "bg-emerald-50 text-emerald-800",
  notice: "bg-ink text-white",
};

export function CategoryBadge({ category, label }: { category: BoardCategory; label: string }) {
  return <span className={`inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-bold ${BADGE[category] ?? BADGE.market}`}>{label}</span>;
}

function Empty({ ko, search }: { ko: boolean; search?: boolean }) {
  return (
    <p className="px-6 py-16 text-center text-[15px] text-muted">
      {search ? (ko ? "검색 결과가 없습니다." : "No matching posts.") : ko ? "등록된 글이 없습니다." : "No posts yet."}
    </p>
  );
}
