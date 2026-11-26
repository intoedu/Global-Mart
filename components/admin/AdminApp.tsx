"use client";

import { useEffect, useRef, useState } from "react";
import { ACTIONS_URL, ConflictError, DATA_BRANCH, checkToken, createBinaryFile, deleteRepoFile, fetchAdminFiles, readFile, readFileOrNull, writeFile } from "@/lib/github";
import {
  MIN_PASSWORD_LENGTH,
  checkAdminId,
  checkPassword,
  decryptAdminToken,
  decryptJson,
  encryptAdminToken,
  encryptBytes,
  encryptJson,
  ensureFileKey,
  randomId,
  withNewFileKey,
} from "@/lib/crypto";
import { REGIONS, REGION_MAP, isRegionId } from "@/lib/regions";
import {
  ADMIN_FILE,
  BOARD_CATEGORIES,
  BOARD_FILE,
  MAX_FILE_BYTES,
  MAX_FILE_LABEL,
  categoryLabel,
  formatBytes,
  imageToken,
  inlineIds,
  isCategory,
  isRegional,
  normalizeBoard,
} from "@/lib/board";
import { formatDate } from "@/lib/format";
import type { Attachment, BoardCategory, BoardData, BoardPost, EncryptedFile } from "@/lib/types";
import { Icon } from "../Icon";

const TOKEN_KEY = "gm_admin_token";
const CONFLICT_MSG = "다른 곳에서 먼저 수정되어 최신 내용을 다시 불러왔습니다. 내용을 확인한 뒤 저장을 다시 눌러 주세요.";
/** 본문에 넣을 수 있는 이미지 형식 */
const IMAGE_ACCEPT = "image/png,image/jpeg,image/gif,image/webp";
const IMAGE_TYPES = new Set(IMAGE_ACCEPT.split(","));
const NET_ERROR = "GitHub에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요.";

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

type Notify = { ok: (what: string) => void; error: (t: string) => void; warn: (t: string) => void };

/**
 * 관리자 화면 (정적 사이트용)
 * - 로그인: 관리자 아이디·비밀번호 → 저장소의 public/data/admin.json(아이디·비밀번호로 암호화한 GitHub 토큰)을 풀어 사용.
 *   처음 한 번은 사이트 소유자가 '처음 설정'에서 GitHub 토큰과 아이디·비밀번호를 정합니다. 토큰 직접 입력도 됩니다.
 * - GitHub 토큰으로 저장소의 public/data/biz.json(회원 비밀번호로 암호화)을 직접 고칩니다.
 *   현재 회원 비밀번호를 넣어야 글을 고칠 수 있습니다.
 * - 본문 이미지·첨부 파일은 게시판 파일 키로 암호화해 public/data/files/biz/ 에 올립니다.
 * - 저장하면 GitHub Actions 가 사이트를 다시 만들어 1~2분 뒤 반영됩니다.
 */
