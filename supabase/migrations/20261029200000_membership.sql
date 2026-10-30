-- Membership tiers for databases that already ran the first society migration.
-- durham: a Durham University address. affiliate: everyone else.
-- Admins can change either tier later. Members cannot.

alter table public.profiles
  add column if not exists membership text not null default 'affiliate';

alter table public.profiles
  drop constraint if exists profiles_membership_check;

alter table public.profiles
  add constraint profiles_membership_check check (membership in ('durham', 'affiliate'));

update public.profiles
set membership = 'durham'
where lower(email) ~ '@([a-z0-9-]+\.)*durham\.ac\.uk$';

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

  insert into public.profiles (id, email, full_name, course, role, membership)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'course', ''),
    case when allowed then 'admin' else 'member' end,
    case
      when lower(coalesce(new.raw_user_meta_data ->> 'membership', '')) = 'affiliate' then 'affiliate'
      when lower(coalesce(new.email, '')) ~ '@([a-z0-9-]+\.)*durham\.ac\.uk$' then 'durham'
      else 'affiliate'
    end
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
    new.membership := old.membership;
    new.show_on_site := old.show_on_site;
    new.committee_title := old.committee_title;
    new.email := old.email;
  end if;

  return new;
end;
$$;

drop policy if exists "insert own member profile" on public.profiles;

create policy "insert own member profile"
  on public.profiles for insert
  to authenticated
  with check (
    id = (select auth.uid())
    and role = 'member'
    and (
      membership = 'affiliate'
      or (
        membership = 'durham'
        and lower(email) ~ '@([a-z0-9-]+\.)*durham\.ac\.uk$'
      )
    )
  );
