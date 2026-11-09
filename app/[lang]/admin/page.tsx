import type { Metadata } from "next";
import { getT, type LangParams } from "@/lib/i18n";
import { PageHero } from "@/components/PageHero";
import { AdminApp } from "@/components/admin/AdminApp";

export const metadata: Metadata = { title: "관리자", robots: { index: false } };

export default async function AdminPage({ params }: LangParams) {
  const { locale } = getT((await params).lang);
  return (
    <>
      <PageHero locale={locale} eyebrow="Admin" title="관리자" lead="해외 Biz정보와 해외주재원 전용 게시판의 글을 쓰고 고칩니다." />
      <AdminApp />
    </>
  );
}
