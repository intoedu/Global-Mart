import { SITE } from "./site";

/**
 * GitHub 저장소의 파일을 읽고 쓰는 도우미 (관리자 화면 전용, 브라우저에서 실행)
 * 토큰은 관리자 브라우저에만 저장되며 코드·서버에 남지 않습니다.
 */

/**
 * 게시판 데이터(data/biz.json, public/data/resident.json)가 있는 소스 브랜치.
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

const toB64 = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
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
  const res = await fetch(`${API}/contents/${path}?ref=${encodeURIComponent(DATA_BRANCH)}`, { headers: headers(token), cache: "no-store" });
  if (!res.ok) throw new Error(`${path} 파일을 불러오지 못했습니다. (${res.status})`);
  const json = await res.json();
  return { data: JSON.parse(fromB64(json.content)) as T, sha: json.sha };
}

export async function writeFile(token: string, path: string, data: unknown, sha: string, message: string): Promise<string> {
  const res = await fetch(`${API}/contents/${path}`, {
    method: "PUT",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify({ message, content: toB64(JSON.stringify(data, null, 2) + "\n"), sha, branch: DATA_BRANCH }),
  });
  if (res.status === 409) throw new ConflictError();
  if (!res.ok) {
    const m = await apiMessage(res);
    throw new Error(`저장하지 못했습니다. (${res.status}${m ? `: ${m}` : ""})`);
  }
  return (await res.json()).content.sha as string;
}

export const ACTIONS_URL = `https://github.com/${SITE.repo.owner}/${SITE.repo.name}/actions`;
