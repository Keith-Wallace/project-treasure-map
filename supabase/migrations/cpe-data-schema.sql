-- ============================================================
-- CPE Tool — Database Schema
-- Target: Supabase (PostgreSQL)
-- ============================================================

-- Enable UUID generation (already available in Supabase by default)
create extension if not exists "pgcrypto";


-- ============================================================
-- USERS
-- Managed by Supabase Auth — this table extends the built-in
-- auth.users with application-level profile data.
-- ============================================================
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  first_name    text not null,
  last_name     text not null,
  email         text not null unique,
  role          text not null default 'user' check (role in ('user', 'admin')),
  created_at    timestamptz not null default now()
);

comment on table public.users is 'Application profile data extending Supabase auth.users.';
comment on column public.users.role is 'User role: user (self-service) or admin (management access).';


-- ============================================================
-- COURSE_CATEGORIES
-- Lookup table for CPE credit categories (e.g. Ethics, Tax Law).
-- ============================================================
create table public.course_categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  description   text,
  created_at    timestamptz not null default now()
);

comment on table public.course_categories is 'Lookup table of CPE credit categories.';

-- Seed common CPE categories
insert into public.course_categories (name, description) values
  ('Ethics',            'Professional ethics and conduct'),
  ('Tax Law',           'Federal and state taxation'),
  ('Auditing',          'Auditing and attestation standards'),
  ('Accounting',        'Financial accounting and reporting'),
  ('Business Law',      'Commercial and business law'),
  ('Finance',           'Financial planning and analysis'),
  ('Technology',        'Information technology and systems'),
  ('Management',        'Leadership and management skills');


