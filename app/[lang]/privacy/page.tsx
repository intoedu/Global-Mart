import type { Metadata } from "next";
import Link from "next/link";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "개인정보처리방침 · Privacy Policy" };

/**
 * 시행일 — 홈페이지를 공개하는 날짜가 정해지면 "2026-12-01" 처럼 적어 주세요.
 * 비어 있으면 "홈페이지 공개일부터 시행" 으로 표시합니다.
 */
const EFFECTIVE_DATE: string | null = null;

type Item = string | { t: string; href?: string };
type Section = { h: string; b: Item[] };

/**
 * 개인정보처리방침 (초안)
 * ※ 실제 게시 전 회사 담당자가 내용(보관 기간, 위탁 업체, 국외 이전 정보, 시행일 등)을 확인해야 합니다.
 * ※ 한국어 본문이 원문이며, 영어 화면에는 번역본을 함께 보여 줍니다.
 */
export default async function PrivacyPage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  const ko = locale === "ko";
  const items = "담당자명, 회사명, 이메일, 연락처, 관심 서비스, 희망 진출 지역, 문의 내용";
  const itemsEn = "name, company, email, phone number, service of interest, target region and message";
  const effective = (lang: "ko" | "en") => {
    if (!EFFECTIVE_DATE) return lang === "ko" ? "본 방침은 홈페이지 공개일부터 시행합니다." : "This policy takes effect on the day the website is published.";
    const [y, m, d] = EFFECTIVE_DATE.split("-").map(Number);
    return lang === "ko"
      ? `본 방침은 ${y}년 ${m}월 ${d}일부터 시행합니다.`
      : `This policy takes effect on ${new Intl.DateTimeFormat("en-US", { timeZone: "UTC", dateStyle: "long" }).format(new Date(Date.UTC(y, m - 1, d)))}.`;
  };

  const KO: Section[] = [
    {
      h: "1. 수집하는 개인정보 항목 및 수집 방법",
      b: [
        `상담 신청: ${items}`,
        "홈페이지의 상담 신청서를 통해 정보주체가 직접 입력하는 방식으로 수집합니다. 홈페이지는 별도의 회원가입을 받지 않습니다.",
        "회사는 홈페이지에서 쿠키나 방문 기록을 따로 수집하지 않습니다. 다만 아래 7번의 외부 서비스가 접속 과정에서 IP 주소, 브라우저 정보 등을 받을 수 있습니다.",
      ],
    },
    {
      h: "2. 개인정보의 수집·이용 목적",
      b: ["해외시장 진출 상담 접수 및 회신", "서비스 관련 안내 및 연락"],
    },
    {
      h: "3. 보유 및 이용 기간",
      b: [
        "상담 신청 정보: 상담 완료 후 1년간 보관 후 파기",
        "관계 법령에 따라 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관합니다.",
      ],
    },
    {
      h: "4. 동의를 거부할 권리",
      b: [
        "정보주체는 개인정보 수집·이용 동의를 거부할 수 있습니다.",
        `동의하지 않으시면 온라인 상담 신청은 할 수 없지만, 전화(${SITE.tel})나 이메일(${SITE.email})로 상담을 요청하실 수 있습니다.`,
      ],
    },
    {
      h: "5. 개인정보의 제3자 제공",
      b: ["회사는 정보주체의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 근거가 있는 경우는 예외로 합니다."],
    },
    {
      h: "6. 개인정보 처리의 위탁 및 국외 이전",
      b: [
        "상담 신청서 전달: FormSubmit(formsubmit.co) — 입력하신 내용을 회사 이메일로 전달하는 서비스이며, 회사는 접수 내용을 이메일로 보관합니다.",
        "국외 이전 받는 자: FormSubmit (연락처: formsubmit.co 홈페이지) · 이전 국가: 국외 (FormSubmit 서비스 서버가 있는 국가)",
        `국외 이전 항목: ${items}`,
        "이전 일시 및 방법: 상담 신청서를 제출하는 때에 인터넷(HTTPS 암호화 전송)으로 전송",
        `이전 목적 및 보유 기간: 신청 내용을 회사 이메일(${SITE.email})로 전달하기 위함이며, FormSubmit 에서의 보유 기간은 해당 서비스의 정책에 따릅니다.`,
        `국외 이전을 원하지 않으시면 상담 신청서를 쓰지 않고 전화(${SITE.tel})나 이메일(${SITE.email})로 직접 문의하실 수 있습니다.`,
        "홈페이지 호스팅: GitHub Pages(GitHub, Inc.) — 홈페이지에 접속하면 IP 주소 등 접속 정보가 GitHub 의 서버에 기록될 수 있습니다.",
        "위탁 업체 및 업무 내용이 변경될 경우 본 방침을 통해 알려 드립니다.",
      ],
    },
    {
      h: "7. 홈페이지에 포함된 외부 서비스",
      b: [
        "사진: Unsplash(images.unsplash.com) · 글꼴: jsDelivr(cdn.jsdelivr.net) · 지도: Google 지도(회사 주소 페이지)",
        "이 서비스들은 페이지를 불러오는 과정에서 방문자의 IP 주소, 브라우저 종류, 방문한 페이지 주소 등을 받을 수 있으며, Google 지도는 쿠키를 사용할 수 있습니다. 이 정보는 각 서비스의 개인정보처리방침에 따라 처리되며, 회사는 이 정보를 받거나 보관하지 않습니다.",
        "브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수 있습니다. 쿠키를 막아도 홈페이지 이용에는 지장이 없으며, 지도 대신 네이버·카카오·Google 지도 바로가기를 이용하실 수 있습니다.",
      ],
    },
    {
      h: "8. 정보주체의 권리와 행사 방법",
      b: [
        "정보주체는 언제든지 개인정보 열람, 정정, 삭제, 처리정지를 요구할 수 있으며, 아래 연락처로 요청하시면 지체 없이 조치하겠습니다.",
        "법정대리인이나 위임을 받은 자 등 대리인을 통해서도 요구하실 수 있습니다.",
      ],
    },
    {
      h: "9. 개인정보의 파기",
      b: ["보유 기간이 지나거나 처리 목적이 달성된 개인정보는 복구할 수 없는 방법으로 지체 없이 파기합니다."],
    },
    {
      h: "10. 개인정보의 안전성 확보 조치",
      b: ["접근 권한 관리(담당자만 열람), 전송 구간 암호화(HTTPS)를 적용하고 있습니다."],
    },
    {
      h: "11. 개인정보 보호책임자",
      b: [`성명: ${SITE.privacyOfficer.ko}`, `전화: ${SITE.tel}`, `이메일: ${SITE.email}`],
    },
    {
      h: "12. 권익침해 구제방법",
      b: [
        "개인정보 침해에 대한 신고나 상담이 필요하시면 아래 기관에 문의하실 수 있습니다.",
        { t: "개인정보침해신고센터 (한국인터넷진흥원): 국번 없이 118 · privacy.kisa.or.kr", href: "https://privacy.kisa.or.kr" },
        { t: "개인정보분쟁조정위원회: 1833-6972 · www.kopico.go.kr", href: "https://www.kopico.go.kr" },
        { t: "대검찰청: 국번 없이 1301 · www.spo.go.kr", href: "https://www.spo.go.kr" },
        { t: "경찰청: 국번 없이 182 · ecrm.police.go.kr", href: "https://ecrm.police.go.kr" },
      ],
    },
    { h: "13. 시행일", b: [effective("ko"), "본 방침의 내용이 바뀌면 시행 전에 홈페이지를 통해 알려 드립니다."] },
  ];

  const EN: Section[] = [
    {
      h: "1. Personal data we collect and how",
      b: [
        `Consultation requests: ${itemsEn}.`,
        "You enter this information yourself in the inquiry form on this website. The website has no member sign-up.",
        "We do not set our own cookies or collect visit logs on this website. The external services listed in section 7 may, however, receive your IP address and browser information when a page loads.",
      ],
    },
    {
      h: "2. Purpose of use",
      b: ["Receiving and answering consultation requests about overseas market entry", "Contacting you about our services"],
    },
    {
      h: "3. Retention period",
      b: [
        "Consultation requests are kept for one year after the consultation and then deleted.",
        "Where a law requires longer retention, we keep the data for the period that law sets.",
      ],
    },
    {
      h: "4. Your right to refuse",
      b: [
        "You may refuse to consent to the collection and use of your personal data.",
        `If you refuse, you cannot use the online inquiry form, but you can still contact us by phone (${SITE.telIntl}) or email (${SITE.email}).`,
      ],
    },
    {
      h: "5. Provision to third parties",
      b: ["We do not give your personal data to third parties without your consent, except where a law provides otherwise."],
    },
    {
      h: "6. Processors and transfer outside Korea",
      b: [
        "Form delivery: FormSubmit (formsubmit.co) forwards what you enter to our email inbox. We keep received requests as email.",
        "Recipient abroad: FormSubmit (contact: formsubmit.co website) · Country: outside Korea (where the FormSubmit service servers are located)",
        `Items transferred: ${itemsEn}`,
        "When and how: when you submit the inquiry form, sent over the internet (HTTPS encrypted)",
        `Purpose and retention: to deliver your request to our email (${SITE.email}); retention at FormSubmit follows that service's own policy.`,
        `If you do not want your data transferred abroad, please contact us directly by phone (${SITE.telIntl}) or email (${SITE.email}) instead of using the form.`,
        "Website hosting: GitHub Pages (GitHub, Inc.). When you visit the website, connection data such as your IP address may be recorded on GitHub's servers.",
        "If our processors or their tasks change, we will announce it in this policy.",
      ],
    },
    {
      h: "7. External services on this website",
      b: [
        "Photos: Unsplash (images.unsplash.com) · Fonts: jsDelivr (cdn.jsdelivr.net) · Map: Google Maps (Location page)",
        "These services may receive your IP address, browser type and the address of the page you visit when a page loads, and Google Maps may use cookies. They process this information under their own privacy policies. We do not receive or keep it.",
        "You can block or delete cookies in your browser settings. The website still works without cookies, and you can use the Naver, Kakao or Google Maps links instead of the embedded map.",
      ],
    },
    {
      h: "8. Your rights",
      b: [
        "You may ask at any time to see, correct or delete your personal data or to stop its processing. Contact us using the details below and we will act without delay.",
        "You may also make these requests through a legal representative or a person you authorise.",
      ],
    },
    {
      h: "9. Destruction",
      b: ["When the retention period ends or the purpose is achieved, we destroy the data without delay so that it cannot be recovered."],
    },
    {
      h: "10. Security measures",
      b: ["Access is limited to the staff in charge, and data is encrypted in transit (HTTPS)."],
    },
    {
      h: "11. Privacy officer",
      b: [`Name: ${SITE.privacyOfficer.en}`, `Phone: ${SITE.telIntl}`, `Email: ${SITE.email}`],
    },
    {
      h: "12. Remedies",
      b: [
        "For reports of or advice on privacy infringement, you can contact the following Korean bodies.",
        { t: "Personal Information Infringement Report Center (KISA): 118 (in Korea) · privacy.kisa.or.kr", href: "https://privacy.kisa.or.kr" },
        { t: "Personal Information Dispute Mediation Committee: 1833-6972 · www.kopico.go.kr", href: "https://www.kopico.go.kr" },
        { t: "Supreme Prosecutors' Office: 1301 (in Korea) · www.spo.go.kr", href: "https://www.spo.go.kr" },
        { t: "Korean National Police Agency: 182 (in Korea) · ecrm.police.go.kr", href: "https://ecrm.police.go.kr" },
      ],
    },
    { h: "13. Effective date", b: [effective("en"), "If this policy changes, we will announce it on this website before the change takes effect."] },
  ];

  const sections = ko ? KO : EN;
  return (
    <>
      <PageHero locale={locale} eyebrow="Privacy" title={ko ? "개인정보처리방침" : "Privacy Policy"} lead={`${t(SITE.name)}`} />
      <section className="py-section-sm">
        <div className="container-x max-w-3xl">
          {!ko && (
            <p className="mb-8 rounded-2xl bg-paper p-5 text-[15px] leading-relaxed text-muted">
              This is an English translation of our Korean privacy policy. If the two differ, the{" "}
              <Link href={lp("ko", "/privacy")} hrefLang="ko" className="font-semibold text-ink underline decoration-accent underline-offset-4">
                Korean version
              </Link>{" "}
              prevails. For questions, contact {SITE.email}.
            </p>
          )}
          <p className="text-body leading-relaxed text-ink-3">
            {ko ? (
              <>
                {SITE.name.ko}(이하 &lsquo;회사&rsquo;)는 「개인정보 보호법」에 따라 정보주체의 개인정보를 보호하고 관련 고충을 신속하게 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
              </>
            ) : (
              <>
                {SITE.name.en} (&ldquo;the Company&rdquo;) publishes this policy under the Korean Personal Information Protection Act to protect your personal data and to handle related concerns promptly.
              </>
            )}
          </p>
          {sections.map((s) => (
            <div key={s.h} className="mt-10">
              <h2 className="text-lg font-bold">{s.h}</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink-3">
                {s.b.map((b) => {
                  const it = typeof b === "string" ? { t: b } : b;
                  return (
                    <li key={it.t}>
                      {it.href ? (
                        <a href={it.href} target="_blank" rel="noopener noreferrer" className="decoration-accent underline-offset-4 hover:text-ink hover:underline">
                          {it.t}
                        </a>
                      ) : (
                        it.t
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
