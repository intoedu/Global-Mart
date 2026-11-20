import type { L } from "./i18n";

/**
 * 사이트 본문 콘텐츠 (한국어 / English)
 * 기존 홈페이지(globalmart21.com)와 의뢰 자료(PPT)의 내용을 바탕으로 정리했습니다.
 */

// ------------------------------------------------------------------
// 메인 (PPT '핸드폰용 홈페이지' 3~6쪽 = PC 'Open Page')
// ------------------------------------------------------------------
export const HOME = {
  heroTitle: {
    ko: "해외시장진출은\n글로벌마트와 함께",
    en: "Your partner for\nglobal market entry",
  } satisfies L,
  heroTag: {
    ko: "한국 기업 해외지사대행 · 해외시장개척 전문",
    en: "Overseas branch agency for Korean companies",
  } satisfies L,
  heroLead: {
    ko: "㈜글로벌마트는 한국기업 해외지사대행 업무를 전문으로 하는 회사입니다. 현지 전문인력이 시장조사, 인허가, 바이어발굴까지 함께 하며, 성공시 무역 에이전트 업무를 지속적으로 수행합니다.",
    en: "Globalmart Inc. specializes in overseas branch agency for Korean companies. Our local specialists work with you on market research, permits and licensing, and buyer discovery, and once a deal succeeds we continue to act as your trade agent.",
  } satisfies L,
  heroServices: [
    { icon: "briefcase", href: "/business/agency", label: { ko: "해외지사대행", en: "Branch agency" }, sub: { ko: "현지 직원 배치", en: "Local staff" } },
    { icon: "chart", href: "/business/research", label: { ko: "해외시장조사", en: "Market research" }, sub: { ko: "가격·경쟁·관세", en: "Prices · tariffs" } },
    { icon: "handshake", href: "/business/buyers", label: { ko: "해외바이어발굴", en: "Buyer discovery" }, sub: { ko: "인허가·무역대행까지", en: "Permits · trade agency" } },
    { icon: "globe", href: "/business/agency", label: { ko: "해외입찰대행", en: "Overseas tender agency" }, sub: { ko: "국제지역개발협력", en: "International regional development cooperation" } },
  ],
  stats: [
    { value: "2004", label: { ko: "설립", en: "Founded" } },
    { value: "20+", label: { ko: "해외 거점 국가", en: "Countries covered" } },
    { value: "2009", label: { ko: "해외 전문가 양성 시작", en: "Specialist training since" } },
    { value: { ko: "성과 시", en: "On results" }, label: { ko: "Agent 수수료", en: "Agent commission" } },
  ],
  services: [
    {
      no: "01",
      title: { ko: "해외지사대행", en: "Overseas Branch Agency" },
      points: [
        { ko: "현지 직원 배치로 해외시장개척", en: "Local staff assigned to open your market" },
        { ko: "단기간 운영가능", en: "Short-term operation available" },
        { ko: "현지 인건비만 발생", en: "You only cover local labor costs" },
      ],
      href: "/business/agency",
    },
    {
      no: "02",
      title: { ko: "유망 아이템 해외시장개척과\n해외 프로젝트 입찰", en: "Promising Items Abroad &\nOverseas Project Tenders" },
      points: [
        { ko: "국제 지역개발 협력 프로젝트(IT, 산업개발)", en: "International regional development cooperation projects (IT, industrial development)" },
        { ko: "유망 중소기업 아이템 환영", en: "Promising SME products welcome" },
        { ko: "해외바이어발굴, 인허가, 무역대행까지", en: "Buyer discovery, permits and trade agency" },
      ],
      href: "/business/buyers",
    },
    {
      no: "03",
      title: { ko: "회계·세무 고객 특전", en: "Perk for Accounting Clients" },
      points: [
        { ko: "회계·세무 거래 고객 대상", en: "For our accounting & tax clients" },
        { ko: "세무 혹은 회계감사 의뢰시 3개월 무상 해외지사대행", en: "3 months of free overseas branch agency when you commission tax or audit work" },
        { ko: "연1회 해외시장개척 아웃리치", en: "A yearly overseas market outreach program" },
      ],
      href: "/company/partners",
    },
  ],
  fee: {
    ko: "성과발생시 Agent 수수료, 지사대행비용은 현지인 인건비 수준(+타지역 출장시 실비)입니다",
    en: "Agent commission when results are achieved; branch agency costs about the same as local labor (plus actual expenses for trips to other regions).",
  } satisfies L,
  regionsTitle: { ko: "해외시장개척 가능지역", en: "Where we can take you" } satisfies L,
  regionsLead: {
    ko: "당사는 국제지역개발협력협회(IRDCA, 해외주재원 훈련기관)의 제휴사로서, 제3세계 전역에 대해 해외시장개척활동을 수행합니다. 아래의 지역 외에도 제3세계 어느 지역에 대해서도 가능합니다.",
    en: "As a partner of IRDCA (International Region Development Cooperation Association, a training institute for overseas staff), we carry out market development across the developing world. Besides the regions below, we can work in any part of the developing world.",
  } satisfies L,
  regions: [
    { ko: "인도", en: "India" },
    { ko: "동남아", en: "Southeast Asia" },
    { ko: "서남아", en: "South Asia" },
    { ko: "중앙아", en: "Central Asia" },
    { ko: "러시아", en: "Russia" },
    { ko: "아프리카", en: "Africa" },
    { ko: "중동", en: "Middle East" },
    { ko: "기타", en: "And more" },
  ] satisfies L[],
  bizCta: {
    title: { ko: "해외 Biz정보", en: "Global Biz Info" },
    body: {
      ko: "글로벌마트는 '해외시장정보'와 '해외입찰정보'를 바탕으로 국내기업과 함께 해외비즈니스를 수행하고자 합니다. 우수한 아이템은 해외 여러 나라에서 동시에 진행됩니다.",
      en: "Globalmart works with Korean companies on overseas business based on overseas market and tender information. Strong items are pursued in several countries at the same time.",
    },
  },
};

