import { SITE } from "./site";
import { ADMIN_FILE } from "./board";
import { asset } from "./paths";
import type { EncryptedFile } from "./types";

/**
 * GitHub 저장소의 파일을 읽고 쓰는 도우미 (관리자 화면 전용, 브라우저에서 실행)
 * 토큰은 관리자 브라우저에만 저장되며 코드·서버에 남지 않습니다.
 */

/**
 * 게시판 데이터(public/data/biz.json, public/data/files/**)와 관리자 토큰(public/data/admin.json)이 있는 소스 브랜치.
 * GitHub Actions 빌드는 NEXT_PUBLIC_DATA_BRANCH(= 푸시된 브랜치)를 넣어 줍니다.
 * 값이 없을 때(로컬 빌드 등)는 소스 브랜치를 씁니다. main 은 배포본만 있어 데이터 파일이 없습니다.
 */
export const SOURCE_BRANCH = "claude/magical-meitner-h496nk";
export const DATA_BRANCH = process.env.NEXT_PUBLIC_DATA_BRANCH || SOURCE_BRANCH;
const API = `https://api.github.com/repos/${SITE.repo.owner}/${SITE.repo.name}`;

/** 다른 곳(다른 관리자 창 등)에서 먼저 파일을 고쳐 sha 가 맞지 않을 때 (HTTP 409) */
export class ConflictError extends Error {
  constructor() {
    super("다른 곳에서 먼저 수정되었습니다.");
    this.name = "ConflictError";
  }
}

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
}

const bytesB64 = (bytes: Uint8Array) => {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
const toB64 = (text: string) => bytesB64(new TextEncoder().encode(text));
const fromB64 = (b64: string) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, "")), (c) => c.charCodeAt(0)));

/** GitHub 오류 응답의 message (없으면 빈 문자열) */
async function apiMessage(res: Response) {
  try {
    const j = await res.json();
    return typeof j?.message === "string" ? j.message : "";
  } catch {
    return "";
  }
}

/**
 * 토큰 확인: 저장소에 쓰기 권한이 있는지.
 * warning: 모든 저장소에 권한이 생길 수 있는 클래식 토큰(ghp_)이면 안내 문구
 */
export async function checkToken(token: string): Promise<{ ok: boolean; message: string; warning?: string }> {
  const res = await fetch(API, { headers: headers(token) });
  if (res.status === 401) return { ok: false, message: "토큰이 올바르지 않거나 만료되었습니다." };
  if (!res.ok) return { ok: false, message: `저장소에 접근할 수 없습니다. (${res.status})` };
  const repo = await res.json();
  if (!repo.permissions?.push) return { ok: false, message: "이 토큰에는 저장소 쓰기 권한(Contents: Read and write)이 없습니다." };
  const warning = token.startsWith("ghp_")
    ? "클래식 토큰(ghp_)은 계정의 모든 저장소에 권한이 생길 수 있습니다. 이 저장소만 고를 수 있고 유효기간이 짧은 Fine-grained 토큰(github_pat_)으로 바꾸는 것을 권장합니다."
    : undefined;
  return { ok: true, message: "확인되었습니다.", warning };
}

export async function readFile<T>(token: string, path: string): Promise<{ data: T; sha: string }> {
  const f = await readFileOrNull<T>(token, path);
  if (!f) throw new Error(`${path} 파일이 저장소에 없습니다. (404)`);
  return f;
}

