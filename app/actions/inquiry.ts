"use server";

import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/site";
import type { FormState } from "./auth";

const str = (fd: FormData, k: string, max: number) => String(fd.get(k) ?? "").trim().slice(0, max);

export async function submitInquiry(_: FormState, fd: FormData): Promise<FormState> {
  // 스팸 방지용 숨김 필드 — 사람이 채울 일이 없음
  if (str(fd, "website", 100)) return { ok: true, message: "OK" };

  const data = {
    name: str(fd, "name", 100),
    company: str(fd, "company", 100),
    email: str(fd, "email", 200),
    phone: str(fd, "phone", 40),
    service: str(fd, "service", 60),
    region: str(fd, "region", 60),
    message: str(fd, "message", 5000),
  };
  if (!data.name || !data.email || !data.message) return { error: "이름, 이메일, 문의 내용은 꼭 입력해 주세요. (Name, email and message are required)" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { error: "이메일 형식을 확인해 주세요. (Please check your email)" };
  if (fd.get("agree") !== "on") return { error: "개인정보 수집·이용에 동의해 주세요. (Please accept the privacy policy)" };

  const supabase = await createClient();
  if (!supabase) {
    return {
      error: `미리보기 모드라 온라인 접수가 저장되지 않습니다. 전화 ${SITE.tel} 또는 ${SITE.email} 로 문의해 주세요.`,
    };
  }
  const { error } = await supabase.from("inquiries").insert(data);
  if (error) {
    console.error("inquiry", error.message);
    return { error: `접수 중 오류가 발생했습니다. 전화 ${SITE.tel} 로 문의해 주세요. (Something went wrong)` };
  }
  return {
    ok: true,
    message: "상담 신청이 접수되었습니다. 영업일 기준 1~2일 안에 연락드리겠습니다. / Thank you. We will contact you within 1–2 business days.",
  };
}