// ------------------------------------------------------------------
// 회사소개
// ------------------------------------------------------------------
export const GREETING = {
  headline: {
    ko: "믿음과 신뢰, 전문성으로\n최선을 다하는 기업",
    en: "A company that gives its best with trust, integrity and expertise",
  } satisfies L,
  /** 의뢰 자료(2차 수정 PPT)의 인사말 원문 그대로 — 문단 구분도 원문과 같음 */
  paragraphs: [
    { ko: "안녕하십니까?", en: "Greetings." },
    {
      ko: "국내외 경제정세가 급변하고 있으며, 특히 중국발 저가 초과공급과잉으로 전세계의 제조업이 크게 위축되어 있습니다. 이러한 열악한 상황 속에서도 해외 수출로 나아가는 귀사의 앞길에 대로가 열리길 소망합니다.",
      en: "The economic situation at home and abroad is changing rapidly, and in particular a glut of low-priced oversupply from China has caused manufacturing around the world to contract sharply. Even in these difficult conditions, we hope a broad road opens before your company as it moves forward into overseas exports.",
    },
    {
      ko: "우리 글로벌마트와 국제지역개발협력협회(해외주재원 훈련기관)는 이 일에 귀한 동역자가 되길 희망합니다.",
      en: "We at Globalmart, together with the International Region Development Cooperation Association (IRDCA, a training institution for overseas representatives), hope to be your valued co-workers in this endeavor.",
    },
    {
      ko: "우리는 귀사의 해외지사 역할을 대행하는 회사로서, 제3세계를 그 주요 대상으로 삼고 있습니다.",
      en: "As a company that takes on the role of your overseas branch, we focus mainly on the developing world.",
    },
    {
      ko: "우수한 중소기업 아이템의 경우, 짧은 시간에 세계 각국에 유통망을 구축할 수 있습니다. 우리는 이러한 업무에 초기에는 해외지사 역할을 수행하다가, 성과발생시 무역대행의 업무로 발전하길 원합니다.",
      en: "For outstanding products from small and medium-sized enterprises, distribution networks can be built in countries around the world in a short time. In this work we first act as your overseas branch, and once results come, we hope to grow into a trade agency role.",
    },
    {
      ko: "우리는 특히 국내 대기업의 해외 산업개발, 곧 대한민국이 중심이 된 국제지역개발협력사업을 전개하고자 합니다.",
      en: "In particular, we aim to carry out overseas industrial development for large Korean companies, that is, international regional development cooperation projects led by Korea.",
    },
    {
      ko: "이 일에 우리는 국내 우수 중소기업과 대기업의 중요한 파트너로 나아가길 소망합니다.",
      en: "In this work, we hope to move forward as an important partner to Korea's outstanding small and medium-sized enterprises and large corporations.",
    },
    { ko: "감사합니다.", en: "Thank you." },
  ] satisfies L[],
  /** 서명 두 줄 (줄바꿈 \n 그대로 표시) */
  sign: { ko: "글로벌마트\n운영위원 대표 최 환 열 올림", en: "Globalmart Inc.\nChoi Hwan-yeol, Representative of the Operating Committee" } satisfies L,
  values: [
    { title: { ko: "믿음", en: "Integrity" }, body: { ko: "맡은 일에 최선을 다합니다.", en: "We give every project our best." } },
    { title: { ko: "신뢰", en: "Trust" }, body: { ko: "고객사와 신뢰를 바탕으로 함께합니다.", en: "We work with our clients on a basis of trust." } },
    { title: { ko: "전문성", en: "Expertise" }, body: { ko: "양성된 해외시장개척 전문 인력이 현지에서 함께합니다.", en: "Trained market development specialists work with you on the ground." } },
  ],
};

