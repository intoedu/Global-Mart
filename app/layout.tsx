import type { Viewport } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";

export const metadata = { metadataBase: new URL(SITE.url + "/") };

export const viewport: Viewport = {
  themeColor: "#0f1830",
  width: "device-width",
  initialScale: 1,
};

/** 최상위 레이아웃 — 언어별 화면은 app/[lang]/layout.tsx */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* 주소의 언어(/en/...)에 맞춰 문서 언어 표시 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if(/\\/en(\\/|$)/.test(location.pathname))document.documentElement.lang="en";`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
