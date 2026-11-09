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
    ko: "글로벌마트는 한국 기업의 해외지사 역할을 대신하는 회사입니다. 현지 전문 인력이 시장조사부터 바이어 발굴, 계약까지 함께하며 성과가 날 때 수수료를 받습니다.",
    en: "Globalmart acts as the overseas branch of Korean companies. Our local specialists handle market research, buyer discovery and contracts, and we are paid only on results.",
  } satisfies L,
  heroServices: [
    { icon: "briefcase", href: "/business/agency", label: { ko: "해외지사대행", en: "Branch agency" }, sub: { ko: "현지 직원 배치", en: "Local staff" } },
    { icon: "chart", href: "/business/research", label: { ko: "해외시장조사", en: "Market research" }, sub: { ko: "가격·경쟁·관세", en: "Prices · tariffs" } },
    { icon: "handshake", href: "/business/buyers", label: { ko: "해외바이어 발굴", en: "Buyer discovery" }, sub: { ko: "계약까지 동행", en: "Until the deal" } },
    { icon: "code", href: "/business/software", label: { ko: "소프트웨어 수출", en: "Software export" }, sub: { ko: "메신저·블록체인", en: "Apps · blockchain" } },
  ],
  stats: [
    { value: "2004", label: { ko: "설립", en: "Founded" } },
    { value: "20+", label: { ko: "해외 거점 국가", en: "Countries covered" } },
    { value: "2009", label: { ko: "해외 전문가 양성 시작", en: "Specialist training since" } },
    { value: { ko: "성과제", en: "Success fee" }, label: { ko: "Agent 수수료", en: "Agent commission" } },
  ],
  services: [
    {
      no: "01",
      title: { ko: "해외지사대행", en: "Overseas Branch Agency" },
      points: [
        { ko: "현지 직원 배치로 해외시장 개척", en: "Local staff assigned to open your market" },
        { ko: "단기 운영 가능", en: "Short-term operation available" },
        { ko: "현지 인건비만 발생", en: "You only cover local labor costs" },
      ],
      href: "/business/agency",
    },
    {
      no: "02",
      title: { ko: "유망 아이템 해외시장개척", en: "Promising Items, Global Markets" },
      points: [
        { ko: "국가 대상 프로젝트 수행", en: "Government-level projects" },
        { ko: "유망 중소기업 아이템 환영", en: "Promising SME products welcome" },
        { ko: "해외 바이어 발굴부터 계약까지", en: "From buyer discovery to contract" },
      ],
      href: "/business/buyers",
    },
    {
      no: "03",
      title: { ko: "회계·세무 고객 특전", en: "Perk for Accounting Clients" },
      points: [
        { ko: "회계·세무 거래 고객 대상", en: "For our accounting & tax clients" },
        { ko: "연 1회 해외시장개척 서비스", en: "One market-entry program every year" },
        { ko: "별도 비용 없이 진행", en: "At no additional cost" },
      ],
      href: "/business/field-research",
    },
  ],
  fee: {
    ko: "수수료는 성과가 발생했을 때 Agent 수수료로만 받습니다.",
    en: "We charge an agent commission only when results are achieved.",
  } satisfies L,
  regionsTitle: { ko: "해외시장개척 가능지역", en: "Where we can take you" } satisfies L,
  regionsLead: {
    ko: "당사는 국제지역개발협력협회(IRDCA)의 제휴사로서, 협회 구성원들과 함께 해외시장개척 업무를 수행합니다. 협회 구성원들은 제3세계 전역에서 현지에 상주하며 활동하고 있어 폭넓은 지역에서 업무 수행이 가능합니다.",
    en: "As a partner of IRDCA (International Region Development Cooperation Association), we work with its members who live and work across the developing world, so we can operate in a wide range of regions.",
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
  itemsTitle: { ko: "유망 아이템 해외시장개척", en: "Taking promising items abroad" } satisfies L,
  items: [
    {
      title: { ko: "제3세계 개발 프로젝트", en: "Development projects in emerging markets" },
      body: {
        ko: "대기업, IT기업 등의 해외지사대행을 통해 제3세계 산업개발에 함께하고자 합니다.",
        en: "Acting as the overseas branch of large and IT companies, we take part in industrial development across emerging economies.",
      },
    },
    {
      title: { ko: "중소기업의 해외시장개척", en: "Market entry for SMEs" },
      body: {
        ko: "화장품, 의료기기 등 중소기업의 유망 제품에 대해 해외 바이어를 발굴하고 해외시장을 개척합니다.",
        en: "We find overseas buyers and open markets for promising SME products such as cosmetics and medical devices.",
      },
    },
    {
      title: { ko: "회계·세무 업무 고객 특전", en: "A perk for accounting clients" },
      body: {
        ko: "회계·세무 업무만 의뢰하셔도 별도 비용 없이 해외시장개척을 진행해 드립니다.",
        en: "Clients who use our accounting and tax services receive market-entry support at no extra cost.",
      },
    },
  ],
  bizCta: {
    title: { ko: "해외 Biz정보", en: "Global Biz Info" },
    body: {
      ko: "현지 주재원이 보내온 산업정보와 인콰이어리를 지역별로 확인하세요. 좋은 아이템은 여러 나라에서 동시에 진행됩니다.",
      en: "Browse industry insights and buyer inquiries sent in by our local staff, sorted by region. Strong items are pursued in several countries at once.",
    },
  },
};