export const HISTORY: { date: string; ko: string; en: string }[] = [
  { date: "2004.05", ko: "㈜한국벤처마트(현 글로벌마트) 설립", en: "Korea Venture Mart Inc. (now Globalmart) founded" },
  { date: "2008.11", ko: "말레이시아 프로젝트 수행 (ITS 정부 프로젝트)", en: "Malaysia project (government ITS project)" },
  { date: "2009.07", ko: "해외시장개척 전문가 훈련 시작", en: "Overseas market specialist training program launched" },
  { date: "2009.12", ko: "중국 대련 해외시장개척 프로젝트 수행 (의류, 건축자재)", en: "Dalian, China market project (apparel, building materials)" },
  { date: "2010.12", ko: "인도 뭄바이 해외시장개척 프로젝트 수행 (건축자재, 엔진오일, 자동차부품)", en: "Mumbai, India market project (building materials, engine oil, auto parts)" },
  { date: "2011.04", ko: "㈜글로벌마트로 상호 변경", en: "Renamed Globalmart Inc." },
  { date: "2016.08", ko: "베트남 호치민 해외시장개척 프로젝트 수행 (화장품, 수산물, 대리석, 엔진오일 등)", en: "Ho Chi Minh City, Vietnam market project (cosmetics, seafood, marble, engine oil, etc.)" },
  { date: "2018.08", ko: "글로벌마트에서 분리하여 국제지역개발협력협회(IRDCA) 설립", en: "IRDCA spun off from Globalmart as an independent association" },
  // 의뢰 자료에 월이 없어 연도만 표시 (date 에 월을 붙이지 않음)
  { date: "2018", ko: "터키 이스탄불, 모로코 해외시장개척활동 (화장품, 섬유, 주사기)", en: "Market development activities in Istanbul, Turkey and in Morocco (cosmetics, textiles, syringes)" },
];

