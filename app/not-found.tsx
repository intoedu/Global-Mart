import { BASE_PATH } from "@/lib/paths";

export default function NotFound() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-black text-brand/20">404</p>
      <h1 className="mt-4 text-2xl font-extrabold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-muted">Page not found</p>
      <a href={`${BASE_PATH}/ko/`} className="btn-primary mt-8">
        홈으로 / Home
      </a>
    </section>
  );
}
