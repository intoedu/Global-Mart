# 글로벌마트 홈페이지 (globalmart21.com 리뉴얼)

(주)글로벌마트의 새 홈페이지입니다. 기존 사이트의 내용을 옮기고, 의뢰서(PPT)에서 요청한 회원 전용 게시판 **해외Biz정보(해외주재원 전용)** 을 추가했습니다.

- Next.js 16 정적 사이트(static export) · TypeScript · Tailwind CSS 4
- **GitHub Pages** 무료 호스팅 — 별도 서버·데이터베이스 없음
- PC·모바일 반응형, 한국어(`/ko/`) / English(`/en/`)

주소: https://intoedu.github.io/Global-Mart/

## 메뉴

| 메뉴 | 주소 | 비고 |
|---|---|---|
| 메인 | `/ko/` | PPT 모바일 4개 블록 + 무역 항로 띠·세계 지도 |
| 회사소개 | `/ko/company/greeting` 외 | 인사말·연혁·제휴기관·주소 |
| 해외지사 | `/ko/offices` | 지역별 지도·사무소 목록 (주재원 이메일은 표시하지 않음) |
| 사업내용 | `/ko/business/agency` 외 3개 | 해외지사대행·해외시장조사·해외바이어발굴·해외입찰대행(`/business/tender`) (소프트웨어 내용은 해외Biz정보 › 국내우수 Item 글로 이동) |
| 해외Biz정보(해외주재원 전용) | `/ko/biz` | **회원 전용**(회원 비밀번호 하나, 회원가입 없음). 한 번 로그인하면 모든 카테고리 이용. 카테고리 `?cat=market`(해외시장) · `?cat=tender`(해외입찰) — 둘 다 나라별(지역 11개 탭 + 국가 머리말, '전체' 지역 글은 모든 지역 표시, 게시자 숨김) · `?cat=items`(국내우수 Item) · `?cat=notice`(공지) — 단일 게시판. `?cat` 없으면 전체 최신 글. 검색 `?q=`, 페이지 `?page=`, 글 보기 `/ko/biz/?post=번호` |
| (예전) 해외주재원 전용 | `/ko/resident` | 통합 게시판으로 자동 이동: `?cat=items`·`?cat=software` → 국내우수 Item, `?cat=notice` → 공지, `?id=1·2·3` → `/biz/?post=6·7·8` |
| Contact Us | `/ko/contact` | 전화·이메일·팩스·주소 (온라인 신청서 없음) |
| 관리자 | `/ko/admin` | **관리자 아이디·비밀번호**로 로그인(처음 한 번 사이트 소유자가 '처음 설정', 토큰 직접 입력도 가능). 카테고리·지역을 골라 글 작성·수정·삭제(본문 이미지·첨부 파일), 회원 비밀번호 변경, 관리자 아이디·비밀번호 변경 |

## 게시판 데이터 (암호화)

| 내용 | 파일 | 여는 열쇠 |
|---|---|---|
| 해외Biz정보(해외주재원 전용) 글 전체 (해외시장·해외입찰·국내우수 Item·공지) | `public/data/biz.json` | 회원 비밀번호 |
| 본문 이미지·첨부 파일 | `public/data/files/biz/*.bin` | 게시판 데이터 안의 파일 키 |
| 관리자 GitHub 토큰 | `public/data/admin.json` | 관리자 아이디 + 비밀번호 |

