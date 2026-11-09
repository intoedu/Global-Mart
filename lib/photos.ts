/**
 * 사이트 사진 — Unsplash (무료 상업 이용 가능, https://unsplash.com/license)
 * 각 사진은 내용을 직접 확인한 뒤 골랐습니다. 바꾸려면 id 만 교체하세요.
 */
const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const PHOTOS = {
  port: u("1494412574643-ff11b0a5c1c3"), // 컨테이너 항만 항공사진
  earth: u("1451187580459-43490279c0fa"), // 야간 지구
  meeting: u("1542744173-8e7e53415bb0"), // 회의실 프레젠테이션
  ship: u("1605745341112-85968b19335b"), // 컨테이너선
  tax: u("1554224154-26032ffc0d07"), // 세무 서류·계산기
  analytics: u("1551288049-bebda4e38f71"), // 데이터 차트
  handshake: u("1521791136064-7986c2920216"), // 악수
  towers: u("1486406146926-c627a92ad1ab"), // 오피스 빌딩
  plane: u("1436491865332-7a61a109cc05"), // 비행기 날개
  code: u("1555066931-4365d14bab8c"), // 코드 화면
  blockchain: u("1639762681485-074b7f938ba0"), // 블록체인 3D
  devices: u("1520607162513-77705c0f0d4a"), // 노트북·모바일 결제
  dashboard: u("1460925895917-afdab827c52f"), // 노트북 대시보드
  executive: u("1507679799987-c73779587ccf"), // 정장 비즈니스맨
  hcmc: u("1583417319070-4a69db38a482"), // 호치민 스카이라인
  training: u("1556761175-5973dc0f32e7"), // 교육·강의
  seoul: u("1517154421773-0529f29ea451"), // 서울 거리
  mumbai: u("1529253355930-ddbe423a2ac7"), // 뭄바이 게이트웨이 오브 인디아
  warehouse: u("1586528116311-ad8dd3c8310d"), // 물류창고 제품
  cranes: u("1578575437130-527eed3abbec"), // 항만 크레인
  success: u("1600880292203-757bb62b4baf"), // 계약 성사
  docs: u("1454165804606-c3d57bc86b40"), // 서류 작업
  kualalumpur: u("1596422846543-75c6fc197f07"), // 쿠알라룸푸르 페트로나스 타워
  apparel: u("1567401893414-76b7b1e5a7a5"), // 의류 매장
  dubai: u("1512453979798-5ea266f8880c"), // 두바이 스카이라인
} as const;

export type PhotoKey = keyof typeof PHOTOS;

/** 크기 지정 URL */
export function photo(key: PhotoKey, w = 1600, q = 75) {
  return `${PHOTOS[key]}?auto=format&fit=crop&w=${w}&q=${q}`;
}
