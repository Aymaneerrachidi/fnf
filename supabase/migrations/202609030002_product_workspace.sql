begin;

alter table public.room_messages
  add column if not exists sender_name text not null default 'FNF trader',
  add column if not exists sender_handle text not null default 'member';

update public.room_messages rm
set sender_name = p.display_name,
    sender_handle = p.handle
from public.profiles p
where p.id = rm.user_id;

drop function if exists public.list_crews(uuid);

create function public.list_crews(p_crew_id uuid default null)
returns table (
  id uuid,
  slug text,
  owner_id uuid,
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
    coalesce((select sr.status = 'pending' from public.seat_requests sr where sr.crew_id = c.id and sr.user_id = auth.uid()), false),
    (select sr.status from public.seat_requests sr where sr.crew_id = c.id and sr.user_id = auth.uid()),
    (select cm.role from public.crew_members cm where cm.crew_id = c.id and cm.user_id = auth.uid() and cm.status = 'active'),
    case when c.owner_id = auth.uid() then
      (select count(*) from public.seat_requests sr where sr.crew_id = c.id and sr.status = 'pending')
    else 0 end
  from public.crews c
  where c.status = 'active'
    and (p_crew_id is null or c.id = p_crew_id)
  order by c.created_at desc;
$$;

create or replace function public.list_crew_requests(p_crew_id uuid)
returns table (
  id uuid,
  user_id uuid,
  display_name text,
  handle text,
  note text,
  trading text,
  language text,
  market_hours text,
  voice_preference text,
  status text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.crews c where c.id = p_crew_id and c.owner_id = auth.uid()) then
    raise exception 'Only the room owner can read seat requests';
  end if;

  return query
  select sr.id, sr.user_id, p.display_name, p.handle, sr.note,
    coalesce(sr.profile_snapshot ->> 'trading', tp.trading),
    coalesce(sr.profile_snapshot ->> 'language', tp.language),
    coalesce(sr.profile_snapshot ->> 'market_hours', tp.market_hours),
    coalesce(sr.profile_snapshot ->> 'voice_preference', tp.voice_preference),
    sr.status, sr.created_at
  from public.seat_requests sr
  join public.profiles p on p.id = sr.user_id
  left join public.trading_profiles tp on tp.user_id = sr.user_id
  where sr.crew_id = p_crew_id
  order by (sr.status = 'pending') desc, sr.created_at desc;
end;
$$;

create or replace function public.decide_seat_request(p_request_id uuid, p_decision text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.seat_requests%rowtype;
  room_capacity smallint;
  active_members integer;
begin
  if p_decision not in ('accepted', 'declined') then
    raise exception 'Decision must be accepted or declined';
  end if;

  select sr.* into target from public.seat_requests sr where sr.id = p_request_id for update;
  if target.id is null then raise exception 'Seat request not found'; end if;

  select c.capacity into room_capacity from public.crews c
  where c.id = target.crew_id and c.owner_id = auth.uid() for update;
  if room_capacity is null then raise exception 'Only the room owner can decide seat requests'; end if;

  if p_decision = 'accepted' then
    select count(*) into active_members from public.crew_members cm
    where cm.crew_id = target.crew_id and cm.status = 'active';
    if active_members >= room_capacity then raise exception 'This room is full'; end if;

    insert into public.crew_members (crew_id, user_id, role, status)
    values (target.crew_id, target.user_id, 'member', 'active')
    on conflict (crew_id, user_id) do update set status = 'active', role = 'member', joined_at = now();
  end if;

  update public.seat_requests set status = p_decision where id = p_request_id;
  return p_decision;
end;
$$;

create or replace function public.list_crew_members(p_crew_id uuid)
returns table (
  user_id uuid,
  display_name text,
  handle text,
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
  select cm.user_id, p.display_name, p.handle, cm.role, cm.joined_at
  from public.crew_members cm
  join public.profiles p on p.id = cm.user_id
  where cm.crew_id = p_crew_id and cm.status = 'active'
  order by (cm.role = 'owner') desc, cm.joined_at;
end;
$$;

create or replace function public.list_room_messages(p_crew_id uuid, p_limit integer default 100)
returns table (
  id bigint,
  user_id uuid,
  sender_name text,
  sender_handle text,
  kind text,
  body text,
  metadata jsonb,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_crew_member(p_crew_id) then raise exception 'Join this room to read its chat'; end if;
  return query
  select m.id, m.user_id, m.sender_name, m.sender_handle, m.kind, m.body, m.metadata, m.created_at
  from (
    select rm.* from public.room_messages rm
    where rm.crew_id = p_crew_id
    order by rm.created_at desc
    limit least(greatest(p_limit, 1), 200)
  ) m
  order by m.created_at;
end;
$$;

create or replace function public.send_room_message(
  p_crew_id uuid,
  p_body text,
  p_kind text default 'message',
  p_metadata jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  message_id bigint;
  sender public.profiles%rowtype;
begin
  if not public.is_crew_member(p_crew_id) then raise exception 'Join this room to send messages'; end if;
  if p_kind not in ('message', 'token', 'chart', 'system') then raise exception 'Unsupported message type'; end if;
  if char_length(trim(p_body)) not between 1 and 2000 then raise exception 'Messages must contain 1 to 2000 characters'; end if;
  select * into sender from public.profiles p where p.id = auth.uid();
  insert into public.room_messages (crew_id, user_id, sender_name, sender_handle, kind, body, metadata)
  values (p_crew_id, auth.uid(), sender.display_name, sender.handle, p_kind, trim(p_body), coalesce(p_metadata, '{}'::jsonb))
  returning id into message_id;
  return message_id;
end;
$$;

create or replace function public.remove_crew_member(p_crew_id uuid, p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.crews c where c.id = p_crew_id and c.owner_id = auth.uid()) then
    raise exception 'Only the room owner can remove members';
  end if;
  if p_user_id = auth.uid() then raise exception 'The room owner cannot remove themselves'; end if;
  update public.crew_members set status = 'removed'
  where crew_id = p_crew_id and user_id = p_user_id and role <> 'owner';
  return found;
end;
$$;

create or replace function public.leave_crew(p_crew_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.crews c where c.id = p_crew_id and c.owner_id = auth.uid()) then
    raise exception 'Transfer or archive your room instead of leaving it';
  end if;
  update public.crew_members set status = 'left'
  where crew_id = p_crew_id and user_id = auth.uid() and status = 'active';
  return found;
end;
$$;

revoke all on function public.list_crews(uuid) from public;
revoke all on function public.list_crew_requests(uuid) from public;
revoke all on function public.decide_seat_request(uuid, text) from public;
revoke all on function public.list_crew_members(uuid) from public;
revoke all on function public.list_room_messages(uuid, integer) from public;
revoke all on function public.send_room_message(uuid, text, text, jsonb) from public;
revoke all on function public.remove_crew_member(uuid, uuid) from public;
revoke all on function public.leave_crew(uuid) from public;

grant execute on function public.list_crews(uuid) to anon, authenticated;
grant execute on function public.list_crew_requests(uuid) to authenticated;
grant execute on function public.decide_seat_request(uuid, text) to authenticated;
grant execute on function public.list_crew_members(uuid) to authenticated;
grant execute on function public.list_room_messages(uuid, integer) to authenticated;
grant execute on function public.send_room_message(uuid, text, text, jsonb) to authenticated;
grant execute on function public.remove_crew_member(uuid, uuid) to authenticated;
grant execute on function public.leave_crew(uuid) to authenticated;

commit;
