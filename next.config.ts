import type { NextConfig } from "next";

/**
 * GitHub Pages 정적 배포
 * - 프로젝트 페이지 주소(https://intoedu.github.io/Global-Mart/)에 맞춰 basePath 를 사용합니다.
 * - 나중에 globalmart21.com 같은 자체 도메인을 연결하면 NEXT_PUBLIC_BASE_PATH 를 빈 값으로 빌드하세요.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
