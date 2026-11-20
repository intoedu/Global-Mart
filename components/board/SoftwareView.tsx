"use client";

import { unsplashUrl } from "@/lib/photos";
import type { Locale } from "@/lib/i18n";
import type { SoftwareContent } from "@/lib/types";
import { Icon } from "../Icon";

/**
 * 해외주재원 전용 › 소프트웨어 (메뉴 이름은 software.title)
 * 내용은 암호화된 public/data/resident.json 안(software)에 있어, 비밀번호를 넣은 뒤에만 보입니다. (공개 페이지 없음)
 */
export function SoftwareView({ software, locale }: { software?: SoftwareContent; locale: Locale }) {
  const ko = locale === "ko";
  const t = (l: { ko: string; en: string }) => l[locale] || l.ko;
  const list = (l: { ko: string[]; en: string[] }) => (l[locale]?.length ? l[locale] : l.ko);

  if (!software || !software.sections?.length)
    return <p className="container-x py-section-sm text-center text-muted">{ko ? "아직 등록된 내용이 없습니다." : "No content yet."}</p>;

  const targets = list(software.targets);
  return (
    <div>
      <section className="py-section-sm">
        <div className="container-x">
          {software.title && <h2 className="text-h2">{t(software.title)}</h2>}
          <div className={`${software.title ? "mt-6 " : ""}grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start`}>
            <div className="space-y-4">
              <p className="text-lead text-ink">{t(software.lead)}</p>
              {t(software.lead2) && <p className="text-body text-ink-3">{t(software.lead2)}</p>}
            </div>
            {targets.length > 0 && (
              <div className="rounded-2xl bg-paper p-[clamp(24px,1.8vw,36px)]">
                <p className="text-small font-bold text-muted">{ko ? "주요 제안 대상" : "Who we propose to"}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {targets.map((x, i) => (
                    <li key={i} className="rounded-full bg-white px-3.5 py-1.5 text-small font-semibold text-ink shadow-card">
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <nav className="mt-8 flex flex-wrap gap-2" aria-label={ko ? "항목" : "Sections"}>
            {software.sections.map((s) => (
              <a key={s.id} href={`#sw-${s.id}`} className="btn-ghost btn-sm">
                {t(s.title)}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {software.sections.map((s, i) => {
        const features = list(s.features);
        return (
          <section key={s.id} id={`sw-${s.id}`} className={`py-section-sm ${i % 2 === 0 ? "bg-paper" : ""}`}>
            <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
              <div>
                <span className="grid size-12 place-items-center rounded-2xl bg-ink text-white">
                  <Icon name="code" className="size-6" />
                </span>
                <h3 className="mt-5 text-h3 font-extrabold tracking-tight">{t(s.title)}</h3>
                {features.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {features.map((f, j) => (
                      <li key={j} className="rounded-lg border border-line bg-white px-3 py-1.5 text-caption font-semibold text-ink-3">
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                {s.photo && /^https:\/\//.test(s.photo) && (
                  <div className="relative mb-8 aspect-[16/8] overflow-hidden rounded-2xl bg-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={unsplashUrl(s.photo, 1200)} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                  </div>
                )}
                <div className="prose-gm text-body">
                  {list(s.paragraphs).map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
