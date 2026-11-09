import type { L } from "./i18n";

/**
 * 해외 Biz정보 게시판 지역 구분 (PPT 9~12쪽 기준, 메뉴 순서 동일)
 * - "all"(전체)로 등록한 글은 모든 지역 게시판에 함께 노출됩니다.
 * - countries: 각 게시판 머리말에 표시되는 나라 목록 (인도는 공란)
 */
export type RegionId =
  | "all"
  | "india"
  | "southeast"
  | "northeast"
  | "central"
  | "southwest"
  | "middleeast"
  | "northafrica"
  | "southafrica"
  | "easteurope"
  | "etc";

export type Region = { id: RegionId; label: L; countries?: L };

export const REGIONS: Region[] = [
  { id: "all", label: { ko: "전체", en: "All" } },
  { id: "india", label: { ko: "인도", en: "India" } },
  {
    id: "southeast",
    label: { ko: "동남아", en: "Southeast Asia" },
    countries: {
      ko: "베트남, 태국, 인도네시아, 말레이시아, 싱가포르, 필리핀, 미얀마, 캄보디아, 라오스, 브루나이, 동티모르",
      en: "Vietnam, Thailand, Indonesia, Malaysia, Singapore, Philippines, Myanmar, Cambodia, Laos, Brunei, Timor-Leste",
    },
  },
  {
    id: "northeast",
    label: { ko: "동북아", en: "Northeast Asia" },
    countries: { ko: "몽골, 대만, 중국", en: "Mongolia, Taiwan, China" },
  },
  {
    id: "central",
    label: { ko: "중앙아", en: "Central Asia" },
    countries: {
      ko: "카자흐스탄, 우즈베키스탄, 투르크메니스탄, 키르기스스탄, 타지키스탄",
      en: "Kazakhstan, Uzbekistan, Turkmenistan, Kyrgyzstan, Tajikistan",
    },
  },
  {
    id: "southwest",
    label: { ko: "서남아", en: "South Asia" },
    countries: {
      ko: "파키스탄, 방글라데시, 네팔, 부탄, 스리랑카, 몰디브, 아프가니스탄",
      en: "Pakistan, Bangladesh, Nepal, Bhutan, Sri Lanka, Maldives, Afghanistan",
    },
  },
  {
    id: "middleeast",
    label: { ko: "중동", en: "Middle East" },
    countries: {
      ko: "사우디아라비아, 이란, 이라크, 이스라엘, 팔레스타인, 요르단, 레바논, 시리아, 튀르키예",
      en: "Saudi Arabia, Iran, Iraq, Israel, Palestine, Jordan, Lebanon, Syria, Türkiye",
    },
  },
  {
    id: "northafrica",
    label: { ko: "북아프리카", en: "North Africa" },
    countries: {
      ko: "이집트, 리비아, 튀니지, 알제리, 모로코, 수단 등",
      en: "Egypt, Libya, Tunisia, Algeria, Morocco, Sudan, etc.",
    },
  },
  {
    id: "southafrica",
    label: { ko: "남아프리카", en: "Sub-Saharan Africa" },
    countries: {
      ko: "나이지리아, 가나, 에티오피아, 케냐, 콩고민주공화국, 남아프리카공화국 등",
      en: "Nigeria, Ghana, Ethiopia, Kenya, DR Congo, South Africa, etc.",
    },
  },
  {
    id: "easteurope",
    label: { ko: "동유럽", en: "Eastern Europe" },
    countries: {
      ko: "우크라이나, 벨라루스, 몰도바, 에스토니아, 라트비아, 리투아니아, 조지아, 아르메니아, 아제르바이잔",
      en: "Ukraine, Belarus, Moldova, Estonia, Latvia, Lithuania, Georgia, Armenia, Azerbaijan",
    },
  },
  {
    id: "etc",
    label: { ko: "기타", en: "Others" },
    countries: { ko: "아메리카, 오세아니아, 기타", en: "Americas, Oceania and others" },
  },
];

export const REGION_MAP = Object.fromEntries(REGIONS.map((r) => [r.id, r])) as Record<RegionId, Region>;

export function isRegionId(v: unknown): v is RegionId {
  return typeof v === "string" && v in REGION_MAP;
}

/** 해외 Biz정보 "종류" */
export const BIZ_CATEGORIES = [
  { id: "industry", label: { ko: "산업정보", en: "Industry Info" } },
  { id: "inquiry", label: { ko: "인콰이어리", en: "Inquiry" } },
] as const;
export type BizCategory = (typeof BIZ_CATEGORIES)[number]["id"];

export function bizCategoryLabel(id: string): L {
  return BIZ_CATEGORIES.find((c) => c.id === id)?.label ?? { ko: id, en: id };
}