- 파일은 **AES-GCM**(PBKDF2-SHA256 60만 회)으로 암호화되어 있어, 저장소·사이트가 공개여도 비밀번호 없이는 읽을 수 없습니다. 글은 브라우저에서 비밀번호를 넣은 뒤에 풀리므로 **정적 HTML·사이트맵에는 글 제목·내용이 들어가지 않습니다.**
- 글 형식(`v: 2`): `category`(market·tender·items·notice), 해외시장·해외입찰은 `region`(lib/regions.ts 지역 id)·`country`, 국내우수 Item 은 `kind`(종류)·`company`(회사명). 예전 형식(해외 Biz정보 industry/inquiry, 해외주재원 전용 board/category)도 읽히며 관리자 화면에서 저장하면 새 형식이 됩니다.
- 첨부 파일은 무작위 파일 키(AES-GCM 256)로 암호화합니다. 파일 키는 암호화된 게시판 데이터 안(`file_keys`)에만 있어, 비밀번호를 바꿀 때는 게시판 데이터만 다시 암호화하고 새 파일 키를 하나 추가합니다(이미 올린 파일은 그대로). 파일 한 개는 10MB까지.
- 관리자 화면에서 저장하면 저장소 파일이 바뀌고, GitHub Actions(`.github/workflows/pages.yml`)가 1~2분 안에 사이트를 다시 배포합니다.
- 관리자 화면은 소스 브랜치(`claude/magical-meitner-h496nk`)의 파일을 고칩니다. Actions 빌드는 `NEXT_PUBLIC_DATA_BRANCH` 로 푸시된 브랜치를 넣어 주고, 값이 없으면(로컬 빌드) 소스 브랜치를 씁니다. `main` 은 배포본만 있어 데이터 파일이 없습니다. 소스 브랜치 이름을 바꾸면 `lib/github.ts` 의 `SOURCE_BRANCH` 도 바꿔 주세요.
- 글 번호: 데이터에는 선택 항목 `next_id`(다음 새 글 번호)가 저장됩니다. 지운 글의 번호를 다시 쓰지 않아, 예전 글 주소가 다른 글을 가리키지 않습니다.
- **2026-11 통합**: 예전 해외 Biz정보(별도 회원 비밀번호)와 해외주재원 전용(공용 비밀번호)을 한 파일로 합쳤습니다. 통합 게시판의 회원 비밀번호는 **예전 해외주재원 전용 비밀번호**이고, 예전 해외 Biz정보 비밀번호는 더 이상 쓰지 않습니다. 예전 글 번호: Biz 1~5 그대로, 주재원 1·2·3 → 6·7·8, 소프트웨어 무역 3개 항목(메신저·블록체인·다양한 소프트웨어) → 국내우수 Item 글 9·10·11. `public/data/resident.json` 은 지웠습니다.

### 명령줄 도구 (`scripts/board-crypt.mjs`, Node 22 이상)

비밀번호는 파일로 넘깁니다(비밀번호 파일·평문 파일은 저장소에 넣지 마세요).

```bash
node scripts/board-crypt.mjs verify    public/data/biz.json --password-file ~/member-pw.txt          # 풀리는지·카테고리별 글 수·첨부 파일까지 확인
node scripts/board-crypt.mjs decrypt   public/data/biz.json --password-file ~/member-pw.txt --out /tmp/biz.plain.json
node scripts/board-crypt.mjs encrypt   /tmp/biz.plain.json  --password-file ~/member-pw.txt --out public/data/biz.json
node scripts/board-crypt.mjs reencrypt public/data/biz.json --password-file old.txt [--new-password-file new.txt]
node scripts/board-crypt.mjs add-file  /tmp/biz.plain.json --file photo.png [--inline]
```

## 보안 메모 (회원 전용 게시판 · 관리자)

- **회원 비밀번호 하나**: 해외Biz정보(해외주재원 전용)의 모든 카테고리를 여는 공용 비밀번호로, 회원가입 없이 글로벌마트가 따로 알려 줍니다. 잠금 화면("회원 전용")에도 "비밀번호가 없으신가요?" 안내와 연락처가 나옵니다.
- 암호화 파일은 누구나 내려받을 수 있으므로, 짧거나 짐작하기 쉬운 비밀번호는 컴퓨터로 대입해 풀릴 수 있습니다.
  - 관리자 화면은 새 비밀번호를 **10자 이상, 글자·숫자·기호 중 두 종류 이상**으로만 받습니다. 회사 이름·연도처럼 짐작하기 쉬운 말은 피해 주세요.
  - 예전(25만 회) 파일도 파일에 적힌 반복 횟수로 그대로 열립니다.
  - 비밀번호를 바꿔도 **git 기록(history)에 남은 예전 파일은 예전 비밀번호로 열립니다.** 바꾸기 전에 올린 글·파일은 예전 비밀번호를 아는 사람이 볼 수 있다고 보고, 민감한 내용은 올리지 마세요. 바꾼 뒤에 올린 글·파일은 새 비밀번호로만 열립니다.