// ------------------------------------------------------------------
// 회사소개
// ------------------------------------------------------------------
export const GREETING = {
  headline: {
    ko: "믿음과 신뢰, 전문성으로\n최선을 다하는 기업",
    en: "A company that gives its best\nwith trust, integrity and expertise",
  } satisfies L,
  paragraphs: [
    {
      ko: "안녕하십니까. 이렇게 인사드리게 되어 기쁘게 생각합니다.",
      en: "Hello, and thank you for visiting Globalmart.",
    },
    {
      ko: "인터넷 산업의 발달로 세상은 더욱 빨라지고 가까워졌습니다. 이제 사업도 한 나라에 머무르지 않고 글로벌 시장을 목표로 해야 합니다. 글로벌마트는 이러한 기업들의 세계화를 위해 최선을 다하고자 합니다.",
      en: "The internet has made the world faster and smaller. Business can no longer stay within one country; it has to aim for the global market. Globalmart is committed to helping companies make that move.",
    },
    {
      ko: "글로벌마트는 한국 기업을 위해 해외에서 지사 업무를 대행하는 회사입니다. 이를 위해 해외시장개척 전문가 양성기관인 '국제지역개발협력협회'와 함께하고 있으며, 협회를 통해 양성된 해외시장개척 전문 인력을 해외에 파견하고 있습니다.",
      en: "We carry out overseas branch work on behalf of Korean companies. To do this we work with the International Region Development Cooperation Association (IRDCA), which trains overseas market development specialists, and we place those specialists abroad.",
    },
    {
      ko: "먼저, 글로벌 마케팅을 희망하는 한국 기업을 만나고자 합니다. 저희는 여러 나라에서 동시에 해외시장개척 활동을 수행할 수 있습니다.",
      en: "First, we want to meet Korean companies that are looking to market globally. We can run market development activities in many countries at the same time.",
    },
    {
      ko: "더 나아가 한국 기업과의 제휴나 한국 시장 진출을 원하는 해외 기업과도 함께합니다. 특히 한국 기업의 전문 기술, 그중에서도 한국 소프트웨어 기술의 해외 진출에 힘을 쏟고 있습니다.",
      en: "We also work with overseas companies seeking partnerships with Korean firms or entry into the Korean market. We focus in particular on taking Korean technology, especially Korean software, to the world.",
    },
    {
      ko: "이러한 사업을 통해 한국 기업과 해외 기업의 글로벌화에 최선을 다하겠습니다. 감사합니다.",
      en: "Through this work, we will do our best for the globalization of both Korean and overseas companies. Thank you.",
    },
  ] satisfies L[],
  sign: { ko: "글로벌마트 임직원 일동", en: "All of us at Globalmart Inc." } satisfies L,
  values: [
    { title: { ko: "믿음", en: "Faithfulness" }, body: { ko: "약속한 일은 끝까지 책임집니다.", en: "We see every commitment through." } },
    { title: { ko: "신뢰", en: "Trust" }, body: { ko: "고객사의 이익을 우리의 이익보다 앞에 둡니다.", en: "Our clients' interests come before our own." } },
    { title: { ko: "전문성", en: "Expertise" }, body: { ko: "현지 전문 인력이 시장을 직접 발로 뜁니다.", en: "Local specialists work the market in person." } },
  ],
};

