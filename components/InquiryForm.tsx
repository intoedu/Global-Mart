"use client";

import Link from "next/link";
import { useState } from "react";
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
 * 전송이 실패하면 방문자의 메일 앱으로 같은 내용을 보내도록 안내합니다.
 */
export function InquiryForm({ locale }: { locale: Locale }) {
  const ko = locale === "ko";
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [mailto, setMailto] = useState("");

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
      v("message"),
    ];
    setMailto(`mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`);
    setState("sending");
    try {
      const res = await fetch(SITE.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: subject,
          _template: "table",
          _captcha: "false",
          담당자명: v("name"),
          회사명: v("company"),
          email: v("email"),
          연락처: v("phone"),
          관심서비스: v("service"),
          희망진출지역: v("region"),
          문의내용: v("message"),
        }),
      });
      const json = await res.json().catch(() => ({}));
      setState(res.ok && String(json.success) !== "false" ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="flex flex-col items-center py-10 text-center">
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
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {ko ? "온라인 전송에 실패했습니다. " : "Sending failed. "}
          <a href={mailto} className="font-semibold underline">
            {ko ? "메일 앱으로 같은 내용 보내기" : "Send the same message by email"}
          </a>
          {ko ? ` 또는 전화 ${SITE.tel} 로 문의해 주세요.` : ` or call ${SITE.telIntl}.`}
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
          <input id="i-phone" name="phone" maxLength={40} className="input" autoComplete="tel" />
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
        <input type="checkbox" name="agree" required className="mt-0.5 size-4 accent-brand" />
        <span>
          {ko
            ? "상담을 위한 개인정보(이름, 회사명, 이메일, 연락처) 수집·이용에 동의합니다. 수집된 정보는 상담 완료 후 1년간 보관 후 파기합니다. "
            : "I agree to the collection and use of my personal data for this consultation. It is kept for one year after the consultation and then deleted. "}
          <Link href={lp(locale, "/privacy")} target="_blank" className="font-semibold text-brand underline">{ko ? "개인정보처리방침" : "Privacy Policy"}</Link>
        </span>
      </label>
      <button disabled={state === "sending"} className="btn-primary w-full sm:w-auto sm:px-10">
        {state === "sending" ? (ko ? "접수 중…" : "Sending…") : ko ? "상담 신청하기" : "Send inquiry"}
      </button>
    </form>
  );
}