/** 파일이 없으면(404) null */
export async function readFileOrNull<T>(token: string, path: string): Promise<{ data: T; sha: string } | null> {
  const res = await fetch(`${API}/contents/${path}?ref=${encodeURIComponent(DATA_BRANCH)}`, { headers: headers(token), cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${path} 파일을 불러오지 못했습니다. (${res.status})`);
  const json = await res.json();
  return { data: JSON.parse(fromB64(json.content)) as T, sha: json.sha };
}

/** JSON 파일 저장. sha 가 없으면 새 파일로 만듭니다(이미 있으면 GitHub 가 거절). */
export async function writeFile(token: string, path: string, data: unknown, sha: string | undefined, message: string): Promise<string> {
  const res = await fetch(`${API}/contents/${path}`, {
    method: "PUT",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify({ message, content: toB64(JSON.stringify(data, null, 2) + "\n"), ...(sha ? { sha } : {}), branch: DATA_BRANCH }),
  });
  // 409: sha 가 맞지 않음 · 422: sha 없이 만들려는데 이미 파일이 있음 (둘 다 다른 곳에서 먼저 저장한 경우)
  if (res.status === 409 || (res.status === 422 && !sha)) throw new ConflictError();
  if (!res.ok) {
    const m = await apiMessage(res);
    throw new Error(`저장하지 못했습니다. (${res.status}${m ? `: ${m}` : ""})`);
  }
  return (await res.json()).content.sha as string;
}

/**
 * 새 파일(첨부 파일의 암호문)을 저장소에 올립니다. 이름이 무작위라 기존 파일과 겹치지 않습니다.
 * 같은 경로가 이미 있으면(422) 오류를 냅니다.
 */
export async function createBinaryFile(token: string, path: string, bytes: Uint8Array, message: string): Promise<void> {
  const res = await fetch(`${API}/contents/${path}`, {
    method: "PUT",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify({ message, content: bytesB64(bytes), branch: DATA_BRANCH }),
  });
  if (!res.ok) {
    const m = await apiMessage(res);
    throw new Error(`파일을 올리지 못했습니다. (${res.status}${m ? `: ${m}` : ""})`);
  }
}

/** 파일 지우기 (지운 글의 첨부 파일 정리용). 이미 없으면 true. 실패하면 false — 오류를 내지 않습니다. */
export async function deleteRepoFile(token: string, path: string, message: string): Promise<boolean> {
  try {
    // 폴더 목록에서 sha 를 찾습니다. (파일 내용은 내려받지 않음)
    const dir = path.slice(0, path.lastIndexOf("/"));
    const list = await fetch(`${API}/contents/${dir}?ref=${encodeURIComponent(DATA_BRANCH)}`, { headers: headers(token), cache: "no-store" });
    if (!list.ok) return list.status === 404;
    const entry = ((await list.json()) as { path: string; sha: string }[]).find((x) => x.path === path);
    if (!entry) return true;
    const res = await fetch(`${API}/contents/${path}`, {
      method: "DELETE",
      headers: { ...headers(token), "Content-Type": "application/json" },
      body: JSON.stringify({ message, sha: entry.sha, branch: DATA_BRANCH }),
    });
    return res.ok || res.status === 404;
  } catch {
    return false;
  }
}

export const ACTIONS_URL = `https://github.com/${SITE.repo.owner}/${SITE.repo.name}/actions`;

/**
 * 관리자 토큰 파일(public/data/admin.json) 읽기 — 토큰 없이 읽습니다.
 * 1) 배포된 사이트의 파일  2) 없거나 예전 것이면 저장소 원본(raw.githubusercontent.com, 공개 저장소일 때)
 * 아이디·비밀번호를 바꾼 직후에는 사이트 반영(1~2분) 전이라 2)가 쓰입니다. 둘 다 없으면 빈 목록.
 */
export async function fetchAdminFiles(): Promise<EncryptedFile[]> {
  const urls = [asset(ADMIN_FILE.web), `https://raw.githubusercontent.com/${SITE.repo.owner}/${SITE.repo.name}/refs/heads/${DATA_BRANCH}/${ADMIN_FILE.repo}`];
  const out: EncryptedFile[] = [];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const j = (await res.json()) as EncryptedFile;
      if (j?.data && j.salt && j.iv && !out.some((x) => x.data === j.data)) out.push(j);
    } catch {}
  }
  return out;
}
