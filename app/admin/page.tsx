import Link from "next/link";
import { adminStats } from "@/lib/data";
import { Icon } from "@/components/Icon";

export default async function AdminHome() {
  const s = await adminStats();
  const cards = [
    { label: "해외 Biz정보 글", value: s?.biz ?? 0, href: "/admin/posts?board=biz", icon: "globe" },
    { label: "주재원 전용 글", value: s?.resident ?? 0, href: "/admin/posts?board=resident", icon: "lock" },
    { label: "새 상담 신청", value: s?.newInquiries ?? 0, href: "/admin/inquiries", icon: "inbox", alert: (s?.newInquiries ?? 0) > 0 },
  ];
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">대시보드</h1>
        <div className="flex gap-2">
          <Link href="/admin/posts/new?board=biz" className="btn-primary !py-2.5 !text-sm">
            <Icon name="plus" className="size-4" /> Biz정보 글쓰기
          </Link>
          <Link href="/admin/posts/new?board=resident" className="btn-ghost !py-2.5 !text-sm">
            <Icon name="plus" className="size-4" /> 주재원 글쓰기
          </Link>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card p-6 transition hover:shadow-lift">
            <div className="flex items-center justify-between">
              <Icon name={c.icon} className="size-5 text-brand" />
              {c.alert && <span className="size-2.5 rounded-full bg-accent" />}
            </div>
            <p className="mt-4 text-sm text-muted">{c.label}</p>
            <p className="mt-1 text-3xl font-extrabold">{c.value}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