export const HISTORY: { date: string; ko: string; en: string }[] = [
  { date: "2004.05", ko: "㈜한국벤처마트(현 글로벌마트) 설립", en: "Korea Venture Mart Inc. (now Globalmart) founded" },
  { date: "2008.11", ko: "말레이시아 프로젝트 수행 (ITS 정부 프로젝트)", en: "Malaysia project (government ITS project)" },
  { date: "2009.07", ko: "해외시장개척 전문가 훈련 시작", en: "Overseas market specialist training program launched" },
  { date: "2009.12", ko: "중국 대련 해외시장개척 프로젝트 수행 (의류, 건축자재)", en: "Dalian, China market project (apparel, building materials)" },
  { date: "2010.12", ko: "인도 뭄바이 해외시장개척 프로젝트 수행 (건축자재, 엔진오일)", en: "Mumbai, India market project (building materials, engine oil)" },
  { date: "2011.04", ko: "㈜글로벌마트로 상호 변경", en: "Renamed Globalmart Inc." },
  { date: "2016.08", ko: "베트남 호치민 해외시장개척 프로젝트 수행 (화장품, 수산물, 대리석, 엔진오일 등)", en: "Ho Chi Minh City, Vietnam market project (cosmetics, seafood, marble, engine oil, etc.)" },
  { date: "2018.08", ko: "글로벌마트에서 분리하여 국제지역개발협력협회(IRDCA) 설립", en: "IRDCA spun off from Globalmart as an independent association" },
];

export const PARTNERS = {
  lead: {
    ko: "(주)글로벌마트는 한국 기업의 해외 진출을 돕기 위해 2009년부터 해외시장개척 전문가 양성 과정을 운영해 왔습니다. 2018년, 이 과정은 비영리 사업으로 전환되었고 그 일환으로 '국제지역개발협력협회(IRDCA)'가 설립되었습니다.",
    en: "Since 2009, Globalmart has run a training course for overseas market development specialists to help Korean companies expand abroad. In 2018 the course became a non-profit program, and IRDCA was established to run it.",
  } satisfies L,
  steps: [
    {
      title: { ko: "전문가 양성", en: "Training" },
      body: { ko: "IRDCA가 해외시장개척 전문가 과정을 운영하고 수료증을 수여합니다.", en: "IRDCA runs the specialist course and awards certificates." },
    },
    {
      title: { ko: "주재원 추천", en: "Recommendation" },
      body: { ko: "수료자를 한국 기업의 해외 주재원으로 추천합니다.", en: "Graduates are recommended to Korean companies as overseas staff." },
    },
    {
      title: { ko: "해외지사대행", en: "Branch agency" },
      body: { ko: "글로벌마트가 수료생을 해외 주재원으로 맞아 국내 기업의 해외지사 업무를 수행합니다.", en: "Globalmart brings graduates on as overseas staff to run branch work for Korean companies." },
    },
  ],
  orgs: [
    {
      kind: { ko: "제휴기관", en: "Partner institution" },
      name: { ko: "국제지역개발협력협회 (IRDCA)", en: "International Region Development Cooperation Association (IRDCA)" },
      body: {
        ko: "해외시장개척 전문가 양성 비영리 기관. 협회 구성원들이 제3세계 전역에서 글로벌마트와 함께 해외시장개척 업무를 수행합니다.",
        en: "A non-profit that trains overseas market development specialists. Its members work with Globalmart on market development across emerging regions.",
      },
    },
    {
      kind: { ko: "제휴기업", en: "Partner firm" },
      name: { ko: "삼지회계법인 성수", en: "Samji Accounting Corp. (Seongsu)" },
      body: {
        ko: "회계·세무 업무 제휴. 회계·세무 거래 고객에게는 연 1회 해외시장개척 서비스를 별도 비용 없이 제공합니다.",
        en: "Our accounting and tax partner. Accounting clients receive one market-entry program a year at no extra cost.",
      },
    },
  ],
};

