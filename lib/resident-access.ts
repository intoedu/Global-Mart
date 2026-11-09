import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createServiceClient, SERVICE_KEY } from "./supabase/service";
import { isSupabaseConfigured } from "./supabase/env";

/**
 * 해외주재원 전용 게시판 — 회원가입 없이 '공용 비밀번호'로 입장
 * - 비밀번호는 DB(settings 테이블)에 scrypt 해시로만 저장
 * - 입장 쿠키는 현재 해시에 묶여 있어, 관리자가 비밀번호를 바꾸면 기존 입장이 모두 무효화됨
 */
const COOKIE = "gm_resident";
const KEY = "resident_password_hash";

async function getHash(): Promise<string | null> {
  const db = createServiceClient();
  if (!db) return null;
  const { data } = await db.from("settings").select("value").eq("key", KEY).maybeSingle<{ value: string }>();
  return data?.value ?? null;
}

function tokenFor(hash: string) {
  return createHmac("sha256", SERVICE_KEY).update(hash).digest("base64url");
}

export function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 32).toString("hex")}`;
}

function verify(pw: string, stored: string) {
  const [salt, hex] = stored.split(":");
  if (!salt || !hex) return false;
  const a = scryptSync(pw, salt, 32);
  const b = Buffer.from(hex, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** 상태: demo(DB 미연결 → 예시 공개) / unset(비밀번호 미설정) / locked / open */
export async function residentAccess(isAdmin: boolean): Promise<"demo" | "unset" | "locked" | "open"> {
  if (!isSupabaseConfigured) return "demo";
  if (isAdmin) return "open";
  const hash = await getHash();
  if (!hash) return "unset";
  const store = await cookies();
  const c = store.get(COOKIE)?.value;
  if (!c) return "locked";
  const expected = tokenFor(hash);
  const ok = c.length === expected.length && timingSafeEqual(Buffer.from(c), Buffer.from(expected));
  return ok ? "open" : "locked";
}

export async function tryEnter(pw: string): Promise<boolean> {
  const hash = await getHash();
  if (!hash || !pw || !verify(pw, hash)) return false;
  const store = await cookies();
  store.set(COOKIE, tokenFor(hash), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return true;
}

export async function leave() {
  (await cookies()).delete(COOKIE);
}

export async function setResidentPassword(pw: string) {
  const db = createServiceClient();
  if (!db) throw new Error("SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다.");
  const { error } = await db.from("settings").upsert({ key: KEY, value: hashPassword(pw), updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

export async function residentPasswordUpdatedAt(): Promise<string | null> {
  const db = createServiceClient();
  if (!db) return null;
  const { data } = await db.from("settings").select("updated_at").eq("key", KEY).maybeSingle<{ updated_at: string }>();
  return data?.updated_at ?? null;
}

