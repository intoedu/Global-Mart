import type { Attachment, ResidentBoard, ResidentData, ResidentPost } from "./types";

/**
 * 게시판 목록에서 마지막으로 보던 주소(지역·종류·검색·페이지)를 이 탭(sessionStorage)에 기억해 두는 열쇠.
 * 목록 화면이 쓰고, 글 상세의 '목록' 버튼(components/board/BackToList)이 읽습니다.
 */
export const listKey = (board: "biz" | "resident", locale: string) => `gm_list_${board}_${locale}`;

/** 목록 주소 기억 (브라우저에서만 호출) */
export function rememberList(key: string, href: string) {
  try {
    sessionStorage.setItem(key, href);
  } catch {}
}

/** 회원 전용 게시판의 암호화 데이터 파일 (public 아래 경로 · 저장소 경로) */
export const BOARD_FILES = {
  biz: { web: "/data/biz.json", repo: "public/data/biz.json", files: "data/files/biz" },
  resident: { web: "/data/resident.json", repo: "public/data/resident.json", files: "data/files/resident" },
} as const;

/** 이 탭에 기억해 두는 비밀번호 열쇠 (창을 닫으면 사라짐) */
export const PW_KEY = { biz: "gm_biz_pw", resident: "gm_resident_pw" } as const;

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

/** 해외주재원 전용 게시판 구분 */
export const RESIDENT_BOARDS: { id: ResidentBoard; label: { ko: string; en: string } }[] = [
  { id: "items", label: { ko: "국내기업 아이템", en: "Korean Company Items" } },
  { id: "notice", label: { ko: "주재원공지", en: "Staff Notices" } },
];
export const residentBoardOf = (p: ResidentPost): ResidentBoard => (p.board === "notice" ? "notice" : "items");

/** 예전 resident.json(글에 board 가 없음)도 읽히도록 정리 */
export function normalizeResident(data: ResidentData): ResidentData {
  return { ...data, posts: (data.posts ?? []).map((p) => ({ ...p, board: residentBoardOf(p) })) };
}
