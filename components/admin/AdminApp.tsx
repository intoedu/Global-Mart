"use client";

import { useEffect, useRef, useState } from "react";
import { ACTIONS_URL, ConflictError, DATA_BRANCH, checkToken, readFile, writeFile } from "@/lib/github";
import { MIN_PASSWORD_LENGTH, checkPassword, decryptJson, encryptJson } from "@/lib/crypto";
import { BIZ_CATEGORIES, REGIONS, REGION_MAP, bizCategoryLabel, isRegionId } from "@/lib/regions";
import { formatDate } from "@/lib/format";
import type { BizData, BizPost, EncryptedFile, ResidentData, ResidentPost } from "@/lib/types";
import { Icon } from "../Icon";

const TOKEN_KEY = "gm_admin_token";
const BIZ_PATH = "data/biz.json";
const RES_PATH = "public/data/resident.json";
const CONFLICT_MSG = "다른 곳에서 먼저 수정되어 최신 내용을 다시 불러왔습니다. 내용을 확인한 뒤 저장을 다시 눌러 주세요.";

type Notice = { kind: "ok" | "error" | "warn"; text: string } | null;

/**
 * 새 글 번호: 지운 글의 번호를 다시 쓰지 않도록 파일의 next_id 와 "가장 큰 번호 + 1" 중 큰 값.
 * (예전 파일에는 next_id 가 없어도 됩니다.)
 */
const nextIdOf = (posts: { id: number }[], stored?: number) => Math.max(stored ?? 0, Math.max(0, ...posts.map((x) => x.id)) + 1);

