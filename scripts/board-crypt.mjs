#!/usr/bin/env node
/**
 * 회원 전용 게시판 데이터 암호화 도구 (Node 22 이상, 외부 패키지 없음)
 * 브라우저(lib/crypto.ts)와 같은 형식을 씁니다: PBKDF2-SHA256(60만 회) → AES-GCM 256,
 * 첨부 파일은 게시판 데이터 안의 파일 키(file_keys)로 암호화한 [IV 12바이트][암호문] 형식.
 *
 * 비밀번호는 명령줄에 직접 쓰지 말고 파일(--password-file)로 넘겨 주세요. 비밀번호 파일은 저장소에 넣지 마세요.
 *
 *   # 풀어서 보기 (또는 --out 으로 저장 — 평문 파일은 저장소 밖에 두세요)
 *   node scripts/board-crypt.mjs decrypt public/data/biz.json --password-file ~/biz-pw.txt [--out /tmp/biz.plain.json]
 *
 *   # 평문 JSON → 암호화 파일 (파일 키가 없으면 하나 만듭니다)
 *   node scripts/board-crypt.mjs encrypt /tmp/biz.plain.json --password-file ~/biz-pw.txt --out public/data/biz.json
 *
 *   # 같은 비밀번호로 다시 암호화(새 salt·iv, 현재 반복 횟수) 또는 비밀번호 바꾸기(새 파일 키 추가)
 *   node scripts/board-crypt.mjs reencrypt public/data/resident.json --password-file old.txt [--new-password-file new.txt]
 *
 *   # 평문 JSON 에 첨부 파일 추가: 암호문을 public/data/files/<board>/ 에 쓰고 첨부 정보(JSON)를 출력
 *   node scripts/board-crypt.mjs add-file /tmp/biz.plain.json --board biz --file photo.png [--inline]
 *
 *   # 확인: 풀리는지, 글마다 첨부 파일이 모두 풀리는지
 *   node scripts/board-crypt.mjs verify public/data/biz.json --password-file ~/biz-pw.txt
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const subtle = globalThis.crypto.subtle;
export const ITER = 600_000;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const b64 = (u8) => Buffer.from(u8).toString("base64");
const unb64 = (s) => new Uint8Array(Buffer.from(s, "base64"));
export const randomId = (n = 8) => Buffer.from(globalThis.crypto.getRandomValues(new Uint8Array(n))).toString("hex");

async function deriveKey(password, salt, iterations) {
  const base = await subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function encryptJson(value, password) {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, ITER);
  const data = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(value))));
  return { v: 1, alg: "AES-GCM", kdf: "PBKDF2-SHA256", iterations: ITER, salt: b64(salt), iv: b64(iv), data: b64(data), updated_at: new Date().toISOString() };
}

/** 비밀번호가 틀리면 오류 */
export async function decryptJson(file, password) {
  const key = await deriveKey(password, unb64(file.salt), file.iterations);
  const plain = await subtle.decrypt({ name: "AES-GCM", iv: unb64(file.iv) }, key, unb64(file.data));
  return JSON.parse(new TextDecoder().decode(plain));
}

export function withNewFileKey(data) {
  const kid = randomId(4);
  return { ...data, file_keys: { ...(data.file_keys ?? {}), [kid]: b64(globalThis.crypto.getRandomValues(new Uint8Array(32))) }, current_key: kid };
}
export const ensureFileKey = (data) => (data.current_key && data.file_keys?.[data.current_key] ? data : withNewFileKey(data));

const fileKey = (raw, usage) => subtle.importKey("raw", unb64(raw), { name: "AES-GCM" }, false, usage);

export async function encryptBytes(plain, rawKey) {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv }, await fileKey(rawKey, ["encrypt"]), plain));
  const out = new Uint8Array(12 + ct.length);
  out.set(iv);
  out.set(ct, 12);
  return out;
}
export async function decryptBytes(blob, rawKey) {
  const u8 = new Uint8Array(blob);
  return new Uint8Array(await subtle.decrypt({ name: "AES-GCM", iv: u8.subarray(0, 12) }, await fileKey(rawKey, ["decrypt"]), u8.subarray(12)));
}

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".pdf": "application/pdf", ".txt": "text/plain", ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation", ".zip": "application/zip" };

