import type { L } from "./i18n";
import type { Attachment, BoardCategory, BoardData, BoardPost } from "./types";

/**
 * 해외Biz정보(해외주재원 전용) — 회원 전용 통합 게시판 (회원 비밀번호 하나로 모든 카테고리 이용)
 */
export type BoardCategoryInfo = { id: BoardCategory; label: L; regional: boolean; intro: L };

/** 카테고리 (메뉴 순서). regional: 나라별 게시판(지역 탭 + 국가 머리말) */
export const BOARD_CATEGORIES: BoardCategoryInfo[] = [
  {
    id: "market",
    label: { ko: "해외시장", en: "Overseas markets" },
    regional: true,
    intro: { ko: "나라별 해외시장 정보입니다.", en: "Overseas market information by country." },
  },
  {
    id: "tender",
    label: { ko: "해외입찰", en: "Overseas tenders" },
    regional: true,
    intro: { ko: "나라별 해외입찰 정보입니다.", en: "Overseas tender information by country." },
  },
  {
    id: "items",
    label: { ko: "국내우수 Item", en: "Korean Featured Items" },
    regional: false,
    intro: { ko: "글로벌마트와 연결된 국내 기업들과 그 우수 아이템입니다.", en: "Korean companies connected with Globalmart and their featured items." },
  },
  {
    id: "notice",
    label: { ko: "공지", en: "Notices" },
    regional: false,
    intro: { ko: "글로벌마트 본사에서 해외주재원에게 전하는 공지사항입니다.", en: "Notices from the Globalmart head office to our overseas staff." },
  },
];

export const CATEGORY_MAP = Object.fromEntries(BOARD_CATEGORIES.map((c) => [c.id, c])) as Record<BoardCategory, BoardCategoryInfo>;

export function isCategory(v: unknown): v is BoardCategory {
  return typeof v === "string" && v in CATEGORY_MAP;
}

/** 나라별 게시판(해외시장·해외입찰)인지 */
export const isRegional = (c: BoardCategory) => CATEGORY_MAP[c].regional;

/**
 * 예전 주소·데이터의 구분 이름 → 새 카테고리
 * - 예전 해외 Biz정보: industry(해외시장) · inquiry(해외입찰)
 * - 예전 해외주재원 전용: items(국내기업 아이템) · notice(주재원공지) · software(소프트웨어 무역 → 국내우수 Item 글)
 */
export const LEGACY_CATEGORY: Record<string, BoardCategory> = {
  industry: "market",
  inquiry: "tender",
  market: "market",
  tender: "tender",
  items: "items",
  notice: "notice",
  software: "items",
};

/**
 * 게시판 목록에서 마지막으로 보던 주소(카테고리·지역·검색·페이지)를 이 탭(sessionStorage)에 기억해 두는 열쇠.
 * 목록 화면이 쓰고, 글 상세의 '목록' 버튼(components/board/BackToList)이 읽습니다.
 */
export const listKey = (locale: string) => `gm_list_biz_${locale}`;

/** 목록 주소 기억 (브라우저에서만 호출) */
export function rememberList(key: string, href: string) {
  try {
    sessionStorage.setItem(key, href);
  } catch {}
}

/** 회원 전용 게시판의 암호화 데이터 파일 (public 아래 경로 · 저장소 경로 · 첨부 파일 폴더) */
export const BOARD_FILE = { web: "/data/biz.json", repo: "public/data/biz.json", files: "data/files/biz" } as const;

/** 관리자 토큰(아이디·비밀번호로 암호화) 파일 */
export const ADMIN_FILE = { web: "/data/admin.json", repo: "public/data/admin.json" } as const;

/** 이 탭에 기억해 두는 회원 비밀번호 열쇠 (창을 닫으면 사라짐) */
export const PW_KEY = "gm_biz_pw";
/** 예전 해외주재원 전용 게시판의 열쇠 — 회원 비밀번호가 바뀌어 더 이상 쓰지 않으므로, 남아 있으면 지웁니다. */
export const LEGACY_PW_KEY = "gm_resident_pw";

/** 첨부 파일 한 개의 최대 크기 */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_FILE_LABEL = "10MB";

/** 본문 이미지 자리 표시: [[image:파일id]] */
export const IMAGE_TOKEN = /\[\[image:([A-Za-z0-9_-]+)\]\]/g;
export const imageToken = (id: string) => `[[image:${id}]]`;

/** 본문에 자리 표시가 있는 이미지 id 목록 */
export function inlineIds(body: string) {
  return new Set(Array.from(body.matchAll(IMAGE_TOKEN), (m) => m[1]));
}

/** 목록에 보일 첨부 파일: 본문 이미지가 아닌 것 + 본문에서 자리 표시가 빠진 이미지 */
export function listedFiles(files: Attachment[] | undefined, body: string) {
  const used = inlineIds(body);
  return (files ?? []).filter((f) => !(f.inline && used.has(f.id)));
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 102.4) / 10} KB`;
  return `${Math.round(n / (1024 * 104.8576)) / 10} MB`;
}

/** 공지(고정) 먼저, 그다음 최신 글 */
export function sortPosts<T extends { is_pinned: boolean; created_at: string }>(posts: T[]) {
  return [...posts].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.created_at.localeCompare(a.created_at));
}

/** 이전·다음 글 (게시일 기준) */
export function adjacentOf<T extends { id: number; created_at: string }>(posts: T[], id: number) {
  const list = [...posts].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const i = list.findIndex((p) => p.id === id);
  return { newer: i > 0 ? list[i - 1] : null, older: i >= 0 ? (list[i + 1] ?? null) : null };
}

/**
 * 글 한 개를 새 형식으로 정리 — 예전 해외 Biz정보 글(category: industry/inquiry)·
 * 예전 해외주재원 전용 글(board: items/notice, category = 종류)도 읽히도록.
 */
export function normalizePost(raw: BoardPost & { board?: string }): BoardPost {
  const p = { ...raw };
  if (raw.board !== undefined) {
    // 예전 해외주재원 전용 글: category 칸이 '종류'였음
    if (raw.kind === undefined && raw.category && !isCategory(raw.category)) p.kind = raw.category;
    p.category = raw.board === "notice" ? "notice" : "items";
    delete (p as { board?: string }).board;
  } else if (!isCategory(raw.category)) {
    p.category = LEGACY_CATEGORY[raw.category as string] ?? "market";
  }
  if (isRegional(p.category)) p.region = p.region || "all";
  return p;
}

export function normalizeBoard(data: BoardData): BoardData {
  return { ...data, posts: (data.posts ?? []).map((p) => normalizePost(p)) };
}

/** 카테고리 이름 */
export const categoryLabel = (c: BoardCategory): L => CATEGORY_MAP[c]?.label ?? { ko: c, en: c };
