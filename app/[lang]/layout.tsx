import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContact } from "@/components/FloatingContact";
import { generateLangParams, toLocale } from "@/lib/i18n";

export const generateStaticParams = generateLangParams;
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const title = locale === "ko" ? "글로벌마트 | 해외지사대행 · 해외시장개척" : "Globalmart | Overseas Branch Agency & Market Entry";
  const description =
    locale === "ko"
      ? "해외시장진출은 글로벌마트와 함께. 해외지사대행, 해외시장조사, 해외바이어 발굴, 소프트웨어 해외진출까지 현지 전문 인력이 함께합니다."
      : "Go global with Globalmart: overseas branch agency, market research, buyer discovery and software export, delivered by local specialists.";
  return {
    title: { default: title, template: locale === "ko" ? "%s | 글로벌마트" : "%s | Globalmart" },
    description,
    openGraph: { title, description, siteName: "Globalmart", type: "website", locale: locale === "ko" ? "ko_KR" : "en_US" },
  };
}

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        {locale === "ko" ? "본문 바로가기" : "Skip to content"}
      </a>
      <Header locale={locale} />
      <main id="main">{children}</main>
      <Footer locale={locale} />
      <FloatingContact locale={locale} />
    </>
  );
}
