begin;

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'FNF trader' check (char_length(display_name) between 2 and 40),
  handle text not null unique check (handle ~ '^[a-z0-9_]{3,24}$'),
  avatar_url text,
  wallet_address text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trading_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  trading text not null default 'Memecoins' check (trading in ('Memecoins', 'Perps', 'Day trading')),
  language text not null default 'English' check (language in ('English', 'Espanol', 'Francais', 'Turkce', 'Bahasa')),
  market_hours text not null default 'Europe' check (market_hours in ('Asia', 'Europe', 'Americas', 'Around the clock')),
  voice_preference text not null default 'Voice sometimes' check (voice_preference in ('Voice daily', 'Voice sometimes', 'Text only')),
  bio text not null default '' check (char_length(bio) <= 280),
  updated_at timestamptz not null default now()
);

create table public.crews (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  owner_id uuid references public.profiles(id) on delete restrict,
  owner_name text not null default 'FNF trader',
  owner_handle text not null default 'member',
  name text not null check (char_length(name) between 3 and 24),
  thesis text not null check (char_length(thesis) between 20 and 200),
  trading text not null check (trading in ('Memecoins', 'Perps', 'Day trading')),
  language text not null check (language in ('English', 'Espanol', 'Francais', 'Turkce', 'Bahasa')),
  market_hours text not null check (market_hours in ('Asia', 'Europe', 'Americas', 'Around the clock')),
  voice_preference text not null check (voice_preference in ('Voice daily', 'Voice sometimes', 'Text only')),
  capacity smallint not null default 8 check (capacity between 4 and 8),
  live_count smallint not null default 0 check (live_count between 0 and 8),
  access_mode text not null default 'Open' check (access_mode in ('Open', 'One question', 'Invite review', 'Waitlist')),
  track_record text not null default 'No history yet' check (char_length(track_record) <= 80),
  age_label text not null default 'Started today' check (char_length(age_label) <= 60),
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.crew_members (
  crew_id uuid not null references public.crews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'moderator', 'member')),
  status text not null default 'active' check (status in ('active', 'left', 'removed')),
  joined_at timestamptz not null default now(),
  primary key (crew_id, user_id)
);

create table public.seat_requests (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  note text check (char_length(note) <= 500),
  profile_snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (crew_id, user_id)
);

create table public.room_messages (
  id bigint generated always as identity primary key,
  crew_id uuid not null references public.crews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'message' check (kind in ('message', 'token', 'chart', 'system')),
  body text not null check (char_length(body) between 1 and 2000),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index crews_discovery_idx on public.crews (status, trading, language, market_hours, created_at desc);
create index crew_members_user_idx on public.crew_members (user_id, status);
create index seat_requests_inbox_idx on public.seat_requests (crew_id, status, created_at desc);
create index room_messages_room_idx on public.room_messages (crew_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();
create trigger trading_profiles_touch_updated_at before update on public.trading_profiles
for each row execute function public.touch_updated_at();
create trigger crews_touch_updated_at before update on public.crews
for each row execute function public.touch_updated_at();
create trigger seat_requests_touch_updated_at before update on public.seat_requests
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  generated_handle text;
begin
  generated_handle := 'trader_' || left(replace(new.id::text, '-', ''), 10);

  insert into public.profiles (id, display_name, handle)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), 'FNF trader'),
    generated_handle
  );

  insert into public.trading_profiles (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, display_name, handle)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data ->> 'display_name', ''), 'FNF trader'),
  'trader_' || left(replace(u.id::text, '-', ''), 10)
from auth.users u
on conflict (id) do nothing;

insert into public.trading_profiles (user_id)
select p.id from public.profiles p
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;
alter table public.trading_profiles enable row level security;
alter table public.crews enable row level security;
alter table public.crew_members enable row level security;
alter table public.seat_requests enable row level security;
alter table public.room_messages enable row level security;

create policy "profiles_read_own" on public.profiles
for select to authenticated using (id = auth.uid());
create policy "profiles_update_own" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "trading_profiles_read_own" on public.trading_profiles
for select to authenticated using (user_id = auth.uid());
create policy "trading_profiles_update_own" on public.trading_profiles
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "active_crews_are_public" on public.crews
for select to anon, authenticated using (status = 'active');
create policy "owners_insert_crews" on public.crews
for insert to authenticated with check (owner_id = auth.uid());
create policy "owners_update_crews" on public.crews
for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owners_delete_crews" on public.crews
for delete to authenticated using (owner_id = auth.uid());

create policy "members_read_their_membership" on public.crew_members
for select to authenticated using (
  user_id = auth.uid()
  or exists (
    select 1 from public.crews c
    where c.id = crew_members.crew_id and c.owner_id = auth.uid()
  )
);

create policy "requesters_and_owners_read_requests" on public.seat_requests
for select to authenticated using (
  user_id = auth.uid()
  or exists (
    select 1 from public.crews c
    where c.id = seat_requests.crew_id and c.owner_id = auth.uid()
  )
);

create or replace function public.is_crew_member(p_crew_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.crew_members cm
    where cm.crew_id = p_crew_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
  );
$$;

create policy "members_read_messages" on public.room_messages
for select to authenticated using (public.is_crew_member(crew_id));
create policy "members_send_messages" on public.room_messages
for insert to authenticated with check (
  user_id = auth.uid() and public.is_crew_member(crew_id)
);

