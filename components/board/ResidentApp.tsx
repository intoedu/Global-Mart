"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { formatDate } from "@/lib/format";
import { RESIDENT_BOARDS, adjacentOf, listKey, normalizeResident, rememberList, residentBoardOf, sortPosts } from "@/lib/board";
import { lp } from "@/lib/paths";
import type { Locale } from "@/lib/i18n";
import type { ResidentBoard, ResidentData, ResidentPost } from "@/lib/types";
import { Icon } from "../Icon";
import { SubNav } from "../SubNav";
import { LockGate } from "./LockGate";
import { Pagination } from "./Pagination";
import { PostView } from "./PostView";
import { AttachmentList, ClipIcon, SecureBody } from "./SecureContent";
import { SoftwareView } from "./SoftwareView";
import { useVault } from "./useVault";

const PAGE_SIZE = 15;
type Tab = ResidentBoard | "software";
const TAB_IDS: Tab[] = ["items", "software", "notice"];
const isTab = (v: unknown): v is Tab => TAB_IDS.includes(v as Tab);
/** 소프트웨어 메뉴 이름: 암호화된 데이터(software.title)에 있으면 그것을, 없으면 기본 이름 (lib/site.ts 메뉴와 같음) */
const SOFTWARE_FALLBACK = { ko: "소프트웨어 무역", en: "Software Trading" };

/**
 * 해외주재원 전용 — 공용 비밀번호로 암호화된 내용을 브라우저에서 풀어 보여 줍니다.
 * 하위 메뉴: 국내기업 아이템(게시판) · 소프트웨어 무역 · 주재원공지(게시판)
 * 주소: ?cat=items|software|notice · 글 보기 ?id=번호 · 검색 ?q= · 페이지 ?page=
 */
