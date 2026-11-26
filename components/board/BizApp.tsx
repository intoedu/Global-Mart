"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { REGION_MAP, isRegionId } from "@/lib/regions";
import { BOARD_CATEGORIES, LEGACY_CATEGORY, adjacentOf, categoryLabel, isCategory, isRegional, listKey, sortPosts } from "@/lib/board";
import { lp } from "@/lib/paths";
import type { Locale } from "@/lib/i18n";
import type { BoardCategory } from "@/lib/types";
import { Icon } from "../Icon";
import { SubNav } from "../SubNav";
import { BizBoard, boardHref } from "./BizBoard";
import { LockGate } from "./LockGate";
import { PostView } from "./PostView";
import { AttachmentList, SecureBody } from "./SecureContent";
import { useVault } from "./useVault";

type Params = URLSearchParams | { get: (k: string) => string | null };

/**
 * 주소에 적힌 카테고리: ?cat=market|tender|items|notice — 적혀 있지 않으면 null
 * 예전 주소도 받습니다: ?category=industry|inquiry (예전 해외 Biz정보)
 */
function explicitView(sp: Params): BoardCategory | null {
  const cat = sp.get("cat");
  if (isCategory(cat)) return cat;
  return LEGACY_CATEGORY[sp.get("category") ?? ""] ?? null;
}

/**
 * 목록 카테고리 — 4차 수정 요청으로 '전체' 탭을 없앴으므로, ?cat 이 없으면(회원로그인 메뉴 /biz,
 * 예전 '전체' 주소, ?region= 만 있는 예전 주소) 해외시장을 엽니다.
 */
export function viewFromParams(sp: Params): BoardCategory {
  return explicitView(sp) ?? "market";
}

/**
 * 해외Biz정보(해외주재원 전용) — 회원 전용 통합 게시판
 * 글은 회원 비밀번호로 암호화된 public/data/biz.json 에 있고, 비밀번호를 한 번 넣으면 모든 카테고리를 이용합니다.
 * 목록: /biz/?cat=…(&region=…)  · 글 보기: /biz/?post=번호
 */
export function BizApp({ locale }: { locale: Locale }) {
  const ko = locale === "ko";
  const t = (l: { ko: string; en: string }) => l[locale];
  const sp = useSearchParams();
  const router = useRouter();
  const { data, state, error, unlock, lock } = useVault(ko);
  const posts = useMemo(() => sortPosts(data?.posts ?? []), [data]);
  const postId = Number(sp.get("post") ?? 0);
  const post = postId ? (posts.find((p) => p.id === postId) ?? null) : null;
  const view: BoardCategory = post ? post.category : viewFromParams(sp);
  const topRef = useRef<HTMLDivElement>(null);

  // 글을 열어 볼 때는 상단 소개 문구 숨김 (globals.css: html[data-viewing-post])
  const viewing = !!post;
  useEffect(() => {
    if (viewing) document.documentElement.dataset.viewingPost = "";
    return () => {
      delete document.documentElement.dataset.viewingPost;
    };
  }, [viewing]);

  // 목록 아래쪽에서 글을 열면 글 머리가 보이도록
  useEffect(() => {
    const el = topRef.current;
    if (postId && el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
  }, [postId]);

  // 잠금 화면 배지: 카테고리를 골라 들어왔으면 그 이름, 아니면(회원로그인 메뉴 등) 게시판 이름
  if (!data) return <BizGate locale={locale} view={post ? view : (explicitView(sp) ?? undefined)} state={state} error={error} onSubmit={(pw) => unlock(pw)} />;

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

  const tabs = (
    <SubNav
      items={BOARD_CATEGORIES.map((c) => ({ href: lp(locale, `/biz?cat=${c.id}`), label: t(c.label) }))}
      current={`cat=${view}`}
    />
  );

  let content: React.ReactNode;
  if (post) {
    const cat: BoardCategory = post.category;
    const regional = isRegional(cat);
    const regionLabel = post.region && isRegionId(post.region) ? t(REGION_MAP[post.region].label) : (post.region ?? "");
    content = (
      <PostView
        title={post.title}
        body={post.body}
        createdAt={post.created_at}
        pinned={post.is_pinned}
        ko={ko}
        locale={locale}
        titleAs="h2"
        contentLang={ko ? undefined : "ko"}
        badge={t(categoryLabel(cat))}
        meta={
          regional
            ? [
                { label: ko ? "지역" : "Region", value: regionLabel },
                { label: ko ? "주 / 국가" : "State / Country", value: post.country ?? "" },
              ]
            : [
                ...(cat === "items" || cat === "notice" ? [{ label: ko ? "종류" : "Type", value: post.kind ?? "" }] : []),
                ...(cat === "items" ? [{ label: ko ? "회사명" : "Company", value: post.company ?? "" }] : []),
                { label: ko ? "게시자" : "Author", value: post.author_name },
              ]
        }
        listHref={boardHref(locale, { cat, region: regional ? post.region : undefined })}
        listStorageKey={listKey(locale)}
        adjacent={adjacentOf(
          posts.filter((p) => p.category === cat),
          post.id
        )}
        detailHref={(pid) => lp(locale, `/biz?post=${pid}`)}
        bodySlot={<SecureBody body={post.body} files={post.files} keys={data.file_keys} ko={ko} />}
        afterBody={<AttachmentList files={post.files} body={post.body} keys={data.file_keys} ko={ko} />}
        footer={lockButton}
      />
    );
  } else {
    content = (
      <div className="pb-section-sm pt-10 lg:pt-14">
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
        <BizBoard posts={posts.filter((p) => p.category === view)} view={view} locale={locale} footer={lockButton} />
      </div>
    );
  }

  return (
    <div ref={topRef} className="scroll-mt-(--header-h)">
      {tabs}
      {content}
    </div>
  );
}

function BizGate({ locale, view, state, error, onSubmit }: { locale: Locale; view?: BoardCategory; state: string; error: string; onSubmit: (pw: string) => void }) {
  const ko = locale === "ko";
  return (
    <LockGate
      locale={locale}
      state={state}
      error={error}
      onSubmit={onSubmit}
      inputId="biz-pw"
      badge={view ? categoryLabel(view)[locale] : ko ? "해외Biz정보(해외주재원 전용)" : "Global Biz Info (Overseas Staff Only)"}
      title={ko ? "회원 전용" : "Members only"}
      text={
        ko
          ? "해외시장·해외입찰·국내우수 Item·공지는 회원만 볼 수 있습니다. 글로벌마트에서 안내받은 회원 비밀번호를 한 번 입력하면 모든 카테고리를 이용할 수 있습니다."
          : "Overseas markets, overseas tenders, Korean featured items and notices are for members only. Enter the member password provided by Globalmart once to use every category."
      }
    />
  );
}

/** 정적 HTML(자바스크립트 실행 전)에 들어가는 화면 — 비밀번호 입력 화면 (글 내용 없음) */
export function BizFallback({ locale }: { locale: Locale }) {
  return <BizGate locale={locale} state="init" error="" onSubmit={() => {}} />;
}
