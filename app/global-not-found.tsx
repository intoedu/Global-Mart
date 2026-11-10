import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FontLoader } from "@/components/FontLoader";
import { BASE_PATH, asset } from "@/lib/paths";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다 · Page not found | 글로벌마트",
  robots: { index: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

/**
 * 없는 주소(404) 화면 — GitHub Pages 가 out/404.html 로 보여 줍니다.
 * 최상위 레이아웃이 언어별([lang])이라 이 파일이 <html> 부터 직접 그립니다. (한국어 + English 함께 표시)
 */
export default function GlobalNotFound() {
  const ko = `${BASE_PATH}/ko/`;
  const en = `${BASE_PATH}/en/`;
  return (
    <html lang="ko">
      <head>
        <FontLoader />
      </head>
      <body className="flex min-h-svh flex-col bg-paper">
        <header className="border-b border-line bg-white">
          <div className="container-x flex h-(--header-h) items-center">
            <a href={ko} className="flex shrink-0 items-center" aria-label={SITE.name.ko}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/images/logo-full.webp")} alt={SITE.name.ko} width={400} height={80} className="h-7 w-auto lg:h-8 3xl:h-9" />
            </a>
          </div>
        </header>
        <main id="main" className="container-x flex flex-1 flex-col items-center justify-center py-section-sm text-center">
          <p aria-hidden className="text-[clamp(72px,8vw+2rem,168px)] font-black leading-none tracking-tight text-ink/10">
            404
          </p>
          <h1 className="mt-4 text-h2 text-ink">페이지를 찾을 수 없습니다</h1>
          <p className="mt-2 text-lead text-muted" lang="en">
            Page not found
          </p>
          <p className="mt-4 max-w-[36em] text-body text-ink-3">
            주소가 바뀌었거나 삭제된 페이지입니다.{" "}
            <span lang="en">The page may have moved or no longer exists.</span>
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={ko} className="btn-primary">
              홈으로
            </a>
            <a href={en} className="btn-ghost" lang="en">
              English home
            </a>
          </div>
        </main>
        <footer className="bg-ink text-white/60">
          <div className="container-stripes" aria-hidden />
          <div className="container-x py-8 text-caption">
            {SITE.name.ko} · Tel <span className="whitespace-nowrap">{SITE.tel}</span> ·{" "}
            <a href={`mailto:${SITE.email}`} className="hover:text-white">
              {SITE.email}
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
