export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Supabase 환경변수가 없으면 '데모 모드'(예시 데이터, 쓰기 불가)로 동작합니다. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
