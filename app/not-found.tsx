import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[70vh] flex-col items-center justify-center pt-20 text-center">
      <p className="text-7xl font-black text-brand/20">404</p>
      <h1 className="mt-4 text-2xl font-extrabold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-muted">Page not found</p>
      <Link href="/" className="btn-primary mt-8">홈으로 / Home</Link>
    </section>
  );
}
