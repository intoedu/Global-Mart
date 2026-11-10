import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, getT } from "@/lib/i18n";
import { REGION_MAP, bizCategoryLabel, isRegionId } from "@/lib/regions";
import { getAdjacent, getBizPost, getBizPosts } from "@/lib/biz";
import { lp } from "@/lib/paths";
import { PageHero } from "@/components/PageHero";
import { PostView } from "@/components/board/PostView";
import { listKey } from "@/lib/board";

type P = { params: Promise<{ lang: string; id: string }> };

export const dynamicParams = false;

/** 글마다 정적 페이지 생성 (글이 하나도 없을 때도 빌드되도록 0번 자리 유지) */
export function generateStaticParams() {
  const ids = getBizPosts().map((p) => String(p.id));
  return LOCALES.flatMap((lang) => (ids.length ? ids : ["0"]).map((id) => ({ lang, id })));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const post = getBizPost(Number((await params).id));
  return { title: post?.title ?? "Not found", description: post?.body.slice(0, 120) };
}

export default async function BizPostPage({ params }: P) {
  const { lang, id } = await params;
  const { locale, ko, t } = getT(lang);
  const post = getBizPost(Number(id));
  if (!post) notFound();
  const regionLabel = isRegionId(post.region) ? t(REGION_MAP[post.region].label) : post.region;

  return (
    <>
      <PageHero titleAs="p" locale={locale} image="mumbai" eyebrow="Global Biz Info" title={ko ? "해외 Biz정보" : "Global Biz Info"} crumbs={[{ href: "/biz", label: ko ? "해외 Biz정보" : "Global Biz Info" }, { label: regionLabel }]} />
      <PostView
        title={post.title}
        body={post.body}
        createdAt={post.created_at}
        pinned={post.is_pinned}
        ko={ko}
        locale={locale}
        contentLang={ko ? undefined : "ko"}
        badge={t(bizCategoryLabel(post.category))}
        meta={[
          { label: ko ? "지역" : "Region", value: regionLabel },
          { label: ko ? "주 / 국가" : "State / Country", value: post.country },
        ]}
        listHref={post.region !== "all" ? `${lp(locale, "/biz")}?region=${post.region}` : lp(locale, "/biz")}
        listStorageKey={listKey("biz", locale)}
        adjacent={getAdjacent(post.id)}
        detailHref={(pid) => lp(locale, `/biz/${pid}`)}
      />
    </>
  );
}
