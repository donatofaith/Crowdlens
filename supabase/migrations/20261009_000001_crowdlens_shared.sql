-- CrowdLens shared-data foundation (Supabase Postgres)
-- Apply through Supabase SQL Editor or the CLI before enabling the cloud client.
-- No service-role credentials are required in the browser or Android app.

create extension if not exists pgcrypto;

create table if not exists public.crowdlens_missions (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 240),
  place text not null check (char_length(trim(place)) between 1 and 240),
  reward_test_usdc numeric(12, 2) not null check (reward_test_usdc > 0 and reward_test_usdc <= 100000),
  radius_m integer not null check (radius_m in (25, 50, 100)),
  target_lat double precision not null check (target_lat between -90 and 90),
  target_lon double precision not null check (target_lon between -180 and 180),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.crowdlens_submissions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.crowdlens_missions(id) on delete cascade,
  scout_id uuid not null references auth.users(id) on delete cascade,
  photo_path text not null check (char_length(photo_path) between 1 and 400),
  browser_reported_lat double precision not null check (browser_reported_lat between -90 and 90),
  browser_reported_lon double precision not null check (browser_reported_lon between -180 and 180),
  browser_reported_accuracy_m double precision not null check (browser_reported_accuracy_m >= 0 and browser_reported_accuracy_m < 100000),
  browser_reported_distance_m double precision not null check (browser_reported_distance_m >= 0 and browser_reported_distance_m < 20000000),
  capture_source text not null check (capture_source in ('browser_unverified', 'android_unverified')),
  status text not null default 'pending' check (status in ('pending', 'accepted_demo', 'rejected_demo')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_id uuid references auth.users(id),
  unique (mission_id, scout_id, photo_path)
);

create index if not exists idx_crowdlens_missions_status_created on public.crowdlens_missions (status, created_at desc);
create index if not exists idx_crowdlens_submissions_mission_created on public.crowdlens_submissions (mission_id, created_at desc);
create index if not exists idx_crowdlens_submissions_scout on public.crowdlens_submissions (scout_id, created_at desc);

alter table public.crowdlens_missions enable row level security;
alter table public.crowdlens_submissions enable row level security;

revoke all on public.crowdlens_missions from anon, authenticated;
revoke all on public.crowdlens_submissions from anon, authenticated;
grant select, insert on public.crowdlens_missions to authenticated;
grant select, insert on public.crowdlens_submissions to authenticated;

drop policy if exists "missions readable by signed-in people" on public.crowdlens_missions;
create policy "missions readable by signed-in people"
on public.crowdlens_missions for select to authenticated
using (auth.uid() is not null);

drop policy if exists "requester creates own mission" on public.crowdlens_missions;
create policy "requester creates own mission"
on public.crowdlens_missions for insert to authenticated
with check (requester_id = (select auth.uid()));

drop policy if exists "participants see their submissions" on public.crowdlens_submissions;
create policy "participants see their submissions"
on public.crowdlens_submissions for select to authenticated
using (
  scout_id = (select auth.uid()) or
  exists (
    select 1 from public.crowdlens_missions m
    where m.id = mission_id and m.requester_id = (select auth.uid())
  )
);

drop policy if exists "scouts submit own evidence to others open missions" on public.crowdlens_submissions;
create policy "scouts submit own evidence to others open missions"
on public.crowdlens_submissions for insert to authenticated
with check (
  scout_id = (select auth.uid())
  and status = 'pending'
  and reviewed_at is null
  and reviewer_id is null
  and capture_source = 'browser_unverified'
  and photo_path like (select auth.uid())::text || '/%'
  and exists (
    select 1 from public.crowdlens_missions m
    where m.id = mission_id and m.status = 'open'
      and m.requester_id <> (select auth.uid())
  )
);

-- No direct update/delete grants on submissions. Only the mission requester may
-- make a review decision, using an authenticated server-side function.
create or replace function public.crowdlens_review_submission(
  p_submission_id uuid,
  p_decision text
) returns public.crowdlens_submissions
language plpgsql security definer
set search_path = ''
as $$
declare
  result public.crowdlens_submissions;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_decision not in ('accepted_demo', 'rejected_demo') then
    raise exception 'Unsupported review status';
  end if;
  update public.crowdlens_submissions s
  set status = p_decision, reviewer_id = auth.uid(), reviewed_at = now()
  from public.crowdlens_missions m
  where s.id = p_submission_id and m.id = s.mission_id
    and m.requester_id = auth.uid() and s.status = 'pending'
  returning s.* into result;
  if not found then raise exception 'Submission not found, already reviewed, or unauthorized'; end if;
  return result;
end;
$$;
revoke all on function public.crowdlens_review_submission(uuid, text) from public, anon;
grant execute on function public.crowdlens_review_submission(uuid, text) to authenticated;

-- Private bucket: photos are never public URLs.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('crowdlens-proofs', 'crowdlens-proofs', false, 5242880, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg'];

drop policy if exists "scout uploads own private proof" on storage.objects;
create policy "scout uploads own private proof"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'crowdlens-proofs'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and lower(storage.extension(name)) = 'jpg'
);

drop policy if exists "proof visible to owner and mission requester" on storage.objects;
create policy "proof visible to owner and mission requester"
on storage.objects for select to authenticated
using (
  bucket_id = 'crowdlens-proofs'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (
      select 1 from public.crowdlens_submissions s
      join public.crowdlens_missions m on m.id = s.mission_id
      where s.photo_path = name
        and m.requester_id = (select auth.uid())
    )
  )
);

-- This schema intentionally does NOT implement financial transfers or proof verification.
-- A browser's GPS readings are untrusted, and demo approval never releases USDC.
