import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostForm } from "@/components/admin/PostForm";
import { deletePost } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import type { Post } from "@/lib/types";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const supabase = await createClient();
  const { data: post } = (await supabase?.from("posts").select("*").eq("id", id).maybeSingle<Post>()) ?? { data: null };
  if (!post) notFound();
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">글 수정</h1>
        <form action={deletePost}>
          <input type="hidden" name="id" value={post.id} />
          <ConfirmButton message="이 글을 삭제할까요? 되돌릴 수 없습니다." className="btn-danger !py-2 !text-sm">
            삭제
          </ConfirmButton>
        </form>
      </div>
      <PostForm post={post} />
    </>
  );
}