export function ResidentApp({ locale }: { locale: Locale }) {
  const ko = locale === "ko";
  const t = (l: { ko: string; en: string }) => l[locale];
  const sp = useSearchParams();
  const router = useRouter();
  const { data, state, error, unlock, lock } = useVault<ResidentData>("resident", ko, normalizeResident);
  const topRef = useRef<HTMLDivElement>(null);

  const id = Number(sp.get("id") ?? 0);
  const posts = useMemo(() => sortPosts(data?.posts ?? []), [data]);
  const post = id ? (posts.find((p) => p.id === id) ?? null) : null;
  // 하위 메뉴는 ?cat= (lib/site.ts 의 헤더 메뉴와 같음). 예전 주소 ?tab= 도 받습니다.
  const cat = sp.get("cat") ?? sp.get("tab");
  const tab: Tab = post ? residentBoardOf(post) : isTab(cat) ? cat : "items";

  // 목록 아래쪽에서 글을 열면 글 머리가 보이도록
  useEffect(() => {
    const el = topRef.current;
    if (id && el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
  }, [id]);

  if (!data) return <ResidentGate locale={locale} state={state} error={error} onSubmit={(pw) => unlock(pw)} />;

  const base = lp(locale, "/resident");
  const tabHref = (x: Tab) => `${base}?cat=${x}`;
  const lockButton = (
    <button
      type="button"
      onClick={() => {
        lock();
        router.push(base);
      }}
      className="btn-ghost"
    >
      <Icon name="lock" className="size-4" /> {ko ? "나가기 (잠금)" : "Lock & leave"}
    </button>
  );

  let content: React.ReactNode;
  if (post) {
    const boardPosts = posts.filter((p) => residentBoardOf(p) === tab);
    const notice = tab === "notice";
    content = (
      <PostView
        title={post.title}
        body={post.body}
        createdAt={post.created_at}
        pinned={post.is_pinned}
        ko={ko}
        locale={locale}
        titleAs="h2"
        contentLang={ko ? undefined : "ko"}
        badge={post.category || (notice ? t(RESIDENT_BOARDS[1].label) : undefined)}
        meta={[
          ...(notice ? [] : [{ label: ko ? "회사명" : "Company", value: post.company }]),
          { label: ko ? "게시자" : "Author", value: post.author_name },
        ]}
        listHref={tabHref(tab)}
        listStorageKey={listKey("resident", locale)}
        adjacent={adjacentOf(boardPosts, post.id)}
        detailHref={(pid) => `${base}?id=${pid}`}
        bodySlot={<SecureBody body={post.body} files={post.files} keys={data.file_keys} ko={ko} />}
        afterBody={<AttachmentList files={post.files} body={post.body} keys={data.file_keys} ko={ko} />}
        footer={lockButton}
      />
    );
  } else if (tab === "software") {
    content = (
      <>
        <SoftwareView software={data.software} locale={locale} />
        <div className="container-x flex justify-end pb-section-sm">{lockButton}</div>
      </>
    );
  } else {
    content = <ResidentList board={tab} posts={posts.filter((p) => residentBoardOf(p) === tab)} locale={locale} base={base} footer={lockButton} missing={id > 0} />;
  }

  return (
    <div ref={topRef} className="scroll-mt-(--header-h)">
      <SubNav
        items={TAB_IDS.map((x) => ({
          href: tabHref(x),
          label: t(x === "software" ? (data.software?.title ?? SOFTWARE_FALLBACK) : RESIDENT_BOARDS.find((b) => b.id === x)!.label),
        }))}
        current={`cat=${tab}`}
      />
      {content}
    </div>
  );
}

function ResidentList({ board, posts, locale, base, footer, missing }: { board: ResidentBoard; posts: ResidentPost[]; locale: Locale; base: string; footer: React.ReactNode; missing: boolean }) {
  const ko = locale === "ko";
  const sp = useSearchParams();
  const router = useRouter();
  const notice = board === "notice";
  const q = sp.get("q")?.trim() ?? "";
  const rawPage = Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1);
  const storeKey = listKey("resident", locale);

  const filtered = useMemo(() => {
    if (!q) return posts;
    const k = q.toLowerCase();
    return posts.filter((p) => [p.title, p.body, p.company, p.category].some((v) => (v ?? "").toLowerCase().includes(k)));
  }, [posts, q]);
  // 글이 지워져 페이지 수가 줄었을 때 등: 마지막 페이지로
  const page = Math.min(rawPage, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));

  const href = (o: { q?: string | null; page?: number }) => {
    const p = new URLSearchParams({ cat: board });
    const qq = o.q === null ? "" : (o.q ?? q);
    if (qq) p.set("q", qq);
    if (o.page && o.page > 1) p.set("page", String(o.page));
    return `${base}?${p.toString()}`;
  };
  const listUrl = href({ page });

  // 글 상세의 '목록' 버튼이 지금 보던 게시판·검색·페이지로 돌아오도록 기억
  useEffect(() => {
    rememberList(storeKey, listUrl);
  }, [storeKey, listUrl]);

  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const postLang = ko ? undefined : "ko";
  const empty = q ? (ko ? "검색 결과가 없습니다." : "No matching posts.") : ko ? "등록된 글이 없습니다." : "No posts yet.";
  const detail = (id: number) => `${base}?id=${id}`;
  const intro = notice
    ? ko
      ? "글로벌마트 본사에서 해외주재원에게 전하는 공지사항입니다."
      : "Notices from the Globalmart head office to our overseas staff."
    : ko
      ? "다음은 글로벌마트와 연결된 국내 기업들과 그 취급 제품들입니다."
      : "Korean companies connected with Globalmart and their products.";

  return (
    <div className="container-x py-section-sm">
      {missing && (
        <p role="status" className="mb-6 rounded-xl bg-orange/15 px-4 py-3 text-sm text-orange-ink">
          {ko ? "찾으시는 글이 없습니다. 삭제되었거나 주소가 잘못되었을 수 있습니다." : "This post could not be found. It may have been deleted."}
        </p>
      )}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-[15px] text-muted">
          {intro} <span className="font-semibold text-ink">{ko ? `총 ${filtered.length}건` : `${filtered.length} posts`}</span>
          {q && (
            <>
              {" · "}
              <Link href={href({ q: null })} className="font-semibold text-ink underline decoration-accent underline-offset-4">
                {ko ? "검색 해제" : "Clear"}
              </Link>
            </>
          )}
        </p>
        <form
          role="search"
          className="relative shrink-0 sm:w-80"
          onSubmit={(e) => {
            e.preventDefault();
            const v = String(new FormData(e.currentTarget).get("q") ?? "").trim();
            router.push(href({ q: v, page: 1 }));
          }}
        >
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            key={`${board}-${q}`}
            name="q"
            defaultValue={q}
            aria-label={ko ? "검색" : "Search"}
            placeholder={notice ? (ko ? "제목·내용 검색" : "Search title, content") : ko ? "회사명·제목·내용 검색" : "Search company, title, content"}
            className="input !rounded-full !py-2.5 !pl-11"
            maxLength={50}
          />
        </form>
      </div>

      {/* PC(1024px~): 표 — 그보다 좁으면 제목이 잘리지 않는 목록형 */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-line lg:block">
        <table className="w-full table-fixed text-[15px]">
          <thead className="bg-ink text-left text-[13px] font-semibold text-white/85">
            <tr>
              {!notice && <th className="w-24 px-5 py-3.5">{ko ? "종류" : "Type"}</th>}
              {!notice && <th className="w-44 px-3 py-3.5">{ko ? "회사명" : "Company"}</th>}
              <th className={`${notice ? "px-5" : "px-3"} py-3.5`}>{ko ? "제목" : "Title"}</th>
              <th className="w-32 px-3 py-3.5">{ko ? "게시일" : "Date"}</th>
              <th className="w-28 px-5 py-3.5">{ko ? "게시자" : "Author"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((p) => (
              <tr key={p.id} className={`transition hover:bg-paper ${p.is_pinned ? "bg-paper" : ""}`}>
                {!notice && (
                  <td lang={postLang} className="px-5 py-4">
                    {p.category && <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[12px] font-bold text-ink">{p.category}</span>}
                  </td>
                )}
                {!notice && (
                  <td lang={postLang} className="truncate px-3 py-4 font-medium text-ink-3">
                    {p.company || "-"}
                  </td>
                )}
                <td className={`${notice ? "px-5" : "px-3"} py-4`}>
                  <Link href={detail(p.id)} className="flex items-center gap-2 font-semibold text-ink decoration-accent underline-offset-4 hover:underline">
                    {p.is_pinned && <PinMark ko={ko} />}
                    <span lang={postLang} className="truncate">{p.title}</span>
                    {!!p.files?.length && <FilesMark ko={ko} />}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm tabular-nums text-muted">{formatDate(p.created_at, locale)}</td>
                <td lang={postLang} className="truncate px-5 py-4 text-sm text-muted">{p.author_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="px-6 py-16 text-center text-muted">{empty}</p>}
      </div>

      <ul className="mt-6 divide-y divide-line border-y border-line lg:hidden">
        {items.map((p) => (
          <li key={p.id}>
            <Link href={detail(p.id)} className="group block py-4">
              {!notice && (
                <div lang={postLang} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                  {p.category && <span className="rounded-md bg-accent/10 px-2 py-0.5 font-bold text-ink">{p.category}</span>}
                  <span>{p.company}</span>
                </div>
              )}
              <p className="mt-1.5 flex items-start gap-1.5 font-semibold leading-snug text-ink decoration-accent underline-offset-4 group-hover:underline">
                {p.is_pinned && <PinMark ko={ko} className="mt-0.5" />}
                <span lang={postLang}>{p.title}</span>
                {!!p.files?.length && <FilesMark ko={ko} className="mt-1" />}
              </p>
              <p className="mt-1 text-xs tabular-nums text-muted">
                {formatDate(p.created_at, locale)} · <span lang={postLang}>{p.author_name}</span>
              </p>
            </Link>
          </li>
        ))}
        {items.length === 0 && <li className="py-16 text-center text-muted">{empty}</li>}
      </ul>

      <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} makeHref={(n) => href({ page: n })} ko={ko} />

      <div className="mt-8 flex justify-end">{footer}</div>
    </div>
  );
}

function PinMark({ ko, className = "" }: { ko: boolean; className?: string }) {
  return (
    <>
      <Icon name="pin" className={`size-4 shrink-0 text-orange ${className}`} />
      <span className="sr-only">{ko ? "공지: " : "Pinned: "}</span>
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

function ResidentGate({ locale, state, error, onSubmit }: { locale: Locale; state: string; error: string; onSubmit: (pw: string) => void }) {
  const ko = locale === "ko";
  return (
    <LockGate
      locale={locale}
      state={state}
      error={error}
      onSubmit={onSubmit}
      inputId="rp"
      badge={ko ? "해외주재원 전용" : "Overseas staff only"}
      title={ko ? "해외주재원 전용 공간입니다" : "Overseas staff only"}
      text={
        ko
          ? "이 공간은 국내아이템을 해외주재원에게 소개하고, 공지사항을 올리는 공간으로서, 비밀번호를 입력한 후에 이용 가능합니다."
          : "This space introduces Korean items to our overseas staff and carries notices. Please enter the password to continue."
      }
    />
  );
}

/**
 * 정적 HTML(자바스크립트 실행 전)에 들어가는 화면 — 첫 화면과 같은 비밀번호 입력 화면.
 * (서버 컴포넌트에서는 함수를 넘길 수 없어 여기서 만듭니다.)
 */
export function ResidentFallback({ locale }: { locale: Locale }) {
  return <ResidentGate locale={locale} state="init" error="" onSubmit={() => {}} />;
}
