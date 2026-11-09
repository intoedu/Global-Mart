import type { Metadata } from "next";
import Link from "next/link";
import { getT, getLocale } from "@/lib/i18n";
import { BIZ_CATEGORIES, REGIONS, REGION_MAP, bizCategoryLabel, isRegionId, type RegionId } from "@/lib/regions";
import { BIZ_INTRO } from "@/lib/content";
import { listPosts, getViewer, PAGE_SIZE } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { PageHero } from "@/components/PageHero";
import { Pagination } from "@/components/board/Pagination";
import { SearchBar } from "@/components/board/SearchBar";
import { DemoNotice } from "@/components/board/DemoNotice";
import { Icon } from "@/components/Icon";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getLocale()) === "ko" ? "해외 Biz정보" : "Global Biz Info" };
}

type SP = Promise<{ region?: string; category?: string; q?: string; page?: string }>;

export default async function BizListPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { locale, t } = await getT();
  const ko = locale === "ko";
  const region: RegionId = isRegionId(sp.region) ? sp.region : "all";
  const category = BIZ_CATEGORIES.some((c) => c.id === sp.category) ? sp.category : undefined;
  const q = sp.q?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [{ items, total, demo }, viewer] = await Promise.all([
    listPosts({ board: "biz", region, category, q, page }),
    getViewer(),
  ]);
  const current = REGION_MAP[region];

  const href = (o: { region?: string; category?: string; q?: string; page?: number }) => {
    const p = new URLSearchParams();
    const r = o.region ?? region;
    if (r !== "all") p.set("region", r);
    const c = "category" in o ? o.category : category;
    if (c) p.set("category", c);
    const qq = "q" in o ? o.q : q;
    if (qq) p.set("q", qq);
    if (o.page && o.page > 1) p.set("page", String(o.page));
    const s = p.toString();
    return `/biz${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHero eyebrow="Global Biz Info" title={ko ? "해외 Biz정보" : "Global Biz Info"} lead={t(BIZ_INTRO)} crumbs={[{ label: ko ? "해외 Biz정보" : "Global Biz Info" }]} />

      <section className="py-10 lg:py-16">
        <div className="container-x grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
          {/* 지역 메뉴: PC 좌측 세로 / 모바일 가로 스크롤 */}
          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <p className="mb-3 hidden text-xs font-bold uppercase tracking-widest text-muted lg:block">{ko ? "지역" : "Region"}</p>
            <nav className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:px-0" aria-label={ko ? "지역" : "Regions"}>
              {REGIONS.map((r) => {
                const active = r.id === region;
                return (
                  <Link
                    key={r.id}
                    href={href({ region: r.id, page: 1 })}
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
            {demo && <DemoNotice ko={ko} />}

            {/* 게시판 머리말: 지역명 + 나라 목록 */}
            <div className="rounded-2xl bg-paper p-6 lg:p-7">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-extrabold tracking-tight">{t(current.label)}</h2>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">
                  {ko ? `총 ${total}건` : `${total} posts`}
                </span>
              </div>
              {current.countries ? (
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{t(current.countries)}</p>
              ) : region === "all" ? (
                <p className="mt-2 text-[15px] text-muted">{ko ? "모든 지역의 정보를 모아 봅니다." : "Posts from every region."}</p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div className="flex gap-1.5">
                {[{ id: undefined, label: { ko: "전체", en: "All" } }, ...BIZ_CATEGORIES].map((c) => (
                  <Link
                    key={c.id ?? "all"}
                    href={href({ category: c.id, page: 1 })}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                      category === c.id ? "border-brand bg-brand text-white" : "border-line text-ink-3 hover:border-brand hover:text-brand"
                    }`}
                  >
                    {t(c.label)}
                  </Link>
                ))}
              </div>
              <div className="lg:w-80">
                <SearchBar action="/biz" q={q} hidden={{ region: region !== "all" ? region : undefined, category }} placeholder={ko ? "제목·내용·국가 검색" : "Search title, content, country"} />
              </div>
            </div>

            {q && (
              <p className="mt-4 text-sm text-muted">
                {ko ? `'${q}' 검색 결과 ${total}건` : `${total} results for '${q}'`} ·{" "}
                <Link href={href({ q: undefined, page: 1 })} className="font-semibold text-brand">
                  {ko ? "검색 해제" : "Clear"}
                </Link>
              </p>
            )}

            {/* PC: 표 (지역 | 주·국가 | 종류 | 제목 | 게시일) — 게시자는 숨김 */}
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
                      <td className="px-5 py-4 font-medium text-ink-3">{isRegionId(p.region) ? t(REGION_MAP[p.region].label) : p.region}</td>
                      <td className="truncate px-3 py-4 text-muted">{p.country || "-"}</td>
                      <td className="px-3 py-4">
                        <CategoryBadge category={p.category} label={t(bizCategoryLabel(p.category))} />
                      </td>
                      <td className="px-3 py-4">
                        <Link href={`/biz/${p.id}`} className="flex items-center gap-2 font-semibold text-ink hover:text-brand">
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

            {/* 모바일: 카드 목록 */}
            <ul className="mt-6 divide-y divide-line border-y border-line md:hidden">
              {items.map((p) => (
                <li key={p.id}>
                  <Link href={`/biz/${p.id}`} className="block py-4">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <CategoryBadge category={p.category} label={t(bizCategoryLabel(p.category))} />
                      <span>{isRegionId(p.region) ? t(REGION_MAP[p.region].label) : p.region}</span>
                      {p.country && <span>· {p.country}</span>}
                    </div>
                    <p className="mt-1.5 font-semibold leading-snug text-ink">{p.title}</p>
                    <p className="mt-1 text-xs tabular-nums text-muted">{formatDate(p.created_at)}</p>
                  </Link>
                </li>
              ))}
              {items.length === 0 && <Empty ko={ko} />}
            </ul>

            <Pagination page={page} total={total} pageSize={PAGE_SIZE} makeHref={(n) => href({ page: n })} />

            {viewer?.isAdmin && (
              <div className="mt-8 flex justify-end">
                <Link href={`/admin/posts/new?board=biz&region=${region}`} className="btn-primary">
                  <Icon name="plus" className="size-4" /> {ko ? "글쓰기" : "New post"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function CategoryBadge({ category, label }: { category: string; label: string }) {
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-[12px] font-bold ${
        category === "inquiry" ? "bg-accent/15 text-[#a8661a]" : "bg-brand-soft text-brand"
      }`}
    >
      {label}
    </span>
  );
}

function Empty({ ko }: { ko: boolean }) {
  return <p className="px-6 py-16 text-center text-[15px] text-muted">{ko ? "등록된 글이 없습니다." : "No posts yet."}</p>;
}
