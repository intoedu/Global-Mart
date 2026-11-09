import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getT } from "@/lib/i18n";
import { REGION_MAP, bizCategoryLabel, isRegionId } from "@/lib/regions";
import { getAdjacent, getPost, getViewer } from "@/lib/data";
import { PageHero } from "@/components/PageHero";
import { PostView } from "@/components/board/PostView";

type P = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const post = await getPost("biz", Number((await params).id));
  return { title: post?.title ?? "Not found", description: post?.body.slice(0, 120) };
}

export default async function BizPostPage({ params }: { params: P }) {
  const id = Number((await params).id);
  const { locale, t } = await getT();
  const ko = locale === "ko";
  const post = await getPost("biz", id);
  if (!post) notFound();
  const [adjacent, viewer] = await Promise.all([getAdjacent("biz", post), getViewer()]);
  const regionLabel = isRegionId(post.region) ? t(REGION_MAP[post.region].label) : post.region;

  return (
    <>
      <PageHero eyebrow="Global Biz Info" title={ko ? "해외 Biz정보" : "Global Biz Info"} crumbs={[{ href: "/biz", label: ko ? "해외 Biz정보" : "Global Biz Info" }, { label: regionLabel }]} />
      <PostView
        post={post}
        ko={ko}
        badge={t(bizCategoryLabel(post.category))}
        meta={[
          { label: ko ? "지역" : "Region", value: regionLabel },
          { label: ko ? "주 / 국가" : "State / Country", value: post.country },
        ]}
        listHref={post.region !== "all" ? `/biz?region=${post.region}` : "/biz"}
        adjacent={adjacent}
        editHref={viewer?.isAdmin ? `/admin/posts/${post.id}` : undefined}
      />
    </>
  );
}