- 열람자의 비밀번호는 그 탭(sessionStorage)에만 기억되고 창을 닫으면 사라집니다. '나가기 (잠금)'을 누르면 바로 지워집니다.
- **관리자 아이디·비밀번호** (정적 사이트라 서버 계정이 없어서 이렇게 만듭니다):
  - 사이트 소유자가 처음 한 번 `/ko/admin` › **처음 설정**에서 GitHub Fine-grained 토큰(**intoedu/Global-Mart 저장소만, Contents: Read and write 만**, 짧은 유효기간)을 붙여 넣고 관리자 아이디·비밀번호를 정합니다. 토큰은 아이디+비밀번호에서 만든 키(PBKDF2-SHA256 60만 회 → AES-GCM)로 암호화되어 `public/data/admin.json` 에 저장되고(그 토큰으로 contents API 사용), 그 뒤로는 아이디·비밀번호만으로 로그인합니다. 아이디·비밀번호 자체는 어디에도 저장되지 않으며 코드에도 없습니다.
  - 로그인 후 **아이디·비밀번호 변경**에서 바꿀 수 있습니다. 토큰 유효기간이 지나면 아이디 로그인이 안 되므로 새 토큰으로 '처음 설정'을 다시 합니다. **토큰 직접 입력** 로그인도 그대로 됩니다.
  - **약점**: `admin.json` 은 공개 파일이므로, 아이디·비밀번호를 아는 사람(또는 대입으로 알아낸 사람)은 누구나 토큰을 꺼내 저장소 쓰기 권한을 얻습니다. 비밀번호는 **길게(16자 이상 권장)**, 다른 곳에서 쓰지 않는 것으로 정하세요. 토큰 권한은 이 저장소의 Contents 로만 제한하세요. 또 아이디·비밀번호를 바꿔도 git 기록에 남은 예전 `admin.json` 은 예전 아이디·비밀번호로 풀리므로, 새어 나갔다고 생각되면 **GitHub에서 토큰을 지우고(Revoke) 새 토큰으로 '처음 설정'**을 다시 하세요. 바꾼 직후 1~2분(사이트 반영 전)은 예전 아이디·비밀번호로도 로그인될 수 있습니다.
- **관리자 토큰**: 기본은 이 탭에만 기억되고(sessionStorage) 탭을 닫으면 로그아웃됩니다. '로그인 유지'를 체크하면 브라우저(localStorage)에 남는데, GitHub Pages 주소(`intoedu.github.io`)는 같은 계정의 다른 페이지와 저장 공간을 함께 쓰므로 개인 PC에서만 쓰세요.
  - 토큰은 이 저장소만, 짧은 유효기간(예: 30~90일)으로 만든 Fine-grained 토큰을 쓰세요. 클래식 토큰(`ghp_`)은 권한 범위가 넓어 권장하지 않습니다(로그인 시 안내가 나옵니다).

## 관리자 토큰 만들기

GitHub › Settings › Developer settings › Personal access tokens › Fine-grained tokens › Generate new token
- Repository access: `intoedu/Global-Mart` 만 선택
- Repository permissions › **Contents: Read and write**
- Expiration: 짧게(예: 30~90일)

## 상담 문의

온라인 상담 신청서는 두지 않았습니다. 상담은 전화(02-499-7977)와 이메일(gvmart@hanmail.net)로 받습니다.

공개 전 확인할 일: 개인정보처리방침(`app/[lang]/privacy/page.tsx`)의 시행일(`EFFECTIVE_DATE`)을 회사가 정해 채웁니다.

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
