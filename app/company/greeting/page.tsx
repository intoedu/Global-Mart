import type { Metadata } from "next";
import Image from "next/image";
import { photo } from "@/lib/photos";
import { getT, getLocale } from "@/lib/i18n";
import { GREETING } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { SectionNav } from "@/components/SectionNav";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getLocale()) === "ko" ? "인사말" : "Greetings" };
}

export default async function GreetingPage() {
  const { locale, t } = await getT();
  const ko = locale === "ko";
  return (
    <>
      <PageHero image="executive"
        eyebrow="Greetings"
        title={ko ? "인사말" : "Greetings"}
        crumbs={[{ label: ko ? "회사소개" : "Company" }, { label: ko ? "인사말" : "Greetings" }]}
      />
      <SectionNav section="/company" current="/company/greeting" locale={locale} />

      <section className="py-16 lg:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div className="lg:sticky lg:top-40 lg:self-start">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image src={photo("towers", 1000)} alt="" fill sizes="(min-width: 1024px) 35vw, 100vw" className="object-cover" />
              <div className="absolute bottom-4 left-4 rounded-2xl bg-white/90 p-3 backdrop-blur">
                <Image src="/images/logo-symbol.png" alt="" width={256} height={240} className="h-10 w-auto" />
              </div>
            </div>
            <h2 className="mt-8 whitespace-pre-line text-3xl font-extrabold leading-snug tracking-tight lg:text-4xl">
              {t(GREETING.headline)}
            </h2>
            <div className="mt-10 grid grid-cols-3 gap-3">
              {GREETING.values.map((v, i) => (
                <div key={i} className="rounded-2xl bg-paper p-4">
                  <p className="text-[15px] font-bold text-brand">{t(v.title)}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{t(v.body)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="prose-gm">
            {GREETING.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "!text-xl font-semibold text-ink" : ""}>
                {t(p)}
              </p>
            ))}
            <p className="!mt-12 border-t border-line pt-8 text-right text-lg font-bold text-ink">{t(GREETING.sign)}</p>
          </div>
        </div>
      </section>
    </>
  );
}
