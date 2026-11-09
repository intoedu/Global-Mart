# 글로벌마트 홈페이지 (globalmart21.com 리뉴얼)

(주)글로벌마트의 새 홈페이지입니다. 기존 사이트의 내용을 옮기고, 의뢰서(PPT)에서 요청한 **해외 Biz정보** 게시판과 **해외주재원 전용** 게시판을 추가했습니다.

- Next.js 16 정적 사이트(static export) · TypeScript · Tailwind CSS 4
- **GitHub Pages** 무료 호스팅 — 별도 서버·데이터베이스 없음
- PC·모바일 반응형, 한국어(`/ko/`) / English(`/en/`)

주소: https://intoedu.github.io/Global-Mart/

## 메뉴

| 메뉴 | 주소 | 비고 |
|---|---|---|
| 메인 | `/ko/` | PPT 모바일 4개 블록 + 무역 항로 띠·세계 지도 |
| 회사소개 | `/ko/company/greeting` 외 | 인사말·연혁·제휴사·주소 |
| 해외지사 | `/ko/offices` | 지역별 지도·사무소 이메일 |
| 사업내용 | `/ko/business/agency` 외 6개 | 해외출장조사 추가, 소프트웨어 무역 포함 |
| 해외 Biz정보 | `/ko/biz` | 지역 11개, 종류(산업정보/인콰이어리), 검색, 게시자 숨김, '전체' 글은 모든 지역 표시 |
| 해외주재원 전용 | `/ko/resident` | 공용 비밀번호 입력 후 열람 (글은 암호화 저장) |
| Contact Us | `/ko/contact` | 상담 신청 → FormSubmit 으로 gvmart@hanmail.net 에 메일 전달 |
| 관리자 | `/ko/admin` | GitHub 토큰으로 로그인해 게시글 작성·수정·삭제, 주재원 비밀번호 변경 |

## 게시판 데이터

- 해외 Biz정보: `data/biz.json`
- 해외주재원 전용: `public/data/resident.json` — 공용 비밀번호로 **AES-GCM 암호화**되어 있어 저장소가 공개여도 비밀번호 없이는 읽을 수 없습니다.
- 관리자 화면에서 저장하면 저장소 파일이 바뀌고, GitHub Actions(`.github/workflows/pages.yml`)가 1~2분 안에 사이트를 다시 배포합니다.

## 관리자 토큰 만들기

GitHub › Settings › Developer settings › Personal access tokens › Fine-grained tokens › Generate new token
- Repository access: `intoedu/Global-Mart` 만 선택
- Repository permissions › **Contents: Read and write**

## 상담 신청서 (FormSubmit)

첫 접수 때 gvmart@hanmail.net 으로 FormSubmit 의 확인(Activate) 메일이 옵니다. 버튼을 한 번 눌러야 이후 접수가 전달됩니다. 전송이 실패하면 방문자의 메일 앱으로 같은 내용을 보내도록 안내합니다.

## 수정 위치

- 회사 정보: `lib/site.ts` · 본문(한/영): `lib/content.ts` · 사진: `lib/photos.ts`
- Biz정보 지역·국가: `lib/regions.ts` · 해외지사: `lib/offices.json` (수정 후 `npm run gen:map`)

## 로컬 실행

```bash
npm install
npm run dev     # http://localhost:3000/ko/
```

## 자체 도메인(globalmart21.com) 연결 시

1. 워크플로의 `NEXT_PUBLIC_BASE_PATH` 를 빈 값으로, `NEXT_PUBLIC_SITE_URL` 을 새 도메인으로 바꿉니다.
2. Settings › Pages › Custom domain 에 도메인 입력, 도메인 업체 DNS 에 GitHub Pages 주소를 연결합니다.
