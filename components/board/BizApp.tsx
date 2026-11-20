"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { REGION_MAP, bizCategoryLabel, isRegionId } from "@/lib/regions";
import { adjacentOf, listKey } from "@/lib/board";
import { bizPostsOf } from "@/lib/biz";
import { lp } from "@/lib/paths";
import type { Locale } from "@/lib/i18n";
import type { BizData } from "@/lib/types";
import { Icon } from "../Icon";
import { BizBoard } from "./BizBoard";
import { LockGate } from "./LockGate";
import { PostView } from "./PostView";
import { AttachmentList, SecureBody } from "./SecureContent";
import { useVault } from "./useVault";

/**
 * 해외 Biz정보 — 회원 전용
 * 글은 회원 비밀번호로 암호화된 public/data/biz.json 에 있고, 비밀번호를 넣은 뒤 브라우저에서 풀어 보여 줍니다.
 * 목록: /biz/?region=…  · 글 보기: /biz/?post=번호
 */
export function BizApp({ locale }: { locale: Locale }) {
  const ko = locale === "ko";
  const t = (l: { ko: string; en: string }) => l[locale];
  const sp = useSearchParams();
  const router = useRouter();
  const { data, state, error, unlock, lock } = useVault<BizData>("biz", ko);
  const posts = useMemo(() => (data ? bizPostsOf(data) : []), [data]);
  const postId = Number(sp.get("post") ?? 0);
  const topRef = useRef<HTMLDivElement>(null);

  // 목록 아래쪽에서 글을 열면 글 머리가 보이도록
  useEffect(() => {
    const el = topRef.current;
    if (postId && el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
  }, [postId]);

  if (!data) return <BizGate locale={locale} state={state} error={error} onSubmit={(pw) => unlock(pw)} />;

  const lockButton = (
    <button
      type="button"
      onClick={() => {
        lock();
        router.push(lp(locale, "/biz"));
      }}
      className="btn-ghost"
    >
      <Icon name="lock" className="size-4" /> {ko ? "나가기 (잠금)" : "Lock & leave"}
    </button>
  );

  const post = postId ? posts.find((p) => p.id === postId) : null;
  if (post) {
    const regionLabel = isRegionId(post.region) ? t(REGION_MAP[post.region].label) : post.region;
    const contentLang = ko ? undefined : "ko";
    return (
      <div ref={topRef} className="scroll-mt-(--header-h)">
        <PostView
          title={post.title}
          body={post.body}
          createdAt={post.created_at}
          pinned={post.is_pinned}
          ko={ko}
          locale={locale}
          titleAs="h2"
          contentLang={contentLang}
          badge={t(bizCategoryLabel(post.category))}
          meta={[
            { label: ko ? "지역" : "Region", value: regionLabel },
            { label: ko ? "주 / 국가" : "State / Country", value: post.country },
          ]}
          listHref={post.region !== "all" ? `${lp(locale, "/biz")}?region=${post.region}` : lp(locale, "/biz")}
          listStorageKey={listKey("biz", locale)}
          adjacent={adjacentOf(posts, post.id)}
          detailHref={(pid) => lp(locale, `/biz?post=${pid}`)}
          bodySlot={<SecureBody body={post.body} files={post.files} keys={data.file_keys} ko={ko} />}
          afterBody={<AttachmentList files={post.files} body={post.body} keys={data.file_keys} ko={ko} />}
          footer={lockButton}
        />
      </div>
    );
  }

  return (
    <div ref={topRef} className="pb-section-sm pt-10 lg:pt-14">
      {postId > 0 && (
        <p role="status" className="container-x mb-6">
          <span className="block rounded-xl bg-orange/15 px-4 py-3 text-sm text-orange-ink">
            {ko ? "찾으시는 글이 없습니다. 삭제되었거나 주소가 잘못되었을 수 있습니다." : "This post could not be found. It may have been deleted."}{" "}
            <Link href={lp(locale, "/biz")} className="font-semibold underline">
              {ko ? "목록 보기" : "View list"}
            </Link>
          </span>
        </p>
      )}
      <BizBoard posts={posts} locale={locale} footer={lockButton} />
    </div>
  );
}

function BizGate({ locale, state, error, onSubmit }: { locale: Locale; state: string; error: string; onSubmit: (pw: string) => void }) {
  const ko = locale === "ko";
  return (
    <LockGate
      locale={locale}
      state={state}
      error={error}
      onSubmit={onSubmit}
      inputId="biz-pw"
      badge={ko ? "회원 전용" : "Members only"}
      title={ko ? "해외 Biz정보는 회원 전용입니다" : "Global Biz Info is for members only"}
      text={
        ko
          ? "해외입찰·해외시장 정보는 로그인한 회원만 볼 수 있습니다. 글로벌마트에서 안내받은 회원 비밀번호를 입력해 주세요."
          : "Overseas tender and market information is available to members only. Please enter the member password provided by Globalmart."
      }
    />
  );
}

/** 정적 HTML(자바스크립트 실행 전)에 들어가는 화면 — 비밀번호 입력 화면 (글 내용 없음) */
export function BizFallback({ locale }: { locale: Locale }) {
  return <BizGate locale={locale} state="init" error="" onSubmit={() => {}} />;
}
