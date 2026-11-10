"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";
import { lp } from "@/lib/paths";
import type { Locale } from "@/lib/i18n";
import { Icon } from "./Icon";

const SERVICES = [
  { ko: "해외지사대행", en: "Overseas branch agency" },
  { ko: "해외시장조사", en: "Market research" },
  { ko: "해외바이어 발굴", en: "Buyer discovery" },
  { ko: "해외출장조사", en: "Field research trip" },
  { ko: "소프트웨어 무역", en: "Software trading" },
  { ko: "회계·세무 + 해외시장개척", en: "Accounting + market entry" },
  { ko: "기타", en: "Other" },
];
const REGIONS = ["인도 India", "동남아 Southeast Asia", "동북아 Northeast Asia", "중앙아 Central Asia", "서남아 South Asia", "중동 Middle East", "아프리카 Africa", "러시아·동유럽 Russia & E. Europe", "기타 Other", "미정 Not sure"];

/**
 * 상담 신청서 — FormSubmit 으로 회사 메일(gvmart@hanmail.net)에 바로 전달
 * 전송이 실패하면(15초 안에 응답이 없을 때 포함) 방문자의 메일 앱으로 같은 내용을 보내도록 안내합니다.
 */
const TIMEOUT_MS = 15_000;
/** 메일 앱 링크(mailto)는 너무 길면 열리지 않는 경우가 많아 본문을 줄입니다. (온라인 전송에는 전체 내용) */
const MAILTO_MESSAGE_MAX = 600;