create or replace function public.list_crews(p_crew_id uuid default null)
returns table (
  id uuid,
  slug text,
  name text,
  thesis text,
  trading text,
  language text,
  market_hours text,
  voice_preference text,
  capacity smallint,
  member_count bigint,
  live_count smallint,
  age_label text,
  track_record text,
  access_mode text,
  owner_name text,
  owner_handle text,
  requested boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.id,
    c.slug,
    c.name,
    c.thesis,
    c.trading,
    c.language,
    c.market_hours,
    c.voice_preference,
    c.capacity,
    count(cm.user_id) filter (where cm.status = 'active') as member_count,
    c.live_count,
    c.age_label,
    c.track_record,
    c.access_mode,
    c.owner_name,
    c.owner_handle,
    exists (
      select 1 from public.seat_requests sr
      where sr.crew_id = c.id
        and sr.user_id = auth.uid()
        and sr.status = 'pending'
    ) as requested
  from public.crews c
  left join public.crew_members cm on cm.crew_id = c.id
  where c.status = 'active'
    and (p_crew_id is null or c.id = p_crew_id)
  group by c.id
  order by c.created_at desc;
$$;

create or replace function public.create_crew(
  p_name text,
  p_thesis text,
  p_trading text,
  p_language text,
  p_market_hours text,
  p_voice_preference text,
  p_capacity smallint default 8
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid := gen_random_uuid();
  base_slug text;
  creator_name text;
  creator_handle text;
begin
  if auth.uid() is null then
    raise exception 'Sign in before creating a crew';
  end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'Create a permanent account before creating a crew';
  end if;

  if char_length(trim(p_name)) not between 3 and 24 then
    raise exception 'Crew names must be between 3 and 24 characters';
  end if;
  if char_length(trim(p_thesis)) not between 20 and 200 then
    raise exception 'Crew theses must be between 20 and 200 characters';
  end if;

  select p.display_name, p.handle
  into creator_name, creator_handle
  from public.profiles p
  where p.id = auth.uid();

  base_slug := trim(both '-' from regexp_replace(lower(trim(p_name)), '[^a-z0-9]+', '-', 'g'));
  if base_slug = '' then base_slug := 'crew'; end if;

  insert into public.crews (
    id, slug, owner_id, owner_name, owner_handle, name, thesis, trading,
    language, market_hours, voice_preference, capacity
  ) values (
    new_id,
    base_slug || '-' || left(replace(new_id::text, '-', ''), 6),
    auth.uid(),
    coalesce(creator_name, 'FNF trader'),
    coalesce(creator_handle, 'member'),
    trim(p_name),
    trim(p_thesis),
    p_trading,
    p_language,
    p_market_hours,
    p_voice_preference,
    p_capacity
  );

  insert into public.crew_members (crew_id, user_id, role)
  values (new_id, auth.uid(), 'owner');

  return new_id;
end;
$$;

create or replace function public.request_seat(p_crew_id uuid, p_note text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_id uuid;
  room_capacity smallint;
  active_members integer;
  snapshot jsonb;
begin
  if auth.uid() is null then
    raise exception 'Sign in before requesting a seat';
  end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'Create a permanent account before requesting a seat';
  end if;

  select c.capacity into room_capacity
  from public.crews c
  where c.id = p_crew_id and c.status = 'active'
  for update;

  if room_capacity is null then raise exception 'Room not found'; end if;
  if public.is_crew_member(p_crew_id) then raise exception 'You are already in this room'; end if;

  select count(*) into active_members
  from public.crew_members cm
  where cm.crew_id = p_crew_id and cm.status = 'active';

  if active_members >= room_capacity then raise exception 'This room is full'; end if;

  select jsonb_build_object(
    'trading', tp.trading,
    'language', tp.language,
    'market_hours', tp.market_hours,
    'voice_preference', tp.voice_preference
  ) into snapshot
  from public.trading_profiles tp
  where tp.user_id = auth.uid();

  insert into public.seat_requests (crew_id, user_id, note, profile_snapshot)
  values (p_crew_id, auth.uid(), nullif(trim(p_note), ''), coalesce(snapshot, '{}'::jsonb))
  on conflict (crew_id, user_id) do update set
    note = excluded.note,
    profile_snapshot = excluded.profile_snapshot,
    status = 'pending',
    updated_at = now()
  returning id into request_id;

  return request_id;
end;
$$;

revoke all on function public.is_crew_member(uuid) from public;
revoke all on function public.list_crews(uuid) from public;
revoke all on function public.create_crew(text, text, text, text, text, text, smallint) from public;
revoke all on function public.request_seat(uuid, text) from public;

grant execute on function public.is_crew_member(uuid) to authenticated;
grant execute on function public.list_crews(uuid) to anon, authenticated;
grant execute on function public.create_crew(text, text, text, text, text, text, smallint) to authenticated;
grant execute on function public.request_seat(uuid, text) to authenticated;

revoke all on public.profiles, public.trading_profiles, public.crews,
  public.crew_members, public.seat_requests, public.room_messages from anon, authenticated;
grant select on public.crews to anon, authenticated;
grant select, update on public.profiles, public.trading_profiles to authenticated;
grant select, update, delete on public.crews to authenticated;
grant select on public.crew_members, public.seat_requests to authenticated;
grant select, insert on public.room_messages to authenticated;
grant usage, select on sequence public.room_messages_id_seq to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'room_messages'
  ) then
    alter publication supabase_realtime add table public.room_messages;
  end if;
end;
$$;

commit;