/** 토큰 저장소: 기본은 이 탭(sessionStorage), '로그인 유지'를 고르면 localStorage */
const tokenStore = {
  read(): string {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || "";
    } catch {
      return "";
    }
  },
  save(t: string, remember: boolean) {
    try {
      sessionStorage.setItem(TOKEN_KEY, t);
      if (remember) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
  clear() {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

/**
 * 관리자 화면 (정적 사이트용)
 * - GitHub 토큰으로 저장소의 data/biz.json, public/data/resident.json 을 직접 고칩니다.
 * - 저장하면 GitHub Actions 가 사이트를 다시 만들어 1~2분 뒤 반영됩니다.
 */
export function AdminApp() {
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"biz" | "resident" | "help">("biz");
  const [notice, setNotice] = useState<Notice>(null);
  const noticeRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const saved = tokenStore.read();
    if (saved) checkToken(saved).then((r) => { if (r.ok) { setToken(saved); setReady(true); } }).catch(() => {});
  }, []);

  // 알림이 화면 밖(긴 글쓰기 양식 아래쪽 등)에 있으면 보이는 곳으로
  useEffect(() => {
    if (notice) noticeRef.current?.scrollIntoView({ block: "nearest" });
  }, [notice]);

  const logout = () => {
    tokenStore.clear();
    setToken("");
    setReady(false);
    setNotice(null);
  };

  const saved = (what: string) =>
    setNotice({ kind: "ok", text: `${what} 저장했습니다. 1~2분 뒤 사이트에 반영됩니다.` });
  const onError = (text: string) => setNotice({ kind: "error", text });

  if (!ready)
    return (
      <TokenGate
        onReady={(t, warning) => {
          setToken(t);
          setReady(true);
          setNotice(warning ? { kind: "warn", text: warning } : null);
        }}
      />
    );

  return (
    <section className="bg-paper py-10 lg:py-14">
      <div className="container-x">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { v: "biz", l: "해외 Biz정보" },
              { v: "resident", l: "해외주재원 전용" },
              { v: "help", l: "사용 안내" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                aria-pressed={tab === o.v}
                onClick={() => { setTab(o.v as typeof tab); setNotice(null); }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === o.v ? "bg-ink text-white" : "bg-white text-ink-3 hover:text-ink"}`}
              >
                {o.l}
              </button>
            ))}
          </div>
          <button type="button" onClick={logout} className="btn-ghost btn-sm">
            로그아웃
          </button>
        </div>

        {notice && (
          <p
            ref={noticeRef}
            role={notice.kind === "error" ? "alert" : "status"}
            className={`mt-5 scroll-mt-[calc(var(--header-h)+1rem)] rounded-xl px-4 py-3 text-sm ${
              notice.kind === "ok" ? "bg-emerald-50 text-emerald-800" : notice.kind === "warn" ? "bg-orange/15 text-orange-ink" : "bg-red-50 text-red-700"
            }`}
          >
            {notice.text}{" "}
            {notice.kind === "ok" && (
              <a href={ACTIONS_URL} target="_blank" rel="noreferrer" className="font-semibold underline">
                반영 진행 상황 보기
              </a>
            )}
          </p>
        )}

        <div className="mt-6">
          {tab === "biz" && <BizAdmin token={token} onSaved={() => saved("해외 Biz정보를")} onError={onError} />}
          {tab === "resident" && <ResidentAdmin token={token} onSaved={(w) => saved(w)} onError={onError} />}
          {tab === "help" && <Help />}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- 로그인(토큰)

function TokenGate({ onReady }: { onReady: (t: string, warning?: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <section className="py-14 lg:py-20">
      <div className="container-x max-w-xl">
        <form
          className="card space-y-4 p-7 sm:p-9"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const t = String(fd.get("token") ?? "").trim();
            setBusy(true);
            setErr("");
            try {
              const r = await checkToken(t);
              if (!r.ok) return setErr(r.message);
              tokenStore.save(t, fd.get("remember") === "on");
              onReady(t, r.warning);
            } catch {
              setErr("GitHub에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2 className="text-xl font-extrabold">관리자 로그인</h2>
          <p className="text-sm leading-relaxed text-muted">
            게시글은 GitHub 저장소에 저장됩니다. 저장소 쓰기 권한이 있는 <b>GitHub 토큰</b>을 입력해 주세요. 이 저장소만 고르고 유효기간을 짧게(예: 30~90일) 정한 Fine-grained 토큰을 권장합니다. 만드는 방법은 로그인 후 &lsquo;사용 안내&rsquo; 또는 README에 있습니다.
          </p>
          {err && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
          <div>
            <label className="label" htmlFor="token">GitHub 토큰</label>
            <input id="token" name="token" type="password" required className="input font-mono" placeholder="github_pat_…" autoComplete="off" />
          </div>
          <div className="rounded-xl bg-paper p-4">
            <label className="flex items-start gap-2.5 text-sm font-semibold text-ink-3">
              <input type="checkbox" name="remember" className="mt-0.5 size-4 shrink-0 accent-ink" aria-describedby="remember-help" />
              이 브라우저에 로그인 유지 (개인 PC에서만)
            </label>
            <p id="remember-help" className="mt-1.5 pl-6.5 text-xs leading-relaxed text-muted">
              체크하지 않으면 토큰은 이 탭에만 기억되고, 탭을 닫으면 로그아웃됩니다. 체크하면 토큰이 브라우저에 계속 남고,
              같은 주소(intoedu.github.io)의 다른 페이지와 저장 공간을 함께 쓰게 되므로 권장하지 않습니다. 공용 PC에서는 체크하지 마세요.
            </p>
          </div>
          <button disabled={busy} className="btn-primary w-full">{busy ? "확인 중…" : "로그인"}</button>
        </form>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- 해외 Biz정보

function BizAdmin({ token, onSaved, onError }: { token: string; onSaved: () => void; onError: (t: string) => void }) {
  const [posts, setPosts] = useState<BizPost[] | null>(null);
  const [sha, setSha] = useState("");
  const [nextId, setNextId] = useState(1);
  const [editing, setEditing] = useState<BizPost | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    setLoadError("");
    try {
      const { data, sha } = await readFile<BizData>(token, BIZ_PATH);
      const list = data.posts ?? [];
      setPosts(list);
      setSha(sha);
      setNextId((cur) => Math.max(cur, nextIdOf(list, data.next_id)));
      return true;
    } catch (e) {
      setLoadError((e as Error).message);
      onError((e as Error).message);
      return false;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const save = async (next: BizPost[], message: string, usedId?: number) => {
    setBusy(true);
    const newNext = usedId ? Math.max(nextId, usedId + 1) : nextId;
    try {
      const data: BizData = { next_id: newNext, posts: next };
      const newSha = await writeFile(token, BIZ_PATH, data, sha, message);
      setSha(newSha);
      setPosts(next);
      setNextId(newNext);
      setEditing(null);
      onSaved();
    } catch (e) {
      if (e instanceof ConflictError) {
        // 최신 파일을 다시 읽고, 쓰던 양식은 그대로 둡니다.
        if (await load()) onError(CONFLICT_MSG);
      } else onError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!posts) return <LoadState error={loadError} onRetry={load} />;

  if (editing) {
    const p: BizPost =
      editing === "new"
        ? { id: nextId, category: "industry", region: "all", country: "", title: "", body: "", author_name: "글로벌마트", is_pinned: false, created_at: new Date().toISOString() }
        : editing;
    return (
      <form
        className="card space-y-5 p-6 lg:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const region = String(fd.get("region"));
          const post: BizPost = {
            ...p,
            region: isRegionId(region) ? region : "all",
            country: String(fd.get("country") ?? "").trim(),
            category: fd.get("category") === "inquiry" ? "inquiry" : "industry",
            title: String(fd.get("title") ?? "").trim(),
            body: String(fd.get("body") ?? ""),
            author_name: String(fd.get("author_name") ?? "").trim() || "글로벌마트",
            is_pinned: fd.get("is_pinned") === "on",
          };
          const exists = posts.some((x) => x.id === post.id);
          save(
            exists ? posts.map((x) => (x.id === post.id ? post : x)) : [post, ...posts],
            `${exists ? "Update" : "Add"} biz post #${post.id}`,
            exists ? undefined : post.id
          );
        }}
      >
        <h2 className="text-xl font-extrabold">{editing === "new" ? "새 글 — 해외 Biz정보" : "글 수정 — 해외 Biz정보"}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="region">지역</label>
            <select id="region" name="region" defaultValue={p.region} className="input">
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>{r.label.ko}{r.id === "all" ? " (모든 지역에 표시)" : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="country">주 또는 국가</label>
            <input id="country" name="country" defaultValue={p.country} maxLength={80} className="input" placeholder="예: 베트남, 마하라슈트라주" />
          </div>
          <div>
            <label className="label" htmlFor="category">종류</label>
            <select id="category" name="category" defaultValue={p.category} className="input">
              {BIZ_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label.ko}</option>)}
            </select>
          </div>
        </div>
        <PostFields title={p.title} body={p.body} author={p.author_name} pinned={p.is_pinned} authorHint="해외 Biz정보 목록에서는 게시자가 표시되지 않습니다." />
        <FormButtons busy={busy} onCancel={() => setEditing(null)} />
      </form>
    );
  }

  return (
    <PostList
      title="해외 Biz정보"
      count={posts.length}
      onNew={() => setEditing("new")}
      rows={[...posts]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((p) => ({
          id: p.id,
          title: p.title,
          pinned: p.is_pinned,
          sub: `${isRegionId(p.region) ? REGION_MAP[p.region].label.ko : p.region} · ${p.country || "-"} · ${bizCategoryLabel(p.category).ko}`,
          date: p.created_at,
          onEdit: () => setEditing(p),
          onDelete: () => save(posts.filter((x) => x.id !== p.id), `Delete biz post #${p.id}`),
        }))}
      busy={busy}
    />
  );
}

