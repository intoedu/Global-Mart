import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContact } from "@/components/FloatingContact";
import { getLocale } from "@/lib/i18n";
import { getViewer, isSupabaseConfigured } from "@/lib/data";
import { SITE } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const title = locale === "ko" ? "글로벌마트 | 해외지사대행 · 해외시장개척" : "Globalmart | Overseas Branch Agency & Market Entry";
  const description =
    locale === "ko"
      ? "해외시장진출은 글로벌마트와 함께. 해외지사대행, 해외시장조사, 해외바이어 발굴, 소프트웨어 해외진출까지 현지 전문 인력이 함께합니다."
      : "Go global with Globalmart: overseas branch agency, market research, buyer discovery and software export, delivered by local specialists.";
  return {
    metadataBase: new URL(SITE.url),
    title: { default: title, template: locale === "ko" ? "%s | 글로벌마트" : "%s | Globalmart" },
    description,
    openGraph: { title, description, siteName: "Globalmart", type: "website", locale: locale === "ko" ? "ko_KR" : "en_US" },
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0f1830",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const viewer = await getViewer();
  const user = viewer
    ? { name: viewer.profile?.name || viewer.email, isAdmin: viewer.isAdmin }
    : null;

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
          {locale === "ko" ? "본문 바로가기" : "Skip to content"}
        </a>
        <Header locale={locale} user={user} authEnabled={isSupabaseConfigured} />
        <main id="main">{children}</main>
        <Footer locale={locale} />
        <FloatingContact locale={locale} />
      </body>
    </html>
  );
}
