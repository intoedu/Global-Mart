import type { Metadata } from "next";
import Image from "next/image";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { photo, type PhotoKey } from "@/lib/photos";

const SECTION_PHOTOS: Record<string, PhotoKey> = { messenger: "devices", blockchain: "blockchain", various: "dashboard" };
import { SOFTWARE } from "@/lib/content";
import { BusinessShell } from "@/components/BusinessShell";
import { Icon } from "@/components/Icon";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "소프트웨어 무역" : "Software Trading" };
}

export default async function SoftwarePage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  const ko = locale === "ko";
  return (
    <BusinessShell image="code" locale={locale} current="/business/software" eyebrow="Software Trading" lead={t(SOFTWARE.lead)}>
      <section className="py-section-sm">
        <div className="container-x grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <p className="text-lead text-ink-3">{t(SOFTWARE.lead2)}</p>
          <div className="rounded-2xl bg-paper p-[clamp(24px,1.8vw,36px)]">
            <p className="text-small font-bold text-muted">{ko ? "주요 제안 대상" : "Who we propose to"}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {SOFTWARE.targets.map((x, i) => (
                <li key={i} className="rounded-full bg-white px-3.5 py-1.5 text-small font-semibold text-ink shadow-card">
                  {t(x)}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <nav className="container-x mt-10 flex flex-wrap gap-2" aria-label="Software sections">
          {SOFTWARE.sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="btn-ghost btn-sm">
              {t(s.title)}
            </a>
          ))}
        </nav>
      </section>

      {SOFTWARE.sections.map((s, i) => (
        <section key={s.id} id={s.id} className={`py-section-sm ${i % 2 === 0 ? "bg-paper" : ""}`}>
          <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <div>
              <span className="grid size-12 place-items-center rounded-2xl bg-ink text-white">
                <Icon name="code" className="size-6" />
              </span>
              <h2 className="mt-5 text-[clamp(1.5rem,1.1rem+1vw,2.5rem)] font-extrabold tracking-tight">{t(s.title)}</h2>
              <ul className="mt-6 flex flex-wrap gap-2">
                {s.features.map((f, j) => (
                  <li key={f} className="rounded-lg border border-line bg-white px-3 py-1.5 text-caption font-semibold text-ink-3">
                    {ko ? s.featuresKo[j] ?? f : f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="relative mb-8 aspect-[16/8] overflow-hidden rounded-2xl">
                <Image src={photo(SECTION_PHOTOS[s.id], 1200)} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
              </div>
              <div className="prose-gm text-body">
                {s.paragraphs.map((p, j) => (
                  <p key={j}>{t(p)}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}
    </BusinessShell>
  );
}
