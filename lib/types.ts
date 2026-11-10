/** 해외 Biz정보 글 — data/biz.json */
export type BizPost = {
  id: number;
  category: "industry" | "inquiry";
  region: string; // lib/regions.ts 의 지역 id ('all' 은 모든 지역에 표시)
  country: string; // 주 또는 국가
  title: string;
  body: string;
  author_name: string; // 목록에서는 숨김
  is_pinned: boolean;
  created_at: string; // ISO 날짜
};

/** 해외주재원 전용 글 — public/data/resident.json (공용 비밀번호로 암호화) */
export type ResidentPost = {
  id: number;
  category: string; // 종류
  company: string; // 회사명
  title: string;
  body: string;
  author_name: string; // 게시자
  is_pinned: boolean;
  created_at: string;
};

/**
 * data/biz.json 형식
 * - next_id(선택): 다음 새 글 번호. 지운 글의 번호를 다시 쓰지 않도록 관리자 화면이 기록합니다.
 *   예전 파일처럼 없으면 "가장 큰 번호 + 1"을 씁니다.
 */
export type BizData = { posts: BizPost[]; next_id?: number };

/** public/data/resident.json 을 풀었을 때의 내용 (next_id 는 BizData 와 같은 뜻, 선택) */
export type ResidentData = { posts: ResidentPost[]; next_id?: number };

/** 암호화된 파일 형식 */
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