export const PARTNERS = {
  lead: {
    ko: "(주)글로벌마트는 한국 기업의 해외 진출을 돕기 위해 2009년부터 해외시장개척 전문가 양성 과정을 운영해 왔습니다. 2018년, 이 과정은 '국제지역개발협력협회'로 발전하였고, 해외주재원 양성을 전담하고 있습니다.",
    en: "Since 2009, Globalmart Inc. has run a training course for overseas market development specialists to help Korean companies expand abroad. In 2018 the course grew into the International Region Development Cooperation Association (IRDCA), which is now dedicated to training overseas representatives.",
  } satisfies L,
  steps: [
    {
      title: { ko: "전문가 양성", en: "Training" },
      body: { ko: "IRDCA가 해외시장개척 전문가 과정을 운영하고 수료증을 수여합니다.", en: "IRDCA runs the specialist course and awards certificates." },
    },
    {
      title: { ko: "주재원 추천", en: "Recommendation" },
      body: { ko: "수료자를 한국 기업의 해외주재원으로 추천합니다.", en: "Graduates are recommended to Korean companies as overseas staff." },
    },
    {
      title: { ko: "해외지사대행", en: "Branch agency" },
      body: { ko: "글로벌마트가 수료생을 해외주재원으로 맞아 국내 기업의 해외지사 업무를 수행합니다.", en: "Globalmart brings graduates on as overseas staff to run branch work for Korean companies." },
    },
  ],
  orgs: [
    {
      kind: { ko: "제휴기관", en: "Partner institution" },
      name: { ko: "국제지역개발협력협회 (IRDCA)", en: "International Region Development Cooperation Association (IRDCA)" },
      body: {
        ko: "해외시장개척 전문가 양성 비영리기관. 협회 구성원들이 “해외주재원 양성과정”을 수료한 후, ㈜글로벌마트의 해외주재원이 되어 제3세계 전역에서 해외시장개척활동을 수행합니다.",
        en: "A non-profit that trains overseas market development specialists. After completing the “Overseas Representative Training Course,” its members become overseas representatives of Globalmart Inc. and carry out market development activities across the developing world.",
      },
    },
    {
      kind: { ko: "제휴기업", en: "Partner firm" },
      name: { ko: "삼지회계법인 성수지점", en: "Samji Accounting Corp. (Seongsu Branch)" },
      body: {
        ko: "회계, 세무 업무제휴. 회계, 세무 거래고객의 경우, “3개월의 무상 지사대행”이 부여되며, 매해 “해외시장개척 아웃리치” 참여기회가 제공됩니다.",
        en: "Accounting and tax partnership. Accounting and tax clients are granted “three months of free branch agency” and are offered the chance to join the “Overseas Market Development Outreach” every year.",
      },
    },
  ],
};

// ------------------------------------------------------------------
// 사업내용
// ------------------------------------------------------------------
export const PROCESS = [
  { key: "research", href: "/business/research", title: { ko: "해외시장조사", en: "Market Research" }, period: { ko: "약 1개월", en: "About 1 month" } },
  { key: "buyers", href: "/business/buyers", title: { ko: "해외바이어발굴", en: "Buyer Discovery" }, period: { ko: "반복 진행", en: "Ongoing cycles" } },
  { key: "branch", href: "/business/branch", title: { ko: "해외지사운영", en: "Branch Operation" }, period: { ko: "6개월 단위 계약 (최초 3개월 가능)", en: "6-month terms (3 months for a first contract)" } },
] as const;

