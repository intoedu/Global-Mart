import type { Metadata } from "next";
import { getT, type LangParams } from "@/lib/i18n";
import { lp } from "@/lib/paths";
import { BUYERS } from "@/lib/content";
import { BusinessShell } from "@/components/BusinessShell";
import { Icon } from "@/components/Icon";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: (await params).lang === "ko" ? "해외바이어발굴" : "Buyer Discovery" };
}

export default async function BuyersPage({ params }: LangParams) {
  const { locale, t } = getT((await params).lang);
  const ko = locale === "ko";
  return (
    <BusinessShell image="handshake" locale={locale} current="/business/buyers" eyebrow="The Discovery of Overseas Buyers" lead={t(BUYERS.lead)}>
      <section className="py-16 lg:py-24">
        <div className="container-x">
          <ol className="relative grid gap-4 lg:grid-cols-4">
            {BUYERS.steps.map((s, i) => (
              <li key={i} data-reveal style={{ "--d": `${i * 0.12}s` } as React.CSSProperties} className="relative rounded-2xl border border-line p-7">
                <span className="text-5xl font-black text-ink/10">0{i + 1}</span>
                <h3 className="mt-2 text-lg font-bold">{t(s.title)}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{t(s.body)}</p>
                {i < BUYERS.steps.length - 1 && (
                  <span className="absolute -right-3 top-1/2 z-10 hidden size-6 -translate-y-1/2 place-items-center rounded-full bg-ink text-white lg:grid">
                    <Icon name="chevron-right" className="size-3.5" strokeWidth={2.5} />
                  </span>
                )}
              </li>
            ))}
          </ol>
          <div className="mt-6 flex items-start gap-4 rounded-2xl bg-ink p-7 text-white">
            <Icon name="handshake" className="mt-0.5 size-6 shrink-0 text-orange" />
            <div>
              <p className="font-bold">{ko ? "계약 체결까지 동행" : "With you until the contract is signed"}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-white/70">{t(BUYERS.outro)}</p>
            </div>
          </div>
        </div>
      </section>
    </BusinessShell>
  );
}
