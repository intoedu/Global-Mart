"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/data";
import { isRegionId } from "@/lib/regions";
import type { FormState } from "./auth";
import { setResidentPassword } from "@/lib/resident-access";

/** 모든 관리자 액션은 서버에서 다시 권한을 확인 (DB RLS 로도 이중 차단) */
async function requireAdmin() {
  const viewer = await getViewer();
  const supabase = await createClient();
  if (!viewer?.isAdmin || !supabase) throw new Error("Unauthorized");
  return { viewer, supabase };
}

const str = (fd: FormData, k: string, max: number) => String(fd.get(k) ?? "").trim().slice(0, max);

export async function savePost(_: FormState, fd: FormData): Promise<FormState> {
  const { viewer, supabase } = await requireAdmin();
  const id = Number(fd.get("id") || 0);
  const board = fd.get("board") === "resident" ? "resident" : "biz";
  const region = str(fd, "region", 30);
  const row = {
    board,
    category: str(fd, "category", 40),
    region: board === "biz" && isRegionId(region) ? region : "all",
    country: board === "biz" ? str(fd, "country", 80) : "",
    company: board === "resident" ? str(fd, "company", 100) : "",
    title: str(fd, "title", 200),
    body: str(fd, "body", 50000),
    author_name: str(fd, "author_name", 50) || viewer.profile?.name || "글로벌마트",
    is_pinned: fd.get("is_pinned") === "on",
  };
  if (!row.title) return { error: "제목을 입력해 주세요." };

  const res = id
    ? await supabase.from("posts").update(row).eq("id", id).select("id").single()
    : await supabase.from("posts").insert({ ...row, created_by: viewer.userId }).select("id").single();
  if (res.error) return { error: res.error.message };

  revalidatePath("/", "layout");
  redirect(`/${board}/${res.data.id}`);
}

export async function deletePost(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = Number(fd.get("id"));
  await supabase.from("posts").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/posts");
}

export async function updateInquiry(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = Number(fd.get("id"));
  const status = String(fd.get("status"));
  const patch: Record<string, string> = { memo: str(fd, "memo", 2000) };
  if (["new", "in_progress", "done"].includes(status)) patch.status = status;
  await supabase.from("inquiries").update(patch).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function deleteInquiry(fd: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("inquiries").delete().eq("id", Number(fd.get("id")));
  revalidatePath("/admin", "layout");
}

export async function changeResidentPassword(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const pw = String(fd.get("password") ?? "");
  if (pw.length < 6) return { error: "비밀번호는 6자 이상으로 정해 주세요." };
  if (pw !== String(fd.get("password2") ?? "")) return { error: "두 비밀번호가 서로 다릅니다." };
  try {
    await setResidentPassword(pw);
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: "변경되었습니다. 기존에 입장해 있던 사람들은 새 비밀번호로 다시 들어와야 합니다." };
}
