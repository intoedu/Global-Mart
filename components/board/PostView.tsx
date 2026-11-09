import Link from "next/link";
import { Icon } from "../Icon";
import { formatDate } from "@/lib/format";

type Meta = { label: string; value: string };
type Adj = { id: number; title: string } | null;

/** 게시글 상세 보기 (줄바꿈 유지, http 주소 자동 링크) — 서버·클라이언트 양쪽에서 사용 */
export function PostView({
  title,
  body,
  createdAt,
  pinned,
  meta,
  badge,
  listHref,
  adjacent,
  detailHref,
  onSelect,
  ko,
}: {
  title: string;
  body: string;
  createdAt: string;
  pinned?: boolean;
  meta: Meta[];
  badge?: string;
  listHref: string;
  adjacent: { newer: Adj; older: Adj };
  detailHref: (id: number) => string;
  /** 클라이언트 화면(주재원 전용)에서 주소 이동 대신 선택만 바꿀 때 */
  onSelect?: (id: number) => void;
  ko: boolean;
}) {
  return (
    <article className="container-x max-w-4xl py-12 lg:py-16">
      <header className="border-b-2 border-ink pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {badge && <span className="rounded-md bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">{badge}</span>}
          {pinned && <span className="rounded-md bg-ink px-2.5 py-1 text-xs font-bold text-white">{ko ? "공지" : "Pinned"}</span>}
        </div>
        <h1 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight lg:text-3xl">{title}</h1>
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
            <dd>{formatDate(createdAt)}</dd>
          </div>
        </dl>
      </header>
      <div className="min-h-48 whitespace-pre-wrap break-words py-10 text-[16px] leading-[1.9] text-ink-3">
        <Linkify text={body} />
      </div>
      <nav className="divide-y divide-line border-y border-line text-[15px]">
        {[
          { p: adjacent.newer, label: ko ? "다음 글" : "Newer" },
          { p: adjacent.older, label: ko ? "이전 글" : "Older" },
        ].map(({ p, label }) => (
          <div key={label} className="flex gap-4 px-2 py-4">
            <span className="w-16 shrink-0 font-semibold text-muted">{label}</span>
            {p ? (
              onSelect ? (
                <button type="button" onClick={() => onSelect(p.id)} className="truncate text-left hover:text-brand">
                  {p.title}
                </button>
              ) : (
                <Link href={detailHref(p.id)} className="truncate hover:text-brand">
                  {p.title}
                </Link>
              )
            ) : (
              <span className="text-muted/60">{ko ? "없습니다." : "None"}</span>
            )}
          </div>
        ))}
      </nav>
      <div className="mt-8 flex justify-center">
        <Link href={listHref} className="btn-primary">
          <Icon name="list" className="size-4" /> {ko ? "목록" : "Back to list"}
        </Link>
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
