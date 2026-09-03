begin;

alter table public.profiles
  add column if not exists provider text,
  add column if not exists social_url text;

alter table public.crews
  add column if not exists description text not null default '' check (char_length(description) <= 500),
  add column if not exists avatar_url text;

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  crew_id uuid references public.crews(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('seat_request', 'seat_accepted', 'seat_declined', 'chart_share', 'member_removed')),
  title text not null check (char_length(title) between 1 and 100),
  body text not null default '' check (char_length(body) <= 300),
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, read_at, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "users_read_notifications" on public.notifications;
create policy "users_read_notifications" on public.notifications
for select to authenticated using (user_id = auth.uid());

drop policy if exists "users_update_notifications" on public.notifications;
create policy "users_update_notifications" on public.notifications
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke all on public.notifications from anon, authenticated;
grant select, update on public.notifications to authenticated;
grant usage, select on sequence public.notifications_id_seq to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fnf-media',
  'fnf-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "fnf_media_public_read" on storage.objects;
create policy "fnf_media_public_read" on storage.objects
for select to public using (bucket_id = 'fnf-media');

drop policy if exists "fnf_media_owner_insert" on storage.objects;
create policy "fnf_media_owner_insert" on storage.objects
for insert to authenticated with check (
  bucket_id = 'fnf-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "fnf_media_owner_update" on storage.objects;
create policy "fnf_media_owner_update" on storage.objects
for update to authenticated using (
  bucket_id = 'fnf-media'
  and (storage.foldername(name))[1] = auth.uid()::text
) with check (
  bucket_id = 'fnf-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "fnf_media_owner_delete" on storage.objects;
create policy "fnf_media_owner_delete" on storage.objects
for delete to authenticated using (
  bucket_id = 'fnf-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_handle text;
  generated_handle text;
  display_value text;
  avatar_value text;
  provider_value text;
begin
  display_value := coalesce(
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    nullif(new.raw_user_meta_data ->> 'user_name', ''),
    'FNF trader'
  );
  display_value := left(display_value, 40);
  if char_length(display_value) < 2 then display_value := 'FNF trader'; end if;

  base_handle := lower(coalesce(
    nullif(new.raw_user_meta_data ->> 'user_name', ''),
    nullif(new.raw_user_meta_data ->> 'preferred_username', ''),
    nullif(new.raw_user_meta_data ->> 'global_name', ''),
    'trader'
  ));
  base_handle := left(regexp_replace(base_handle, '[^a-z0-9_]+', '_', 'g'), 13);
  base_handle := trim(both '_' from base_handle);
  if char_length(base_handle) < 3 then base_handle := 'trader'; end if;
  generated_handle := base_handle || '_' || left(replace(new.id::text, '-', ''), 6);

  avatar_value := coalesce(
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_user_meta_data ->> 'picture', '')
  );
  provider_value := nullif(new.raw_app_meta_data ->> 'provider', '');

  insert into public.profiles (id, display_name, handle, avatar_url, provider)
  values (new.id, display_value, generated_handle, avatar_value, provider_value);

  insert into public.trading_profiles (user_id) values (new.id);
  return new;
end;
$$;

drop function if exists public.list_crews(uuid);

create function public.list_crews(p_crew_id uuid default null)
returns table (
  id uuid,
  slug text,
  owner_id uuid,
  name text,
  thesis text,
  description text,
  avatar_url text,
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
  owner_avatar_url text,
  requested boolean,
  my_request_status text,
  membership_role text,
  pending_request_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.id,
    c.slug,
    c.owner_id,
    c.name,
    c.thesis,
    c.description,
    c.avatar_url,
    c.trading,
    c.language,
    c.market_hours,
    c.voice_preference,
    c.capacity,
    (select count(*) from public.crew_members cm where cm.crew_id = c.id and cm.status = 'active'),
    c.live_count,
    c.age_label,
    c.track_record,
    c.access_mode,
    c.owner_name,
    c.owner_handle,
    p.avatar_url,
    coalesce((select sr.status = 'pending' from public.seat_requests sr where sr.crew_id = c.id and sr.user_id = auth.uid()), false),
    (select sr.status from public.seat_requests sr where sr.crew_id = c.id and sr.user_id = auth.uid()),
    (select cm.role from public.crew_members cm where cm.crew_id = c.id and cm.user_id = auth.uid() and cm.status = 'active'),
    case when c.owner_id = auth.uid() then
      (select count(*) from public.seat_requests sr where sr.crew_id = c.id and sr.status = 'pending')
    else 0 end
  from public.crews c
  left join public.profiles p on p.id = c.owner_id
  where c.status = 'active'
    and c.owner_id is not null
    and (p_crew_id is null or c.id = p_crew_id)
  order by c.created_at desc;
$$;

drop function if exists public.create_crew(text, text, text, text, text, text, smallint);

create function public.create_crew(
  p_name text,
  p_thesis text,
  p_description text,
  p_avatar_url text,
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
  if auth.uid() is null then raise exception 'Sign in before creating a crew'; end if;
  if char_length(trim(p_name)) not between 3 and 24 then raise exception 'Crew names must be between 3 and 24 characters'; end if;
  if char_length(trim(p_thesis)) not between 20 and 200 then raise exception 'Crew theses must be between 20 and 200 characters'; end if;
  if char_length(trim(coalesce(p_description, ''))) > 500 then raise exception 'Room descriptions can use up to 500 characters'; end if;

  select p.display_name, p.handle into creator_name, creator_handle
  from public.profiles p where p.id = auth.uid();

  base_slug := trim(both '-' from regexp_replace(lower(trim(p_name)), '[^a-z0-9]+', '-', 'g'));
  if base_slug = '' then base_slug := 'crew'; end if;

  insert into public.crews (
    id, slug, owner_id, owner_name, owner_handle, name, thesis, description, avatar_url,
    trading, language, market_hours, voice_preference, capacity
  ) values (
    new_id, base_slug || '-' || left(replace(new_id::text, '-', ''), 6), auth.uid(),
    coalesce(creator_name, 'FNF trader'), coalesce(creator_handle, 'member'), trim(p_name),
    trim(p_thesis), trim(coalesce(p_description, '')), nullif(trim(coalesce(p_avatar_url, '')), ''),
    p_trading, p_language, p_market_hours, p_voice_preference, p_capacity
  );

  insert into public.crew_members (crew_id, user_id, role) values (new_id, auth.uid(), 'owner');
  return new_id;
end;
$$;

drop function if exists public.list_crew_members(uuid);

create function public.list_crew_members(p_crew_id uuid)
returns table (
  user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  bio text,
  role text,
  joined_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_crew_member(p_crew_id) then raise exception 'Join this room to see its members'; end if;
  return query
  select cm.user_id, p.display_name, p.handle, p.avatar_url, tp.bio, cm.role, cm.joined_at
  from public.crew_members cm
  join public.profiles p on p.id = cm.user_id
  left join public.trading_profiles tp on tp.user_id = cm.user_id
  where cm.crew_id = p_crew_id and cm.status = 'active'
  order by (cm.role = 'owner') desc, cm.joined_at;
end;
$$;

create or replace function public.notify_seat_request_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  room public.crews%rowtype;
  requester public.profiles%rowtype;
begin
  select * into room from public.crews c where c.id = new.crew_id;
  select * into requester from public.profiles p where p.id = new.user_id;

  if new.status = 'pending' and (tg_op = 'INSERT' or old.status is distinct from 'pending') then
    insert into public.notifications (user_id, crew_id, actor_id, type, title, body, payload)
    values (
      room.owner_id, room.id, new.user_id, 'seat_request',
      requester.display_name || ' requested a seat',
      'Review the request for ' || room.name || '.',
      jsonb_build_object('crew_slug', room.slug, 'request_id', new.id)
    );
  elsif tg_op = 'UPDATE' and new.status in ('accepted', 'declined') and old.status is distinct from new.status then
    insert into public.notifications (user_id, crew_id, actor_id, type, title, body, payload)
    values (
      new.user_id, room.id, room.owner_id,
      case when new.status = 'accepted' then 'seat_accepted' else 'seat_declined' end,
      case when new.status = 'accepted' then 'Your seat is open' else 'Seat request update' end,
      case when new.status = 'accepted'
        then 'You can enter ' || room.name || ' now.'
        else room.name || ' passed on this request.' end,
      jsonb_build_object('crew_slug', room.slug, 'request_id', new.id)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists seat_request_notifications on public.seat_requests;
create trigger seat_request_notifications
after insert or update of status on public.seat_requests
for each row execute function public.notify_seat_request_change();

create or replace function public.share_chart_with_member(
  p_crew_id uuid,
  p_target_user_id uuid,
  p_payload jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  notification_id bigint;
  sender public.profiles%rowtype;
  room public.crews%rowtype;
  symbol text;
begin
  if not public.is_crew_member(p_crew_id) then raise exception 'Join this room before sharing a chart'; end if;
  if p_target_user_id = auth.uid() then raise exception 'Choose another room member'; end if;
  if not exists (
    select 1 from public.crew_members cm
    where cm.crew_id = p_crew_id and cm.user_id = p_target_user_id and cm.status = 'active'
  ) then raise exception 'That trader is not in this room'; end if;

  select * into sender from public.profiles p where p.id = auth.uid();
  select * into room from public.crews c where c.id = p_crew_id;
  symbol := left(coalesce(nullif(p_payload ->> 'symbol', ''), 'A chart'), 24);

  insert into public.notifications (user_id, crew_id, actor_id, type, title, body, payload)
  values (
    p_target_user_id, p_crew_id, auth.uid(), 'chart_share',
    sender.display_name || ' sent you ' || symbol,
    'Open the live chart in ' || room.name || '.',
    coalesce(p_payload, '{}'::jsonb) || jsonb_build_object('crew_slug', room.slug, 'sender_name', sender.display_name)
  ) returning id into notification_id;
  return notification_id;
end;
$$;

create or replace function public.remove_crew_member(p_crew_id uuid, p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  room public.crews%rowtype;
begin
  select * into room from public.crews c where c.id = p_crew_id and c.owner_id = auth.uid();
  if room.id is null then raise exception 'Only the room owner can remove members'; end if;
  if p_user_id = auth.uid() then raise exception 'The room owner cannot remove themselves'; end if;

  update public.crew_members set status = 'removed'
  where crew_id = p_crew_id and user_id = p_user_id and role <> 'owner';

  if found then
    insert into public.notifications (user_id, crew_id, actor_id, type, title, body, payload)
    values (p_user_id, p_crew_id, auth.uid(), 'member_removed', 'Room access changed', 'You are no longer a member of ' || room.name || '.', jsonb_build_object('crew_slug', room.slug));
  end if;
  return found;
end;
$$;

delete from public.crews where owner_id is null;

revoke all on function public.list_crews(uuid) from public;
revoke all on function public.create_crew(text, text, text, text, text, text, text, text, smallint) from public;
revoke all on function public.list_crew_members(uuid) from public;
revoke all on function public.share_chart_with_member(uuid, uuid, jsonb) from public;

grant execute on function public.list_crews(uuid) to anon, authenticated;
grant execute on function public.create_crew(text, text, text, text, text, text, text, text, smallint) to authenticated;
grant execute on function public.list_crew_members(uuid) to authenticated;
grant execute on function public.share_chart_with_member(uuid, uuid, jsonb) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'seat_requests'
  ) then
    alter publication supabase_realtime add table public.seat_requests;
  end if;
end;
$$;

commit;
