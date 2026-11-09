import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

/**
 * 서버 전용 service role 클라이언트 (RLS 우회).
 * 해외주재원 비밀번호 확인 후 주재원 게시판을 읽을 때, 설정값을 읽고 쓸 때만 사용합니다.
 * 키는 절대 NEXT_PUBLIC_ 으로 노출하지 마세요.
 */
export const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";

export function createServiceClient() {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}
