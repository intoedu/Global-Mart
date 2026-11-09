import type { Metadata } from "next";
import Link from "next/link";
import { getT, getLocale } from "@/lib/i18n";
import { RESIDENT_INTRO } from "@/lib/content";
import { listPosts, getViewer, PAGE_SIZE } from "@/lib/data";
import { residentAccess } from "@/lib/resident-access";
import { leaveResident } from "@/app/actions/resident";
import { formatDate } from "@/lib/format";
import { PageHero } from "@/components/PageHero";
import { Pagination } from "@/components/board/Pagination";
import { SearchBar } from "@/components/board/SearchBar";
import { DemoNotice } from "@/components/board/DemoNotice";
import { ResidentGate } from "@/components/board/ResidentGate";
import { Icon } from "@/components/Icon";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getLocale()) === "ko" ? "해외주재원 전용" : "For Overseas Staff", robots: { index: false } };
}

type SP = Promise<{ q?: string; page?: string }>;

export default async function ResidentPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { locale, t } = await getT();
  const ko = locale === "ko";
  const viewer = await getViewer();
  const hero = (
    <PageHero eyebrow="For Overseas Staff" title={ko ? "해외주재원 전용" : "For Overseas Staff"} lead={t(RESIDENT_INTRO)} crumbs={[{ label: ko ? "해외주재원 전용" : "For Overseas Staff" }]} />
  );

  // DB 미연결(미리보기)에서는 예시 공개. 운영 시에는 공용 비밀번호 입장 또는 관리자만 열람
  const access = await residentAccess(!!viewer?.isAdmin);
  if (access === "locked" || access === "unset") {
    return (
      <>
        {hero}
        <ResidentGate ko={ko} next="/resident" unset={access === "unset"} />
      </>
    );
  }

  const q = sp.q?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const { items, total, demo } = await listPosts({ board: "resident", q, page });
  const href = (n: number) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (n > 1) p.set("page", String(n));
    const s = p.toString();
    return `/resident${s ? `?${s}` : ""}`;
  };

  return (
    <>
      {hero}
      <section className="py-10 lg:py-16">
        <div className="container-x">
          {demo && <DemoNotice ko={ko} />}
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-[15px] text-muted">
              {ko ? "다음은 글로벌마트와 연결된 국내 기업들과 그 취급 제품들입니다." : "Korean companies connected with Globalmart and their products."}{" "}
              <span className="font-semibold text-ink">{ko ? `총 ${total}건` : `${total} posts`}</span>
            </p>
            <div className="sm:w-80">
              <SearchBar action="/resident" q={q} placeholder={ko ? "회사명·제목·내용 검색" : "Search company, title, content"} />
            </div>
          </div>

          {/* PC 표: 종류 | 회사명 | 제목 | 게시일 | 게시자 */}
          <div className="mt-6 hidden overflow-hidden rounded-2xl border border-line md:block">
            <table className="w-full table-fixed text-[15px]">
              <thead className="bg-ink text-left text-[13px] font-semibold text-white/85">
                <tr>
                  <th className="w-24 px-5 py-3.5">{ko ? "종류" : "Type"}</th>
                  <th className="w-44 px-3 py-3.5">{ko ? "회사명" : "Company"}</th>
                  <th className="px-3 py-3.5">{ko ? "제목" : "Title"}</th>
                  <th className="w-32 px-3 py-3.5">{ko ? "게시일" : "Date"}</th>
                  <th className="w-28 px-5 py-3.5">{ko ? "게시자" : "Author"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((p) => (
                  <tr key={p.id} className={`transition hover:bg-brand-soft/40 ${p.is_pinned ? "bg-paper" : ""}`}>
                    <td className="px-5 py-4">
                      {p.category && <span className="rounded-md bg-brand-soft px-2 py-0.5 text-[12px] font-bold text-brand">{p.category}</span>}
                    </td>
                    <td className="truncate px-3 py-4 font-medium text-ink-3">{p.company || "-"}</td>
                    <td className="px-3 py-4">
                      <Link href={`/resident/${p.id}`} className="flex items-center gap-2 font-semibold hover:text-brand">
                        {p.is_pinned && <Icon name="pin" className="size-4 shrink-0 text-brand" />}
                        <span className="truncate">{p.title}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-4 text-sm tabular-nums text-muted">{formatDate(p.created_at)}</td>
                    <td className="truncate px-5 py-4 text-sm text-muted">{p.author_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <p className="px-6 py-16 text-center text-muted">{ko ? "등록된 글이 없습니다." : "No posts yet."}</p>}
          </div>

          <ul className="mt-6 divide-y divide-line border-y border-line md:hidden">
            {items.map((p) => (
              <li key={p.id}>
                <Link href={`/resident/${p.id}`} className="block py-4">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    {p.category && <span className="rounded-md bg-brand-soft px-2 py-0.5 font-bold text-brand">{p.category}</span>}
                    <span>{p.company}</span>
                  </div>
                  <p className="mt-1.5 font-semibold leading-snug">{p.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatDate(p.created_at)} · {p.author_name}
                  </p>
                </Link>
              </li>
            ))}
            {items.length === 0 && <li className="py-16 text-center text-muted">{ko ? "등록된 글이 없습니다." : "No posts yet."}</li>}
          </ul>

          <Pagination page={page} total={total} pageSize={PAGE_SIZE} makeHref={href} />

          <div className="mt-8 flex justify-end gap-2">
            {access === "open" && !viewer?.isAdmin && (
              <form action={leaveResident}>
                <button className="btn-ghost !text-sm">
                  <Icon name="lock" className="size-4" /> {ko ? "나가기 (잠금)" : "Lock & leave"}
                </button>
              </form>
            )}
            {viewer?.isAdmin && (
              <Link href="/admin/posts/new?board=resident" className="btn-primary">
                <Icon name="plus" className="size-4" /> {ko ? "글쓰기" : "New post"}
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
