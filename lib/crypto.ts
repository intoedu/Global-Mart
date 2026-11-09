import type { EncryptedFile } from "./types";

/**
 * 해외주재원 전용 글 암호화 (브라우저 WebCrypto)
 * - 공용 비밀번호 → PBKDF2(SHA-256, 25만 회) → AES-GCM 256 키
 * - 저장소가 공개여도 비밀번호 없이는 내용을 읽을 수 없습니다.
 */
const ITER = 250_000;

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
