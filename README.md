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
- 관리자 화면은 소스 브랜치(`claude/magical-meitner-h496nk`)의 파일을 고칩니다. Actions 빌드는 `NEXT_PUBLIC_DATA_BRANCH` 로 푸시된 브랜치를 넣어 주고, 값이 없으면(로컬 빌드) 소스 브랜치를 씁니다. `main` 은 배포본만 있어 데이터 파일이 없습니다. 소스 브랜치 이름을 바꾸면 `lib/github.ts` 의 `SOURCE_BRANCH` 도 바꿔 주세요.
- 글 번호: 두 파일에는 선택 항목 `next_id`(다음 새 글 번호)가 저장됩니다. 지운 글의 번호를 다시 쓰지 않아, 예전 글 주소(`/biz/번호/`)가 다른 글을 가리키지 않습니다. `next_id` 가 없는 예전 파일도 그대로 읽힙니다(가장 큰 번호 + 1).

## 보안 메모 (해외주재원 전용 · 관리자)

- **공용 비밀번호**: `public/data/resident.json` 은 누구나 내려받을 수 있으므로, 짧거나 짐작하기 쉬운 비밀번호는 컴퓨터로 대입해 풀릴 수 있습니다.
  - 관리자 화면은 새 비밀번호를 **10자 이상, 글자·숫자·기호 중 두 종류 이상**으로만 받습니다. 회사 이름·연도처럼 짐작하기 쉬운 말은 피해 주세요.
  - 새로 저장하는 파일은 PBKDF2-SHA256 **60만 회**(OWASP 권장값)로 암호화합니다. 예전(25만 회) 파일도 파일에 적힌 횟수로 그대로 열립니다.
  - 지금 저장소의 파일은 예전 규칙(6자 이상)으로 만든 비밀번호일 수 있습니다. 공개 전에 관리자 화면에서 **새 규칙에 맞는 비밀번호로 한 번 바꿔** 주세요.
  - 비밀번호를 바꿔도 **git 기록(history)에 남은 예전 파일은 예전 비밀번호로 열립니다.** 바꾸기 전에 올린 글은 공개될 수 있다고 보고, 민감한 내용은 올리지 마세요.
- **관리자 토큰**: 기본은 이 탭에만 기억되고(sessionStorage) 탭을 닫으면 로그아웃됩니다. '로그인 유지'를 체크하면 브라우저(localStorage)에 남는데, GitHub Pages 주소(`intoedu.github.io`)는 같은 계정의 다른 페이지와 저장 공간을 함께 쓰므로 개인 PC에서만 쓰세요.
  - 토큰은 이 저장소만, 짧은 유효기간(예: 30~90일)으로 만든 Fine-grained 토큰을 쓰세요. 클래식 토큰(`ghp_`)은 권한 범위가 넓어 권장하지 않습니다(로그인 시 안내가 나옵니다).

## 관리자 토큰 만들기

GitHub › Settings › Developer settings › Personal access tokens › Fine-grained tokens › Generate new token
- Repository access: `intoedu/Global-Mart` 만 선택
- Repository permissions › **Contents: Read and write**
- Expiration: 짧게(예: 30~90일)

## 상담 신청서 (FormSubmit)

첫 접수 때 gvmart@hanmail.net 으로 FormSubmit 의 확인(Activate) 메일이 옵니다. 버튼을 한 번 눌러야 이후 접수가 전달됩니다. 전송이 실패하거나 15초 안에 응답이 없으면 방문자의 메일 앱으로 같은 내용을 보내도록 안내합니다(메일 앱 본문은 앞 600자까지).

공개 전 확인할 일:
1. 공개된 사이트에서 시험 접수를 한 번 보내고, 회사 메일로 온 FormSubmit 확인 메일의 버튼을 누릅니다. (확인 전에는 첫 방문자의 접수가 실패로 보입니다.)
2. 확인 후 FormSubmit 이 알려 주는 임의 주소(alias)로 `lib/site.ts` 의 `formEndpoint` 를 바꾸면 메일 주소가 코드에 드러나지 않습니다.
3. 개인정보처리방침(`app/[lang]/privacy/page.tsx`)의 시행일(`EFFECTIVE_DATE`)과 국외 이전 내용(FormSubmit 서버 소재 국가, 보유 기간)을 회사가 확인해 채웁니다.

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
