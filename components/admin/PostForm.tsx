"use client";

import { useActionState, useState } from "react";
import { savePost } from "@/app/actions/admin";
import { BIZ_CATEGORIES, REGIONS } from "@/lib/regions";
import type { Post } from "@/lib/types";

const RESIDENT_CATEGORIES = ["제품", "기술", "서비스", "기타"];

export function PostForm({ post, defaults }: { post?: Post; defaults?: { board?: string; region?: string } }) {
  const [state, action, pending] = useActionState(savePost, null);
  const [board, setBoard] = useState<string>(post?.board ?? (defaults?.board === "resident" ? "resident" : "biz"));
  const region = REGIONS.find((r) => r.id === (post?.region ?? defaults?.region)) ?? REGIONS[0];
  const [regionId, setRegionId] = useState<string>(region.id);
  const hint = REGIONS.find((r) => r.id === regionId)?.countries?.ko;

  return (
    <form action={action} className="card space-y-5 p-6 lg:p-8">
      {post && <input type="hidden" name="id" value={post.id} />}
      {state?.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}

      <fieldset>
        <legend className="label">게시판</legend>
        <div className="flex gap-2">
          {[
            { v: "biz", l: "해외 Biz정보" },
            { v: "resident", l: "해외주재원 전용" },
          ].map((o) => (
            <label key={o.v} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold ${board === o.v ? "border-brand bg-brand text-white" : "border-line"}`}>
              <input type="radio" name="board" value={o.v} checked={board === o.v} onChange={() => setBoard(o.v)} className="sr-only" />
              {o.l}
            </label>
          ))}
        </div>
      </fieldset>

      {board === "biz" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="region">지역</label>
            <select id="region" name="region" value={regionId} onChange={(e) => setRegionId(e.target.value)} className="input">
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label.ko}
                  {r.id === "all" ? " (모든 지역에 표시)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="country">주 또는 국가</label>
            <input id="country" name="country" defaultValue={post?.country} maxLength={80} className="input" placeholder="예: 베트남, 마하라슈트라주" />
          </div>
          <div>
            <label className="label" htmlFor="category">종류</label>
            <select id="category" name="category" defaultValue={post?.category ?? "industry"} className="input">
              {BIZ_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label.ko}</option>
              ))}
            </select>
          </div>
          {hint && <p className="text-xs text-muted sm:col-span-3">이 지역 국가: {hint}</p>}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="category-r">종류</label>
            <input id="category-r" name="category" list="resident-cats" defaultValue={post?.category ?? "제품"} maxLength={40} className="input" />
            <datalist id="resident-cats">
              {RESIDENT_CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="company">회사명</label>
            <input id="company" name="company" defaultValue={post?.company} maxLength={100} className="input" />
          </div>
        </div>
      )}

      <div>
        <label className="label" htmlFor="title">제목 *</label>
        <input id="title" name="title" required defaultValue={post?.title} maxLength={200} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="body">내용</label>
        <textarea id="body" name="body" rows={14} defaultValue={post?.body} className="input resize-y leading-relaxed" placeholder="줄바꿈은 그대로 표시되고, http로 시작하는 주소는 자동으로 링크가 됩니다." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="author_name">게시자</label>
          <input id="author_name" name="author_name" defaultValue={post?.author_name} maxLength={50} className="input" placeholder="비워 두면 관리자 이름" />
          {board === "biz" && <p className="mt-1 text-xs text-muted">해외 Biz정보 목록에서는 게시자가 표시되지 않습니다.</p>}
        </div>
        <label className="flex items-center gap-2.5 self-center text-sm font-semibold">
          <input type="checkbox" name="is_pinned" defaultChecked={post?.is_pinned} className="size-4 accent-brand" />
          공지로 목록 맨 위에 고정
        </label>
      </div>
      <div className="flex justify-end">
        <button disabled={pending} className="btn-primary px-8">
          {pending ? "저장 중…" : post ? "수정 저장" : "등록"}
        </button>
      </div>
    </form>
  );
}