export const AGENCY = {
  lead: {
    ko: "글로벌마트는 국내기업의 해외지사업무를 대행합니다. 해외지사 대행의 업무의 내용은 고객과 당사가 공동으로 수립합니다.",
    en: "Globalmart carries out overseas branch work on behalf of Korean companies. The scope of the branch agency work is set jointly by the client and Globalmart.",
  } satisfies L,
  /** 해외지사대행 전략수립 및 수수료 (2차 수정 PPT 문구 그대로) — dash: "-" 목록 / 없으면 들여쓴 설명 줄 */
  strategy: {
    title: { ko: "해외지사대행 전략수립 및 수수료", en: "Branch agency strategy and fees" } satisfies L,
    steps: [
      {
        no: "1st",
        title: {
          ko: "고객과 글로벌마트 본사와 해외주재원의 해외지사대행 전략 수립",
          en: "The client, Globalmart HQ and our overseas staff set the branch agency strategy together",
        },
        dash: true,
        items: [],
      },
      {
        no: "2nd",
        title: { ko: "해외지사대행의 기간과 수수료의 책정", en: "Setting the term and fees of the branch agency" },
        dash: true,
        items: [
          { ko: "월 수수료 : 50-100만원(업무의 난이도 따라)", en: "Monthly fee: KRW 0.5–1 million (depending on the difficulty of the work)" },
          { ko: "6개월 단위 계약(최초의 경우 3개월 가능)", en: "6-month contracts (3 months possible for a first contract)" },
          { ko: "타지역 출장 등 : 실비 별도", en: "Trips to other regions, etc.: actual costs charged separately" },
          { ko: "인허가, 해외입찰 등 : 별도 협의", en: "Permits, overseas tenders, etc.: negotiated separately" },
        ],
      },
      {
        no: "3rd",
        title: { ko: "지사대행 업무 진행", en: "Carrying out the branch agency work" },
        dash: false,
        items: [
          { ko: "계약내용에 따른 지사대행 업무 진행", en: "Branch agency work is carried out according to the contract" },
          { ko: "(예시) 시장조사, 바이어발굴, 지사업무대행 등", en: "(Examples) market research, buyer discovery, branch work on your behalf, etc." },
        ],
      },
      {
        no: "4th",
        title: { ko: "계약성사시", en: "When a contract is concluded" },
        dash: true,
        items: [
          { ko: '"해외지사대행"의 "무역대행"으로 이행', en: '"Overseas branch agency" moves on to "trade agency"' },
          { ko: "무역대행 수수료 : 별도 협의", en: "Trade agency fee: negotiated separately" },
        ],
      },
    ],
  },
};

export const RESEARCH = {
  lead: {
    ko: "해외시장조사는 고객사가 그동안 쌓아 온 해외시장개척 경험을 고려해 진행합니다. 일반적으로 약 1개월 동안 다음 항목을 조사합니다.",
    en: "Market research is tailored to your previous experience abroad. A typical study takes about one month and covers the following.",
  } satisfies L,
  items: [
    { title: { ko: "현지 시장 가격 조사", en: "Local market prices" }, body: { ko: "현지 시장에서 판매되는 제품의 가격을 조사합니다.", en: "Prices of comparable products in the local market." } },
    { title: { ko: "경쟁 제품 조사", en: "Competing products" }, body: { ko: "현지에서 판매 중인 경쟁 제품과 기업을 분석합니다.", en: "Competing products and companies already in the market." } },
    { title: { ko: "도매상·수입상 조사", en: "Wholesalers & importers" }, body: { ko: "현지의 도매상과 수입상을 조사합니다.", en: "Local wholesalers and importers." } },
    { title: { ko: "관세·부가세·인허가 조사", en: "Tariffs, VAT & permits" }, body: { ko: "관세, 부가세와 인허가 사항을 확인합니다.", en: "Tariffs, VAT and permit requirements." } },
  ],
  outro: {
    ko: "조사 결과를 바탕으로 고객사와 함께 해외시장개척 전략을 세웁니다.",
    en: "Based on the findings, we build a market entry strategy together with you.",
  } satisfies L,
};

export const BUYERS = {
  lead: {
    ko: "국내 기업의 해외시장 진출을 위한 해외 바이어는 다음 절차를 통해 발굴합니다.",
    en: "We find overseas buyers for Korean companies through the following steps.",
  } satisfies L,
  steps: [
    { title: { ko: "해외 기업 리스트 확보", en: "Build a buyer list" }, body: { ko: "온라인 등을 통해 잠재 바이어를 찾습니다.", en: "Identify potential buyers online and through other channels." } },
    { title: { ko: "해외 텔레마케팅", en: "Email & phone contact" }, body: { ko: "이메일과 전화로 상담을 진행합니다.", en: "Contact them by email and phone." } },
    { title: { ko: "가격·조건 조정", en: "Negotiation" }, body: { ko: "국내 기업과 바이어 사이의 가격과 조건을 조율합니다.", en: "Mediate price and terms between you and the buyer." } },
    { title: { ko: "출장대행 바이어 면담", en: "On-site buyer meetings" }, body: { ko: "고객사를 대신해 바이어를 직접 만납니다.", en: "Meet buyers in person on your behalf." } },
  ],
};

