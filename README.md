# 글로벌마트 홈페이지 (globalmart21.com 리뉴얼)

(주)글로벌마트의 새 홈페이지입니다. 기존 사이트(globalmart21.com/default/…)의 내용을 옮기고, 의뢰서(PPT)에서 요청한 **해외 Biz정보** 게시판과 **해외주재원 전용** 게시판을 추가했습니다.

- Next.js 16 (App Router) · TypeScript · Tailwind CSS 4
- Supabase (PostgreSQL) — 게시판, 관리자 로그인, 상담 신청
- PC·모바일 반응형, 한국어/English 전환

## 메뉴 구성 (PPT 9쪽 기준)

| 메뉴 | 주소 | 비고 |
|---|---|---|
| 메인 (Open Page) | `/` | PPT의 모바일 4개 블록(서비스·가능지역·유망아이템·연락처)을 그대로 배치 |
| 회사소개 | `/company/greeting` `/history` `/partners` `/location` | 인사말·연혁·제휴사·주소 |
| 해외지사 | `/offices` | 지역별로 거르는 세계 지도와 사무소 이메일 |
| 사업내용 | `/business/agency` `/research` `/buyers` `/branch` `/field-research` `/software` | 해외출장조사 추가, 소프트웨어 무역은 사업내용 아래로 이동 |
| 해외 Biz정보 | `/biz` | 지역 11개 탭, 종류(산업정보/인콰이어리), 검색, 페이지 넘김. 목록에서 게시자 숨김. 지역 '전체'로 쓴 글은 모든 지역에 표시 |
| 해외주재원 전용 | `/resident` | **회원가입 없음**. 공용 비밀번호를 넣어야 열람 가능 |
| Contact Us | `/contact` | 온라인 상담 신청서 |
| 관리자 | `/admin` | 글쓰기·수정·삭제, 상담 신청 처리, 주재원 비밀번호 변경 |

기존 주소(`/default/01/01.php` 등)로 들어오면 새 페이지로 자동 이동합니다(`next.config.ts`).

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # 값을 비워 두면 미리보기 모드
npm run dev
```

## 운영 설정 (처음 한 번)

1. **Supabase 프로젝트 생성** 후 SQL Editor 에서 `supabase/migrations/20261109000000_init.sql` 을 실행합니다.
2. **회원가입 끄기**: Authentication › Sign In / Providers 에서 *Allow new users to sign up* 을 끕니다.
3. **관리자 계정**: Authentication › Users › *Add user* 로 관리자 이메일/비밀번호를 만들고, SQL 로 권한을 줍니다.
   ```sql
   update public.profiles set role = 'admin' where email = '관리자@이메일';
   ```
4. **환경변수**: 배포 환경(Vercel 등)에 `.env.example` 의 값을 넣습니다. `SUPABASE_SERVICE_ROLE_KEY` 는 서버 전용입니다.
5. 사이트 하단 **관리자** 링크로 로그인한 뒤 › **주재원 비밀번호** 에서 공용 비밀번호를 정해 주재원들에게 알려 줍니다.

## 콘텐츠 수정 위치

- 회사 정보(전화·주소·대표 등): `lib/site.ts`
- 본문 문구(한/영): `lib/content.ts`
- Biz정보 지역·국가 목록: `lib/regions.ts`
- 해외지사 목록: `lib/offices.json` → 수정 후 `npm run gen:map` 으로 지도 갱신

## 보안 메모

- 게시판 쓰기·수정·삭제와 상담 신청 열람은 DB 보안 규칙(RLS)으로 관리자만 가능합니다.
- 주재원 게시판은 DB에서 관리자만 읽을 수 있고, 공용 비밀번호를 확인한 경우에만 서버가 대신 읽어 보여 줍니다.
- 공용 비밀번호는 해시로만 저장되며, 바꾸면 기존 입장 쿠키가 모두 무효가 됩니다.
