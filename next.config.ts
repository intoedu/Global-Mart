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
  images: {
    // 정적 배포: Next 이미지 서버 대신 lib/image-loader.ts 가 Unsplash 주소에 폭(w)을 붙여 srcset 을 만듭니다.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    deviceSizes: [480, 640, 828, 1080, 1280, 1600, 1920, 2560],
    imageSizes: [64, 128, 256, 384],
  },
  experimental: {
    // [lang] 이 최상위 레이아웃이라 404 화면은 app/global-not-found.tsx 로 따로 만듭니다.
    globalNotFound: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
