"use server";

import { redirect } from "next/navigation";
import { leave, tryEnter } from "@/lib/resident-access";
import type { FormState } from "./auth";

export async function enterResident(_: FormState, fd: FormData): Promise<FormState> {
  const ok = await tryEnter(String(fd.get("password") ?? "").slice(0, 200));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)); // 무차별 대입 속도 늦추기
    return { error: "비밀번호가 올바르지 않습니다. (Incorrect password)" };
  }
  const next = String(fd.get("next") ?? "/resident");
  redirect(next.startsWith("/resident") ? next : "/resident");
}

export async function leaveResident() {
  await leave();
  redirect("/resident");
}
