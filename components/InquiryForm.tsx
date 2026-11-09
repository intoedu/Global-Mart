"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitInquiry } from "@/app/actions/inquiry";
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

export function InquiryForm({ ko }: { ko: boolean }) {
  const [state, action, pending] = useActionState(submitInquiry, null);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <Icon name="check" className="size-8" strokeWidth={2.4} />
        </span>
        <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
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
            {SERVICES.map((s) => (
              <option key={s.ko} value={s.ko}>{ko ? s.ko : s.en}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="i-region">{ko ? "희망 진출 지역" : "Target region"}</label>
          <select id="i-region" name="region" className="input">
            {REGIONS.map((r) => (
              <option key={r} value={r}>{ko ? r.split(" ")[0] : r.split(" ").slice(1).join(" ")}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="i-message">{ko ? "문의 내용 *" : "Message *"}</label>
        <textarea
          id="i-message"
          name="message"
          required
          rows={6}
          maxLength={5000}
          className="input resize-y"
          placeholder={ko ? "취급 아이템, 진출 희망 국가, 현재 수출 경험 등을 적어 주시면 더 정확히 안내해 드립니다." : "Tell us about your product, target countries and any export experience."}
        />
      </div>
      <label className="flex items-start gap-2.5 rounded-xl bg-paper p-4 text-sm text-ink-3">
        <input type="checkbox" name="agree" required className="mt-0.5 size-4 accent-brand" />
        <span>
          {ko
            ? "상담을 위한 개인정보(이름, 회사명, 이메일, 연락처) 수집·이용에 동의합니다. 수집된 정보는 상담 완료 후 1년간 보관 후 파기합니다. "
            : "I agree to the collection and use of my personal data for this consultation. It is kept for one year after the consultation and then deleted. "}
          <Link href="/privacy" target="_blank" className="font-semibold text-brand underline">
            {ko ? "개인정보처리방침" : "Privacy Policy"}
          </Link>
        </span>
      </label>
      <button disabled={pending} className="btn-primary w-full sm:w-auto sm:px-10">
        {pending ? (ko ? "접수 중…" : "Sending…") : ko ? "상담 신청하기" : "Send inquiry"}
      </button>
    </form>
  );
}
