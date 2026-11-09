import { Icon } from "../Icon";

/** GET 폼 기반 검색 (JS 없이도 동작) */
export function SearchBar({
  action,
  q,
  hidden,
  placeholder,
  children,
}: {
  action: string;
  q?: string;
  hidden?: Record<string, string | undefined>;
  placeholder: string;
  children?: React.ReactNode;
}) {
  return (
    <form action={action} method="get" className="flex flex-col gap-2 sm:flex-row">
      {Object.entries(hidden ?? {}).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      {children}
      <div className="relative flex-1">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input name="q" defaultValue={q} placeholder={placeholder} className="input !rounded-full !py-2.5 !pl-11" maxLength={50} />
      </div>
    </form>
  );
}
