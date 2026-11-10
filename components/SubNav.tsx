"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * 섹션 내 하위 메뉴 탭 (검은 막대, 헤더 바로 아래에 붙음)
 * - 바깥 div 의 `subnav` 클래스: globals.css 가 이 막대 높이만큼 scroll-padding 을 늘림 (포커스·#이동 시 가려지지 않게)
 * - 휴대폰·태블릿에서 가로로 넘치면 현재 탭이 보이도록 처음에 스크롤해 두고, 오른쪽 끝을 흐리게 해 더 있다는 것을 알림
 */
export function SubNav({ items, current }: { items: { href: string; label: string }[]; current: string }) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    // 페이지 자체가 세로로 움직이지 않도록 scrollIntoView 대신 scrollLeft 를 직접 지정
    nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
  }, [current]);

  return (
    <div className="subnav sticky top-(--header-h) z-30 bg-ink">
      <div className="container-x">
        <nav
          ref={navRef}
          className="relative -mx-gutter flex gap-1 overflow-x-auto px-[calc(var(--spacing-gutter)-1rem)] [scrollbar-width:none] max-lg:[mask-image:linear-gradient(90deg,#000_88%,transparent)] after:block after:w-10 after:shrink-0 after:content-[''] sm:mx-0 sm:-ml-4 sm:px-0 lg:after:hidden [&::-webkit-scrollbar]:hidden [&_:focus-visible]:outline-sky [&_:focus-visible]:-outline-offset-2"
          aria-label="Section"
        >
          {items.map((i) => {
            const active = i.href.replace(/\/$/, "").endsWith(current);
            return (
              <Link
                key={i.href}
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={`relative shrink-0 px-4 py-3 text-[14px] font-semibold transition sm:py-[clamp(14px,0.7rem+0.3vw,18px)] sm:text-[clamp(15px,0.25vw+11px,17px)] ${
                  active ? "text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {i.label}
                {active && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-accent" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
