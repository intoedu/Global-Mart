import { adminListInquiries } from "@/lib/data";
import { deleteInquiry, updateInquiry } from "@/app/actions/admin";
import { formatDateTime } from "@/lib/format";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

const STATUS = { new: "신규", in_progress: "진행 중", done: "완료" } as const;

export default async function InquiriesPage() {
  const list = await adminListInquiries();
  return (
    <>
      <h1 className="text-2xl font-extrabold">상담 신청</h1>
      <div className="mt-6 space-y-3">
        {list.map((q) => (
          <details key={q.id} className="card group p-5" open={q.status === "new"}>
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3">
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                  q.status === "new" ? "bg-accent/15 text-[#a8661a]" : q.status === "done" ? "bg-emerald-50 text-emerald-700" : "bg-brand-soft text-brand"
                }`}
              >
                {STATUS[q.status]}
              </span>
              <span className="font-bold">{q.name}</span>
              <span className="text-sm text-muted">{q.company}</span>
              <span className="ml-auto text-xs tabular-nums text-muted">{formatDateTime(q.created_at)}</span>
            </summary>
            <div className="mt-4 grid gap-4 border-t border-line pt-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="text-sm">
                <p className="text-muted">
                  <a href={`mailto:${q.email}`} className="font-semibold text-brand">{q.email}</a> · {q.phone || "-"} · {q.service} · {q.region}
                </p>
                <p className="mt-3 whitespace-pre-wrap leading-relaxed">{q.message}</p>
              </div>
              <div className="space-y-2">
                <form action={updateInquiry} className="space-y-2">
                  <input type="hidden" name="id" value={q.id} />
                  <select name="status" defaultValue={q.status} className="input !py-2 text-sm">
                    {Object.entries(STATUS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                  <textarea name="memo" defaultValue={q.memo} rows={3} className="input text-sm" placeholder="처리 메모" />
                  <button className="btn-primary w-full !py-2 !text-sm">저장</button>
                </form>
                <form action={deleteInquiry}>
                  <input type="hidden" name="id" value={q.id} />
                  <ConfirmButton message="이 상담 신청을 삭제할까요?" className="btn-danger w-full !py-2 !text-sm">삭제</ConfirmButton>
                </form>
              </div>
            </div>
          </details>
        ))}
        {list.length === 0 && <p className="card p-10 text-center text-muted">접수된 상담 신청이 없습니다.</p>}
      </div>
    </>
  );
}