// ---------------------------------------------------------------- 해외주재원 전용 (암호화)

function ResidentAdmin({ token, onSaved, onError }: { token: string; onSaved: (what: string) => void; onError: (t: string) => void }) {
  const [file, setFile] = useState<{ data: EncryptedFile; sha: string } | null>(null);
  const [pw, setPw] = useState("");
  const [posts, setPosts] = useState<ResidentPost[] | null>(null);
  const [nextId, setNextId] = useState(1);
  const [editing, setEditing] = useState<ResidentPost | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [unlockErr, setUnlockErr] = useState("");
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    setLoadError("");
    try {
      const f = await readFile<EncryptedFile>(token, RES_PATH);
      setFile(f);
      return f;
    } catch (e) {
      setLoadError((e as Error).message);
      onError((e as Error).message);
      return null;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const applyData = (data: ResidentData) => {
    setPosts(data.posts ?? []);
    setNextId((cur) => Math.max(cur, nextIdOf(data.posts ?? [], data.next_id)));
  };

  /** 저장에 성공하면 true */
  const persist = async (next: ResidentPost[], password: string, message: string, what = "해외주재원 전용 글을", usedId?: number): Promise<boolean> => {
    if (!file) return false;
    setBusy(true);
    const newNext = usedId ? Math.max(nextId, usedId + 1) : nextId;
    try {
      const payload: ResidentData = { posts: next, next_id: newNext };
      const enc = await encryptJson(payload, password);
      const sha = await writeFile(token, RES_PATH, enc, file.sha, message);
      setFile({ data: enc, sha });
      setPosts(next);
      setNextId(newNext);
      setPw(password);
      setEditing(null);
      onSaved(what);
      return true;
    } catch (e) {
      if (e instanceof ConflictError) {
        // 최신 파일을 다시 읽어 현재 비밀번호로 풀고, 쓰던 양식은 그대로 둡니다.
        const f = await load();
        const data = f ? await decryptJson<ResidentData>(f.data, pw) : null;
        if (data) {
          applyData(data);
          onError(CONFLICT_MSG);
        } else if (f) {
          setPosts(null);
          setEditing(null);
          onError("다른 곳에서 공용 비밀번호가 바뀌었습니다. 새 비밀번호로 다시 열어 주세요.");
        }
      } else onError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (!file) return <LoadState error={loadError} onRetry={load} />;

  if (!posts)
    return (
      <form
        className="card mx-auto max-w-md space-y-4 p-7"
        onSubmit={async (e) => {
          e.preventDefault();
          const p = String(new FormData(e.currentTarget).get("pw") ?? "");
          setBusy(true);
          setUnlockErr("");
          const data = await decryptJson<ResidentData>(file.data, p);
          setBusy(false);
          if (!data) return setUnlockErr("비밀번호가 올바르지 않습니다.");
          setPw(p);
          applyData(data);
        }}
      >
        <h2 className="text-lg font-extrabold">현재 공용 비밀번호 입력</h2>
        <p className="text-sm text-muted">해외주재원 전용 글은 공용 비밀번호로 암호화되어 있습니다. 현재 비밀번호를 넣어야 글을 고칠 수 있습니다.</p>
        {unlockErr && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{unlockErr}</p>}
        <div>
          <label className="label" htmlFor="res-pw">현재 공용 비밀번호</label>
          <input id="res-pw" name="pw" type="password" required className="input" autoComplete="current-password" />
        </div>
        <button disabled={busy} className="btn-primary w-full">{busy ? "확인 중…" : "열기"}</button>
      </form>
    );

  if (editing) {
    const p: ResidentPost =
      editing === "new"
        ? { id: nextId, category: "제품", company: "", title: "", body: "", author_name: "글로벌마트", is_pinned: false, created_at: new Date().toISOString() }
        : editing;
    return (
      <form
        className="card space-y-5 p-6 lg:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const post: ResidentPost = {
            ...p,
            category: String(fd.get("category") ?? "").trim(),
            company: String(fd.get("company") ?? "").trim(),
            title: String(fd.get("title") ?? "").trim(),
            body: String(fd.get("body") ?? ""),
            author_name: String(fd.get("author_name") ?? "").trim() || "글로벌마트",
            is_pinned: fd.get("is_pinned") === "on",
          };
          const exists = posts.some((x) => x.id === post.id);
          persist(exists ? posts.map((x) => (x.id === post.id ? post : x)) : [post, ...posts], pw, "Update resident board", undefined, exists ? undefined : post.id);
        }}
      >
        <h2 className="text-xl font-extrabold">{editing === "new" ? "새 글 — 해외주재원 전용" : "글 수정 — 해외주재원 전용"}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="category">종류</label>
            <input id="category" name="category" list="res-cats" defaultValue={p.category} maxLength={40} className="input" />
            <datalist id="res-cats">{["제품", "기술", "서비스", "기타"].map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="company">회사명</label>
            <input id="company" name="company" defaultValue={p.company} maxLength={100} className="input" />
          </div>
        </div>
        <PostFields title={p.title} body={p.body} author={p.author_name} pinned={p.is_pinned} />
        <FormButtons busy={busy} onCancel={() => setEditing(null)} />
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <PostList
        title="해외주재원 전용"
        count={posts.length}
        onNew={() => setEditing("new")}
        busy={busy}
        rows={[...posts]
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .map((p) => ({
            id: p.id,
            title: p.title,
            pinned: p.is_pinned,
            sub: `${p.category || "-"} · ${p.company || "-"} · ${p.author_name}`,
            date: p.created_at,
            onEdit: () => setEditing(p),
            onDelete: () => { persist(posts.filter((x) => x.id !== p.id), pw, "Update resident board"); },
          }))}
      />
      <form
        className="card max-w-xl space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const fd = new FormData(form);
          const a = String(fd.get("np") ?? "");
          const b = String(fd.get("np2") ?? "");
          const problem = checkPassword(a);
          if (problem) return onError(problem);
          if (a !== b) return onError("두 비밀번호가 서로 다릅니다.");
          persist(posts, a, "Change resident password", "새 공용 비밀번호를").then((ok) => { if (ok) form.reset(); });
        }}
      >
        <h3 className="text-lg font-extrabold">공용 비밀번호 바꾸기</h3>
        <p className="text-sm leading-relaxed text-muted">
          바꾸면 기존 비밀번호로는 더 이상 열리지 않습니다. 주재원들에게 새 비밀번호를 알려 주세요.
          새 비밀번호는 {MIN_PASSWORD_LENGTH}자 이상, 글자·숫자·기호 중 두 종류 이상을 섞어 주세요. 회사 이름·연도처럼 짐작하기 쉬운 말은 피해 주세요.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="np">새 비밀번호</label>
            <input id="np" name="np" type="password" minLength={MIN_PASSWORD_LENGTH} required className="input" placeholder={`${MIN_PASSWORD_LENGTH}자 이상`} autoComplete="new-password" />
          </div>
          <div>
            <label className="label" htmlFor="np2">새 비밀번호 확인</label>
            <input id="np2" name="np2" type="password" minLength={MIN_PASSWORD_LENGTH} required className="input" autoComplete="new-password" />
          </div>
        </div>
        <button disabled={busy} className="btn-primary">{busy ? "저장 중…" : "비밀번호 변경"}</button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------- 공통 UI

function LoadState({ error, onRetry }: { error: string; onRetry: () => unknown }) {
  if (!error) return <p className="card p-10 text-center text-muted" role="status">불러오는 중…</p>;
  return (
    <div className="card flex flex-col items-center gap-4 p-10 text-center">
      <p className="text-sm text-red-700">{error}</p>
      <button type="button" onClick={() => onRetry()} className="btn-ghost btn-sm">
        다시 불러오기
      </button>
    </div>
  );
}

function PostFields({ title, body, author, pinned, authorHint }: { title: string; body: string; author: string; pinned: boolean; authorHint?: string }) {
  return (
    <>
      <div>
        <label className="label" htmlFor="title">제목 *</label>
        <input id="title" name="title" required defaultValue={title} maxLength={200} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="body">내용</label>
        <textarea id="body" name="body" rows={14} defaultValue={body} className="input resize-y leading-relaxed" placeholder="줄바꿈은 그대로 표시되고, http로 시작하는 주소는 자동으로 링크가 됩니다." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="author_name">게시자</label>
          <input id="author_name" name="author_name" defaultValue={author} maxLength={50} className="input" />
          {authorHint && <p className="mt-1 text-xs text-muted">{authorHint}</p>}
        </div>
        <label className="flex items-center gap-2.5 self-center text-sm font-semibold">
          <input type="checkbox" name="is_pinned" defaultChecked={pinned} className="size-4 accent-ink" />
          공지로 목록 맨 위에 고정
        </label>
      </div>
    </>
  );
}

function FormButtons({ busy, onCancel }: { busy: boolean; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="btn-ghost">취소</button>
      <button disabled={busy} className="btn-primary px-8">{busy ? "저장 중…" : "저장"}</button>
    </div>
  );
}

type Row = { id: number; title: string; sub: string; date: string; pinned: boolean; onEdit: () => void; onDelete: () => void };

function PostList({ title, count, rows, onNew, busy }: { title: string; count: number; rows: Row[]; onNew: () => void; busy: boolean }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <p className="font-bold">
          {title} <span className="text-sm font-normal text-muted">{count}건 · 저장 위치: {DATA_BRANCH} 브랜치</span>
        </p>
        <button type="button" onClick={onNew} className="btn-primary btn-sm shrink-0">
          <Icon name="plus" className="size-4" /> 새 글
        </button>
      </div>
      <ul className="divide-y divide-line">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-semibold">
                {r.pinned && (
                  <>
                    <Icon name="pin" className="size-4 shrink-0 text-orange" />
                    <span className="sr-only">공지</span>
                  </>
                )}
                <span className="truncate">{r.title}</span>
              </p>
              <p className="mt-0.5 truncate text-sm text-muted">#{r.id} · {r.sub} · {formatDate(r.date)}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={r.onEdit} className="btn-ghost btn-sm">수정</button>
              <button
                type="button"
                disabled={busy}
                onClick={() => { if (window.confirm(`"${r.title}" 글을 삭제할까요?`)) r.onDelete(); }}
                className="btn-danger btn-sm"
              >
                삭제
              </button>
            </div>
          </li>
        ))}
        {rows.length === 0 && <li className="p-10 text-center text-muted">글이 없습니다.</li>}
      </ul>
    </div>
  );
}

