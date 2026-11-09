import type { L } from "./i18n";

/**
 * 회사 기본 정보 — 사이트 전체(헤더·푸터·연락처·지도)에 쓰입니다.
 * 정보가 바뀌면 이 파일만 고치면 됩니다.
 */
export const SITE = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.globalmart21.com",
  name: { ko: "(주)글로벌마트", en: "Globalmart Inc." } satisfies L,
  shortName: { ko: "글로벌마트", en: "Globalmart" } satisfies L,
  slogan: {
    ko: "해외시장진출은 글로벌마트와 함께",
    en: "Go global with Globalmart",
  } satisfies L,
  tagline: {
    ko: "믿음과 신뢰, 전문성으로 최선을 다하는 기업",
    en: "Driven by trust, integrity and expertise",
  } satisfies L,
  ceo: { ko: "최환열", en: "Hwan-yeol Choi" } satisfies L,
  privacyOfficer: { ko: "최하희", en: "Ha-hee Choi" } satisfies L,
  bizNo: "120-86-81320",
  tel: "02-499-7977",
  telIntl: "+82-2-499-7977",
  telHref: "tel:+8224997977",
  fax: "02-2118-7007",
  email: "gvmart@hanmail.net",
  address: {
    ko: "서울특별시 성동구 아차산로 103, 영동테크노타워 901호",
    en: "#901, Youngdong Techno-Tower, 103 Achasan-ro, Seongdong-gu, Seoul, Korea",
  } satisfies L,
  addressShort: { ko: "서울 성동구 아차산로 103", en: "103 Achasan-ro, Seoul" } satisfies L,
  directions: {
    ko: "지하철 2호선 성수역 1번 출구에서 약 10m",
    en: "About 10 m from Exit 1, Seongsu Station (Subway Line 2)",
  } satisfies L,
  hours: {
    ko: "평일 09:00 – 18:00 (주말·공휴일 휴무)",
    en: "Mon–Fri 09:00–18:00 KST (closed weekends & holidays)",
  } satisfies L,
  partners: {
    company: { ko: "삼지회계법인 성수", en: "Samji Accounting Corp. (Seongsu)" } satisfies L,
    institution: {
      ko: "국제지역개발협력협회 (IRDCA)",
      en: "International Region Development Cooperation Association (IRDCA)",
    } satisfies L,
  },
  map: {
    naver: "https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%20%EC%84%B1%EB%8F%99%EA%B5%AC%20%EC%95%84%EC%B0%A8%EC%82%B0%EB%A1%9C%20103",
    kakao: "https://map.kakao.com/link/search/%EC%84%9C%EC%9A%B8%20%EC%84%B1%EB%8F%99%EA%B5%AC%20%EC%95%84%EC%B0%A8%EC%82%B0%EB%A1%9C%20103",
    google: "https://www.google.com/maps/search/?api=1&query=103+Achasan-ro+Seongdong-gu+Seoul",
    embed:
      "https://maps.google.com/maps?q=%EC%84%9C%EC%9A%B8%20%EC%84%B1%EB%8F%99%EA%B5%AC%20%EC%95%84%EC%B0%A8%EC%82%B0%EB%A1%9C%20103&z=16&output=embed",
  },
};

export type NavItem = { href: string; label: L; children?: { href: string; label: L }[] };

/** PPT(PC용 홈페이지) 메뉴 구성: 회사소개 · 해외지사 · 사업내용 · 해외 Biz정보 · 해외주재원 전용 · Contact Us */
export const NAV: NavItem[] = [
  {
    href: "/company/greeting",
    label: { ko: "회사소개", en: "Company" },
    children: [
      { href: "/company/greeting", label: { ko: "인사말", en: "Greetings" } },
      { href: "/company/history", label: { ko: "연혁", en: "History" } },
      { href: "/company/partners", label: { ko: "제휴사", en: "Partners" } },
      { href: "/company/location", label: { ko: "주소", en: "Location" } },
    ],
  },
  { href: "/offices", label: { ko: "해외지사", en: "Global Offices" } },
  {
    href: "/business/agency",
    label: { ko: "사업내용", en: "Services" },
    children: [
      { href: "/business/agency", label: { ko: "해외지사대행", en: "Overseas Branch Agency" } },
      { href: "/business/research", label: { ko: "해외시장조사", en: "Market Research" } },
      { href: "/business/buyers", label: { ko: "해외바이어발굴", en: "Buyer Discovery" } },
      { href: "/business/branch", label: { ko: "해외지사 운영대행", en: "Branch Operation" } },
      { href: "/business/field-research", label: { ko: "해외출장조사", en: "Field Research Trips" } },
      { href: "/business/software", label: { ko: "소프트웨어 무역", en: "Software Trading" } },
    ],
  },
  { href: "/biz", label: { ko: "해외 Biz정보", en: "Global Biz Info" } },
  { href: "/resident", label: { ko: "해외주재원 전용", en: "For Overseas Staff" } },
  { href: "/contact", label: { ko: "Contact Us", en: "Contact Us" } },
];
