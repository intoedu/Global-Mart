import { sortPosts } from "./board";
import type { BizData, BizPost } from "./types";

/**
 * 해외 Biz정보 (회원 전용)
 * 글은 public/data/biz.json 에 회원 비밀번호로 암호화되어 있고, 브라우저에서 비밀번호를 넣은 뒤에만 풀립니다.
 * 빌드 시점에 글 내용을 읽지 않으므로 정적 HTML 에는 글 제목·내용이 들어가지 않습니다.
 */
export function bizPostsOf(data: BizData): BizPost[] {
  return sortPosts(data.posts ?? []);
}