function Help() {
  return (
    <div className="card prose-gm max-w-3xl p-7">
      <h3 className="!mt-0 text-lg font-bold text-ink">글을 저장하면</h3>
      <p>저장 버튼을 누르면 GitHub 저장소의 파일이 바뀌고, 자동으로 사이트가 다시 만들어집니다. 보통 1~2분 뒤에 홈페이지에 보입니다.</p>
      <p>글 번호는 지운 글의 번호를 다시 쓰지 않습니다. 예전 글 주소(/biz/번호/)가 다른 글을 가리키지 않게 하기 위해서입니다.</p>
      <h3 className="text-lg font-bold text-ink">GitHub 토큰 만들기</h3>
      <ol className="list-decimal space-y-1 pl-5">
        <li>GitHub 로그인 → 오른쪽 위 프로필 → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token</li>
        <li>Repository access: Only select repositories → <b>intoedu/Global-Mart</b></li>
        <li>Permissions → Repository permissions → <b>Contents: Read and write</b></li>
        <li>Expiration은 짧게(예: 30~90일) 정합니다. 유효기간이 지나면 새로 만들어야 합니다.</li>
        <li>만든 토큰(github_pat_로 시작)을 이 화면에 붙여 넣습니다. 클래식 토큰(ghp_)은 권한 범위가 넓어 권장하지 않습니다.</li>
      </ol>
      <h3 className="text-lg font-bold text-ink">해외주재원 전용 게시판</h3>
      <p>이 게시판의 글은 공용 비밀번호로 암호화되어 저장됩니다. 비밀번호를 잊으면 글을 열 수 없으니 안전한 곳에 적어 두세요.</p>
      <p>
        암호화된 파일은 누구나 내려받을 수 있으므로, 짧거나 짐작하기 쉬운 비밀번호는 컴퓨터로 대입해 풀릴 수 있습니다. 새 비밀번호는 {MIN_PASSWORD_LENGTH}자 이상,
        글자·숫자·기호를 섞어 정해 주세요. 비밀번호를 바꿔도 저장소 기록(git history)에 남은 예전 파일은 예전 비밀번호로 열리므로, 바꾸기 전에 올린 글은 그대로 공개될 수 있다고 생각해 주세요.
      </p>
    </div>
  );
}
