import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer, isSupabaseConfigured } from "@/lib/data";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "관리자", robots: { index: false } };

const MENU = [
  { href: "/admin", label: "대시보드", icon: "home" },
  { href: "/admin/posts", label: "게시글 관리", icon: "list" },
  { href: "/admin/settings", label: "주재원 비밀번호", icon: "lock" },
  { href: "/admin/inquiries", label: "상담 신청", icon: "inbox" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) return <SetupGuide />;
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/admin");
  if (!viewer.isAdmin)
    return (
      <div className="container-x py-40 text-center">
        <p className="text-xl font-bold">관리자 권한이 필요합니다.</p>
        <Link href="/" className="btn-ghost mt-6">홈으로</Link>
      </div>
    );

  return (
    <div className="bg-paper pt-16 lg:pt-20">
      <div className="container-x grid gap-6 py-8 lg:grid-cols-[200px_1fr] lg:py-12">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Admin">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href} className="flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-[15px] font-semibold text-ink-3 hover:bg-white">
              <Icon name={m.icon} className="size-4.5" /> {m.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

function SetupGuide() {
  return (
    <section className="container-x max-w-3xl py-32">
      <h1 className="text-3xl font-extrabold">관리자 기능 설정 안내</h1>
      <p className="mt-4 text-muted">현재 데이터베이스가 연결되지 않은 미리보기 모드입니다. 아래 순서로 연결하면 게시판 글쓰기, 회원 승인, 상담 신청 관리를 사용할 수 있습니다.</p>
      <ol className="mt-8 list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-ink-3">
        <li>Supabase 프로젝트를 만들고 <code>supabase/migrations</code> 의 SQL을 실행합니다.</li>
        <li>
          배포 환경변수에 <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> 를 입력합니다.
        </li>
        <li>
          서버 전용 환경변수 <code>SUPABASE_SERVICE_ROLE_KEY</code> 를 입력합니다 (해외주재원 비밀번호 기능에 필요).
        </li>
        <li>Supabase 대시보드에서 관리자 계정을 만들고 SQL로 관리자 권한을 부여합니다 (README 참고).</li>
      </ol>
    </section>
  );
}
