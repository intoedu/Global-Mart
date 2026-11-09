"use client";

import { useActionState } from "react";
import { changeResidentPassword } from "@/app/actions/admin";

export function ResidentPasswordForm() {
  const [state, action, pending] = useActionState(changeResidentPassword, null);
  return (
    <form action={action} className="card space-y-4 p-6">
      {(state?.error || state?.message) && (
        <p className={`rounded-xl px-4 py-3 text-sm ${state.error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{state.error ?? state.message}</p>
      )}
      <div>
        <label className="label" htmlFor="np">새 비밀번호 (6자 이상)</label>
        <input id="np" name="password" type="password" minLength={6} required className="input" autoComplete="new-password" />
      </div>
      <div>
        <label className="label" htmlFor="np2">새 비밀번호 확인</label>
        <input id="np2" name="password2" type="password" minLength={6} required className="input" autoComplete="new-password" />
      </div>
      <button disabled={pending} className="btn-primary w-full">{pending ? "저장 중…" : "비밀번호 변경"}</button>
    </form>
  );
}
