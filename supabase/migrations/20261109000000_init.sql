-- =====================================================================
-- 글로벌마트 홈페이지 데이터베이스 (Supabase / PostgreSQL)
--  - profiles  : 회원 (해외주재원 가입 신청 → 관리자 승인)
--  - posts     : 게시판 (해외 Biz정보 = 'biz', 해외주재원 전용 = 'resident')
--  - inquiries : 상담 신청 (Contact Us)
-- Supabase 대시보드 > SQL Editor 에 그대로 붙여넣어 실행하거나
-- `supabase db push` 로 적용합니다.
-- =====================================================================

-- ---------- 관리자 ----------
-- 일반 회원가입은 없습니다. 관리자 계정만 Supabase 대시보드(Authentication > Users > Add user)에서 만들고,
-- 아래 맨 끝의 SQL 로 관리자 권한을 부여합니다.
-- ※ Supabase 대시보드 Authentication > Sign In / Providers 에서 "Allow new users to sign up" 을 꺼 두세요.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  name       text not null default '',
  role       text not null default 'none' check (role in ('none', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- 사이트 설정 (해외주재원 공용 비밀번호 해시 등) ----------
-- 서버(service role)만 읽고 씁니다. 브라우저에서는 접근할 수 없습니다.
create table if not exists public.settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

-- ---------- 게시판 ----------
create table if not exists public.posts (
  id          bigint generated always as identity primary key,
  board       text not null check (board in ('biz', 'resident')),
  category    text not null default '',  -- biz: industry(산업정보) / inquiry(인콰이어리), resident: 자유 입력(종류)
  region      text not null default 'all',  -- biz 전용: all, india, southeast ... ('all' 은 모든 지역에 노출)
  country     text not null default '',  -- biz 전용: 주 또는 국가 (자유 입력)
  company     text not null default '',  -- resident 전용: 회사명
  title       text not null check (char_length(title) between 1 and 200),
  body        text not null default '',
  author_name text not null default '',  -- 게시자 (Biz정보 목록에서는 숨김)
  is_pinned   boolean not null default false,
  view_count  integer not null default 0,
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists posts_board_created_idx on public.posts (board, is_pinned desc, created_at desc);
create index if not exists posts_region_idx on public.posts (board, region);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

-- 조회수 증가 (Biz정보 글. 주재원 글은 서버가 service role 로 처리)
create or replace function public.increment_post_view(p_id bigint)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.posts
     set view_count = view_count + 1
   where id = p_id
     and board = 'biz';
end;
$$;

-- ---------- 상담 신청 ----------
create table if not exists public.inquiries (
  id         bigint generated always as identity primary key,
  name       text not null check (char_length(name) between 1 and 100),
  company    text not null default '',
  email      text not null check (char_length(email) between 3 and 200),
  phone      text not null default '',
  service    text not null default '',
  region     text not null default '',
  message    text not null check (char_length(message) between 1 and 5000),
  status     text not null default 'new' check (status in ('new', 'in_progress', 'done')),
  memo       text not null default '',
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------
alter table public.profiles  enable row level security;
alter table public.settings  enable row level security;  -- 정책 없음 = anon/로그인 사용자 모두 접근 불가
alter table public.posts     enable row level security;
alter table public.inquiries enable row level security;

-- profiles: 본인만 조회 (관리자 지정은 SQL 로만)
drop policy if exists "profiles select" on public.profiles;
create policy "profiles select" on public.profiles
  for select using (id = auth.uid());

-- posts: Biz정보는 누구나 열람, 주재원 전용은 관리자만 직접 열람
--        (주재원은 공용 비밀번호 확인 후 서버가 service role 로 대신 읽어 줌). 작성·수정·삭제는 관리자
drop policy if exists "posts read" on public.posts;
create policy "posts read" on public.posts
  for select using (board = 'biz' or public.is_admin());

drop policy if exists "posts admin insert" on public.posts;
create policy "posts admin insert" on public.posts
  for insert with check (public.is_admin());

drop policy if exists "posts admin update" on public.posts;
create policy "posts admin update" on public.posts
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "posts admin delete" on public.posts;
create policy "posts admin delete" on public.posts
  for delete using (public.is_admin());

-- inquiries: 누구나 신청 가능, 조회·처리는 관리자
drop policy if exists "inquiries insert" on public.inquiries;
create policy "inquiries insert" on public.inquiries
  for insert with check (status = 'new' and memo = '');

drop policy if exists "inquiries admin select" on public.inquiries;
create policy "inquiries admin select" on public.inquiries
  for select using (public.is_admin());

drop policy if exists "inquiries admin update" on public.inquiries;
create policy "inquiries admin update" on public.inquiries
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "inquiries admin delete" on public.inquiries;
create policy "inquiries admin delete" on public.inquiries
  for delete using (public.is_admin());

grant execute on function public.increment_post_view(bigint) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 관리자 지정: 대시보드에서 관리자 계정을 만든 뒤 이메일을 바꿔 한 번 실행하세요.
-- update public.profiles set role = 'admin' where email = 'admin@example.com';
-- ---------------------------------------------------------------------
