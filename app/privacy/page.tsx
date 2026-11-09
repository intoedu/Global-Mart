import type { Metadata } from "next";
import { getT } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "개인정보처리방침 · Privacy Policy" };

/**
 * 개인정보처리방침 (초안)
 * ※ 실제 게시 전 회사 담당자가 내용(보관 기간, 위탁 업체 등)을 확인해야 합니다.
 */
export default async function PrivacyPage() {
  const { locale, t } = await getT();
  const ko = locale === "ko";
  const sections: { h: string; b: string[] }[] = [
    {
      h: "1. 수집하는 개인정보 항목 및 수집 방법",
      b: [
        "상담 신청: 담당자명, 회사명, 이메일, 연락처, 관심 서비스, 희망 진출 지역, 문의 내용",
        "홈페이지의 상담 신청서를 통해 정보주체가 직접 입력하는 방식으로 수집합니다. 홈페이지는 별도의 회원가입을 받지 않습니다.",
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
      h: "4. 개인정보의 제3자 제공",
      b: ["회사는 정보주체의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 근거가 있는 경우는 예외로 합니다."],
    },
    {
      h: "5. 개인정보 처리의 위탁",
      b: ["홈페이지 운영을 위해 데이터 보관 및 호스팅 서비스(클라우드 서비스 제공업체)를 이용합니다. 위탁 업체 및 업무 내용이 변경될 경우 본 방침을 통해 알려 드립니다."],
    },
    {
      h: "6. 정보주체의 권리와 행사 방법",
      b: ["정보주체는 언제든지 개인정보 열람, 정정, 삭제, 처리정지를 요구할 수 있으며, 아래 연락처로 요청하시면 지체 없이 조치하겠습니다."],
    },
    {
      h: "7. 개인정보의 파기",
      b: ["보유 기간이 지나거나 처리 목적이 달성된 개인정보는 복구할 수 없는 방법으로 지체 없이 파기합니다."],
    },
    {
      h: "8. 개인정보의 안전성 확보 조치",
      b: ["접근 권한 관리(관리자만 열람), 전송 구간 암호화(HTTPS)를 적용하고 있습니다."],
    },
    {
      h: "9. 개인정보 보호책임자",
      b: [`성명: ${SITE.privacyOfficer.ko}`, `전화: ${SITE.tel}`, `이메일: ${SITE.email}`],
    },
    { h: "10. 시행일", b: ["본 방침은 홈페이지 공개일부터 시행합니다."] },
  ];
  return (
    <>
      <PageHero eyebrow="Privacy" title={ko ? "개인정보처리방침" : "Privacy Policy"} lead={`${t(SITE.name)}`} />
      <section className="py-14 lg:py-20">
        <div className="container-x max-w-3xl">
          {!ko && (
            <p className="mb-8 rounded-2xl bg-paper p-5 text-[15px] text-muted">
              This policy is provided in Korean as required by Korean law. For questions, contact {SITE.email}.
            </p>
          )}
          <p className="text-[16px] leading-relaxed text-ink-3">
            {SITE.name.ko}(이하 &lsquo;회사&rsquo;)는 「개인정보 보호법」에 따라 정보주체의 개인정보를 보호하고 관련 고충을 신속하게 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
          </p>
          {sections.map((s) => (
            <div key={s.h} className="mt-10">
              <h2 className="text-lg font-bold">{s.h}</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink-3">
                {s.b.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
