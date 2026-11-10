import type { Metadata, Viewport } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url + "/"),
  title: "글로벌마트 Globalmart",
  alternates: { canonical: `${SITE.url}/ko/` },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

/** 루트(/) 이동 페이지 전용 최상위 레이아웃 — 사이트 화면은 app/[lang]/layout.tsx */
export default function RootRedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
