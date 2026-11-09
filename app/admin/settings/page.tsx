import { residentPasswordUpdatedAt } from "@/lib/resident-access";
import { formatDateTime } from "@/lib/format";
import { ResidentPasswordForm } from "@/components/admin/ResidentPasswordForm";

export default async function SettingsPage() {
  const updated = await residentPasswordUpdatedAt();
  return (
    <>
      <h1 className="text-2xl font-extrabold">해외주재원 공용 비밀번호</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        해외주재원 전용 게시판은 회원가입 없이 이 비밀번호로 들어갑니다. 비밀번호를 바꾸면 기존에 들어와 있던 사람도 모두 새 비밀번호로 다시 입장해야 합니다.
        주재원이 바뀌거나 비밀번호가 외부로 새었다고 생각되면 바로 변경하세요.
      </p>
      <p className="mt-4 text-sm font-semibold">
        현재 상태: {updated ? `설정됨 (마지막 변경 ${formatDateTime(updated)})` : "아직 설정되지 않음 — 설정 전에는 주재원 게시판에 아무도 들어올 수 없습니다."}
      </p>
      <div className="mt-6 max-w-md">
        <ResidentPasswordForm />
      </div>
    </>
  );
}
