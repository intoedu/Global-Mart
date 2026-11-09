"use client";

import { useActionState } from "react";
import { enterResident } from "@/app/actions/resident";
import { Icon } from "../Icon";

/** 해외주재원 전용: 공용 비밀번호 입력 (회원가입 없음) */
export function ResidentGate({ ko, next, unset }: { ko: boolean; next: string; unset?: boolean }) {
  const [state, action, pending] = useActionState(enterResident, null);
  return (
    <section className="py-16 lg:py-24">
      <div className="container-x max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-soft text-brand">
          <Icon name="lock" className="size-8" />
        </span>
        <h2 className="mt-6 text-2xl font-extrabold tracking-tight">{ko ? "해외주재원 전용 공간입니다" : "Overseas staff only"}</h2>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          {ko
            ? "이 공간은 국내 아이템들을 해외주재원들에게 소개하는 전용 공간으로서, 비밀번호를 입력한 후에 이용 가능합니다."
            : "This area introduces Korean products to our overseas staff. Please enter the access password."}
        </p>
        {unset ? (
          <p className="mt-8 rounded-2xl bg-paper p-5 text-sm text-muted">
            {ko ? "아직 이용이 준비되지 않았습니다. 본사(02-499-7977)로 문의해 주세요." : "Not available yet. Please contact the head office."}
          </p>
        ) : (
          <form action={action} className="mt-8 space-y-3 text-left">
            <input type="hidden" name="next" value={next} />
            {state?.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
            <label className="label" htmlFor="rp">{ko ? "비밀번호" : "Password"}</label>
            <input id="rp" name="password" type="password" required autoComplete="current-password" className="input" />
            <button disabled={pending} className="btn-primary w-full">
              {pending ? (ko ? "확인 중…" : "Checking…") : ko ? "입장하기" : "Enter"}
            </button>
            <p className="pt-2 text-center text-sm text-muted">
              {ko ? "비밀번호는 글로벌마트 본사에서 안내해 드립니다." : "The password is provided by the Globalmart head office."}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
