import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getT } from "@/lib/i18n";
import { getAdjacent, getPost, getViewer } from "@/lib/data";
import { residentAccess } from "@/lib/resident-access";
import { PageHero } from "@/components/PageHero";
import { PostView } from "@/components/board/PostView";
import { ResidentGate } from "@/components/board/ResidentGate";

export const metadata: Metadata = { robots: { index: false } };

export default async function ResidentPostPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const { locale } = await getT();
  const ko = locale === "ko";
  const viewer = await getViewer();
  const hero = (
    <PageHero image="warehouse" eyebrow="For Overseas Staff" title={ko ? "해외주재원 전용" : "For Overseas Staff"} crumbs={[{ href: "/resident", label: ko ? "해외주재원 전용" : "For Overseas Staff" }]} />
  );
  // DB 미연결(미리보기)에서는 예시 공개. 운영 시에는 공용 비밀번호 입장 또는 관리자만 열람
  const access = await residentAccess(!!viewer?.isAdmin);
  if (access === "locked" || access === "unset") {
    return (
      <>
        {hero}
        <ResidentGate ko={ko} next={`/resident/${id}`} unset={access === "unset"} />
      </>
    );
  }
  const post = await getPost("resident", id);
  if (!post) notFound();
  const adjacent = await getAdjacent("resident", post);
  return (
    <>
      {hero}
      <PostView
        post={post}
        ko={ko}
        badge={post.category || undefined}
        meta={[
          { label: ko ? "회사명" : "Company", value: post.company },
          { label: ko ? "게시자" : "Author", value: post.author_name },
        ]}
        listHref="/resident"
        adjacent={adjacent}
        editHref={viewer?.isAdmin ? `/admin/posts/${post.id}` : undefined}
      />
    </>
  );
}
