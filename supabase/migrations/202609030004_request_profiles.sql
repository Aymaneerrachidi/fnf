begin;

drop function if exists public.list_crew_requests(uuid);

create function public.list_crew_requests(p_crew_id uuid)
returns table (
  id uuid,
  user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  bio text,
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
  select sr.id, sr.user_id, p.display_name, p.handle, p.avatar_url, tp.bio, sr.note,
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

revoke all on function public.list_crew_requests(uuid) from public;
grant execute on function public.list_crew_requests(uuid) to authenticated;

commit;
