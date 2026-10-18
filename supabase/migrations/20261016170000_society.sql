-- Durham Fusion Society
-- Run this in the Supabase SQL editor, or with `supabase db push`.
-- Before the first signup, replace the placeholder admin email below.

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to postgres, service_role, anon, authenticated;

create table private.admin_emails (
  email text primary key
);

alter table private.admin_emails enable row level security;
revoke all on private.admin_emails from public, anon, authenticated;

insert into private.admin_emails (email) values ('change-me@durham.ac.uk');

set check_function_bodies = off;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed boolean;
begin
  select exists (
    select 1
    from private.admin_emails
    where lower(email) = lower(coalesce(new.email, ''))
  ) into allowed;

  insert into public.profiles (id, email, full_name, course, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'course', ''),
    case when allowed then 'admin' else 'member' end
  );
  return new;
end;
$$;

create or replace function private.protect_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return new;
  end if;

  if not private.is_admin() then
    new.role := old.role;
    new.show_on_site := old.show_on_site;
    new.committee_title := old.committee_title;
    new.email := old.email;
  end if;

  return new;
end;
$$;

create or replace function private.sync_rsvp_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid;
begin
  target := coalesce(new.event_id, old.event_id);
  update public.events
  set rsvp_count = (
    select count(*)::integer from public.rsvps where event_id = target
  )
  where id = target;
  return coalesce(new, old);
end;
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.handle_new_user() from public;
revoke all on function private.protect_profile() from public;
revoke all on function private.sync_rsvp_count() from public;

grant execute on function private.is_admin() to anon, authenticated, service_role;
grant execute on function private.handle_new_user() to supabase_auth_admin, postgres, service_role;
grant execute on function private.protect_profile() to authenticated, postgres, service_role;
grant execute on function private.sync_rsvp_count() to authenticated, postgres, service_role;

set check_function_bodies = on;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  course text not null default '',
  role text not null default 'member' check (role in ('member', 'committee', 'admin')),
  committee_title text not null default '',
  bio text not null default '',
  show_on_site boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null default '',
  details text not null default '',
  location text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  published boolean not null default false,
  rsvp_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.rsvps (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier text not null default 'supporter' check (tier in ('supporter', 'partner', 'principal')),
  url text not null default '',
  note text not null default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null default '',
  kind text not null check (kind in ('education', 'project', 'industry')),
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  constraint newsletter_email_shape check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create table public.sponsor_inquiries (
  id uuid primary key default gen_random_uuid(),
  organisation text not null,
  contact_name text not null,
  email text not null,
  message text not null default '',
  created_at timestamptz not null default now(),
  constraint inquiry_email_shape check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create table public.site_copy (
  key text primary key,
  value text not null default ''
);

insert into public.site_copy (key, value) values
  ('intro', 'A student society at Durham for fusion science, engineering, and the people who want to work on it.'),
  ('contact_email', ''),
  ('instagram', ''),
  ('linkedin', '');

create index events_starts_at_idx on public.events (starts_at);
create index profiles_show_idx on public.profiles (show_on_site);

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.rsvps enable row level security;
alter table public.sponsors enable row level security;
alter table public.activities enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.sponsor_inquiries enable row level security;
alter table public.site_copy enable row level security;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create trigger protect_profile
  before update on public.profiles
  for each row execute function private.protect_profile();

create trigger sync_rsvp_count
  after insert or delete on public.rsvps
  for each row execute function private.sync_rsvp_count();

create policy "public committee"
  on public.profiles for select
  to anon
  using (show_on_site);

create policy "members read directory"
  on public.profiles for select
  to authenticated
  using (true);

create policy "insert own member profile"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()) and role = 'member');

create policy "update own or admin profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()) or private.is_admin())
  with check (id = (select auth.uid()) or private.is_admin());

create policy "read visible events"
  on public.events for select
  to anon, authenticated
  using (published or private.is_admin());

create policy "admin write events"
  on public.events for insert
  to authenticated
  with check (private.is_admin());

create policy "admin update events"
  on public.events for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "admin delete events"
  on public.events for delete
  to authenticated
  using (private.is_admin());

create policy "read own rsvps"
  on public.rsvps for select
  to authenticated
  using (user_id = (select auth.uid()) or private.is_admin());

create policy "rsvp to published events"
  on public.rsvps for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.events
      where id = event_id and published
    )
  );

create policy "cancel own rsvp"
  on public.rsvps for delete
  to authenticated
  using (user_id = (select auth.uid()) or private.is_admin());

create policy "read published sponsors"
  on public.sponsors for select
  to anon, authenticated
  using (published or private.is_admin());

create policy "admin insert sponsors"
  on public.sponsors for insert to authenticated
  with check (private.is_admin());

create policy "admin update sponsors"
  on public.sponsors for update to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "admin delete sponsors"
  on public.sponsors for delete to authenticated
  using (private.is_admin());

create policy "read published activities"
  on public.activities for select
  to anon, authenticated
  using (published or private.is_admin());

create policy "admin insert activities"
  on public.activities for insert to authenticated
  with check (private.is_admin());

create policy "admin update activities"
  on public.activities for update to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "admin delete activities"
  on public.activities for delete to authenticated
  using (private.is_admin());

create policy "subscribe"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

create policy "admin read subscribers"
  on public.newsletter_subscribers for select
  to authenticated
  using (private.is_admin());

create policy "admin delete subscribers"
  on public.newsletter_subscribers for delete
  to authenticated
  using (private.is_admin());

create policy "send inquiry"
  on public.sponsor_inquiries for insert
  to anon, authenticated
  with check (
    organisation <> ''
    and contact_name <> ''
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

create policy "admin read inquiries"
  on public.sponsor_inquiries for select
  to authenticated
  using (private.is_admin());

create policy "admin delete inquiries"
  on public.sponsor_inquiries for delete
  to authenticated
  using (private.is_admin());

create policy "read site copy"
  on public.site_copy for select
  to anon, authenticated
  using (true);

create policy "admin insert copy"
  on public.site_copy for insert
  to authenticated
  with check (private.is_admin());

create policy "admin update copy"
  on public.site_copy for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;
grant select, insert, delete on public.rsvps to authenticated;
grant select on public.sponsors to anon, authenticated;
grant insert, update, delete on public.sponsors to authenticated;
grant select on public.activities to anon, authenticated;
grant insert, update, delete on public.activities to authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select, delete on public.newsletter_subscribers to authenticated;
grant insert on public.sponsor_inquiries to anon, authenticated;
grant select, delete on public.sponsor_inquiries to authenticated;
grant select on public.site_copy to anon, authenticated;
grant insert, update on public.site_copy to authenticated;

revoke select (email) on public.profiles from anon;
