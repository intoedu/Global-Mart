import raw from "@/data/biz.json";
import type { BizData, BizPost } from "./types";

/** 빌드 시점에 data/biz.json 을 읽습니다. (관리자가 저장하면 GitHub Actions 가 다시 빌드) — next_id 등 다른 필드는 무시 */
export function getBizPosts(): BizPost[] {
  const posts = (raw as BizData).posts ?? [];
  return [...posts].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.created_at.localeCompare(a.created_at));
}

export function getBizPost(id: number) {
  return getBizPosts().find((p) => p.id === id) ?? null;
}

/** 이전·다음 글 (게시일 기준) */
export function getAdjacent(id: number) {
  const list = [...getBizPosts()].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const i = list.findIndex((p) => p.id === id);
  return { newer: list[i - 1] ?? null, older: list[i + 1] ?? null };
}
