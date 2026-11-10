// "use client" 를 붙이지 않음: 서버 컴포넌트의 getImageProps(PageHero)에서도 호출하기 때문
import { unsplashUrl } from "./photos";

/**
 * next/image 사용자 정의 로더 (정적 배포라 Next 이미지 최적화 서버가 없음)
 * - Unsplash 사진: 화면에 필요한 폭(w)만 받아 오도록 주소를 바꿉니다 → srcset 이 생겨 sizes 가 제대로 동작
 * - 그 밖의 이미지(로고 등 public 파일): 주소를 그대로 씁니다.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.startsWith("https://images.unsplash.com/")) {
    const q = quality ?? Number(new URL(src).searchParams.get("q") || 70);
    return unsplashUrl(src, width, q);
  }
  return src;
}