-- ============================================================
-- CPE_COURSES
-- Core record representing a single completed CPE course.
-- Total credits are derived via COURSE_CATEGORY_CREDITS.
-- ============================================================
create table public.cpe_courses (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  course_title      text not null,
  provider          text,
  course_type       text check (course_type in ('online', 'in-person', 'self-study', 'webinar', 'other')),
  completion_date   date not null,
  certificate_url   text,
  status            text not null default 'completed' check (status in ('draft', 'completed', 'pending_review')),
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.cpe_courses is 'Core CPE course records. Total credits are calculated from course_category_credits.';
comment on column public.cpe_courses.certificate_url is 'Path or URL to uploaded certificate file.';
comment on column public.cpe_courses.status is 'draft = in progress, completed = submitted, pending_review = awaiting admin approval.';


-- ============================================================
-- COURSE_CATEGORY_CREDITS
-- Junction table linking a course to one or more categories,
-- with the credits earned per category.
-- Replaces the simple map table — credits live here, not on
-- cpe_courses, to support split-credit courses.
-- ============================================================
create table public.course_category_credits (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid not null references public.cpe_courses(id) on delete cascade,
  category_id     uuid not null references public.course_categories(id) on delete restrict,
  credits_earned  numeric(5, 2) not null check (credits_earned > 0),
  is_primary      boolean not null default false,
  created_at      timestamptz not null default now(),

  -- A course can only be linked to the same category once
  unique (course_id, category_id)
);

comment on table public.course_category_credits is 'Per-category credit breakdown for each course. Supports split-credit courses.';
comment on column public.course_category_credits.is_primary is 'Marks the main reporting category when a course spans multiple categories.';
comment on column public.course_category_credits.credits_earned is 'CPE credits earned for this specific category on this course.';


-- ============================================================
-- AUDIT_LOG
-- Tracks all create / update / delete actions on cpe_courses.
-- Useful for compliance and history views.
-- ============================================================
create table public.audit_log (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.users(id) on delete set null,
  course_id     uuid references public.cpe_courses(id) on delete set null,
  action        text not null check (action in ('created', 'updated', 'deleted')),
  changes       jsonb,
  occurred_at   timestamptz not null default now()
);

comment on table public.audit_log is 'Immutable log of add/modify/delete actions on CPE course records.';
comment on column public.audit_log.changes is 'JSON snapshot of changed fields: { before: {}, after: {} }.';


-- ============================================================
-- INDEXES
-- ============================================================
create index on public.cpe_courses (user_id);
create index on public.cpe_courses (completion_date);
create index on public.cpe_courses (status);
create index on public.course_category_credits (course_id);
create index on public.course_category_credits (category_id);
create index on public.audit_log (course_id);
create index on public.audit_log (user_id);


-- ============================================================
-- UPDATED_AT TRIGGER
-- Automatically keeps cpe_courses.updated_at current.
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_cpe_courses_updated_at
  before update on public.cpe_courses
  for each row execute function public.set_updated_at();


-- ============================================================
-- VIEW: course_report
-- Pre-built report view — returns one row per course with
-- total_credits (SUM) and categories (comma-separated list).
-- Use this from your API service layer.
-- ============================================================
create or replace view public.course_report as
select
  c.id,
  c.user_id,
  c.course_title,
  c.provider,
  c.course_type,
  c.completion_date,
  c.certificate_url,
  c.status,
  c.notes,
  c.created_at,
  c.updated_at,
  sum(ccc.credits_earned)                             as total_credits,
  string_agg(cat.name, ', ' order by ccc.is_primary desc, cat.name)
                                                      as categories,
  count(ccc.id)                                       as category_count
from public.cpe_courses c
join public.course_category_credits ccc on ccc.course_id = c.id
join public.course_categories       cat on cat.id = ccc.category_id
group by
  c.id, c.user_id, c.course_title, c.provider, c.course_type,
  c.completion_date, c.certificate_url, c.status, c.notes,
  c.created_at, c.updated_at;

comment on view public.course_report is
  'Aggregated report view. Filters by user_id in your query: SELECT * FROM course_report WHERE user_id = $1 AND status = ''completed'' ORDER BY completion_date DESC';


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only see and modify their own records.
-- Admins can see all records.
-- Enable RLS in Supabase dashboard or uncomment below.
-- ============================================================

alter table public.users                  enable row level security;
alter table public.cpe_courses            enable row level security;
alter table public.course_category_credits enable row level security;
alter table public.audit_log              enable row level security;

-- Users: read/update own profile
create policy "users: own row" on public.users
  for all using (auth.uid() = id);

-- CPE Courses: full access to own records
create policy "cpe_courses: own records" on public.cpe_courses
  for all using (auth.uid() = user_id);

-- Course category credits: access via parent course ownership
create policy "course_category_credits: via course ownership" on public.course_category_credits
  for all using (
    exists (
      select 1 from public.cpe_courses c
      where c.id = course_id and c.user_id = auth.uid()
    )
  );

-- Audit log: read own records only (writes handled server-side)
create policy "audit_log: read own" on public.audit_log
  for select using (auth.uid() = user_id);


-- ============================================================
-- SAMPLE DATA (optional — comment out for production)
-- ============================================================

-- Insert a test user (requires a matching auth.users entry first)
-- insert into public.users (id, first_name, last_name, email) values
--   ('00000000-0000-0000-0000-000000000001', 'Jane', 'Doe', 'jane@example.com');

-- insert into public.cpe_courses (id, user_id, course_title, provider, course_type, completion_date, status) values
--   ('10000000-0000-0000-0000-000000000001',
--    '00000000-0000-0000-0000-000000000001',
--    'Ethics & Tax Law Update 2025', 'AICPA', 'webinar', '2025-03-15', 'completed');

-- insert into public.course_category_credits (course_id, category_id, credits_earned, is_primary) values
--   ('10000000-0000-0000-0000-000000000001',
--    (select id from public.course_categories where name = 'Ethics'),    2.00, true),
--   ('10000000-0000-0000-0000-000000000001',
--    (select id from public.course_categories where name = 'Tax Law'),   1.00, false);
