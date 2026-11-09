"use client";

import { useActionState } from "react";
import { signIn, type FormState } from "@/app/actions/auth";

function Alert({ state }: { state: FormState }) {
  if (!state?.error && !state?.message) return null;
  return (
    <p role="alert" className={`rounded-xl px-4 py-3 text-sm ${state.error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>
      {state.error ?? state.message}
    </p>
  );
}

export function LoginForm({ ko, next }: { ko: boolean; next: string }) {
  const [state, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Alert state={state} />
      <div>
        <label className="label" htmlFor="email">{ko ? "이메일" : "Email"}</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">{ko ? "비밀번호" : "Password"}</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      <button disabled={pending} className="btn-primary w-full">
        {pending ? (ko ? "확인 중…" : "Signing in…") : ko ? "로그인" : "Log in"}
      </button>
    </form>
  );
}