export function AdminApp() {
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"board" | "account" | "help">("board");
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

  const notify: Notify = {
    ok: (what) => setNotice({ kind: "ok", text: `${what} 저장했습니다. 1~2분 뒤 사이트에 반영됩니다.` }),
    error: (text) => setNotice({ kind: "error", text }),
    warn: (text) => setNotice({ kind: "warn", text }),
  };

  if (!ready)
    return (
      <AdminGate
        onReady={(t, message) => {
          setToken(t);
          setReady(true);
          setNotice(message ?? null);
        }}
      />
    );

  return (
    <section className="bg-paper py-10 lg:py-14">
      <div className="container-x">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { v: "board", l: "해외Biz정보(해외주재원 전용)" },
              { v: "account", l: "아이디·비밀번호 변경" },
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
          {tab === "board" && <BoardAdmin token={token} notify={notify} />}
          {tab === "account" && <AccountAdmin token={token} notify={notify} />}
          {tab === "help" && <Help />}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- 로그인 (아이디·비밀번호 / 처음 설정 / 토큰 직접 입력)

type GateMode = "login" | "setup" | "token";

/** 아이디·비밀번호로 암호화한 토큰을 저장소에 저장 (admin.json). 이미 있으면 덮어씀 — 409 이면 한 번 더 시도 */
async function saveAdminFile(token: string, id: string, pw: string) {
  const file = await encryptAdminToken(token, id, pw);
  for (let attempt = 0; ; attempt++) {
    const cur = await readFileOrNull<EncryptedFile>(token, ADMIN_FILE.repo);
    try {
      await writeFile(token, ADMIN_FILE.repo, file, cur?.sha, "Update admin login");
      return;
    } catch (e) {
      if (!(e instanceof ConflictError) || attempt >= 1) throw e;
    }
  }
}

/** 새 아이디·비밀번호 검사 — 문제가 없으면 빈 문자열 */
function checkCredentials(id: string, pw: string, pw2: string) {
  return checkAdminId(id) || checkPassword(pw) || (pw !== pw2 ? "두 비밀번호가 서로 다릅니다." : "");
}

function AdminGate({ onReady }: { onReady: (t: string, message?: Notice) => void }) {
  const [mode, setMode] = useState<GateMode>("login");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setErr("");
    try {
      await fn();
    } catch (e) {
      setErr(e instanceof TypeError ? NET_ERROR : (e as Error).message || NET_ERROR);
    } finally {
      setBusy("");
    }
  };

  const remember = (
    <div className="rounded-xl bg-paper p-4">
      <label className="flex items-start gap-2.5 text-sm font-semibold text-ink-3">
        <input type="checkbox" name="remember" className="mt-0.5 size-4 shrink-0 accent-ink" aria-describedby="remember-help" />
        이 브라우저에 로그인 유지 (개인 PC에서만)
      </label>
      <p id="remember-help" className="mt-1.5 pl-6.5 text-xs leading-relaxed text-muted">
        체크하지 않으면 이 탭에만 기억되고, 탭을 닫으면 로그아웃됩니다. 체크하면 GitHub 토큰이 브라우저에 계속 남고,
        같은 주소(intoedu.github.io)의 다른 페이지와 저장 공간을 함께 쓰게 되므로 권장하지 않습니다. 공용 PC에서는 체크하지 마세요.
      </p>
    </div>
  );

  return (
    <section className="py-14 lg:py-20">
      <div className="container-x max-w-xl">
        <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label="로그인 방법">
          {[
            { v: "login", l: "아이디 로그인" },
            { v: "setup", l: "처음 설정 (사이트 소유자)" },
            { v: "token", l: "토큰 직접 입력" },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              aria-pressed={mode === o.v}
              onClick={() => { setMode(o.v as GateMode); setErr(""); }}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${mode === o.v ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-3 hover:border-ink hover:text-ink"}`}
            >
              {o.l}
            </button>
          ))}
        </div>

        {mode === "login" && (
          <form
            key="login"
            className="card space-y-4 p-7 sm:p-9"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const id = String(fd.get("admin-id") ?? "");
              const pw = String(fd.get("admin-pw") ?? "");
              run("확인 중…", async () => {
                const files = await fetchAdminFiles();
                if (!files.length) throw new Error("아직 관리자 아이디가 설정되지 않았습니다. 사이트 소유자가 '처음 설정'에서 GitHub 토큰과 아이디·비밀번호를 정해 주세요. (설정 직후라면 1~2분 뒤 다시 시도해 주세요)");
                let t: string | null = null;
                for (const f of files) if ((t = await decryptAdminToken(f, id, pw))) break;
                if (!t) throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
                const r = await checkToken(t);
                if (!r.ok)
                  throw new Error(
                    `저장된 GitHub 토큰을 쓸 수 없습니다: ${r.message} 토큰의 유효기간이 지났다면 사이트 소유자가 새 토큰을 만들어 '처음 설정'에서 다시 설정해 주세요.`
                  );
                tokenStore.save(t, fd.get("remember") === "on");
                onReady(t, r.warning ? { kind: "warn", text: r.warning } : null);
              });
            }}
          >
            <h2 className="text-xl font-extrabold">관리자 로그인</h2>
            <p className="text-sm leading-relaxed text-muted">관리자 아이디와 비밀번호를 입력해 주세요.</p>
            {err && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
            <div>
              <label className="label" htmlFor="admin-id">아이디</label>
              <input id="admin-id" name="admin-id" required autoComplete="username" autoCapitalize="none" spellCheck={false} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="admin-pw">비밀번호</label>
              <input id="admin-pw" name="admin-pw" type="password" required autoComplete="current-password" className="input" />
            </div>
            {remember}
            <button disabled={!!busy} className="btn-primary w-full">{busy || "로그인"}</button>
          </form>
        )}

        {mode === "setup" && (
          <form
            key="setup"
            className="card space-y-4 p-7 sm:p-9"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const t = String(fd.get("setup-token") ?? "").trim();
              const id = String(fd.get("setup-id") ?? "");
              const pw = String(fd.get("setup-pw") ?? "");
              const problem = checkCredentials(id, pw, String(fd.get("setup-pw2") ?? ""));
              if (problem) return setErr(problem);
              run("저장 중…", async () => {
                const r = await checkToken(t);
                if (!r.ok) throw new Error(r.message);
                const existing = await readFileOrNull<EncryptedFile>(t, ADMIN_FILE.repo);
                if (existing && !window.confirm("이미 관리자 아이디가 설정되어 있습니다. 새 토큰·아이디·비밀번호로 바꿀까요? (예전 아이디·비밀번호로는 더 이상 로그인되지 않습니다)")) return;
                await saveAdminFile(t, id, pw);
                tokenStore.save(t, fd.get("remember") === "on");
                onReady(t, {
                  kind: r.warning ? "warn" : "ok",
                  text: `관리자 아이디·비밀번호를 저장했습니다. 1~2분 뒤부터 '아이디 로그인'으로 들어올 수 있습니다.${r.warning ? ` ${r.warning}` : ""}`,
                });
              });
            }}
          >
            <h2 className="text-xl font-extrabold">처음 설정 (사이트 소유자)</h2>
            <p className="text-sm leading-relaxed text-muted">
              처음 한 번, 또는 GitHub 토큰의 유효기간이 지났을 때 사이트 소유자가 합니다. 저장소 쓰기 권한이 있는 <b>GitHub 토큰</b>을 붙여 넣고 관리자 아이디·비밀번호를 정하면,
              토큰을 그 아이디·비밀번호로 암호화해 저장소(<code>public/data/admin.json</code>)에 저장합니다. 그 뒤로는 아이디·비밀번호만으로 로그인합니다.
            </p>
            <p className="rounded-xl bg-orange/15 px-4 py-3 text-xs leading-relaxed text-orange-ink">
              주의: 아이디·비밀번호를 아는 사람은 누구나 이 토큰으로 저장소를 고칠 수 있습니다. 암호화 파일은 공개되어 있어 짧은 비밀번호는 대입으로 풀릴 수 있으니, 길고 짐작하기 어려운 비밀번호(예: 16자 이상)를 쓰세요.
              토큰은 <b>intoedu/Global-Mart</b> 저장소만, <b>Contents: Read and write</b> 권한만, 짧은 유효기간으로 만드세요.
            </p>
            {err && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
            <div>
              <label className="label" htmlFor="setup-token">GitHub 토큰 (Fine-grained)</label>
              <input id="setup-token" name="setup-token" type="password" required className="input font-mono" placeholder="github_pat_…" autoComplete="off" />
            </div>
            <div>
              <label className="label" htmlFor="setup-id">관리자 아이디</label>
              <input id="setup-id" name="setup-id" required minLength={3} maxLength={40} autoComplete="username" autoCapitalize="none" spellCheck={false} className="input" />
              <p className="mt-1 text-xs text-muted">영문·숫자와 . _ - (대소문자 구분 없음)</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="setup-pw">관리자 비밀번호</label>
                <input id="setup-pw" name="setup-pw" type="password" required minLength={MIN_PASSWORD_LENGTH} className="input" placeholder={`${MIN_PASSWORD_LENGTH}자 이상`} autoComplete="new-password" />
              </div>
              <div>
                <label className="label" htmlFor="setup-pw2">비밀번호 확인</label>
                <input id="setup-pw2" name="setup-pw2" type="password" required minLength={MIN_PASSWORD_LENGTH} className="input" autoComplete="new-password" />
              </div>
            </div>
            {remember}
            <button disabled={!!busy} className="btn-primary w-full">{busy || "설정 저장하고 로그인"}</button>
          </form>
        )}

        {mode === "token" && (
          <form
            key="token"
            className="card space-y-4 p-7 sm:p-9"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const t = String(fd.get("token") ?? "").trim();
              run("확인 중…", async () => {
                const r = await checkToken(t);
                if (!r.ok) throw new Error(r.message);
                tokenStore.save(t, fd.get("remember") === "on");
                onReady(t, r.warning ? { kind: "warn", text: r.warning } : null);
              });
            }}
          >
            <h2 className="text-xl font-extrabold">토큰 직접 입력</h2>
            <p className="text-sm leading-relaxed text-muted">
              저장소 쓰기 권한이 있는 <b>GitHub 토큰</b>으로 바로 로그인합니다(아이디 설정이 없어도 됨). 이 저장소만 고르고 유효기간을 짧게(예: 30~90일) 정한 Fine-grained 토큰을 권장합니다. 만드는 방법은 로그인 후 &lsquo;사용 안내&rsquo; 또는 README에 있습니다.
            </p>
            {err && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
            <div>
              <label className="label" htmlFor="token">GitHub 토큰</label>
              <input id="token" name="token" type="password" required className="input font-mono" placeholder="github_pat_…" autoComplete="off" />
            </div>
            {remember}
            <button disabled={!!busy} className="btn-primary w-full">{busy || "로그인"}</button>
          </form>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- 아이디·비밀번호 변경

function AccountAdmin({ token, notify }: { token: string; notify: Notify }) {
  const [busy, setBusy] = useState("");
  return (
    <form
      className="card max-w-xl space-y-4 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        const id = String(fd.get("acc-id") ?? "");
        const pw = String(fd.get("acc-pw") ?? "");
        const problem = checkCredentials(id, pw, String(fd.get("acc-pw2") ?? ""));
        if (problem) return notify.error(problem);
        setBusy("저장 중…");
        try {
          await saveAdminFile(token, id, pw);
          form.reset();
          notify.ok("새 관리자 아이디·비밀번호를");
        } catch (err) {
          notify.error(err instanceof ConflictError ? "다른 곳에서 동시에 바꾸고 있습니다. 잠시 후 다시 시도해 주세요." : (err as Error).message || NET_ERROR);
        } finally {
          setBusy("");
        }
      }}
    >
      <h3 className="text-lg font-extrabold">관리자 아이디·비밀번호 변경</h3>
      <p className="text-sm leading-relaxed text-muted">
        지금 로그인한 GitHub 토큰을 새 아이디·비밀번호로 다시 암호화해 저장소(<code>public/data/admin.json</code>)에 저장합니다. 저장하면 예전 아이디·비밀번호로는 로그인되지 않습니다
        (사이트 반영 1~2분 동안은 예전 것도 될 수 있습니다). 비밀번호는 {MIN_PASSWORD_LENGTH}자 이상, 글자·숫자·기호 중 두 종류 이상 — 길수록 안전합니다(16자 이상 권장).
      </p>
      <p className="rounded-xl bg-paper px-4 py-3 text-xs leading-relaxed text-ink-3">
        비밀번호가 새어 나갔다고 생각되면 아이디·비밀번호만 바꾸지 말고, GitHub에서 토큰을 지우고(Revoke) 새 토큰으로 &lsquo;처음 설정&rsquo;을 다시 해 주세요.
        저장소 기록(git history)에 남은 예전 파일은 예전 아이디·비밀번호로 풀리기 때문입니다.
      </p>
      <div>
        <label className="label" htmlFor="acc-id">새 아이디</label>
        <input id="acc-id" name="acc-id" required minLength={3} maxLength={40} autoComplete="username" autoCapitalize="none" spellCheck={false} className="input" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="acc-pw">새 비밀번호</label>
          <input id="acc-pw" name="acc-pw" type="password" required minLength={MIN_PASSWORD_LENGTH} className="input" placeholder={`${MIN_PASSWORD_LENGTH}자 이상`} autoComplete="new-password" />
        </div>
        <div>
          <label className="label" htmlFor="acc-pw2">새 비밀번호 확인</label>
          <input id="acc-pw2" name="acc-pw2" type="password" required minLength={MIN_PASSWORD_LENGTH} className="input" autoComplete="new-password" />
        </div>
      </div>
      <button disabled={!!busy} className="btn-primary">{busy || "아이디·비밀번호 저장"}</button>
    </form>
  );
}

