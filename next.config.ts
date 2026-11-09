import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    // 기존 사이트(globalmart21.com/default/...) 주소로 들어오는 방문자를 새 페이지로 연결
    const map: Record<string, string> = {
      "00/01": "/",
      "01/01": "/company/greeting",
      "01/02": "/company/history",
      "01/03": "/company/partners",
      "01/04": "/company/location",
      "02/01": "/offices",
      "02/02": "/offices",
      "03/01": "/business/agency",
      "03/02": "/business/research",
      "03/03": "/business/buyers",
      "03/04": "/business/branch",
      "04/01": "/business/software",
      "04/02": "/business/software#messenger",
      "04/03": "/business/software#blockchain",
      "04/04": "/business/software#various",
      "05/01": "/contact",
    };
    return Object.entries(map).map(([from, to]) => ({
      source: `/default/${from}.php`,
      destination: to,
      permanent: true,
    }));
  },
};

export default nextConfig;