/** 평문 데이터에 파일 하나를 암호화해 추가 → { data(키가 추가됐을 수 있음), attachment } */
export async function addFile(data, board, filePath, { inline = false, publicDir = path.join(ROOT, "public"), name } = {}) {
  const d = ensureFileKey(data);
  const bytes = fs.readFileSync(filePath);
  if (bytes.length > 10 * 1024 * 1024) throw new Error("10MB 보다 큰 파일은 올릴 수 없습니다.");
  const id = randomId(8);
  const rel = `data/files/${board}/${id}.bin`;
  fs.mkdirSync(path.join(publicDir, `data/files/${board}`), { recursive: true });
  fs.writeFileSync(path.join(publicDir, rel), await encryptBytes(bytes, d.file_keys[d.current_key]));
  const fname = name ?? path.basename(filePath);
  const type = MIME[path.extname(fname).toLowerCase()] ?? "application/octet-stream";
  return { data: d, attachment: { id, kid: d.current_key, name: fname, type, size: bytes.length, path: rel, ...(inline ? { inline: true } : {}) } };
}

/** 암호화 파일과 첨부 파일이 모두 풀리는지 확인 → 요약 문자열 목록 */
export async function verify(encFile, password, publicDir = path.join(ROOT, "public")) {
  const data = await decryptJson(encFile, password);
  const lines = [`posts: ${data.posts?.length ?? 0}, file keys: ${Object.keys(data.file_keys ?? {}).length}, software: ${data.software ? "yes" : "no"}`];
  for (const p of data.posts ?? []) {
    for (const f of p.files ?? []) {
      const blob = fs.readFileSync(path.join(publicDir, f.path));
      const plain = await decryptBytes(blob, data.file_keys[f.kid]);
      if (plain.length !== f.size) throw new Error(`size mismatch: ${f.path}`);
      lines.push(`  #${p.id} ${f.inline ? "image" : "file "} ${f.name} (${f.size} B) OK`);
    }
  }
  return lines;
}

// ---------------------------------------------------------------- 명령줄

function args(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const k = a.slice(2);
      if (k === "inline") o.inline = true;
      else o[k] = argv[++i];
    } else o._.push(a);
  }
  return o;
}
const readPw = (f) => {
  if (!f) throw new Error("--password-file 이 필요합니다.");
  const pw = fs.readFileSync(f, "utf8").replace(/\r?\n$/, "");
  if (!pw) throw new Error(`${f} 가 비어 있습니다.`);
  return pw;
};
const readJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const writeJson = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 2) + "\n");

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const o = args(rest);
  const input = o._[0];
  switch (cmd) {
    case "decrypt": {
      const data = await decryptJson(readJson(input), readPw(o["password-file"]));
      if (o.out) writeJson(o.out, data);
      else console.log(JSON.stringify(data, null, 2));
      break;
    }
    case "encrypt": {
      if (!o.out) throw new Error("--out 이 필요합니다.");
      const data = ensureFileKey(readJson(input));
      writeJson(o.out, await encryptJson(data, readPw(o["password-file"])));
      console.log(`encrypted → ${o.out}`);
      break;
    }
    case "reencrypt": {
      let data = await decryptJson(readJson(input), readPw(o["password-file"]));
      let pw = readPw(o["password-file"]);
      if (o["new-password-file"]) {
        pw = readPw(o["new-password-file"]);
        data = withNewFileKey(data);
      } else data = ensureFileKey(data);
      writeJson(o.out ?? input, await encryptJson(data, pw));
      console.log(`re-encrypted → ${o.out ?? input}`);
      break;
    }
    case "add-file": {
      if (!o.board || !o.file) throw new Error("--board 와 --file 이 필요합니다.");
      const { data, attachment } = await addFile(readJson(input), o.board, o.file, { inline: !!o.inline });
      writeJson(input, data);
      console.log(JSON.stringify(attachment, null, 2));
      break;
    }
    case "verify": {
      for (const l of await verify(readJson(input), readPw(o["password-file"]))) console.log(l);
      break;
    }
    default:
      console.log("usage: node scripts/board-crypt.mjs <decrypt|encrypt|reencrypt|add-file|verify> … (자세한 사용법은 파일 머리말)");
      process.exitCode = cmd ? 1 : 0;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e?.name === "OperationError" ? "풀 수 없습니다: 비밀번호가 맞지 않거나 파일이 손상되었습니다." : e.message || e);
    process.exit(1);
  });
}
