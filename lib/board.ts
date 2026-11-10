/**
 * 게시판 목록에서 마지막으로 보던 주소(지역·종류·검색·페이지)를 이 탭(sessionStorage)에 기억해 두는 열쇠.
 * BizBoard 가 쓰고, 글 상세의 '목록' 버튼(components/board/BackToList)이 읽습니다.
 */
export const listKey = (board: "biz" | "resident", locale: string) => `gm_list_${board}_${locale}`;

/** 목록 주소 기억 (브라우저에서만 호출) */
export function rememberList(key: string, href: string) {
  try {
    sessionStorage.setItem(key, href);
  } catch {}
}
