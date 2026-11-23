/**
 * 첨부 파일·본문 이미지 (암호화되어 public/data/files/biz/<무작위>.bin 에 저장)
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

/**
 * 해외Biz정보(해외주재원 전용) 카테고리 — 주소 ?cat=
 * - market: 해외시장 · tender: 해외입찰 (둘 다 나라별 게시판: 지역 탭 + 국가 머리말)
 * - items: 국내우수 Item · notice: 공지 (단일 게시판)
 */
export type BoardCategory = "market" | "tender" | "items" | "notice";

/** 해외Biz정보(해외주재원 전용) 글 — public/data/biz.json (회원 비밀번호로 암호화) */
export type BoardPost = {
  id: number;
  category: BoardCategory;
  /** 해외시장·해외입찰: lib/regions.ts 의 지역 id ('all' 은 모든 지역에 표시) */
  region?: string;
  /** 해외시장·해외입찰: 주 또는 국가 */
  country?: string;
  /** 국내우수 Item: 회사명 */
  company?: string;
  /** 국내우수 Item: 종류 (제품·기술·소프트웨어 등) */
  kind?: string;
  title: string;
  body: string;
  author_name: string; // 해외시장·해외입찰 화면에서는 숨김
  is_pinned: boolean;
  created_at: string; // ISO 날짜
  files?: Attachment[];
};

/**
 * 첨부 파일을 암호화하는 키 묶음 (암호화된 게시판 데이터 안에만 들어 있음)
 * - 비밀번호를 바꾸면 게시판 데이터만 새 비밀번호로 다시 암호화하고 새 파일 키를 하나 더 만듭니다.
 *   이미 올린 파일은 다시 암호화하지 않습니다(예전 키도 묶음에 남아 있음).
 */
export type KeyRing = { file_keys?: Record<string, string>; current_key?: string };

/**
 * public/data/biz.json 을 풀었을 때의 내용
 * - v: 2 = 통합 게시판(카테고리 4개). 예전 형식도 lib/board.ts normalizeBoard 가 읽어 줍니다.
 * - next_id(선택): 다음 새 글 번호. 지운 글의 번호를 다시 쓰지 않도록 관리자 화면이 기록합니다.
 */
export type BoardData = { v?: 2; posts: BoardPost[]; next_id?: number } & KeyRing;

/** 암호화된 파일 형식 (게시판 데이터 · 관리자 토큰 공통) */
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

/** public/data/admin.json — 관리자 아이디·비밀번호로 암호화한 GitHub 토큰 */
export type AdminFile = EncryptedFile & { kind: "admin-token" };
/** admin.json 을 풀었을 때의 내용 */
export type AdminSecret = { token: string; set_at: string };
