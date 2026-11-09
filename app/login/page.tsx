import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getT } from "@/lib/i18n";
import { getViewer, isSupabaseConfigured } from "@/lib/data";
import { PageHero } from "@/components/PageHero";
import { LoginForm } from "@/components/AuthForms";
import { DemoNotice } from "@/components/board/DemoNotice";

export const metadata: Metadata = { title: "Login", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safe = next?.startsWith("/") && !next.startsWith("//") ? next : "/admin";
  if (await getViewer()) redirect(safe);
  const { locale } = await getT();
  const ko = locale === "ko";
  return (
    <>
      <PageHero eyebrow="Member" title={ko ? "관리자 로그인" : "Admin login"} lead={ko ? "게시판 글 등록과 상담 신청 관리를 위한 관리자 전용 로그인입니다." : "For site administrators only."} />
      <section className="py-14 lg:py-20">
        <div className="container-x max-w-md">
          {!isSupabaseConfigured && <DemoNotice ko={ko} />}
          <div className="card p-7 sm:p-9">
            <LoginForm ko={ko} next={safe} />
          </div>
        </div>
      </section>
    </>
  );
}