// ------------------------------------------------------------------
// 사업내용
// ------------------------------------------------------------------
export const PROCESS = [
  { key: "research", href: "/business/research", title: { ko: "해외시장조사", en: "Market research" }, period: { ko: "약 1개월", en: "About 1 month" } },
  { key: "buyers", href: "/business/buyers", title: { ko: "해외바이어 발굴", en: "Buyer discovery" }, period: { ko: "반복 진행", en: "Ongoing cycles" } },
  { key: "branch", href: "/business/branch", title: { ko: "해외지사 운영대행", en: "Branch operation" }, period: { ko: "3·6·12개월", en: "3, 6 or 12 months" } },
] as const;

export const AGENCY = {
  lead: {
    ko: "글로벌마트는 국내 기업의 해외지사 업무를 대행합니다. 해외지사대행은 아이템과 계약 조건에 따라 두 가지 방식으로 진행됩니다.",
    en: "Globalmart runs overseas branch operations on behalf of Korean companies. There are two ways to work with us, depending on your product and terms.",
  } satisfies L,
  types: [
    {
      tag: { ko: "성과형", en: "Success-based" },
      title: { ko: "수수료형 지사대행", en: "Commission model" },
      body: {
        ko: "귀사의 아이템이 탁월하다고 판단되면 별도 비용 없이 진행합니다. 일반 무역과 같은 방식으로 세계 각국을 대상으로 진행하며, 실제 거래가 발생했을 때 일정 수수료를 받습니다.",
        en: "If we judge your product to be exceptional, we take it on with no upfront fee. We work it like general trade across many countries and earn a commission only when a sale is made.",
      },
      points: [
        { ko: "초기 비용 없음", en: "No upfront cost" },
        { ko: "거래 발생 시 수수료", en: "Commission on actual sales" },
        { ko: "여러 국가 동시 진행", en: "Multiple countries at once" },
      ],
    },
    {
      tag: { ko: "계약형", en: "Retainer" },
      title: { ko: "월정액 지사대행", en: "Monthly retainer model" },
      body: {
        ko: "매월 최소한의 비용을 받고 지사대행 업무를 수행합니다. 3개월, 6개월, 1년 단위로 계약하며, 현지 인건비 수준의 비용으로 실제 해외지사를 둔 것과 같은 효과를 얻을 수 있습니다.",
        en: "For a modest monthly fee we run your branch operations. Contracts run for 3, 6 or 12 months, giving you the effect of a real overseas branch at roughly the cost of local staff.",
      },
      points: [
        { ko: "3개월 · 6개월 · 1년 단위", en: "3, 6 or 12-month terms" },
        { ko: "현지 인건비 수준", en: "About the cost of local staff" },
        { ko: "전담 현지 인력 배치", en: "Dedicated local staff" },
      ],
    },
  ],
};

export const RESEARCH = {
  lead: {
    ko: "해외시장조사는 고객사가 그동안 쌓아 온 해외시장개척 경험을 고려해 진행합니다. 따라서 고객사의 판단에 따라 생략할 수도 있습니다. 일반적으로 약 1개월 동안 다음 항목을 조사합니다.",
    en: "Market research is tailored to your previous experience abroad, so you may choose to skip it. A typical study takes about one month and covers the following.",
  } satisfies L,
  items: [
    { title: { ko: "현지 시장 가격 조사", en: "Local market prices" }, body: { ko: "유통 단계별 소비자가와 도매가를 파악합니다.", en: "Retail and wholesale prices across the distribution chain." } },
    { title: { ko: "경쟁 제품 조사", en: "Competing products" }, body: { ko: "현지에서 판매 중인 경쟁 제품과 기업을 분석합니다.", en: "Competing products and companies already in the market." } },
    { title: { ko: "도매상·수입상 조사", en: "Wholesalers & importers" }, body: { ko: "거래 가능성이 있는 유통 파트너를 찾습니다.", en: "Potential distribution partners to approach." } },
    { title: { ko: "관세·부가세·인허가 조사", en: "Tariffs, VAT & permits" }, body: { ko: "수출에 필요한 세금과 인증, 허가 요건을 확인합니다.", en: "Taxes, certifications and permits needed to export." } },
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
    { title: { ko: "해외 기업 리스트 확보", en: "Build a buyer list" }, body: { ko: "온라인 등을 통해 잠재 바이어를 찾습니다.", en: "Identify potential buyers online and through local networks." } },
    { title: { ko: "해외 텔레마케팅", en: "Outreach" }, body: { ko: "이메일과 전화로 상담을 진행합니다.", en: "Contact them by email and phone." } },
    { title: { ko: "가격·조건 조정", en: "Negotiation" }, body: { ko: "국내 기업과 바이어 사이의 가격과 조건을 조율합니다.", en: "Mediate price and terms between you and the buyer." } },
    { title: { ko: "출장대행 업체 면담", en: "On-site meetings" }, body: { ko: "고객사를 대신해 바이어를 직접 만납니다.", en: "Meet buyers in person on your behalf." } },
  ],
  outro: {
    ko: "이 과정을 반복해 해외 바이어를 발굴하고 국내 기업과 연결하며, 계약을 체결할 때까지 함께합니다.",
    en: "We repeat this cycle to find buyers, connect them with you, and stay with you until the contract is signed.",
  } satisfies L,
};

