import { SITE } from "./site";

/**
 * GitHub 저장소의 파일을 읽고 쓰는 도우미 (관리자 화면 전용, 브라우저에서 실행)
 * 토큰은 관리자 브라우저에만 저장되며 코드·서버에 남지 않습니다.
 */
export const DATA_BRANCH = process.env.NEXT_PUBLIC_DATA_BRANCH || "main";
const API = `https://api.github.com/repos/${SITE.repo.owner}/${SITE.repo.name}`;

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

/** 토큰 확인: 저장소에 쓰기 권한이 있는지 */
export async function checkToken(token: string): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(API, { headers: headers(token) });
  if (res.status === 401) return { ok: false, message: "토큰이 올바르지 않거나 만료되었습니다." };
  if (!res.ok) return { ok: false, message: `저장소에 접근할 수 없습니다. (${res.status})` };
  const repo = await res.json();
  if (!repo.permissions?.push) return { ok: false, message: "이 토큰에는 저장소 쓰기 권한(Contents: Read and write)이 없습니다." };
  return { ok: true, message: "확인되었습니다." };
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
  if (res.status === 409 || res.status === 422) throw new Error("다른 곳에서 먼저 수정되었습니다. 새로고침 후 다시 저장해 주세요.");
  if (!res.ok) throw new Error(`저장하지 못했습니다. (${res.status})`);
  return (await res.json()).content.sha as string;
}

export const ACTIONS_URL = `https://github.com/${SITE.repo.owner}/${SITE.repo.name}/actions`;
