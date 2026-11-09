import { PostForm } from "@/components/admin/PostForm";

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ board?: string; region?: string }> }) {
  const sp = await searchParams;
  return (
    <>
      <h1 className="mb-6 text-2xl font-extrabold">새 글 등록</h1>
      <PostForm defaults={sp} />
    </>
  );
}
