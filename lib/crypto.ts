import type { EncryptedFile } from "./types";

/**
 * 해외주재원 전용 글 암호화 (브라우저 WebCrypto)
 * - 공용 비밀번호 → PBKDF2(SHA-256, 60만 회) → AES-GCM 256 키
 * - 저장소가 공개여도 비밀번호 없이는 내용을 읽을 수 없습니다.
 * - 반복 횟수는 파일(iterations)에 함께 저장되므로, 예전(25만 회) 파일도 그대로 열립니다.
 *   새로 저장할 때부터 60만 회(OWASP 권장값)를 씁니다.
 * - 파일이 공개되어 있어 짧은 비밀번호는 오프라인 대입으로 풀릴 수 있습니다. 관리자 화면은 새 비밀번호를
 *   10자 이상, 두 종류 이상의 문자(글자·숫자·기호)로만 받습니다. (checkPassword)
 */
const ITER = 600_000;

export const MIN_PASSWORD_LENGTH = 10;

/** 새 공용 비밀번호 규칙 검사 — 문제가 없으면 빈 문자열 */
export function checkPassword(pw: string): string {
  if (pw.length < MIN_PASSWORD_LENGTH) return `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상으로 정해 주세요.`;
  const kinds = [/\p{L}/u, /\p{N}/u, /[^\p{L}\p{N}\s]/u].filter((r) => r.test(pw)).length;
  if (kinds < 2) return "글자·숫자·기호 중 두 종류 이상을 섞어 주세요.";
  return "";
}

const b64 = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
};
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

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
  return { v: 1, alg: "AES-GCM", kdf: "PBKDF2-SHA256", iterations: ITER, salt: b64(salt), iv: b64(iv), data: b64(data), updated_at: new Date().toISOString() };
}

/** 비밀번호가 틀리면 null */
export async function decryptJson<T>(file: EncryptedFile, password: string): Promise<T | null> {
  try {
    const key = await deriveKey(password, unb64(file.salt), file.iterations);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(file.iv) as BufferSource }, key, unb64(file.data) as BufferSource);
    return JSON.parse(new TextDecoder().decode(plain)) as T;
  } catch {
    return null;
  }
}