// ---------------------------------------------------------------- 암호화된 게시판 파일

/** 아직 저장소에 올리지 않은 첨부 파일 (올린 뒤 uploaded=true — 저장이 실패해 다시 눌러도 두 번 올리지 않음) */
type Draft = { att: Attachment; file?: File; uploaded: boolean; preview?: string };

type PersistOptions = { message: string; what: string; password?: string; drafts?: Draft[]; removed?: Attachment[] };

/**
 * 암호화된 게시판 파일 읽기·풀기·저장
 * - 저장할 때: 새 첨부 파일 암호화·업로드 → 게시판 데이터 암호화·저장 → 지운 첨부 파일 정리
 * - 다른 곳에서 먼저 저장했으면(409) 최신 파일을 다시 풀고, 파일 키는 합칩니다(키는 지우지 않음).
 */
function useAdminVault(token: string, notify: Notify) {
  const path = BOARD_FILE.repo;
  const [file, setFile] = useState<{ data: EncryptedFile; sha: string } | null>(null);
  const [pw, setPw] = useState("");
  const [data, setData] = useState<BoardData | null>(null);
  const [busy, setBusy] = useState("");
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    setLoadError("");
    try {
      const f = await readFile<EncryptedFile>(token, path);
      setFile(f);
      return f;
    } catch (e) {
      setLoadError((e as Error).message);
      notify.error((e as Error).message);
      return null;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  /** 비밀번호가 맞으면 true */
  const unlock = async (password: string) => {
    if (!file) return false;
    setBusy("확인 중…");
    const d = await decryptJson<BoardData>(file.data, password);
    setBusy("");
    if (!d) return false;
    setPw(password);
    // 예전 파일(파일 키 없음)이면 여기서 키를 만들어 두고, 다음 저장 때 함께 저장합니다.
    setData(ensureFileKey(normalizeBoard(d)));
    return true;
  };

  /** 저장에 성공하면 true */
  const persist = async (next: BoardData, o: PersistOptions): Promise<boolean> => {
    if (!file || !data) return false;
    const password = o.password ?? pw;
    try {
      const todo = (o.drafts ?? []).filter((d) => !d.uploaded && d.file);
      for (let i = 0; i < todo.length; i++) {
        const d = todo[i];
        setBusy(`파일 올리는 중 (${i + 1}/${todo.length})…`);
        const key = next.file_keys?.[d.att.kid];
        if (!key) throw new Error("파일 키를 찾지 못했습니다. 페이지를 새로 고친 뒤 다시 시도해 주세요.");
        const enc = await encryptBytes(await d.file!.arrayBuffer(), key);
        await createBinaryFile(token, `public/${d.att.path}`, enc, "Add board attachment");
        d.uploaded = true;
      }
      setBusy("저장 중…");
      const enc = await encryptJson({ ...next, v: 2 }, password);
      const sha = await writeFile(token, path, enc, file.sha, o.message);
      setFile({ data: enc, sha });
      setData(next);
      setPw(password);
      // 지운 첨부 파일 정리 (실패해도 글은 저장된 상태)
      let failed = 0;
      for (const a of o.removed ?? []) {
        setBusy("지운 파일 정리 중…");
        if (!(await deleteRepoFile(token, `public/${a.path}`, "Remove board attachment"))) failed++;
      }
      if (failed) notify.warn(`${o.what} 저장했습니다. 다만 지운 첨부 파일 ${failed}개를 저장소에서 지우지 못했습니다. (암호화되어 있어 내용은 보이지 않습니다)`);
      else notify.ok(o.what);
      return true;
    } catch (e) {
      if (e instanceof ConflictError) {
        // 최신 파일을 다시 읽어 현재 비밀번호로 풀고, 쓰던 양식은 그대로 둡니다.
        const f = await load();
        const latest = f ? await decryptJson<BoardData>(f.data, pw) : null;
        if (latest) {
          const merged = normalizeBoard(latest);
          setData({
            ...merged,
            file_keys: { ...(next.file_keys ?? {}), ...(merged.file_keys ?? {}) },
            current_key: merged.current_key && merged.file_keys?.[merged.current_key] ? merged.current_key : next.current_key,
          });
          notify.error(CONFLICT_MSG);
        } else if (f) {
          setData(null);
          notify.error("다른 곳에서 회원 비밀번호가 바뀌었습니다. 새 비밀번호로 다시 열어 주세요.");
        }
      } else notify.error((e as Error).message);
      return false;
    } finally {
      setBusy("");
    }
  };

  return { file, data, busy, loadError, load, unlock, persist };
}

/** 새 첨부 파일 준비 (크기·형식 검사) — 문제가 있으면 문자열 */
function makeDraft(file: File, kid: string, inline: boolean): Draft | string {
  if (file.size > MAX_FILE_BYTES) return `"${file.name}" 파일이 너무 큽니다. 한 파일은 ${MAX_FILE_LABEL}까지 올릴 수 있습니다. (현재 ${formatBytes(file.size)})`;
  if (file.size === 0) return `"${file.name}" 파일이 비어 있습니다.`;
  if (inline && !IMAGE_TYPES.has(file.type)) return "본문에는 이미지 파일(JPG, PNG, GIF, WEBP)만 넣을 수 있습니다. 다른 파일은 '파일 첨부'를 이용해 주세요.";
  const id = randomId(8);
  return {
    att: { id, kid, name: file.name.slice(0, 120), type: file.type || "application/octet-stream", size: file.size, path: `${BOARD_FILE.files}/${id}.bin`, ...(inline ? { inline: true } : {}) },
    file,
    uploaded: false,
    preview: inline ? URL.createObjectURL(file) : undefined,
  };
}

// ---------------------------------------------------------------- 해외Biz정보(해외주재원 전용) 글 관리

type Filter = BoardCategory | "all";

/** 목록의 한 줄 설명 */
function postSub(p: BoardPost) {
  const parts: string[] = [categoryLabel(p.category).ko];
  if (isRegional(p.category)) parts.push(p.region && isRegionId(p.region) ? REGION_MAP[p.region].label.ko : (p.region ?? "-"), p.country || "-");
  else if (p.category === "items") parts.push(p.kind || "-", p.company || "-", p.author_name);
  else parts.push(p.kind || "-", p.author_name);
  if (p.files?.length) parts.push(`첨부 ${p.files.length}`);
  return parts.join(" · ");
}

function BoardAdmin({ token, notify }: { token: string; notify: Notify }) {
  const v = useAdminVault(token, notify);
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<BoardPost | "new" | null>(null);

  if (!v.file) return <LoadState error={v.loadError} onRetry={v.load} />;
  if (!v.data)
    return (
      <UnlockForm
        title="현재 회원 비밀번호 입력"
        desc="해외Biz정보(해외주재원 전용)는 회원 전용이라 글이 회원 비밀번호로 암호화되어 있습니다. 현재 회원 비밀번호를 넣어야 글을 고칠 수 있습니다."
        label="현재 회원 비밀번호"
        busy={!!v.busy}
        onUnlock={v.unlock}
      />
    );

  const data = v.data;
  const posts = data.posts ?? [];

  if (editing) {
    const isNew = editing === "new";
    const startCat: BoardCategory = isNew ? (filter === "all" ? "market" : filter) : editing.category;
    const p: BoardPost = isNew
      ? { id: 0, category: startCat, region: "all", country: "", title: "", body: "", author_name: "글로벌마트", is_pinned: false, created_at: new Date().toISOString() }
      : editing;
    return (
      <PostEditor
        key={isNew ? "new" : p.id}
        heading={isNew ? "새 글 — 해외Biz정보(해외주재원 전용)" : `글 수정 — #${p.id}`}
        currentKey={data.current_key!}
        initial={p}
        busy={v.busy}
        authorHint="해외시장·해외입찰 화면에서는 게시자가 표시되지 않습니다."
        onCancel={() => setEditing(null)}
        extra={<CategoryFields initial={p} />}
        onSubmit={(fd, fields, drafts, removed) => {
          const rawCat = fd.get("category");
          const category: BoardCategory = isCategory(rawCat) ? rawCat : startCat;
          // 새 글 번호는 저장하는 순간의 최신 목록 기준 (다른 곳에서 먼저 글을 올렸어도 겹치지 않게)
          const id = isNew ? nextIdOf(posts, data.next_id) : p.id;
          // 카테고리를 바꿨을 때 예전 칸(지역·회사명 등)이 남지 않도록 지우고 다시 채움
          const post: BoardPost = { ...p, ...fields, id, category };
          delete post.region;
          delete post.country;
          delete post.company;
          delete post.kind;
          if (isRegional(category)) {
            const region = String(fd.get("region") ?? "all");
            post.region = isRegionId(region) ? region : "all";
            post.country = String(fd.get("country") ?? "").trim();
          } else {
            // 국내우수 Item·공지: 종류 (국내우수 Item 은 회사명도)
            post.kind = String(fd.get("kind") ?? "").trim();
            if (category === "items") post.company = String(fd.get("company") ?? "").trim();
          }
          const next: BoardData = {
            ...data,
            next_id: Math.max(nextIdOf(posts, data.next_id), id + 1),
            posts: isNew ? [post, ...posts] : posts.map((x) => (x.id === id ? post : x)),
          };
          return v
            .persist(next, { message: `${isNew ? "Add" : "Update"} board post #${id}`, what: "글을", drafts, removed })
            .then((ok) => { if (ok) { setEditing(null); setFilter(category); } });
        }}
      />
    );
  }

  const shown = filter === "all" ? posts : posts.filter((p) => p.category === filter);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="카테고리">
        {[{ id: "all" as Filter, l: "전체" }, ...BOARD_CATEGORIES.map((c) => ({ id: c.id as Filter, l: c.label.ko }))].map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={filter === o.id}
            onClick={() => setFilter(o.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${filter === o.id ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-3 hover:border-ink hover:text-ink"}`}
          >
            {o.l} <span className="font-normal opacity-70">{o.id === "all" ? posts.length : posts.filter((p) => p.category === o.id).length}</span>
          </button>
        ))}
      </div>
      <PostList
        title={filter === "all" ? "해외Biz정보(해외주재원 전용) 전체" : categoryLabel(filter).ko}
        count={shown.length}
        onNew={() => setEditing("new")}
        busy={!!v.busy}
        rows={[...shown]
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .map((p) => ({
            id: p.id,
            title: p.title,
            pinned: p.is_pinned,
            sub: postSub(p),
            date: p.created_at,
            onEdit: () => setEditing(p),
            onDelete: () => {
              v.persist({ ...data, next_id: nextIdOf(posts, data.next_id), posts: posts.filter((x) => x.id !== p.id) }, { message: `Delete board post #${p.id}`, what: "글 삭제를", removed: p.files });
            },
          }))}
      />
      <PasswordForm
        title="회원 비밀번호 바꾸기"
        desc="해외Biz정보(해외주재원 전용)의 모든 카테고리(해외시장·해외입찰·국내우수 Item·공지)를 여는 회원 공용 비밀번호입니다. 바꾸면 기존 비밀번호로는 더 이상 열리지 않으니, 회원들에게 새 비밀번호를 알려 주세요."
        busy={v.busy}
        onError={notify.error}
        onChange={(np) => v.persist(withNewFileKey(data), { message: "Change board member password", what: "새 회원 비밀번호를", password: np })}
      />
    </div>
  );
}

/** 글쓰기 양식의 카테고리별 칸: 해외시장·해외입찰 → 지역·주/국가, 국내우수 Item → 종류·회사명, 공지 → 종류 */
function CategoryFields({ initial }: { initial: BoardPost }) {
  const [cat, setCat] = useState<BoardCategory>(initial.category);
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div>
        <label className="label" htmlFor="category">카테고리</label>
        <select id="category" name="category" value={cat} onChange={(e) => isCategory(e.target.value) && setCat(e.target.value)} className="input">
          {BOARD_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label.ko}{c.regional ? " (나라별)" : ""}</option>
          ))}
        </select>
      </div>
      {isRegional(cat) && (
        <>
          <div>
            <label className="label" htmlFor="region">지역</label>
            <select id="region" name="region" defaultValue={initial.region ?? "all"} className="input">
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>{r.label.ko}{r.id === "all" ? " (모든 지역에 표시)" : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="country">주 또는 국가</label>
            <input id="country" name="country" defaultValue={initial.country ?? ""} maxLength={80} className="input" placeholder="예: 베트남, 마하라슈트라주" />
          </div>
        </>
      )}
      {cat === "items" && (
        <>
          <div>
            <label className="label" htmlFor="kind">종류</label>
            <input id="kind" name="kind" list="item-kinds" defaultValue={initial.kind ?? ""} maxLength={40} className="input" />
            <datalist id="item-kinds">{["제품", "기술", "서비스", "소프트웨어", "기타"].map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div>
            <label className="label" htmlFor="company">회사명</label>
            <input id="company" name="company" defaultValue={initial.company ?? ""} maxLength={100} className="input" />
          </div>
        </>
      )}
      {cat === "notice" && (
        <>
          <div>
            <label className="label" htmlFor="kind">종류</label>
            <input id="kind" name="kind" list="notice-kinds" defaultValue={initial.kind ?? ""} maxLength={40} className="input" placeholder="예: 안내" />
            <datalist id="notice-kinds">{["안내", "중요", "행사", "기타"].map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <p className="self-end pb-3 text-sm text-muted">공지는 지역·회사 구분 없이 한 게시판에 올라갑니다. 목록에 종류·제목·게시일이 보입니다.</p>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- 글쓰기 양식 (본문 이미지·첨부 파일)

type PostFieldsValue = { title: string; body: string; author_name: string; is_pinned: boolean; files: Attachment[] };

function PostEditor({
  heading,
  currentKey,
  initial,
  extra,
  authorHint,
  busy,
  onCancel,
  onSubmit,
}: {
  heading: string;
  currentKey: string;
  initial: { title: string; body: string; author_name: string; is_pinned: boolean; files?: Attachment[] };
  extra: React.ReactNode;
  authorHint?: string;
  busy: string;
  onCancel: () => void;
  onSubmit: (fd: FormData, fields: PostFieldsValue, drafts: Draft[], removed: Attachment[]) => Promise<void>;
}) {
  const [drafts, setDrafts] = useState<Draft[]>(() => (initial.files ?? []).map((att) => ({ att, uploaded: true })));
  const [err, setErr] = useState("");
  const removedRef = useRef<Attachment[]>([]);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // 미리보기 주소 정리
  useEffect(() => () => drafts.forEach((d) => d.preview && URL.revokeObjectURL(d.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const insertAtCursor = (text: string) => {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? start;
    const before = ta.value.slice(0, start);
    const pre = before && !before.endsWith("\n") ? "\n" : "";
    ta.setRangeText(`${pre}${text}\n`, start, end, "end");
    ta.focus();
  };

  const add = (files: FileList | null, inline: boolean) => {
    setErr("");
    const list = Array.from(files ?? []);
    const made: Draft[] = [];
    for (const f of list) {
      const d = makeDraft(f, currentKey, inline);
      if (typeof d === "string") {
        setErr(d);
        continue;
      }
      made.push(d);
      if (inline) insertAtCursor(imageToken(d.att.id));
    }
    if (made.length) setDrafts((cur) => [...cur, ...made]);
  };

  const remove = (d: Draft) => {
    if (d.att.inline && bodyRef.current) bodyRef.current.value = bodyRef.current.value.split(imageToken(d.att.id)).join("");
    if (d.uploaded) removedRef.current.push(d.att);
    if (d.preview) URL.revokeObjectURL(d.preview);
    setDrafts((cur) => cur.filter((x) => x !== d));
  };

  const used = inlineIds(bodyRef.current?.value ?? initial.body);

  return (
    <form
      className="card space-y-5 p-6 lg:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const fields: PostFieldsValue = {
          title: String(fd.get("title") ?? "").trim(),
          body: String(fd.get("body") ?? ""),
          author_name: String(fd.get("author_name") ?? "").trim() || "글로벌마트",
          is_pinned: fd.get("is_pinned") === "on",
          files: drafts.map((d) => d.att),
        };
        onSubmit(fd, fields, drafts, [...removedRef.current]);
      }}
    >
      <h2 className="text-xl font-extrabold">{heading}</h2>
      {extra}
      <div>
        <label className="label" htmlFor="title">제목 *</label>
        <input id="title" name="title" required defaultValue={initial.title} maxLength={200} className="input" />
      </div>
      <div>
        <div className="mb-1.5 flex flex-wrap items-end justify-between gap-2">
          <label className="label !mb-0" htmlFor="body">내용</label>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => imageInput.current?.click()} className="btn-ghost btn-sm">
              <Icon name="plus" className="size-4" /> 이미지 넣기
            </button>
            <button type="button" onClick={() => fileInput.current?.click()} className="btn-ghost btn-sm">
              <Icon name="plus" className="size-4" /> 파일 첨부
            </button>
          </div>
        </div>
        <input ref={imageInput} type="file" accept={IMAGE_ACCEPT} multiple hidden onChange={(e) => { add(e.target.files, true); e.target.value = ""; }} />
        <input ref={fileInput} type="file" multiple hidden onChange={(e) => { add(e.target.files, false); e.target.value = ""; }} />
        <textarea
          ref={bodyRef}
          id="body"
          name="body"
          rows={14}
          defaultValue={initial.body}
          className="input resize-y leading-relaxed"
          placeholder="줄바꿈은 그대로 표시되고, http로 시작하는 주소는 자동으로 링크가 됩니다."
          aria-describedby="body-help"
        />
        <p id="body-help" className="mt-1 text-xs leading-relaxed text-muted">
          &lsquo;이미지 넣기&rsquo;를 누르면 커서 위치에 [[image:…]] 표시가 들어가고, 사이트에서는 그 자리에 이미지가 보입니다. 표시를 옮기면 이미지 위치도 바뀝니다.
          파일은 한 개당 {MAX_FILE_LABEL}까지 올릴 수 있으며, 글과 같은 비밀번호로 암호화되어 저장됩니다.
        </p>
      </div>
      {err && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
      {drafts.length > 0 && (
        <div className="rounded-xl bg-paper p-4">
          <p className="text-sm font-bold">이미지·첨부 파일 {drafts.length}개</p>
          <ul className="mt-2 space-y-2">
            {drafts.map((d) => (
              <li key={d.att.id} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm">
                {d.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.preview} alt="" className="size-10 shrink-0 rounded object-cover" />
                ) : (
                  <span className="grid size-10 shrink-0 place-items-center rounded bg-paper text-[11px] font-bold text-muted">{d.att.inline ? "IMG" : "FILE"}</span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{d.att.name}</span>
                  <span className="block text-xs text-muted">
                    {d.att.inline ? (used.has(d.att.id) ? "본문 이미지" : "본문 이미지 (표시가 지워져 첨부 파일로 보임)") : "첨부 파일"} · {formatBytes(d.att.size)}
                    {!d.uploaded && " · 저장할 때 올라갑니다"}
                  </span>
                </span>
                {d.att.inline && (
                  <button type="button" onClick={() => insertAtCursor(imageToken(d.att.id))} className="btn-ghost btn-sm shrink-0">
                    본문에 다시 넣기
                  </button>
                )}
                <button type="button" onClick={() => remove(d)} className="btn-danger btn-sm shrink-0" aria-label={`${d.att.name} 빼기`}>
                  빼기
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="author_name">게시자</label>
          <input id="author_name" name="author_name" defaultValue={initial.author_name} maxLength={50} className="input" />
          {authorHint && <p className="mt-1 text-xs text-muted">{authorHint}</p>}
        </div>
        <label className="flex items-center gap-2.5 self-center text-sm font-semibold">
          <input type="checkbox" name="is_pinned" defaultChecked={initial.is_pinned} className="size-4 accent-ink" />
          목록 맨 위에 고정
        </label>
      </div>
      <FormButtons busy={busy} onCancel={onCancel} />
    </form>
  );
}

// ---------------------------------------------------------------- 공통 UI

function UnlockForm({ title, desc, label, busy, onUnlock }: { title: string; desc: string; label: string; busy: boolean; onUnlock: (pw: string) => Promise<boolean> }) {
  const [err, setErr] = useState("");
  return (
    <form
      className="card mx-auto max-w-md space-y-4 p-7"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr("");
        const ok = await onUnlock(String(new FormData(e.currentTarget).get("pw") ?? ""));
        if (!ok) setErr("비밀번호가 올바르지 않습니다.");
      }}
    >
      <h2 className="text-lg font-extrabold">{title}</h2>
      <p className="text-sm text-muted">{desc}</p>
      {err && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
      <div>
        <label className="label" htmlFor="unlock-pw">{label}</label>
        <input id="unlock-pw" name="pw" type="password" required className="input" autoComplete="current-password" />
      </div>
      <button disabled={busy} className="btn-primary w-full">{busy ? "확인 중…" : "열기"}</button>
    </form>
  );
}

function PasswordForm({ title, desc, busy, onError, onChange }: { title: string; desc: string; busy: string; onError: (t: string) => void; onChange: (pw: string) => Promise<boolean> }) {
  return (
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
        onChange(a).then((ok) => { if (ok) form.reset(); });
      }}
    >
      <h3 className="text-lg font-extrabold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">
        {desc} 새 비밀번호는 {MIN_PASSWORD_LENGTH}자 이상, 글자·숫자·기호 중 두 종류 이상을 섞어 주세요. 회사 이름·연도처럼 짐작하기 쉬운 말은 피해 주세요.
        이미 올린 이미지·첨부 파일은 다시 올릴 필요가 없습니다.
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
      <button disabled={!!busy} className="btn-primary">{busy || "비밀번호 변경"}</button>
    </form>
  );
}

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

function FormButtons({ busy, onCancel }: { busy: string; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel} disabled={!!busy} className="btn-ghost">취소</button>
      <button disabled={!!busy} className="btn-primary px-8">{busy || "저장"}</button>
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
                    <span className="sr-only">고정</span>
                  </>
                )}
                <span className="truncate">{r.title}</span>
              </p>
              <p className="mt-0.5 truncate text-sm text-muted">#{r.id} · {r.sub} · {formatDate(r.date)}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={r.onEdit} disabled={busy} className="btn-ghost btn-sm">수정</button>
              <button
                type="button"
                disabled={busy}
                onClick={() => { if (window.confirm(`"${r.title}" 글을 삭제할까요? 글의 이미지·첨부 파일도 함께 지웁니다.`)) r.onDelete(); }}
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
      <p>글 번호는 지운 글의 번호를 다시 쓰지 않습니다. 예전 글 주소가 다른 글을 가리키지 않게 하기 위해서입니다.</p>
      <h3 className="text-lg font-bold text-ink">카테고리</h3>
      <ul className="list-disc space-y-1 pl-5">
        <li><b>해외시장 · 해외입찰</b> — 나라별 게시판. 지역(동남아·중동 등)과 주/국가를 고릅니다. &lsquo;전체&rsquo; 지역으로 올린 글은 모든 지역에 함께 보입니다. 게시자는 표시되지 않습니다.</li>
        <li><b>국내우수 Item</b> — 단일 게시판. 종류(제품·기술·소프트웨어 등)와 회사명을 적습니다.</li>
        <li><b>공지</b> — 단일 게시판. 본사에서 해외주재원에게 전하는 공지. 종류(안내·중요 등)를 적으면 목록의 &lsquo;종류&rsquo; 칸에 보입니다.</li>
      </ul>
      <p>&lsquo;목록 맨 위에 고정&rsquo;을 체크하면 그 카테고리 목록의 맨 위에 보입니다.</p>
      <h3 className="text-lg font-bold text-ink">회원 비밀번호 (하나)</h3>
      <p>
        해외Biz정보(해외주재원 전용)의 모든 카테고리는 회원 비밀번호 하나로 열립니다. 회원가입은 없고, 글로벌마트가 회원(해외주재원 등)에게 알려 줍니다.
        글은 이 비밀번호로 암호화되어 저장되므로, 비밀번호를 잊으면 글을 열 수 없습니다. 안전한 곳에 적어 두세요.
      </p>
      <h3 className="text-lg font-bold text-ink">관리자 아이디·비밀번호</h3>
      <p>
        관리자 아이디·비밀번호는 회원 비밀번호와 별개입니다. 사이트 소유자가 &lsquo;처음 설정&rsquo;에서 GitHub 토큰을 넣고 정하면, 토큰이 아이디·비밀번호로 암호화되어 저장소(public/data/admin.json)에 저장됩니다.
        아이디·비밀번호를 아는 사람은 이 토큰으로 저장소를 고칠 수 있으므로, 길고 짐작하기 어려운 비밀번호를 쓰고 다른 사람에게 알려 주지 마세요.
        토큰의 유효기간이 지나면 아이디로 로그인되지 않으니, 새 토큰을 만들어 &lsquo;처음 설정&rsquo;을 다시 해 주세요.
      </p>
      <h3 className="text-lg font-bold text-ink">이미지·첨부 파일</h3>
      <p>
        글쓰기 화면의 &lsquo;이미지 넣기&rsquo;(JPG·PNG·GIF·WEBP)는 본문의 커서 위치에 이미지를 넣고, &lsquo;파일 첨부&rsquo;는 글 아래에 내려받기 목록으로 붙입니다.
        한 파일은 {MAX_FILE_LABEL}까지 올릴 수 있습니다. 파일도 회원 비밀번호로 보호되는 파일 키로 암호화되어 저장되므로 비밀번호를 아는 사람만 볼 수 있습니다.
        파일은 저장 버튼을 누를 때 올라가며, 글이나 첨부를 지우면 저장소의 파일도 함께 지웁니다.
      </p>
      <h3 className="text-lg font-bold text-ink">GitHub 토큰 만들기</h3>
      <ol className="list-decimal space-y-1 pl-5">
        <li>GitHub 로그인 → 오른쪽 위 프로필 → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token</li>
        <li>Repository access: Only select repositories → <b>intoedu/Global-Mart</b></li>
        <li>Permissions → Repository permissions → <b>Contents: Read and write</b></li>
        <li>Expiration은 짧게(예: 30~90일) 정합니다. 유효기간이 지나면 새로 만들어 &lsquo;처음 설정&rsquo;을 다시 합니다.</li>
        <li>만든 토큰(github_pat_로 시작)을 &lsquo;처음 설정&rsquo; 또는 &lsquo;토큰 직접 입력&rsquo;에 붙여 넣습니다. 클래식 토큰(ghp_)은 권한 범위가 넓어 권장하지 않습니다.</li>
      </ol>
      <h3 className="text-lg font-bold text-ink">비밀번호 보안</h3>
      <p>
        암호화된 파일은 누구나 내려받을 수 있으므로, 짧거나 짐작하기 쉬운 비밀번호는 컴퓨터로 대입해 풀릴 수 있습니다. 새 비밀번호는 {MIN_PASSWORD_LENGTH}자 이상,
        글자·숫자·기호를 섞어 정해 주세요. 비밀번호를 바꾸면 그 뒤로 올리는 글·파일은 새 비밀번호로만 열립니다. 다만 저장소 기록(git history)에 남은 예전 파일은
        예전 비밀번호로 열리므로, 바꾸기 전에 올린 글과 파일은 예전 비밀번호를 아는 사람이 볼 수 있다고 생각해 주세요.
      </p>
    </div>
  );
}
