"use client";

import Link from "next/link";
import { SITE } from "@/lib/site";
import { lp } from "@/lib/paths";
import type { Locale } from "@/lib/i18n";
import { Icon } from "../Icon";

/**
 * 회원 전용 게시판의 비밀번호 입력 화면 (해외 Biz정보 · 해외주재원 전용 공통)
 * 비밀번호는 회원가입 없이 글로벌마트가 따로 알려 드립니다.
 */
export function LockGate({
  locale,
  state,
  error,
  onSubmit,
  badge,
  title,
  text,
  inputId,
}: {
  locale: Locale;
  state: string;
  error: string;
  onSubmit: (pw: string) => void;
  badge: string;
  title: string;
  text: string;
  inputId: string;
}) {
  const ko = locale === "ko";
  const waiting = state === "checking" || state === "init";
  return (
    <section className="py-section-sm">
      <div className="container-x max-w-lg text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-ink text-sky">
          <Icon name="lock" className="size-8" />
        </span>
        <p className="mt-6 inline-block rounded-full bg-orange/15 px-3 py-1 text-small font-bold text-orange-ink">{badge}</p>
        <h2 className="mt-3 text-h3 font-extrabold">{title}</h2>
        <p className="mt-4 text-body leading-relaxed text-muted">{text}</p>
        <form
          className="mt-8 space-y-3 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(String(new FormData(e.currentTarget).get("password") ?? ""));
          }}
        >
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {state === "error" && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {ko ? "자료를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." : "Could not load the data. Please try again."}
            </p>
          )}
          <label className="label" htmlFor={inputId}>{ko ? "비밀번호" : "Password"}</label>
          <input id={inputId} name="password" type="password" required autoComplete="current-password" className="input" />
          <button disabled={waiting} className="btn-primary w-full">
            {waiting ? (ko ? "확인 중…" : "Checking…") : ko ? "입장하기" : "Enter"}
          </button>
        </form>
        <div className="mt-6 rounded-2xl bg-paper p-5 text-left text-small leading-relaxed text-ink-3">
          <p className="font-bold text-ink">{ko ? "비밀번호가 없으신가요?" : "Don't have the password?"}</p>
          <p className="mt-1">
            {ko
              ? "비밀번호는 글로벌마트에서 알려 드립니다. 별도의 회원가입은 없습니다. 글로벌마트 본사로 연락해 비밀번호를 받아 주세요."
              : "The password is provided by Globalmart. There is no sign-up. Please contact the Globalmart head office to get it."}
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href={SITE.telHref} className="inline-flex items-center gap-1.5 font-semibold text-ink underline decoration-accent underline-offset-4">
              <Icon name="phone" className="size-4" /> {ko ? SITE.tel : SITE.telIntl}
            </a>
            <Link href={lp(locale, "/contact")} className="link-arrow">
              {ko ? "문의하기" : "Contact us"}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