export const BRANCH = {
  lead: {
    ko: "위의 해외시장개척 절차를 꾸준히 반복해 바이어를 계속 발굴합니다. 계약이 성사된 고객에 대해서는 현지 에이전트로서 지속적으로 관리합니다.",
    en: "We keep running the market development cycle to find more buyers, and once a deal is closed we continue to manage the account as your local agent.",
  } satisfies L,
  points: [
    { title: { ko: "지속적인 바이어 발굴", en: "Continuous buyer discovery" }, body: { ko: "시장조사와 바이어 발굴을 꾸준히 반복합니다.", en: "Research and outreach keep running." } },
    { title: { ko: "계약 고객 관리", en: "Account management" }, body: { ko: "발주, 납품, 대금, 클레임 등 현지 커뮤니케이션을 맡습니다.", en: "We handle local communication on orders, delivery, payment and claims." } },
    { title: { ko: "현지 에이전트 역할", en: "Local agent" }, body: { ko: "귀사의 현지 창구로서 시장 변화를 계속 보고합니다.", en: "As your local contact, we keep you informed of market changes." } },
  ],
};

export const FIELD = {
  lead: {
    ko: "해외 현지를 직접 방문해 시장을 확인하는 출장 조사 프로그램입니다. 현지 주재원이 일정과 미팅을 준비하고 동행하며, 고객사는 짧은 기간에 시장과 바이어를 직접 확인할 수 있습니다.",
    en: "A field research program for visiting target markets in person. Our local staff prepare the schedule and meetings and travel with you, so you can see the market and meet buyers in a short time.",
  } satisfies L,
  points: [
    { title: { ko: "현지 일정 기획", en: "Itinerary planning" }, body: { ko: "목표 시장과 아이템에 맞춰 방문 일정을 설계합니다.", en: "We design a visit plan around your target market and product." } },
    { title: { ko: "바이어·유통처 미팅", en: "Buyer & distributor meetings" }, body: { ko: "사전에 발굴한 바이어와 유통처 미팅을 주선합니다.", en: "We arrange meetings with pre-screened buyers and distributors." } },
    { title: { ko: "통역·동행 지원", en: "Interpretation & escort" }, body: { ko: "현지 주재원이 통역과 이동을 지원합니다.", en: "Local staff handle interpretation and logistics." } },
    { title: { ko: "결과 보고", en: "Report" }, body: { ko: "방문 결과와 후속 진행 방안을 정리해 드립니다.", en: "We summarize the outcomes and next steps." } },
  ],
  perk: {
    ko: "회계·세무 거래 고객에게는 연 1회 해외시장개척 서비스를 별도 비용 없이 제공합니다.",
    en: "Accounting and tax clients receive one market development program each year at no additional cost.",
  } satisfies L,
};