export function InquiryForm({ locale }: { locale: Locale }) {
  const ko = locale === "ko";
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [mailto, setMailto] = useState("");
  const msgRef = useRef<HTMLElement | null>(null);

  // 접수 완료·실패 안내를 화면 안으로 가져오고 포커스를 옮겨 스크린 리더에서도 읽히게 합니다.
  useEffect(() => {
    if (state !== "done" && state !== "error") return;
    const el = msgRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
  }, [state]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("_honey")) return;
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    const subject = `[글로벌마트 홈페이지] 상담 신청 - ${v("name")} / ${v("service")}`;
    const lines = [
      `담당자명: ${v("name")}`,
      `회사명: ${v("company")}`,
      `이메일: ${v("email")}`,
      `연락처: ${v("phone")}`,
      `관심 서비스: ${v("service")}`,
      `희망 진출 지역: ${v("region")}`,
      "",
    ];
    const msg = v("message");
    const shortMsg = msg.length > MAILTO_MESSAGE_MAX ? `${msg.slice(0, MAILTO_MESSAGE_MAX)}\n…${ko ? "(이하 생략)" : "(truncated)"}` : msg;
    setMailto(`mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent([...lines, shortMsg].join("\n"))}`);
    setState("sending");
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(SITE.formEndpoint, {
        method: "POST",
        signal: ac.signal,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: subject,
          _template: "table",
          _captcha: "false",
          _honey: v("_honey"),
          담당자명: v("name"),
          회사명: v("company"),
          email: v("email"),
          연락처: v("phone"),
          관심서비스: v("service"),
          희망진출지역: v("region"),
          문의내용: msg,
        }),
      });
      const json = await res.json().catch(() => ({}));
      setState(res.ok && String(json.success) !== "false" ? "done" : "error");
    } catch {
      setState("error");
    } finally {
      clearTimeout(timer);
    }
  };

  if (state === "done") {
    return (
      <div
        ref={(el) => { msgRef.current = el; }}
        role="status"
        aria-live="polite"
        tabIndex={-1}
        className="flex flex-col items-center py-10 text-center outline-none"
      >
        <span className="grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <Icon name="check" className="size-8" strokeWidth={2.4} />
        </span>
        <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink">
          {ko ? "상담 신청이 접수되었습니다. 영업일 기준 1~2일 안에 연락드리겠습니다." : "Thank you. We will contact you within 1–2 business days."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {state === "error" && (
        <p
          ref={(el) => { msgRef.current = el; }}
          role="alert"
          tabIndex={-1}
          className="scroll-mt-[calc(var(--header-h)+1rem)] rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          {ko ? "온라인 전송에 실패했습니다. " : "Sending failed. "}
          <a href={mailto} className="font-semibold underline">
            {ko ? "메일 앱으로 같은 내용 보내기" : "Send the same message by email"}
          </a>
          {ko ? <> 또는 전화 <span className="whitespace-nowrap">{SITE.tel}</span>로 문의해 주세요.</> : <> or call <span className="whitespace-nowrap">{SITE.telIntl}</span>.</>}
        </p>
      )}
      <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="i-name">{ko ? "담당자명 *" : "Your name *"}</label>
          <input id="i-name" name="name" required maxLength={100} className="input" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="i-company">{ko ? "회사명" : "Company"}</label>
          <input id="i-company" name="company" maxLength={100} className="input" autoComplete="organization" />
        </div>
        <div>
          <label className="label" htmlFor="i-email">{ko ? "이메일 *" : "Email *"}</label>
          <input id="i-email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="i-phone">{ko ? "연락처" : "Phone"}</label>
          <input id="i-phone" name="phone" type="tel" inputMode="tel" maxLength={40} className="input" autoComplete="tel" />
        </div>
        <div>
          <label className="label" htmlFor="i-service">{ko ? "관심 서비스" : "Service"}</label>
          <select id="i-service" name="service" className="input">
            {SERVICES.map((s) => <option key={s.ko} value={s.ko}>{ko ? s.ko : s.en}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="i-region">{ko ? "희망 진출 지역" : "Target region"}</label>
          <select id="i-region" name="region" className="input">
            {REGIONS.map((r) => <option key={r} value={r}>{ko ? r.split(" ")[0] : r.split(" ").slice(1).join(" ")}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="i-message">{ko ? "문의 내용 *" : "Message *"}</label>
        <textarea id="i-message" name="message" required rows={6} maxLength={5000} className="input resize-y"
          placeholder={ko ? "취급 아이템, 진출 희망 국가, 현재 수출 경험 등을 적어 주시면 더 정확히 안내해 드립니다." : "Tell us about your product, target countries and any export experience."} />
      </div>
      <label className="flex items-start gap-2.5 rounded-xl bg-paper p-4 text-sm text-ink-3">
        <input type="checkbox" name="agree" required className="mt-0.5 size-4 shrink-0 accent-ink" aria-describedby="i-agree-more" />
        <span>
          {ko
            ? "상담을 위한 개인정보 수집·이용에 동의합니다. (필수)"
            : "I agree to the collection and use of my personal data for this consultation. (Required)"}
          <span id="i-agree-more" className="mt-1.5 block text-xs leading-relaxed text-muted">
            {ko
              ? "수집 항목: 담당자명, 회사명, 이메일, 연락처, 관심 서비스, 희망 진출 지역, 문의 내용 · 목적: 상담 접수 및 회신 · 보관: 상담 완료 후 1년 뒤 파기. 입력하신 내용은 국외 신청서 전달 서비스 FormSubmit(formsubmit.co)을 거쳐 회사 이메일로 전달됩니다. 동의하지 않으실 수 있으며, 이 경우 온라인 상담 신청은 할 수 없지만 전화·이메일로 문의하실 수 있습니다. "
              : "Items: name, company, email, phone, service, target region and message · Purpose: receiving and answering your inquiry · Kept for one year after the consultation, then deleted. Your entry is passed to our email via FormSubmit (formsubmit.co), a form service located outside Korea. You may refuse; you then cannot use this online form, but you can still contact us by phone or email. "}
            <Link href={lp(locale, "/privacy")} target="_blank" className="font-semibold text-ink underline decoration-accent underline-offset-4">
              {ko ? "개인정보처리방침" : "Privacy Policy"}
            </Link>
          </span>
        </span>
      </label>
      <button disabled={state === "sending"} className="btn-primary w-full sm:w-auto sm:px-10">
        {state === "sending" ? (ko ? "접수 중…" : "Sending…") : ko ? "상담 신청하기" : "Send inquiry"}
      </button>
    </form>
  );
}
