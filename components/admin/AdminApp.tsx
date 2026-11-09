"use client";

import { useEffect, useState } from "react";
import { ACTIONS_URL, DATA_BRANCH, checkToken, readFile, writeFile } from "@/lib/github";
import { decryptJson, encryptJson } from "@/lib/crypto";
import { BIZ_CATEGORIES, REGIONS, REGION_MAP, bizCategoryLabel, isRegionId } from "@/lib/regions";
import { formatDate } from "@/lib/format";
import type { BizData, BizPost, EncryptedFile, ResidentPost } from "@/lib/types";
import { Icon } from "../Icon";

const TOKEN_KEY = "gm_admin_token";
const BIZ_PATH = "data/biz.json";
const RES_PATH = "public/data/resident.json";

type Notice = { kind: "ok" | "error"; text: string } | null;

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

  useEffect(() => {
    let saved = "";
    try { saved = localStorage.getItem(TOKEN_KEY) ?? ""; } catch {}
    if (saved) checkToken(saved).then((r) => { if (r.ok) { setToken(saved); setReady(true); } }).catch(() => {});
  }, []);

  const logout = () => {
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
    setToken("");
    setReady(false);
  };

  const saved = (what: string) =>
    setNotice({ kind: "ok", text: `${what} 저장했습니다. 1~2분 뒤 사이트에 반영됩니다.` });

  if (!ready) return <TokenGate onReady={(t) => { setToken(t); setReady(true); }} />;

  return (
    <section className="bg-paper py-10 lg:py-14">
      <div className="container-x">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {[
              { v: "biz", l: "해외 Biz정보" },
              { v: "resident", l: "해외주재원 전용" },
              { v: "help", l: "사용 안내" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => { setTab(o.v as typeof tab); setNotice(null); }}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === o.v ? "bg-ink text-white" : "bg-white text-ink-3"}`}
              >
                {o.l}
              </button>
            ))}
          </div>
          <button type="button" onClick={logout} className="btn-ghost !py-2 !text-sm">
            로그아웃
          </button>
        </div>

        {notice && (
          <p className={`mt-5 rounded-xl px-4 py-3 text-sm ${notice.kind === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
            {notice.text}{" "}
            {notice.kind === "ok" && (
              <a href={ACTIONS_URL} target="_blank" rel="noreferrer" className="font-semibold underline">
                반영 진행 상황 보기
              </a>
            )}
          </p>
        )}

        <div className="mt-6">
          {tab === "biz" && <BizAdmin token={token} onSaved={() => saved("해외 Biz정보를")} onError={(t) => setNotice({ kind: "error", text: t })} />}
          {tab === "resident" && <ResidentAdmin token={token} onSaved={(w) => saved(w)} onError={(t) => setNotice({ kind: "error", text: t })} />}
          {tab === "help" && <Help />}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- 로그인(토큰)

function TokenGate({ onReady }: { onReady: (t: string) => void }) {
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
              if (fd.get("remember") === "on") {
                try { localStorage.setItem(TOKEN_KEY, t); } catch {}
              }
              onReady(t);
            } catch {
              setErr("GitHub 에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2 className="text-xl font-extrabold">관리자 로그인</h2>
          <p className="text-sm leading-relaxed text-muted">
            게시글은 GitHub 저장소에 저장됩니다. 저장소 쓰기 권한이 있는 <b>GitHub 토큰</b>을 입력해 주세요. 토큰 만드는 방법은 로그인 후 &lsquo;사용 안내&rsquo; 또는 README 에 있습니다.
          </p>
          {err && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
          <div>
            <label className="label" htmlFor="token">GitHub 토큰</label>
            <input id="token" name="token" type="password" required className="input font-mono" placeholder="github_pat_…" autoComplete="off" />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-3">
            <input type="checkbox" name="remember" className="size-4 accent-brand" /> 이 컴퓨터에서 로그인 유지 (공용 PC에서는 체크하지 마세요)
          </label>
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
  const [editing, setEditing] = useState<BizPost | "new" | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    readFile<BizData>(token, BIZ_PATH)
      .then(({ data, sha }) => { setPosts(data.posts); setSha(sha); })
      .catch((e: Error) => onError(e.message));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const save = async (next: BizPost[], message: string) => {
    setBusy(true);
    try {
      const newSha = await writeFile(token, BIZ_PATH, { posts: next }, sha, message);
      setSha(newSha);
      setPosts(next);
      setEditing(null);
      onSaved();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!posts) return <p className="card p-10 text-center text-muted">불러오는 중…</p>;

  if (editing) {
    const p: BizPost =
      editing === "new"
        ? { id: Math.max(0, ...posts.map((x) => x.id)) + 1, category: "industry", region: "all", country: "", title: "", body: "", author_name: "글로벌마트", is_pinned: false, created_at: new Date().toISOString() }
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
          save(exists ? posts.map((x) => (x.id === post.id ? post : x)) : [post, ...posts], `${exists ? "Update" : "Add"} biz post #${post.id}`);
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
  const [editing, setEditing] = useState<ResidentPost | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [unlockErr, setUnlockErr] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { readFile<EncryptedFile>(token, RES_PATH).then(setFile).catch((e: Error) => onError(e.message)); }, []);

  const persist = async (next: ResidentPost[], password: string, message: string, what = "해외주재원 전용 글을") => {
    if (!file) return;
    setBusy(true);
    try {
      const enc = await encryptJson({ posts: next }, password);
      const sha = await writeFile(token, RES_PATH, enc, file.sha, message);
      setFile({ data: enc, sha });
      setPosts(next);
      setPw(password);
      setEditing(null);
      onSaved(what);
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!file) return <p className="card p-10 text-center text-muted">불러오는 중…</p>;

  if (!posts)
    return (
      <form
        className="card mx-auto max-w-md space-y-4 p-7"
        onSubmit={async (e) => {
          e.preventDefault();
          const p = String(new FormData(e.currentTarget).get("pw") ?? "");
          setBusy(true);
          const data = await decryptJson<{ posts: ResidentPost[] }>(file.data, p);
          setBusy(false);
          if (!data) return setUnlockErr("비밀번호가 올바르지 않습니다.");
          setPw(p);
          setPosts(data.posts);
        }}
      >
        <h2 className="text-lg font-extrabold">현재 공용 비밀번호 입력</h2>
        <p className="text-sm text-muted">해외주재원 전용 글은 공용 비밀번호로 암호화되어 있습니다. 현재 비밀번호를 넣어야 글을 고칠 수 있습니다.</p>
        {unlockErr && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{unlockErr}</p>}
        <input name="pw" type="password" required className="input" autoComplete="current-password" />
        <button disabled={busy} className="btn-primary w-full">{busy ? "확인 중…" : "열기"}</button>
      </form>
    );

  if (editing) {
    const p: ResidentPost =
      editing === "new"
        ? { id: Math.max(0, ...posts.map((x) => x.id)) + 1, category: "제품", company: "", title: "", body: "", author_name: "글로벌마트", is_pinned: false, created_at: new Date().toISOString() }
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
          persist(exists ? posts.map((x) => (x.id === post.id ? post : x)) : [post, ...posts], pw, "Update resident board");
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
            onDelete: () => persist(posts.filter((x) => x.id !== p.id), pw, "Update resident board"),
          }))}
      />
      <form
        className="card max-w-xl space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const a = String(fd.get("np") ?? "");
          const b = String(fd.get("np2") ?? "");
          if (a.length < 6) return onError("비밀번호는 6자 이상으로 정해 주세요.");
          if (a !== b) return onError("두 비밀번호가 서로 다릅니다.");
          persist(posts, a, "Change resident password", "새 공용 비밀번호를").then(() => e.currentTarget?.reset());
        }}
      >
        <h3 className="text-lg font-extrabold">공용 비밀번호 바꾸기</h3>
        <p className="text-sm text-muted">바꾸면 기존 비밀번호로는 더 이상 열리지 않습니다. 주재원들에게 새 비밀번호를 알려 주세요.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="np" type="password" minLength={6} required className="input" placeholder="새 비밀번호 (6자 이상)" autoComplete="new-password" />
          <input name="np2" type="password" minLength={6} required className="input" placeholder="새 비밀번호 확인" autoComplete="new-password" />
        </div>
        <button disabled={busy} className="btn-primary">{busy ? "저장 중…" : "비밀번호 변경"}</button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------- 공통 UI

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
          <input type="checkbox" name="is_pinned" defaultChecked={pinned} className="size-4 accent-brand" />
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
        <button type="button" onClick={onNew} className="btn-primary !py-2 !text-sm">
          <Icon name="plus" className="size-4" /> 새 글
        </button>
      </div>
      <ul className="divide-y divide-line">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{r.pinned && "📌 "}{r.title}</p>
              <p className="mt-0.5 truncate text-sm text-muted">{r.sub} · {formatDate(r.date)}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={r.onEdit} className="btn-ghost !py-1.5 !text-sm">수정</button>
              <button
                type="button"
                disabled={busy}
                onClick={() => { if (window.confirm(`"${r.title}" 글을 삭제할까요?`)) r.onDelete(); }}
                className="btn-danger !py-1.5 !text-sm"
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
      <h3 className="text-lg font-bold text-ink">GitHub 토큰 만들기</h3>
      <ol className="list-decimal space-y-1 pl-5">
        <li>GitHub 로그인 → 오른쪽 위 프로필 → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token</li>
        <li>Repository access: Only select repositories → <b>intoedu/Global-Mart</b></li>
        <li>Permissions → Repository permissions → <b>Contents: Read and write</b></li>
        <li>만든 토큰(github_pat_로 시작)을 이 화면에 붙여 넣습니다. 유효기간이 지나면 새로 만들어야 합니다.</li>
      </ol>
      <h3 className="text-lg font-bold text-ink">해외주재원 전용 게시판</h3>
      <p>이 게시판의 글은 공용 비밀번호로 암호화되어 저장됩니다. 비밀번호를 잊으면 글을 열 수 없으니 안전한 곳에 적어 두세요.</p>
    </div>
  );
}