export const SOFTWARE = {
  lead: {
    ko: "글로벌마트는 한국 기업 소프트웨어의 해외 진출에 힘을 쏟고 있습니다. 더 나아가 해외 현지 기업의 요청이 있으면 적합한 한국 기업을 연결해 교류를 넓힙니다.",
    en: "Globalmart is dedicated to taking Korean software solutions abroad. When overseas companies have specific needs, we also connect them with the right Korean partners.",
  } satisfies L,
  lead2: {
    ko: "이를 위해 해외에서 소프트웨어 관련 업무를 하는 기업들을 파트너로 초청하고, 위임받은 솔루션을 그들을 통해 해외 통신사, 금융기관, 정부기관, 물류회사, 대기업 등에 공동으로 제안합니다.",
    en: "We invite software companies abroad to be our partners and, together with them, propose the solutions we represent to telecom operators, financial institutions, government agencies, logistics firms and large enterprises.",
  } satisfies L,
  targets: [
    { ko: "이동통신사", en: "Mobile carriers" },
    { ko: "금융기관", en: "Financial institutions" },
    { ko: "정부기관", en: "Government agencies" },
    { ko: "물류회사", en: "Logistics firms" },
    { ko: "대기업", en: "Large enterprises" },
  ] satisfies L[],
  sections: [
    {
      id: "messenger",
      title: { ko: "메신저 프로그램", en: "Messenger Platform" },
      paragraphs: [
        {
          ko: "카카오톡, 위챗 등과 유사한 메신저 프로그램을 개발해 보유한 기업으로부터 해외 판매를 위임받았습니다. 이 메신저에는 영상, 음성, 1인 미디어, VOD, 쇼핑, OTT 기능이 함께 탑재되어 있습니다.",
          en: "We have been commissioned to sell, outside Korea, a messenger platform similar to KakaoTalk or WeChat. It includes video, voice, creator media, VOD, shopping and OTT features.",
        },
        {
          ko: "앞으로 인터넷 영토 문제가 더욱 중요해지면서 각 나라마다 자체 메신저가 필요해질 것입니다. 이 프로그램을 가장 잘 활용할 수 있는 곳은 각국의 이동통신사입니다. 통신사가 메신저에 결제 프로그램을 탑재하면 은행의 역할까지 수행할 수 있습니다.",
          en: "As digital sovereignty becomes a bigger issue, each country will want its own messenger. Mobile carriers are best placed to use it, and with a payment module added a carrier can even provide banking services.",
        },
        {
          ko: "이러한 사업이 어떻게 수익을 내고 확장되는지에 대한 선행 사례를 보유하고 있으며, 기술 이전과 함께 사업을 공동으로 수행하고자 합니다. 특히 이동통신사와 거래 관계가 있는 현지 소프트웨어 기업과의 제휴를 희망합니다.",
          en: "We have reference cases showing how such services generate revenue and grow, and we aim to transfer the technology and run the business jointly. We especially welcome partners who already work with mobile carriers.",
        },
      ],
      features: ["Video", "Voice", "Creator media", "VOD", "Shopping", "OTT", "Payment"],
    },
    {
      id: "blockchain",
      title: { ko: "블록체인 프로그램", en: "Blockchain (Mainnet)" },
      paragraphs: [
        {
          ko: "블록체인은 인터넷상의 '분산 장부'로 위변조와 해킹을 막는 기술입니다. 대규모 데이터가 오가는 금융기관, 물류회사, 카드사, 정부 등은 해킹 위험에 크게 노출되어 있으며, 이를 막기 위해 장부를 분산해 기록합니다. 이 장부를 '메인넷'이라고 합니다.",
          en: "Blockchain is a distributed ledger that protects data from tampering and hacking. Financial institutions, logistics companies, card issuers and governments handle huge volumes of data and are exposed to attacks; recording the ledger in a distributed way, the 'mainnet', protects them.",
        },
        {
          ko: "금융기관은 예금 기록, 특히 외화 환전을 블록체인으로 관리하면 절차가 크게 간소화됩니다. 카드사는 포인트 관리의 부정을 막을 수 있고, 물류회사는 물류 흐름을 낱낱이 기록할 수 있으며, 정부는 투표 등에 활용해 부정을 차단할 수 있습니다.",
          en: "Banks can simplify records and foreign exchange; card issuers can prevent fraud in loyalty points; logistics firms can record every step of the supply chain; governments can secure processes such as voting.",
        },
        {
          ko: "글로벌마트는 이 메인넷 프로그램을 해당 기업에 공급하고 지속적으로 유지·관리하고자 하며, 함께할 현지 기업과의 제휴를 희망합니다.",
          en: "We supply this mainnet solution, maintain it over time, and are looking for local partners to deliver it with us.",
        },
      ],
      features: ["Finance", "FX", "Card points", "Logistics", "e-Government", "Voting"],
    },
    {
      id: "various",
      title: { ko: "다양한 소프트웨어 수출입", en: "More Software Trading" },
      paragraphs: [
        {
          ko: "제휴사들은 위 프로그램 외에도 회계 프로그램, 설계 프로그램, 금융 관련 프로그램, 3D 지도 제작 프로그램 등을 보유하고 있으며, 지문인식 IC카드도 개발했습니다.",
          en: "Our partners also offer accounting, design, financial and 3D mapping software, and have developed a fingerprint-recognition IC card.",
        },
        {
          ko: "또한 해외 현지 소프트웨어 기업의 요청에 따라 한국 기업과의 제휴를 주선합니다.",
          en: "We can also arrange partnerships with Korean companies at the request of software companies abroad.",
        },
      ],
      features: ["Accounting", "CAD / Design", "Fintech", "3D mapping", "Fingerprint IC card"],
    },
  ],
};

