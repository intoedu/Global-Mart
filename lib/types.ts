import type { L } from "./i18n";

/**
 * 첨부 파일·본문 이미지 (암호화되어 public/data/files/<게시판>/<무작위>.bin 에 저장)
 * - kid: 이 파일을 암호화한 파일 키의 번호 (게시판 데이터의 file_keys 안에 있음)
 * - path: public 아래 경로 (예: "data/files/biz/3f9a….bin") — 저장소 경로는 "public/" + path
 * - inline: 본문 이미지 (본문의 [[image:id]] 자리에 표시). 아니면 첨부 파일 목록에 표시
 */
export type Attachment = {
  id: string;
  kid: string;
  name: string;
  type: string;
  size: number;
  path: string;
  inline?: boolean;
};

/** 해외 Biz정보 글 — public/data/biz.json (회원 비밀번호로 암호화) */
export type BizPost = {
  id: number;
  category: "industry" | "inquiry"; // industry = 해외시장, inquiry = 해외입찰 (id 는 예전 그대로)
  region: string; // lib/regions.ts 의 지역 id ('all' 은 모든 지역에 표시)
  country: string; // 주 또는 국가
  title: string;
  body: string;
  author_name: string; // 목록에서는 숨김
  is_pinned: boolean;
  created_at: string; // ISO 날짜
  files?: Attachment[];
};

/** 해외주재원 전용 게시판 구분 — items: 국내기업 아이템, notice: 주재원공지 */
export type ResidentBoard = "items" | "notice";

/** 해외주재원 전용 글 — public/data/resident.json (공용 비밀번호로 암호화) */
export type ResidentPost = {
  id: number;
  board?: ResidentBoard; // 예전 글에는 없음 → "items"
  category: string; // 종류
  company: string; // 회사명
  title: string;
  body: string;
  author_name: string; // 게시자
  is_pinned: boolean;
  created_at: string;
  files?: Attachment[];
};

/**
 * 첨부 파일을 암호화하는 키 묶음 (암호화된 게시판 데이터 안에만 들어 있음)
 * - 비밀번호를 바꾸면 게시판 데이터만 새 비밀번호로 다시 암호화하고 새 파일 키를 하나 더 만듭니다.
 *   이미 올린 파일은 다시 암호화하지 않습니다(예전 키도 묶음에 남아 있음).
 */
export type KeyRing = { file_keys?: Record<string, string>; current_key?: string };

/** 언어별 문장 목록 */
export type LList = { ko: string[]; en: string[] };

/** 해외주재원 전용 › 소프트웨어 무역 (암호화된 resident.json 안에 저장) */
export type SoftwareSection = { id: string; title: L; paragraphs: LList; features: LList; photo?: string };
/** title: 하위 메뉴 이름(예: "소프트웨어 무역") — 메뉴 이름도 암호화된 데이터 안에 둡니다. */
export type SoftwareContent = { title?: L; lead: L; lead2: L; targets: LList; sections: SoftwareSection[] };

/**
 * public/data/biz.json 을 풀었을 때의 내용
 * - next_id(선택): 다음 새 글 번호. 지운 글의 번호를 다시 쓰지 않도록 관리자 화면이 기록합니다.
 */
export type BizData = { posts: BizPost[]; next_id?: number } & KeyRing;

/** public/data/resident.json 을 풀었을 때의 내용 (예전 파일은 posts 만 있음) */
export type ResidentData = { posts: ResidentPost[]; next_id?: number; software?: SoftwareContent } & KeyRing;

/** 암호화된 파일 형식 (두 게시판 공통) */
export type EncryptedFile = {
  v: 1;
  alg: "AES-GCM";
  kdf: "PBKDF2-SHA256";
  iterations: number;
  salt: string; // base64
  iv: string; // base64
  data: string; // base64 (암호문)
  updated_at: string;
};
