"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { decryptJson } from "@/lib/crypto";
import { formatDate } from "@/lib/format";
import { listKey, rememberList } from "@/lib/board";
import { asset, lp } from "@/lib/paths";
import type { Locale } from "@/lib/i18n";
import type { EncryptedFile, ResidentData, ResidentPost } from "@/lib/types";
import { Icon } from "../Icon";
import { Pagination } from "./Pagination";
import { PostView } from "./PostView";

const KEY = "gm_resident_pw";
const PAGE_SIZE = 15;

/**
 * 해외주재원 전용 — 공용 비밀번호로 암호화된 글을 브라우저에서 풀어 보여 줍니다.
 * 비밀번호는 이 탭(sessionStorage)에만 기억되고, 창을 닫으면 사라집니다.
 */
export function ResidentApp({ locale }: { locale: Locale }) {
  const ko = locale === "ko";
  const sp = useSearchParams();
  const router = useRouter();
  const [posts, setPosts] = useState<ResidentPost[] | null>(null);
  const [state, setState] = useState<"init" | "locked" | "checking" | "error">("init");
  const [error, setError] = useState("");

  const unlock = useCallback(
    async (pw: string, silent = false) => {
      setState("checking");
      try {
        const res = await fetch(asset("/data/resident.json"), { cache: "no-store" });
        const file = (await res.json()) as EncryptedFile;
        const data = await decryptJson<ResidentData>(file, pw);
        if (!data) {
          try { sessionStorage.removeItem(KEY); } catch {}
          setState("locked");
          if (!silent) setError(ko ? "비밀번호가 올바르지 않습니다." : "Incorrect password.");
          return;
        }
        try { sessionStorage.setItem(KEY, pw); } catch {}
        setPosts([...(data.posts ?? [])].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.created_at.localeCompare(a.created_at)));
      } catch {
        setState("error");
      }
    },
    [ko]
  );

  useEffect(() => {
    let saved: string | null = null;
    try { saved = sessionStorage.getItem(KEY); } catch {}
    if (saved) unlock(saved, true);
    else setState("locked");
  }, [unlock]);

  const lock = () => {
    try { sessionStorage.removeItem(KEY); } catch {}
    setPosts(null);
    setState("locked");
    router.push(lp(locale, "/resident"));
  };

  const id = Number(sp.get("id") ?? 0);
  const q = sp.get("q")?.trim() ?? "";
  const rawPage = Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1);
  const base = lp(locale, "/resident");
  const storeKey = listKey("resident", locale);
  const filtered = useMemo(() => {
    if (!posts) return [];
    if (!q) return posts;
    const k = q.toLowerCase();
    return posts.filter((p) => [p.title, p.body, p.company, p.category].some((v) => v.toLowerCase().includes(k)));
  }, [posts, q]);
  // 글이 지워져 페이지 수가 줄었을 때 등: 마지막 페이지로
  const page = Math.min(rawPage, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));

  const href = (o: { q?: string | null; page?: number }) => {
    const p = new URLSearchParams();
    const qq = o.q === null ? "" : (o.q ?? q);
    if (qq) p.set("q", qq);
    if (o.page && o.page > 1) p.set("page", String(o.page));
    const s = p.toString();
    return `${base}${s ? `?${s}` : ""}`;
  };
  const listUrl = href({ page });

  // 글 상세의 '목록' 버튼이 지금 보던 검색·페이지로 돌아오도록 기억
  useEffect(() => {
    if (posts && !id) rememberList(storeKey, listUrl);
  }, [posts, id, storeKey, listUrl]);

  if (!posts) return <Gate ko={ko} state={state} error={error} onSubmit={(pw) => { setError(""); unlock(pw); }} />;

  const lockButton = (
    <button type="button" onClick={lock} className="btn-ghost">
      <Icon name="lock" className="size-4" /> {ko ? "나가기 (잠금)" : "Lock & leave"}
    </button>
  );

  const post = id ? posts.find((p) => p.id === id) : null;
  if (post) {
    const byDate = [...posts].sort((a, b) => b.created_at.localeCompare(a.created_at));
    const i = byDate.findIndex((p) => p.id === post.id);
    return (
      <PostView
        title={post.title}
        body={post.body}
        createdAt={post.created_at}
        pinned={post.is_pinned}
        ko={ko}
        locale={locale}
        titleAs="h2"
        contentLang={ko ? undefined : "ko"}
        badge={post.category || undefined}
        meta={[
          { label: ko ? "회사명" : "Company", value: post.company },
          { label: ko ? "게시자" : "Author", value: post.author_name },
        ]}
        listHref={base}
        listStorageKey={storeKey}
        adjacent={{ newer: byDate[i - 1] ?? null, older: byDate[i + 1] ?? null }}
        detailHref={(pid) => `${base}?id=${pid}`}
        footer={lockButton}
      />
    );
  }

  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const postLang = ko ? undefined : "ko";
  const empty = q ? (ko ? "검색 결과가 없습니다." : "No matching posts.") : ko ? "등록된 글이 없습니다." : "No posts yet.";

  return (
    <div className="container-x py-section-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-[15px] text-muted">
          {ko ? "다음은 글로벌마트와 연결된 국내 기업들과 그 취급 제품들입니다." : "Korean companies connected with Globalmart and their products."}{" "}
          <span className="font-semibold text-ink">{ko ? `총 ${filtered.length}건` : `${filtered.length} posts`}</span>
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
          <input key={q} name="q" defaultValue={q} aria-label={ko ? "검색" : "Search"} placeholder={ko ? "회사명·제목·내용 검색" : "Search company, title, content"} className="input !rounded-full !py-2.5 !pl-11" maxLength={50} />
        </form>
      </div>

      {/* PC(1024px~): 종류 | 회사명 | 제목 | 게시일 | 게시자 — 그보다 좁으면 제목이 잘리지 않는 목록형 */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-line lg:block">
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
              <tr key={p.id} className={`transition hover:bg-paper ${p.is_pinned ? "bg-paper" : ""}`}>
                <td lang={postLang} className="px-5 py-4">{p.category && <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[12px] font-bold text-ink">{p.category}</span>}</td>
                <td lang={postLang} className="truncate px-3 py-4 font-medium text-ink-3">{p.company || "-"}</td>
                <td className="px-3 py-4">
                  <Link href={`${base}?id=${p.id}`} className="flex items-center gap-2 font-semibold text-ink decoration-accent underline-offset-4 hover:underline">
                    {p.is_pinned && <PinMark ko={ko} />}
                    <span lang={postLang} className="truncate">{p.title}</span>
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
            <Link href={`${base}?id=${p.id}`} className="group block py-4">
              <div lang={postLang} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                {p.category && <span className="rounded-md bg-accent/10 px-2 py-0.5 font-bold text-ink">{p.category}</span>}
                <span>{p.company}</span>
              </div>
              <p className="mt-1.5 flex items-start gap-1.5 font-semibold leading-snug text-ink decoration-accent underline-offset-4 group-hover:underline">
                {p.is_pinned && <PinMark ko={ko} className="mt-0.5" />}
                <span lang={postLang}>{p.title}</span>
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

      <div className="mt-8 flex justify-end">{lockButton}</div>
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

/**
 * 정적 HTML(자바스크립트 실행 전)에 들어가는 화면 — 첫 화면과 같은 비밀번호 입력 화면.
 * (서버 컴포넌트에서는 함수를 넘길 수 없어 여기서 만듭니다.)
 */
export function ResidentFallback({ locale }: { locale: Locale }) {
  return <Gate ko={locale === "ko"} state="init" error="" onSubmit={() => {}} />;
}

function Gate({ ko, state, error, onSubmit }: { ko: boolean; state: string; error: string; onSubmit: (pw: string) => void }) {
  return (
    <section className="py-section-sm">
      <div className="container-x max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-ink text-sky">
          <Icon name="lock" className="size-8" />
        </span>
        <h2 className="mt-6 text-h3 font-extrabold">{ko ? "해외주재원 전용 공간입니다" : "Overseas staff only"}</h2>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          {ko
            ? "이 공간은 국내 아이템들을 해외주재원들에게 소개하는 전용 공간으로서, 비밀번호를 입력한 후에 이용 가능합니다."
            : "This area introduces Korean products to our overseas staff. Please enter the access password."}
        </p>
        <form
          className="mt-8 space-y-3 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(String(new FormData(e.currentTarget).get("password") ?? ""));
          }}
        >
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {state === "error" && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {ko ? "자료를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." : "Could not load the data. Please try again."}
            </p>
          )}
          <label className="label" htmlFor="rp">{ko ? "비밀번호" : "Password"}</label>
          <input id="rp" name="password" type="password" required autoComplete="current-password" className="input" />
          <button disabled={state === "checking" || state === "init"} className="btn-primary w-full">
            {state === "checking" || state === "init" ? (ko ? "확인 중…" : "Checking…") : ko ? "입장하기" : "Enter"}
          </button>
          <p className="pt-2 text-center text-sm text-muted">{ko ? "비밀번호는 글로벌마트 본사에서 안내해 드립니다." : "The password is provided by the Globalmart head office."}</p>
        </form>
      </div>
    </section>
  );
}