export const BRANCH = {
  lead: {
    ko: "고객사와 협의하여 해외 지사업무를 수행하고, 수행한 업무를 주기적으로 보고합니다. 지사대행 성과 발생시 무역대행으로 이행합니다.",
    en: "We carry out overseas branch work as agreed with the client and report on it regularly. When the branch agency produces results, it moves on to trade agency.",
  } satisfies L,
  /** 카드 위 표시: [해외지사운영] 고객사와 협의하여 지사업무 수행 */
  chip: { ko: "해외지사운영", en: "Branch Operation" } satisfies L,
  chipText: { ko: "고객사와 협의하여 지사업무 수행", en: "Branch work carried out in consultation with the client" } satisfies L,
  points: [
    { title: { ko: "해외 지사업무 수행", en: "Overseas branch work" }, body: { ko: "국내기업의 해외지사 업무를 수행합니다.", en: "We carry out overseas branch work for Korean companies." } },
    { title: { ko: "주기적 업무 보고", en: "Regular reporting" }, body: { ko: "수행한 업무를 주기적으로 보고합니다.", en: "We report regularly on the work carried out." } },
    { title: { ko: "지사대행의 성과발생", en: "When the branch agency produces results" }, body: { ko: "지사대행 성과 발생시 무역대행으로 이행합니다.", en: "When the branch agency produces results, it moves on to trade agency." } },
  ],
};

// (2차 수정 요청 슬라이드 18·22) 예전 사업내용 6번째 항목의 내용은 공개하지 않고 해외주재원 전용(암호화된
// public/data/resident.json 의 software)으로 옮겼습니다. 수정은 관리자 화면 › 해외주재원 전용에서 합니다.

export const BIZ_INTRO = {
  ko: "글로벌마트는 '해외시장정보'와 '해외입찰정보'를 바탕으로 국내기업과 함께 해외비즈니스를 수행하고자 합니다. 우수한 아이템은 해외 여러 나라에서 동시에 진행됩니다.",
  en: "Globalmart aims to carry out overseas business together with Korean companies, based on 'overseas market information' and 'overseas tender information'. Strong items are pursued in several countries at the same time.",
} satisfies L;

export const RESIDENT_INTRO = {
  ko: "국내아이템을 해외주재원에게 소개하고, 공지사항을 올리는 공간입니다.",
  en: "A space that introduces Korean items to our overseas staff and posts notices.",
} satisfies L;

// ------------------------------------------------------------------
// 메인 — 주요활동 (연혁 기반, 사실 그대로)
// ------------------------------------------------------------------
export const TRACK_RECORD = [
  {
    year: "2008",
    photo: "kualalumpur",
    place: { ko: "말레이시아", en: "Malaysia" },
    title: { ko: "정부 프로젝트", en: "Government project" },
    items: { ko: "ITS", en: "ITS" },
  },
  {
    year: "2010",
    photo: "mumbai",
    place: { ko: "인도", en: "India" },
    title: { ko: "해외시장개척 활동", en: "Market development" },
    items: { ko: "건축자재, 엔진오일, 자동차부품", en: "Building materials, engine oil, auto parts" },
  },
  {
    year: "2016",
    photo: "hcmc",
    place: { ko: "베트남", en: "Vietnam" },
    title: { ko: "해외시장개척 활동", en: "Market development" },
    items: { ko: "화장품, 수산물, 대리석, 엔진오일", en: "Cosmetics, seafood, marble, engine oil" },
  },
  {
    year: "2018",
    photo: "istanbul",
    place: { ko: "터키", en: "Turkey" },
    title: { ko: "해외시장개척 활동", en: "Market development" },
    items: { ko: "화장품, 섬유, 의료기기", en: "Cosmetics, textiles, medical devices" },
  },
] as const;

