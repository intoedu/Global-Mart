import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { REGION_MAP, bizCategoryLabel, isRegionId } from "@/lib/regions";
import { formatDate } from "@/lib/format";
import { Icon } from "@/components/Icon";
import type { Post } from "@/lib/types";

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<{ board?: string }> }) {
  const { board } = await searchParams;
  const supabase = await createClient();
  let q = supabase!.from("posts").select("id,board,category,region,country,company,title,is_pinned,view_count,created_at").order("created_at", { ascending: false }).limit(300);
  if (board === "biz" || board === "resident") q = q.eq("board", board);
  const { data } = await q;
  const posts = (data ?? []) as Post[];
  const tabs = [
    { v: undefined, l: "전체" },
    { v: "biz", l: "해외 Biz정보" },
    { v: "resident", l: "해외주재원 전용" },
  ];
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">게시글 관리</h1>
        <Link href={`/admin/posts/new${board ? `?board=${board}` : ""}`} className="btn-primary !py-2.5 !text-sm">
          <Icon name="plus" className="size-4" /> 새 글
        </Link>
      </div>
      <div className="mt-5 flex gap-1.5">
        {tabs.map((t) => (
          <Link key={t.l} href={t.v ? `/admin/posts?board=${t.v}` : "/admin/posts"} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${board === t.v ? "bg-ink text-white" : "bg-white text-ink-3"}`}>
            {t.l}
          </Link>
        ))}
      </div>
      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-[14px]">
          <thead className="border-b border-line text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-3">게시판</th>
              <th className="px-4 py-3">분류</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3 text-right">조회</th>
              <th className="px-4 py-3">게시일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-paper">
                <td className="whitespace-nowrap px-4 py-3">{p.board === "biz" ? "Biz정보" : "주재원"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {p.board === "biz"
                    ? `${isRegionId(p.region) ? REGION_MAP[p.region].label.ko : p.region} · ${bizCategoryLabel(p.category).ko}`
                    : `${p.category} · ${p.company}`}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/posts/${p.id}`} className="font-semibold hover:text-brand">
                    {p.is_pinned && "📌 "}
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted">{p.view_count}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted">{formatDate(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && <p className="p-10 text-center text-muted">글이 없습니다.</p>}
      </div>
    </>
  );
}
