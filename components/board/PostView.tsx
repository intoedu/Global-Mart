import Link from "next/link";
import { Icon } from "../Icon";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/types";

type Meta = { label: string; value: string };

/** 게시글 상세 보기 (본문은 줄바꿈 유지, URL 자동 링크) */
export function PostView({
  post,
  meta,
  badge,
  listHref,
  adjacent,
  ko,
  editHref,
}: {
  post: Post;
  meta: Meta[];
  badge?: string;
  listHref: string;
  adjacent: { newer: Pick<Post, "id" | "title"> | null; older: Pick<Post, "id" | "title"> | null };
  ko: boolean;
  editHref?: string;
}) {
  const base = listHref.split("?")[0];
  return (
    <article className="container-x max-w-4xl py-12 lg:py-16">
      <header className="border-b-2 border-ink pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {badge && <span className="rounded-md bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">{badge}</span>}
          {post.is_pinned && <span className="rounded-md bg-ink px-2.5 py-1 text-xs font-bold text-white">{ko ? "공지" : "Pinned"}</span>}
        </div>
        <h1 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight lg:text-3xl">{post.title}</h1>
        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
          {meta
            .filter((m) => m.value)
            .map((m) => (
              <div key={m.label} className="flex gap-1.5">
                <dt className="font-semibold text-ink-3">{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          <div className="flex gap-1.5">
            <dt className="font-semibold text-ink-3">{ko ? "게시일" : "Posted"}</dt>
            <dd>{formatDate(post.created_at)}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="sr-only">{ko ? "조회" : "Views"}</dt>
            <dd className="flex items-center gap-1">
              <Icon name="eye" className="size-4" /> {post.view_count.toLocaleString()}
            </dd>
          </div>
        </dl>
      </header>
      <div className="min-h-48 whitespace-pre-wrap break-words py-10 text-[16px] leading-[1.9] text-ink-3">
        <Linkify text={post.body} />
      </div>
      <nav className="divide-y divide-line border-y border-line text-[15px]">
        {[
          { p: adjacent.newer, label: ko ? "다음 글" : "Newer", icon: "chevron-down" },
          { p: adjacent.older, label: ko ? "이전 글" : "Older", icon: "chevron-down" },
        ].map(({ p, label }) => (
          <div key={label} className="flex gap-4 px-2 py-4">
            <span className="w-16 shrink-0 font-semibold text-muted">{label}</span>
            {p ? (
              <Link href={`${base}/${p.id}`} className="truncate hover:text-brand">
                {p.title}
              </Link>
            ) : (
              <span className="text-muted/60">{ko ? "없습니다." : "None"}</span>
            )}
          </div>
        ))}
      </nav>
      <div className="mt-8 flex justify-center gap-2">
        <Link href={listHref} className="btn-primary">
          <Icon name="list" className="size-4" /> {ko ? "목록" : "Back to list"}
        </Link>
        {editHref && (
          <Link href={editHref} className="btn-ghost">
            <Icon name="edit" className="size-4" /> {ko ? "수정" : "Edit"}
          </Link>
        )}
      </div>
    </article>
  );
}

function Linkify({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s<>"']+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer nofollow" className="text-brand underline underline-offset-2">
            {part}
          </a>
        ) : (
          part
        )
      )}
    </>
  );
}
