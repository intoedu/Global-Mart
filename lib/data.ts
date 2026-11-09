import "server-only";
import { cache } from "react";
import { createClient } from "./supabase/server";
import { createServiceClient } from "./supabase/service";
import { residentAccess } from "./resident-access";
import { isSupabaseConfigured } from "./supabase/env";
import { SAMPLE_POSTS } from "./sample-data";
import type { Board, Inquiry, Post, Profile, Viewer } from "./types";

/**
 * 게시판별 DB 클라이언트
 * - biz: 일반 클라이언트 (RLS: 누구나 열람)
 * - resident: 공용 비밀번호 확인(또는 관리자)을 통과한 경우에만 service role 클라이언트
 */
async function clientFor(board: Board) {
  if (board === "biz") return { db: await createClient(), allowed: true };
  const viewer = await getViewer();
  const access = await residentAccess(!!viewer?.isAdmin);
  if (access === "demo") return { db: null, allowed: true };
  return { db: access === "open" ? createServiceClient() : null, allowed: access === "open" };
}

export const PAGE_SIZE = 15;

/** 현재 로그인한 사용자 (요청당 1회만 조회) */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  return { userId: user.id, email: user.email ?? "", profile: profile ?? null, isAdmin: profile?.role === "admin" };
});

/** 검색어에서 PostgREST 필터 문법에 영향을 주는 문자를 제거 */
function sanitizeQuery(q: string) {
  return q.replace(/[%_,().*\\]/g, " ").trim().slice(0, 50);
}

export type ListParams = {
  board: Board;
  region?: string;
  category?: string;
  q?: string;
  page?: number;
  pageSize?: number;
};

export async function listPosts({
  board,
  region,
  category,
  q,
  page = 1,
  pageSize = PAGE_SIZE,
}: ListParams): Promise<{ items: Post[]; total: number; demo: boolean }> {
  const query = q ? sanitizeQuery(q) : "";
  const from = (page - 1) * pageSize;

  const { db: supabase, allowed } = await clientFor(board);
  if (!allowed) return { items: [], total: 0, demo: false };
  if (!supabase) {
    let items = SAMPLE_POSTS.filter((p) => p.board === board);
    if (region && region !== "all") items = items.filter((p) => p.region === region || p.region === "all");
    if (category) items = items.filter((p) => p.category === category);
    if (query) {
      const k = query.toLowerCase();
      items = items.filter((p) => [p.title, p.body, p.country, p.company].some((v) => v.toLowerCase().includes(k)));
    }
    items.sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.created_at.localeCompare(a.created_at));
    return { items: items.slice(from, from + pageSize), total: items.length, demo: true };
  }

  let req = supabase
    .from("posts")
    .select("id,board,category,region,country,company,title,author_name,is_pinned,view_count,created_at,updated_at", {
      count: "exact",
    })
    .eq("board", board);
  if (region && region !== "all") req = req.in("region", [region, "all"]);
  if (category) req = req.eq("category", category);
  if (query) req = req.or(`title.ilike.%${query}%,body.ilike.%${query}%,country.ilike.%${query}%,company.ilike.%${query}%`);
  const { data, count, error } = await req
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);
  if (error) {
    console.error("listPosts", error.message);
    return { items: [], total: 0, demo: false };
  }
  return { items: (data ?? []).map((p) => ({ ...p, body: "" }) as Post), total: count ?? 0, demo: false };
}

export async function getPost(board: Board, id: number): Promise<Post | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  const { db: supabase, allowed } = await clientFor(board);
  if (!allowed) return null;
  if (!supabase) return SAMPLE_POSTS.find((p) => p.board === board && p.id === id) ?? null;
  const { data } = await supabase.from("posts").select("*").eq("board", board).eq("id", id).maybeSingle<Post>();
  if (data) {
    if (board === "biz") await supabase.rpc("increment_post_view", { p_id: id });
    else await supabase.from("posts").update({ view_count: data.view_count + 1 }).eq("id", id);
  }
  return data ?? null;
}

/** 이전·다음 글 */
export async function getAdjacent(board: Board, post: Post) {
  const { db: supabase } = await clientFor(board);
  if (!supabase) {
    const list = SAMPLE_POSTS.filter((p) => p.board === board).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const i = list.findIndex((p) => p.id === post.id);
    return { newer: list[i - 1] ?? null, older: list[i + 1] ?? null };
  }
  const cols = "id,title";
  const [{ data: newer }, { data: older }] = await Promise.all([
    supabase.from("posts").select(cols).eq("board", board).gt("created_at", post.created_at).order("created_at").limit(1),
    supabase
      .from("posts")
      .select(cols)
      .eq("board", board)
      .lt("created_at", post.created_at)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);
  return {
    newer: (newer?.[0] as Pick<Post, "id" | "title"> | undefined) ?? null,
    older: (older?.[0] as Pick<Post, "id" | "title"> | undefined) ?? null,
  };
}

// ---------------- 관리자 ----------------

export async function adminListInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(500);
  return (data as Inquiry[]) ?? [];
}

export async function adminStats() {
  const supabase = await createClient();
  if (!supabase) return null;
  const head = { count: "exact" as const, head: true };
  const [biz, resident, newInq] = await Promise.all([
    supabase.from("posts").select("id", head).eq("board", "biz"),
    supabase.from("posts").select("id", head).eq("board", "resident"),
    supabase.from("inquiries").select("id", head).eq("status", "new"),
  ]);
  return {
    biz: biz.count ?? 0,
    resident: resident.count ?? 0,
    newInquiries: newInq.count ?? 0,
  };
}

export { isSupabaseConfigured };
