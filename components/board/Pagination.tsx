import Link from "next/link";
import { Icon } from "../Icon";

export function Pagination({ page, total, pageSize, makeHref }: { page: number; total: number; pageSize: number; makeHref: (p: number) => string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const nums = Array.from({ length: Math.min(5, pages) }, (_, i) => start + i);
  const cls = "grid size-10 place-items-center rounded-full text-sm font-semibold transition";
  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
      {page > 1 && (
        <Link href={makeHref(page - 1)} className={`${cls} text-muted hover:bg-paper`} aria-label="Previous page">
          <Icon name="chevron-left" className="size-4" />
        </Link>
      )}
      {nums.map((n) => (
        <Link
          key={n}
          href={makeHref(n)}
          aria-current={n === page ? "page" : undefined}
          className={`${cls} ${n === page ? "bg-ink text-white" : "text-ink-3 hover:bg-paper"}`}
        >
          {n}
        </Link>
      ))}
      {page < pages && (
        <Link href={makeHref(page + 1)} className={`${cls} text-muted hover:bg-paper`} aria-label="Next page">
          <Icon name="chevron-right" className="size-4" />
        </Link>
      )}
    </nav>
  );
}
