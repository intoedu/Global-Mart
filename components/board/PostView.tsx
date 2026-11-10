import Link from "next/link";
import { Icon } from "../Icon";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { BackToList } from "./BackToList";

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
  listStorageKey,
  adjacent,
  detailHref,
  onSelect,
  ko,
  locale,
  titleAs = "h1",
  contentLang,
  footer,
}: {
  title: string;
  body: string;
  createdAt: string;
  pinned?: boolean;
  meta: Meta[];
  badge?: string;
  listHref: string;
  /** 주면 '목록' 버튼이 이 탭에서 마지막으로 보던 목록 주소(검색·페이지 포함)로 돌아갑니다. */
  listStorageKey?: string;
  adjacent: { newer: Adj; older: Adj };
  detailHref: (id: number) => string;
  /** 클라이언트 화면(주재원 전용)에서 주소 이동 대신 선택만 바꿀 때 */
  onSelect?: (id: number) => void;
  ko: boolean;
  locale?: Locale;
  /** 페이지에 이미 h1 이 있으면 "h2" */
  titleAs?: "h1" | "h2";
  /** 글 제목·본문의 언어 (영어 화면에서 한국어 글이면 "ko") */
  contentLang?: string;
  /** '목록' 버튼 옆에 더 넣을 버튼 */
  footer?: React.ReactNode;
}) {
  const Title = titleAs;
  const listCls = "btn-primary";
  const listLabel = (
    <>
      <Icon name="list" className="size-4" /> {ko ? "목록" : "Back to list"}
    </>
  );
  return (
    <article className="container-x max-w-4xl py-section-sm">
      <header className="border-b-2 border-ink pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {badge && <span className="rounded-md bg-accent/10 px-2.5 py-1 text-xs font-bold text-ink">{badge}</span>}
          {pinned && <span className="rounded-md bg-ink px-2.5 py-1 text-xs font-bold text-white">{ko ? "공지" : "Pinned"}</span>}
        </div>
        <Title lang={contentLang} className="mt-3 text-[clamp(24px,1.2rem+0.9vw,36px)] font-extrabold leading-snug tracking-tight text-ink">
          {title}
        </Title>
        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-small text-muted">
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
            <dd>{formatDate(createdAt, locale)}</dd>
          </div>
        </dl>
      </header>
      <div lang={contentLang} className="min-h-48 whitespace-pre-wrap break-words py-10 text-body leading-[1.9] text-ink-3">
        <Linkify text={body} />
      </div>
      <nav aria-label={ko ? "이전·다음 글" : "Newer and older posts"} className="divide-y divide-line border-y border-line text-[15px]">
        {[
          { p: adjacent.newer, label: ko ? "다음 글" : "Newer" },
          { p: adjacent.older, label: ko ? "이전 글" : "Older" },
        ].map(({ p, label }) => (
          <div key={label} className="flex gap-4 px-2 py-4">
            <span className="w-16 shrink-0 font-semibold text-muted">{label}</span>
            {p ? (
              onSelect ? (
                <button type="button" lang={contentLang} onClick={() => onSelect(p.id)} className="truncate text-left decoration-accent underline-offset-4 hover:text-ink hover:underline">
                  {p.title}
                </button>
              ) : (
                <Link href={detailHref(p.id)} lang={contentLang} className="truncate decoration-accent underline-offset-4 hover:text-ink hover:underline">
                  {p.title}
                </Link>
              )
            ) : (
              <span className="text-muted">{ko ? "없습니다." : "None"}</span>
            )}
          </div>
        ))}
      </nav>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {listStorageKey ? (
          <BackToList storageKey={listStorageKey} fallback={listHref} prefix={listHref.split("?")[0]} className={listCls}>
            {listLabel}
          </BackToList>
        ) : (
          <Link href={listHref} className={listCls}>
            {listLabel}
          </Link>
        )}
        {footer}
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
          <a key={i} href={part} target="_blank" rel="noopener noreferrer nofollow" className="font-medium text-ink underline decoration-accent underline-offset-2 hover:decoration-2">
            {part}
          </a>
        ) : (
          part
        )
      )}
    </>
  );
}
