"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { ok?: boolean; error?: string; message?: string } | null;

function safeNext(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/admin";
}

/** 관리자 로그인 (일반 회원가입 없음) */
export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  const supabase = await createClient();
  if (!supabase) return { error: "데이터베이스가 아직 연결되지 않았습니다." };
  const { error } = await supabase.auth.signInWithPassword({
    email: String(fd.get("email") ?? "").trim(),
    password: String(fd.get("password") ?? ""),
  });
  if (error) return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  redirect(safeNext(fd.get("next")));
}
