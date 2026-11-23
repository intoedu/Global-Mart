import type { AdminFile, AdminSecret, EncryptedFile, KeyRing } from "./types";

/**
 * 회원 전용 게시판 암호화 (브라우저 WebCrypto) — 해외Biz정보(해외주재원 전용), 회원 비밀번호 하나
 * - 게시판 데이터: 비밀번호 → PBKDF2(SHA-256, 60만 회) → AES-GCM 256 키로 JSON 전체를 암호화
 * - 반복 횟수는 파일(iterations)에 함께 저장되므로, 예전(25만 회) 파일도 그대로 열립니다.
 * - 첨부 파일·본문 이미지: 게시판마다 무작위 "파일 키"(AES-GCM 256)로 암호화해 따로 저장합니다.
 *   파일 키는 암호화된 게시판 데이터 안(file_keys)에만 들어 있어, 비밀번호가 곧 파일 키를 감싸는 열쇠입니다.
 *   비밀번호를 바꿀 때는 게시판 데이터만 다시 암호화하고(파일은 그대로) 새 파일 키를 하나 더 만듭니다.
 * - 파일이 공개되어 있어 짧은 비밀번호는 오프라인 대입으로 풀릴 수 있습니다. 관리자 화면은 새 비밀번호를
 *   10자 이상, 두 종류 이상의 문자(글자·숫자·기호)로만 받습니다. (checkPassword)
 */
const ITER = 600_000;

export const MIN_PASSWORD_LENGTH = 10;

/** 새 비밀번호 규칙 검사 — 문제가 없으면 빈 문자열 */
export function checkPassword(pw: string): string {
  if (pw.length < MIN_PASSWORD_LENGTH) return `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상으로 정해 주세요.`;
  const kinds = [/\p{L}/u, /\p{N}/u, /[^\p{L}\p{N}\s]/u].filter((r) => r.test(pw)).length;
  if (kinds < 2) return "글자·숫자·기호 중 두 종류 이상을 섞어 주세요.";
  return "";
}

/** 바이트 → base64 (큰 파일도 되도록 나눠서 변환) */
export function bytesToB64(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
export const b64ToBytes = (s: string) => Uint8Array.from(atob(s.replace(/\s/g, "")), (c) => c.charCodeAt(0));

/** 무작위 영숫자 id (파일 이름·키 번호) */
export function randomId(bytes = 8) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptJson(value: unknown, password: string): Promise<EncryptedFile> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, ITER);
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(value)));
  return { v: 1, alg: "AES-GCM", kdf: "PBKDF2-SHA256", iterations: ITER, salt: bytesToB64(salt), iv: bytesToB64(iv), data: bytesToB64(data), updated_at: new Date().toISOString() };
}

/** 비밀번호가 틀리면 null */
export async function decryptJson<T>(file: EncryptedFile, password: string): Promise<T | null> {
  try {
    const key = await deriveKey(password, b64ToBytes(file.salt), file.iterations);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(file.iv) as BufferSource }, key, b64ToBytes(file.data) as BufferSource);
    return JSON.parse(new TextDecoder().decode(plain)) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- 파일 키 · 첨부 파일

/** 새 파일 키를 만들어 묶음에 넣고 현재 키로 지정 (데이터를 직접 바꾸지 않고 새 객체를 돌려줌) */
export function withNewFileKey<T extends KeyRing>(data: T): T {
  const kid = randomId(4);
  const raw = bytesToB64(crypto.getRandomValues(new Uint8Array(32)));
  return { ...data, file_keys: { ...(data.file_keys ?? {}), [kid]: raw }, current_key: kid };
}

/** 현재 파일 키가 없으면(예전 파일) 하나 만듭니다. */
export function ensureFileKey<T extends KeyRing>(data: T): T {
  return data.current_key && data.file_keys?.[data.current_key] ? data : withNewFileKey(data);
}

const importFileKey = (rawB64: string, usage: KeyUsage[]) =>
  crypto.subtle.importKey("raw", b64ToBytes(rawB64) as BufferSource, { name: "AES-GCM" }, false, usage);

/** 파일 암호화 → [IV 12바이트][암호문] */
export async function encryptBytes(plain: ArrayBuffer | Uint8Array, rawKeyB64: string): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await importFileKey(rawKeyB64, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain as BufferSource));
  const out = new Uint8Array(12 + ct.length);
  out.set(iv);
  out.set(ct, 12);
  return out;
}

/** 키가 맞지 않거나 파일이 손상되면 null */
export async function decryptBytes(blob: ArrayBuffer | Uint8Array, rawKeyB64: string): Promise<ArrayBuffer | null> {
  try {
    const bytes = blob instanceof Uint8Array ? blob : new Uint8Array(blob);
    const key = await importFileKey(rawKeyB64, ["decrypt"]);
    return await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes.subarray(0, 12) as BufferSource }, key, bytes.subarray(12) as BufferSource);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- 관리자 아이디·비밀번호 → GitHub 토큰

/** 아이디는 앞뒤 공백을 빼고 소문자로 비교합니다. */
export const normalizeAdminId = (id: string) => id.trim().toLowerCase();

/** 새 관리자 아이디 규칙 검사 — 문제가 없으면 빈 문자열 */
export function checkAdminId(id: string): string {
  const v = normalizeAdminId(id);
  if (v.length < 3 || v.length > 40) return "아이디는 3~40자로 정해 주세요.";
  if (!/^[a-z0-9._-]+$/.test(v)) return "아이디는 영문·숫자와 . _ - 만 쓸 수 있습니다.";
  return "";
}

/** 아이디·비밀번호를 합친 암호화 열쇠 문자열 (둘 중 하나라도 틀리면 풀리지 않음) */
const adminSecret = (id: string, pw: string) => `gm-admin\u0000${normalizeAdminId(id)}\u0000${pw}`;

/**
 * GitHub 토큰을 관리자 아이디·비밀번호로 암호화 (PBKDF2-SHA256 60만 회 → AES-GCM 256)
 * 결과는 저장소의 public/data/admin.json 에 저장됩니다. 아이디·비밀번호 자체는 어디에도 저장하지 않습니다.
 */
export async function encryptAdminToken(token: string, id: string, pw: string): Promise<AdminFile> {
  const secret: AdminSecret = { token, set_at: new Date().toISOString() };
  return { ...(await encryptJson(secret, adminSecret(id, pw))), kind: "admin-token" };
}

/** 아이디·비밀번호가 틀리면 null */
export async function decryptAdminToken(file: EncryptedFile, id: string, pw: string): Promise<string | null> {
  const d = await decryptJson<AdminSecret>(file, adminSecret(id, pw));
  return d && typeof d.token === "string" && d.token ? d.token : null;
}
