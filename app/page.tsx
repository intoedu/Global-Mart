import { BASE_PATH } from "@/lib/paths";

/** 루트(/) → 한국어 메인(/ko/)으로 이동 (영어는 상단 EN 버튼) */
export default function RootRedirect() {
  const ko = `${BASE_PATH}/ko/`;
  const en = `${BASE_PATH}/en/`;
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${ko}`} />
      <script dangerouslySetInnerHTML={{ __html: `location.replace("${ko}")` }} />
      <p style={{ padding: 40, fontFamily: "sans-serif" }}>
        <a href={ko}>글로벌마트 홈페이지로 이동</a> · <a href={en}>English</a>
      </p>
    </>
  );
}