export const BIZ_INTRO = {
  ko: "글로벌마트는 '해외 Biz정보' 게시판에 올라온 산업정보를 바탕으로 국내 대기업, 중소기업과 함께 해외시장개척 비즈니스를 수행합니다. 우수한 아이템은 해외 여러 나라에서 동시에 진행됩니다.",
  en: "Using the industry information posted on this board, Globalmart develops overseas markets together with Korean large companies and SMEs. Strong items are pursued in several countries at the same time.",
} satisfies L;

export const RESIDENT_INTRO = {
  ko: "이 공간은 국내 아이템을 해외 주재원에게 소개하는 전용 공간입니다. 다음은 글로벌마트와 연결된 국내 기업과 그 취급 제품입니다.",
  en: "This area introduces Korean products to our overseas staff. Below are the Korean companies connected with Globalmart and the products they handle.",
} satisfies L;

// ------------------------------------------------------------------
// 메인 — 주요 수행 실적 (연혁 기반, 사실 그대로)
// ------------------------------------------------------------------
export const TRACK_RECORD = [
  {
    year: "2008",
    photo: "kualalumpur",
    place: { ko: "말레이시아", en: "Malaysia" },
    title: { ko: "ITS 정부 프로젝트", en: "Government ITS project" },
    items: { ko: "지능형 교통 시스템(ITS)", en: "Intelligent transport systems" },
  },
  {
    year: "2009",
    photo: "apparel",
    place: { ko: "중국 대련", en: "Dalian, China" },
    title: { ko: "해외시장개척 프로젝트", en: "Market development project" },
    items: { ko: "의류 · 건축자재", en: "Apparel · Building materials" },
  },
  {
    year: "2010",
    photo: "mumbai",
    place: { ko: "인도 뭄바이", en: "Mumbai, India" },
    title: { ko: "해외시장개척 프로젝트", en: "Market development project" },
    items: { ko: "건축자재 · 엔진오일", en: "Building materials · Engine oil" },
  },
  {
    year: "2016",
    photo: "hcmc",
    place: { ko: "베트남 호치민", en: "Ho Chi Minh City" },
    title: { ko: "해외시장개척 프로젝트", en: "Market development project" },
    items: { ko: "화장품 · 수산물 · 대리석 · 엔진오일", en: "Cosmetics · Seafood · Marble · Engine oil" },
  },
] as const;

/** 메인 — 다뤄 온 품목·분야 (연혁·의뢰서 기준) */
export const INDUSTRIES = [
  { icon: "sparkle", label: { ko: "화장품", en: "Cosmetics" } },
  { icon: "medical", label: { ko: "의료기기", en: "Medical devices" } },
  { icon: "building", label: { ko: "건축자재", en: "Building materials" } },
  { icon: "drop", label: { ko: "엔진오일", en: "Engine oil" } },
  { icon: "fish", label: { ko: "수산물", en: "Seafood" } },
  { icon: "gem", label: { ko: "대리석", en: "Marble" } },
  { icon: "shirt", label: { ko: "의류", en: "Apparel" } },
  { icon: "traffic", label: { ko: "교통 시스템(ITS)", en: "Transport systems (ITS)" } },
  { icon: "code", label: { ko: "소프트웨어", en: "Software" } },
  { icon: "chain", label: { ko: "블록체인", en: "Blockchain" } },
] as const;
