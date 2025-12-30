-- Stories schema for SUCCMS
-- Requires: user_profiles table mapping to auth.users.id

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  type text not null check (type in ('image','video','text','assignment','grade','course')),
  content_url text,
  title text,
  description text,
  course_id uuid references public.courses(id) on delete set null,
  course_code text,
  assignment_title text,
  grade text
);

alter table public.stories enable row level security;

-- Allow anyone authenticated to read stories for now (can refine to course-scoped later)
create policy stories_select_authenticated on public.stories
  for select
  to authenticated
  using (true);

-- Only owners can insert/update/delete their stories
create policy stories_insert_own on public.stories
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy stories_update_own on public.stories
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy stories_delete_own on public.stories
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Optional: track views
create table if not exists public.story_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  story_id uuid not null references public.stories(id) on delete cascade,
  viewer_id uuid not null references public.user_profiles(id) on delete cascade,
  unique (story_id, viewer_id)
);

alter table public.story_views enable row level security;

create policy story_views_select_authenticated on public.story_views
  for select to authenticated using (true);

create policy story_views_insert_authenticated on public.story_views
  for insert to authenticated with check (true);
