import { Icon } from "../Icon";

export function DemoNotice({ ko }: { ko: boolean }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-5 py-4 text-[14px] text-[#7a4a10]">
      <Icon name="info" className="mt-0.5 size-5 shrink-0" />
      <p>
        {ko
          ? "미리보기 모드입니다. 아래 글은 화면 구성을 보여 주기 위한 예시이며, 데이터베이스를 연결하면 관리자가 등록한 실제 글이 표시됩니다."
          : "Preview mode. The posts below are examples; once the database is connected, real posts entered by the administrator will appear."}
      </p>
    </div>
  );
}
