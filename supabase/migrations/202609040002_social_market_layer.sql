begin;

alter table public.profiles
  add column if not exists location text not null default '' check (char_length(location) <= 80),
  add column if not exists availability_status text not null default 'open' check (availability_status in ('open', 'quiet', 'crew-only')),
  add column if not exists x_url text,
  add column if not exists discord_handle text not null default '' check (char_length(discord_handle) <= 40),
  add column if not exists last_seen_at timestamptz;

alter table public.trading_profiles
  add column if not exists experience_level text not null default 'Active' check (experience_level in ('Learning', 'Active', 'Full-time')),
  add column if not exists communication_style text not null default 'Balanced' check (communication_style in ('Voice-first', 'Balanced', 'Text-first')),
  add column if not exists languages text[] not null default array['English']::text[];

alter table public.crews
  add column if not exists accent text not null default '#ff3bbe' check (accent ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists manifesto text not null default '' check (char_length(manifesto) <= 280),
  add column if not exists crew_emoji text not null default '⌁' check (char_length(crew_emoji) between 1 and 8),
  add column if not exists rituals text not null default '' check (char_length(rituals) <= 280),
  add column if not exists application_question text not null default 'Why this room?' check (char_length(application_question) between 4 and 140),
  add column if not exists invite_code text unique default encode(gen_random_bytes(6), 'hex'),
  add column if not exists public_preview boolean not null default true;

-- Owners must retain row visibility while changing a room out of the public
-- `active` state; otherwise PostgREST's UPDATE check rejects archiving.
drop policy if exists "owners_read_own_crews" on public.crews;
create policy "owners_read_own_crews" on public.crews
for select to authenticated using (owner_id = auth.uid());

alter table public.seat_requests
  add column if not exists availability_note text not null default '' check (char_length(availability_note) <= 160),
  add column if not exists contribution text not null default '' check (char_length(contribution) <= 280),
  add column if not exists intro_url text;

alter table public.room_messages
  add column if not exists reply_to bigint references public.room_messages(id) on delete set null,
  add column if not exists pinned_at timestamptz;

alter table public.room_messages drop constraint if exists room_messages_kind_check;
alter table public.room_messages add constraint room_messages_kind_check check (kind in ('message', 'token', 'chart', 'system', 'image', 'poll', 'event', 'introduction'));

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'seat_request', 'seat_accepted', 'seat_declined', 'chart_share', 'member_removed',
  'connection_request', 'connection_accepted', 'introduction', 'direct_message',
  'crew_event', 'market_alert'
));

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> addressee_id),
  unique (requester_id, addressee_id)
);

create unique index if not exists connections_pair_unique
  on public.connections (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

create table if not exists public.introductions (
  id uuid primary key default gen_random_uuid(),
  introducer_id uuid not null references public.profiles(id) on delete cascade,
  person_a_id uuid not null references public.profiles(id) on delete cascade,
  person_b_id uuid not null references public.profiles(id) on delete cascade,
  note text not null check (char_length(note) between 4 and 280),
  status text not null default 'open' check (status in ('open', 'connected', 'dismissed')),
  created_at timestamptz not null default now(),
  check (person_a_id <> person_b_id and introducer_id <> person_a_id and introducer_id <> person_b_id)
);

create table if not exists public.direct_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.direct_conversation_members (
  conversation_id uuid not null references public.direct_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create table if not exists public.direct_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.direct_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  kind text not null default 'message' check (kind in ('message', 'token', 'chart')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.crew_events (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 80),
  description text not null default '' check (char_length(description) <= 500),
  starts_at timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes between 15 and 360),
  event_type text not null default 'voice' check (event_type in ('voice', 'discussion', 'research', 'hangout')),
  created_at timestamptz not null default now()
);

create table if not exists public.crew_watchlist (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  added_by uuid not null references public.profiles(id) on delete cascade,
  network text not null check (network in ('solana', 'base', 'bsc', 'robinhood')),
  token_address text not null,
  pool_address text not null,
  symbol text not null check (char_length(symbol) between 1 and 24),
  name text not null default '',
  snapshot jsonb not null default '{}'::jsonb,
  note text not null default '' check (char_length(note) <= 280),
  sentiment text not null default 'watching' check (sentiment in ('watching', 'interesting', 'risky', 'dead', 'research')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (crew_id, network, token_address)
);

create table if not exists public.saved_tokens (
  user_id uuid not null references public.profiles(id) on delete cascade,
  network text not null check (network in ('solana', 'base', 'bsc', 'robinhood')),
  token_address text not null,
  pool_address text not null,
  symbol text not null check (char_length(symbol) between 1 and 24),
  name text not null default '',
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, network, token_address)
);

create table if not exists public.token_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  network text not null check (network in ('solana', 'base', 'bsc', 'robinhood')),
  token_address text not null,
  pool_address text not null,
  symbol text not null check (char_length(symbol) between 1 and 24),
  metric text not null default 'market_cap' check (metric in ('market_cap', 'liquidity', 'volume')),
  direction text not null check (direction in ('above', 'below')),
  threshold numeric not null check (threshold > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.chart_annotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  crew_id uuid references public.crews(id) on delete cascade,
  network text not null check (network in ('solana', 'base', 'bsc', 'robinhood')),
  token_address text not null,
  pool_address text not null,
  candle_time bigint not null,
  market_cap numeric not null,
  body text not null check (char_length(body) between 1 and 280),
  created_at timestamptz not null default now()
);

create table if not exists public.room_polls (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  question text not null check (char_length(question) between 3 and 180),
  closes_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.room_poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.room_polls(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 80),
  position smallint not null default 0,
  unique (poll_id, label)
);

create table if not exists public.room_poll_votes (
  poll_id uuid not null references public.room_polls(id) on delete cascade,
  option_id uuid not null references public.room_poll_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);

create table if not exists public.message_reactions (
  message_id bigint not null references public.room_messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null check (emoji in ('⚡', '👀', '🧠', '🤝', '⚠️')),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);

create index if not exists connections_people_idx on public.connections (requester_id, addressee_id, status);
create index if not exists dm_conversation_idx on public.direct_messages (conversation_id, created_at desc);
create index if not exists crew_events_room_idx on public.crew_events (crew_id, starts_at);
create index if not exists crew_watchlist_room_idx on public.crew_watchlist (crew_id, updated_at desc);
create index if not exists token_alerts_user_idx on public.token_alerts (user_id, active, created_at desc);
create index if not exists chart_annotations_token_idx on public.chart_annotations (network, token_address, candle_time);

alter table public.connections enable row level security;
alter table public.introductions enable row level security;
alter table public.direct_conversations enable row level security;
alter table public.direct_conversation_members enable row level security;
alter table public.direct_messages enable row level security;
alter table public.crew_events enable row level security;
alter table public.crew_watchlist enable row level security;
alter table public.saved_tokens enable row level security;
alter table public.token_alerts enable row level security;
alter table public.chart_annotations enable row level security;
alter table public.room_polls enable row level security;
alter table public.room_poll_options enable row level security;
alter table public.room_poll_votes enable row level security;
alter table public.message_reactions enable row level security;

create policy "connections_visible_to_people" on public.connections for select to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());
create policy "introductions_visible_to_people" on public.introductions for select to authenticated
  using (introducer_id = auth.uid() or person_a_id = auth.uid() or person_b_id = auth.uid());
create policy "conversation_members_read_own" on public.direct_conversation_members for select to authenticated
  using (user_id = auth.uid());
create policy "direct_messages_read_member" on public.direct_messages for select to authenticated
  using (exists (select 1 from public.direct_conversation_members dcm where dcm.conversation_id = direct_messages.conversation_id and dcm.user_id = auth.uid()));
create policy "crew_events_read_members" on public.crew_events for select to authenticated using (public.is_crew_member(crew_id));
create policy "crew_events_write_leads" on public.crew_events for insert to authenticated with check (
  creator_id = auth.uid() and exists (select 1 from public.crew_members cm where cm.crew_id = crew_events.crew_id and cm.user_id = auth.uid() and cm.status = 'active' and cm.role in ('owner', 'moderator'))
);
create policy "crew_events_delete_leads" on public.crew_events for delete to authenticated using (
  creator_id = auth.uid() or exists (select 1 from public.crews c where c.id = crew_events.crew_id and c.owner_id = auth.uid())
);
create policy "crew_watchlist_read_members" on public.crew_watchlist for select to authenticated using (public.is_crew_member(crew_id));
create policy "crew_watchlist_add_members" on public.crew_watchlist for insert to authenticated with check (added_by = auth.uid() and public.is_crew_member(crew_id));
create policy "crew_watchlist_update_members" on public.crew_watchlist for update to authenticated using (public.is_crew_member(crew_id)) with check (public.is_crew_member(crew_id));
create policy "crew_watchlist_delete_members" on public.crew_watchlist for delete to authenticated using (public.is_crew_member(crew_id));
create policy "saved_tokens_own" on public.saved_tokens for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "token_alerts_own" on public.token_alerts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "annotations_read_visible" on public.chart_annotations for select to authenticated using (user_id = auth.uid() or (crew_id is not null and public.is_crew_member(crew_id)));
create policy "annotations_add_visible" on public.chart_annotations for insert to authenticated with check (user_id = auth.uid() and (crew_id is null or public.is_crew_member(crew_id)));
create policy "annotations_delete_own" on public.chart_annotations for delete to authenticated using (user_id = auth.uid());
create policy "room_polls_read_members" on public.room_polls for select to authenticated using (public.is_crew_member(crew_id));
create policy "room_polls_add_members" on public.room_polls for insert to authenticated with check (creator_id = auth.uid() and public.is_crew_member(crew_id));
create policy "poll_options_read_members" on public.room_poll_options for select to authenticated using (exists (select 1 from public.room_polls p where p.id = room_poll_options.poll_id and public.is_crew_member(p.crew_id)));
create policy "poll_options_add_creator" on public.room_poll_options for insert to authenticated with check (exists (select 1 from public.room_polls p where p.id = room_poll_options.poll_id and p.creator_id = auth.uid()));
create policy "poll_votes_read_members" on public.room_poll_votes for select to authenticated using (exists (select 1 from public.room_polls p where p.id = room_poll_votes.poll_id and public.is_crew_member(p.crew_id)));
create policy "poll_votes_add_members" on public.room_poll_votes for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.room_polls p where p.id = room_poll_votes.poll_id and public.is_crew_member(p.crew_id)));
create policy "poll_votes_change_own" on public.room_poll_votes for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "message_reactions_read_members" on public.message_reactions for select to authenticated using (exists (select 1 from public.room_messages m where m.id = message_reactions.message_id and public.is_crew_member(m.crew_id)));
create policy "message_reactions_add_members" on public.message_reactions for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.room_messages m where m.id = message_reactions.message_id and public.is_crew_member(m.crew_id)));
create policy "message_reactions_remove_own" on public.message_reactions for delete to authenticated using (user_id = auth.uid());

create or replace function public.discover_people(p_query text default '', p_limit integer default 40)
returns table (
  id uuid, display_name text, handle text, avatar_url text, location text, availability_status text,
  trading text, language text, market_hours text, voice_preference text, bio text,
  experience_level text, communication_style text, connection_status text, mutual_crews bigint, match_score integer
)
language sql stable security definer set search_path = '' as $$
  with me as (
    select tp.* from public.trading_profiles tp where tp.user_id = auth.uid()
  )
  select p.id, p.display_name, p.handle, p.avatar_url, p.location, p.availability_status,
    tp.trading, tp.language, tp.market_hours, tp.voice_preference, tp.bio,
    tp.experience_level, tp.communication_style,
    coalesce((select c.status from public.connections c where (c.requester_id = auth.uid() and c.addressee_id = p.id) or (c.addressee_id = auth.uid() and c.requester_id = p.id) limit 1), 'none'),
    (select count(*) from public.crew_members mine join public.crew_members theirs on theirs.crew_id = mine.crew_id where mine.user_id = auth.uid() and theirs.user_id = p.id and mine.status = 'active' and theirs.status = 'active'),
    (case when tp.trading = me.trading then 35 else 0 end + case when tp.language = me.language then 25 else 0 end + case when tp.market_hours = me.market_hours then 25 else 0 end + case when tp.communication_style = me.communication_style then 15 else 0 end)::integer
  from public.profiles p
  join public.trading_profiles tp on tp.user_id = p.id
  cross join me
  where p.id <> auth.uid() and p.availability_status <> 'quiet'
    and (trim(coalesce(p_query, '')) = '' or p.display_name ilike '%' || trim(p_query) || '%' or p.handle ilike '%' || trim(p_query) || '%' or tp.bio ilike '%' || trim(p_query) || '%')
  order by 16 desc, 15 desc, p.created_at desc
  limit least(greatest(p_limit, 1), 100);
$$;

create or replace function public.send_connection_request(p_target uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid; sender_name text; existing_id uuid;
begin
  if p_target = auth.uid() then raise exception 'Choose another trader'; end if;
  if not exists (select 1 from public.profiles p where p.id = p_target) then raise exception 'Trader not found'; end if;
  select id into existing_id from public.connections where (requester_id = auth.uid() and addressee_id = p_target) or (requester_id = p_target and addressee_id = auth.uid()) limit 1 for update;
  if existing_id is null then
    insert into public.connections (requester_id, addressee_id, status) values (auth.uid(), p_target, 'pending') returning id into new_id;
  else
    update public.connections set requester_id = auth.uid(), addressee_id = p_target, status = 'pending', updated_at = now() where id = existing_id returning id into new_id;
  end if;
  select display_name into sender_name from public.profiles where id = auth.uid();
  insert into public.notifications (user_id, actor_id, type, title, body, payload) values (p_target, auth.uid(), 'connection_request', sender_name || ' wants to connect', 'They found you through the FNF network.', jsonb_build_object('connection_id', new_id));
  return new_id;
end; $$;

create or replace function public.decide_connection(p_connection_id uuid, p_decision text)
returns text language plpgsql security definer set search_path = '' as $$
declare item public.connections%rowtype; receiver_name text;
begin
  if p_decision not in ('accepted', 'declined', 'blocked') then raise exception 'Invalid connection decision'; end if;
  select * into item from public.connections where id = p_connection_id and addressee_id = auth.uid() for update;
  if item.id is null then raise exception 'Connection request not found'; end if;
  update public.connections set status = p_decision, updated_at = now() where id = item.id;
  if p_decision = 'accepted' then
    select display_name into receiver_name from public.profiles where id = auth.uid();
    insert into public.notifications (user_id, actor_id, type, title, body, payload) values (item.requester_id, auth.uid(), 'connection_accepted', receiver_name || ' connected with you', 'You can now message each other directly.', jsonb_build_object('connection_id', item.id));
  end if;
  return p_decision;
end; $$;

create or replace function public.list_connections()
returns table (connection_id uuid, user_id uuid, display_name text, handle text, avatar_url text, trading text, language text, market_hours text, status text, direction text)
language sql stable security definer set search_path = '' as $$
  select c.id,
    case when c.requester_id = auth.uid() then c.addressee_id else c.requester_id end,
    p.display_name, p.handle, p.avatar_url, tp.trading, tp.language, tp.market_hours, c.status,
    case when c.requester_id = auth.uid() then 'outgoing' else 'incoming' end
  from public.connections c
  join public.profiles p on p.id = case when c.requester_id = auth.uid() then c.addressee_id else c.requester_id end
  left join public.trading_profiles tp on tp.user_id = p.id
  where c.requester_id = auth.uid() or c.addressee_id = auth.uid()
  order by (c.status = 'pending' and c.addressee_id = auth.uid()) desc, c.updated_at desc;
$$;

create or replace function public.get_or_create_conversation(p_target uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare convo uuid;
begin
  if not exists (select 1 from public.connections c where c.status = 'accepted' and ((c.requester_id = auth.uid() and c.addressee_id = p_target) or (c.addressee_id = auth.uid() and c.requester_id = p_target))) then raise exception 'Connect before messaging'; end if;
  select mine.conversation_id into convo from public.direct_conversation_members mine join public.direct_conversation_members theirs on theirs.conversation_id = mine.conversation_id and theirs.user_id = p_target where mine.user_id = auth.uid() and (select count(*) from public.direct_conversation_members x where x.conversation_id = mine.conversation_id) = 2 limit 1;
  if convo is null then
    insert into public.direct_conversations default values returning id into convo;
    insert into public.direct_conversation_members (conversation_id, user_id) values (convo, auth.uid()), (convo, p_target);
  end if;
  return convo;
end; $$;

create or replace function public.list_conversations()
returns table (conversation_id uuid, user_id uuid, display_name text, handle text, avatar_url text, last_body text, last_at timestamptz, unread bigint)
language sql stable security definer set search_path = '' as $$
  select mine.conversation_id, other.user_id, p.display_name, p.handle, p.avatar_url,
    coalesce(last_message.body, 'Start the conversation'), coalesce(last_message.created_at, dc.created_at),
    (select count(*) from public.direct_messages unread_message where unread_message.conversation_id = mine.conversation_id and unread_message.sender_id <> auth.uid() and unread_message.created_at > coalesce(mine.last_read_at, '-infinity'::timestamptz))
  from public.direct_conversation_members mine
  join public.direct_conversations dc on dc.id = mine.conversation_id
  join public.direct_conversation_members other on other.conversation_id = mine.conversation_id and other.user_id <> auth.uid()
  join public.profiles p on p.id = other.user_id
  left join lateral (select dm.body, dm.created_at from public.direct_messages dm where dm.conversation_id = mine.conversation_id order by dm.created_at desc limit 1) last_message on true
  where mine.user_id = auth.uid()
  order by coalesce(last_message.created_at, dc.created_at) desc;
$$;

create or replace function public.list_direct_messages(p_conversation_id uuid, p_limit integer default 100)
returns table (id bigint, sender_id uuid, sender_name text, sender_handle text, body text, kind text, metadata jsonb, created_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.direct_conversation_members m where m.conversation_id = p_conversation_id and m.user_id = auth.uid()) then raise exception 'Conversation unavailable'; end if;
  update public.direct_conversation_members dcm set last_read_at = now() where dcm.conversation_id = p_conversation_id and dcm.user_id = auth.uid();
  return query select dm.id, dm.sender_id, p.display_name, p.handle, dm.body, dm.kind, dm.metadata, dm.created_at from public.direct_messages dm join public.profiles p on p.id = dm.sender_id where dm.conversation_id = p_conversation_id order by dm.created_at desc limit least(greatest(p_limit, 1), 200);
end; $$;

create or replace function public.send_direct_message(p_conversation_id uuid, p_body text, p_kind text default 'message', p_metadata jsonb default '{}'::jsonb)
returns bigint language plpgsql security definer set search_path = '' as $$
declare message_id bigint; recipient uuid; sender_name text;
begin
  if not exists (select 1 from public.direct_conversation_members m where m.conversation_id = p_conversation_id and m.user_id = auth.uid()) then raise exception 'Conversation unavailable'; end if;
  if p_kind not in ('message', 'token', 'chart') then raise exception 'Unsupported message type'; end if;
  insert into public.direct_messages (conversation_id, sender_id, body, kind, metadata) values (p_conversation_id, auth.uid(), trim(p_body), p_kind, coalesce(p_metadata, '{}'::jsonb)) returning id into message_id;
  update public.direct_conversations set updated_at = now() where id = p_conversation_id;
  select user_id into recipient from public.direct_conversation_members where conversation_id = p_conversation_id and user_id <> auth.uid() limit 1;
  select display_name into sender_name from public.profiles where id = auth.uid();
  insert into public.notifications (user_id, actor_id, type, title, body, payload) values (recipient, auth.uid(), 'direct_message', sender_name || ' messaged you', left(trim(p_body), 140), jsonb_build_object('conversation_id', p_conversation_id));
  return message_id;
end; $$;

create or replace function public.create_introduction(p_person_a uuid, p_person_b uuid, p_note text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid; sender_name text;
begin
  if p_person_a = p_person_b or p_person_a = auth.uid() or p_person_b = auth.uid() then raise exception 'Choose two different connections'; end if;
  if not exists (select 1 from public.connections c where c.status = 'accepted' and ((c.requester_id = auth.uid() and c.addressee_id = p_person_a) or (c.addressee_id = auth.uid() and c.requester_id = p_person_a))) or not exists (select 1 from public.connections c where c.status = 'accepted' and ((c.requester_id = auth.uid() and c.addressee_id = p_person_b) or (c.addressee_id = auth.uid() and c.requester_id = p_person_b))) then raise exception 'You can only introduce your connections'; end if;
  insert into public.introductions (introducer_id, person_a_id, person_b_id, note) values (auth.uid(), p_person_a, p_person_b, trim(p_note)) returning id into new_id;
  select display_name into sender_name from public.profiles where id = auth.uid();
  insert into public.notifications (user_id, actor_id, type, title, body, payload) values
    (p_person_a, auth.uid(), 'introduction', sender_name || ' made an introduction', trim(p_note), jsonb_build_object('introduction_id', new_id, 'other_user_id', p_person_b)),
    (p_person_b, auth.uid(), 'introduction', sender_name || ' made an introduction', trim(p_note), jsonb_build_object('introduction_id', new_id, 'other_user_id', p_person_a));
  return new_id;
end; $$;

create or replace function public.list_introductions()
returns table (id uuid, introducer_name text, other_user_id uuid, other_name text, other_handle text, other_avatar_url text, note text, status text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select i.id, intro.display_name,
    case when i.person_a_id = auth.uid() then i.person_b_id else i.person_a_id end,
    other.display_name, other.handle, other.avatar_url, i.note, i.status, i.created_at
  from public.introductions i
  join public.profiles intro on intro.id = i.introducer_id
  join public.profiles other on other.id = case when i.person_a_id = auth.uid() then i.person_b_id else i.person_a_id end
  where i.person_a_id = auth.uid() or i.person_b_id = auth.uid()
  order by i.created_at desc;
$$;

create or replace function public.list_token_activity(p_network text, p_token_address text)
returns table (message_id bigint, crew_id uuid, crew_name text, crew_slug text, sender_name text, sender_handle text, body text, metadata jsonb, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select rm.id, rm.crew_id, c.name, c.slug, rm.sender_name, rm.sender_handle, rm.body, rm.metadata, rm.created_at
  from public.room_messages rm join public.crews c on c.id = rm.crew_id
  where public.is_crew_member(rm.crew_id) and rm.kind in ('token', 'chart')
    and rm.metadata ->> 'network' = p_network
    and lower(rm.metadata ->> 'tokenAddress') = lower(p_token_address)
  order by rm.created_at desc limit 60;
$$;

drop function if exists public.list_crews(uuid);
create function public.list_crews(p_crew_id uuid default null)
returns table (
  id uuid, slug text, owner_id uuid, name text, thesis text, description text, avatar_url text,
  trading text, language text, market_hours text, voice_preference text, capacity smallint,
  member_count bigint, live_count smallint, age_label text, track_record text, access_mode text,
  owner_name text, owner_handle text, owner_avatar_url text, requested boolean, my_request_status text,
  membership_role text, pending_request_count bigint, accent text, manifesto text, crew_emoji text,
  rituals text, application_question text, invite_code text, public_preview boolean
)
language sql stable security definer set search_path = '' as $$
  select c.id, c.slug, c.owner_id, c.name, c.thesis, c.description, c.avatar_url,
    c.trading, c.language, c.market_hours, c.voice_preference, c.capacity,
    (select count(*) from public.crew_members cm where cm.crew_id = c.id and cm.status = 'active'),
    c.live_count, c.age_label, c.track_record, c.access_mode, c.owner_name, c.owner_handle, p.avatar_url,
    coalesce((select sr.status = 'pending' from public.seat_requests sr where sr.crew_id = c.id and sr.user_id = auth.uid()), false),
    (select sr.status from public.seat_requests sr where sr.crew_id = c.id and sr.user_id = auth.uid()),
    (select cm.role from public.crew_members cm where cm.crew_id = c.id and cm.user_id = auth.uid() and cm.status = 'active'),
    case when c.owner_id = auth.uid() then (select count(*) from public.seat_requests sr where sr.crew_id = c.id and sr.status = 'pending') else 0 end,
    c.accent, c.manifesto, c.crew_emoji, c.rituals, c.application_question,
    case when c.owner_id = auth.uid() then c.invite_code else null end, c.public_preview
  from public.crews c left join public.profiles p on p.id = c.owner_id
  where c.status = 'active' and c.owner_id is not null and (p_crew_id is null or c.id = p_crew_id)
    and (c.public_preview or public.is_crew_member(c.id))
  order by c.created_at desc;
$$;

drop function if exists public.list_crew_requests(uuid);
create function public.list_crew_requests(p_crew_id uuid)
returns table (id uuid, user_id uuid, display_name text, handle text, avatar_url text, bio text, note text, availability_note text, contribution text, intro_url text, trading text, language text, market_hours text, voice_preference text, status text, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.crews c where c.id = p_crew_id and c.owner_id = auth.uid()) then raise exception 'Only the room owner can read seat requests'; end if;
  return query select sr.id, sr.user_id, p.display_name, p.handle, p.avatar_url, tp.bio, sr.note, sr.availability_note, sr.contribution, sr.intro_url,
    coalesce(sr.profile_snapshot ->> 'trading', tp.trading), coalesce(sr.profile_snapshot ->> 'language', tp.language), coalesce(sr.profile_snapshot ->> 'market_hours', tp.market_hours), coalesce(sr.profile_snapshot ->> 'voice_preference', tp.voice_preference), sr.status, sr.created_at
  from public.seat_requests sr join public.profiles p on p.id = sr.user_id left join public.trading_profiles tp on tp.user_id = sr.user_id where sr.crew_id = p_crew_id order by (sr.status = 'pending') desc, sr.created_at desc;
end; $$;

create or replace function public.request_seat_profiled(p_crew_id uuid, p_note text, p_availability text, p_contribution text, p_intro_url text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare request_id uuid;
begin
  request_id := public.request_seat(p_crew_id, p_note);
  update public.seat_requests set availability_note = left(trim(coalesce(p_availability, '')), 160), contribution = left(trim(coalesce(p_contribution, '')), 280), intro_url = nullif(trim(coalesce(p_intro_url, '')), '') where id = request_id and user_id = auth.uid();
  return request_id;
end; $$;

drop function if exists public.list_room_messages(uuid, integer);
create function public.list_room_messages(p_crew_id uuid, p_limit integer default 100)
returns table (id bigint, user_id uuid, sender_name text, sender_handle text, kind text, body text, metadata jsonb, reply_to bigint, pinned_at timestamptz, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_crew_member(p_crew_id) then raise exception 'Join this room to read its feed'; end if;
  return query select m.id, m.user_id, m.sender_name, m.sender_handle, m.kind, m.body, m.metadata, m.reply_to, m.pinned_at, m.created_at
  from (select rm.* from public.room_messages rm where rm.crew_id = p_crew_id order by rm.created_at desc limit least(greatest(p_limit, 1), 200)) m order by m.created_at;
end; $$;

create or replace function public.send_room_message(
  p_crew_id uuid,
  p_body text,
  p_kind text default 'message',
  p_metadata jsonb default '{}'::jsonb
)
returns bigint language plpgsql security definer set search_path = '' as $$
declare message_id bigint; sender public.profiles%rowtype;
begin
  if not public.is_crew_member(p_crew_id) then raise exception 'Join this room to send messages'; end if;
  if p_kind not in ('message', 'token', 'chart', 'system', 'image', 'poll', 'event', 'introduction') then raise exception 'Unsupported message type'; end if;
  if char_length(trim(p_body)) not between 1 and 2000 then raise exception 'Messages must contain 1 to 2000 characters'; end if;
  select * into sender from public.profiles p where p.id = auth.uid();
  insert into public.room_messages (crew_id, user_id, sender_name, sender_handle, kind, body, metadata)
  values (p_crew_id, auth.uid(), sender.display_name, sender.handle, p_kind, trim(p_body), coalesce(p_metadata, '{}'::jsonb))
  returning id into message_id;
  return message_id;
end; $$;

create or replace function public.pin_room_message(p_message_id bigint)
returns boolean language plpgsql security definer set search_path = '' as $$
declare room_id uuid;
begin
  select crew_id into room_id from public.room_messages where id = p_message_id;
  if not exists (select 1 from public.crew_members cm where cm.crew_id = room_id and cm.user_id = auth.uid() and cm.status = 'active' and cm.role in ('owner', 'moderator')) then raise exception 'Only room leads can pin messages'; end if;
  update public.room_messages set pinned_at = case when pinned_at is null then now() else null end where id = p_message_id;
  return found;
end; $$;

create or replace function public.create_room_poll(p_crew_id uuid, p_question text, p_options text[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare poll_id uuid; option_label text; position smallint := 0;
begin
  if not public.is_crew_member(p_crew_id) then raise exception 'Join this room to create a poll'; end if;
  if array_length(p_options, 1) not between 2 and 5 then raise exception 'Polls need two to five options'; end if;
  insert into public.room_polls (crew_id, creator_id, question) values (p_crew_id, auth.uid(), trim(p_question)) returning id into poll_id;
  foreach option_label in array p_options loop
    insert into public.room_poll_options (poll_id, label, position) values (poll_id, trim(option_label), position);
    position := position + 1;
  end loop;
  perform public.send_room_message(p_crew_id, trim(p_question), 'poll', jsonb_build_object('poll_id', poll_id));
  return poll_id;
end; $$;

create or replace function public.vote_room_poll(p_poll_id uuid, p_option_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare room_id uuid;
begin
  select crew_id into room_id from public.room_polls where id = p_poll_id;
  if not public.is_crew_member(room_id) then raise exception 'Join this room to vote'; end if;
  if not exists (select 1 from public.room_poll_options where id = p_option_id and poll_id = p_poll_id) then raise exception 'Poll option not found'; end if;
  insert into public.room_poll_votes (poll_id, option_id, user_id) values (p_poll_id, p_option_id, auth.uid())
  on conflict (poll_id, user_id) do update set option_id = excluded.option_id, created_at = now();
  return true;
end; $$;

create or replace function public.list_room_polls(p_crew_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_crew_member(p_crew_id) then raise exception 'Join this room to see polls'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
    'id', p.id, 'question', p.question, 'created_at', p.created_at,
    'options', (select jsonb_agg(jsonb_build_object('id', o.id, 'label', o.label, 'votes', (select count(*) from public.room_poll_votes v where v.option_id = o.id), 'mine', exists(select 1 from public.room_poll_votes v where v.option_id = o.id and v.user_id = auth.uid())) order by o.position) from public.room_poll_options o where o.poll_id = p.id)
  ) order by p.created_at desc) from public.room_polls p where p.crew_id = p_crew_id), '[]'::jsonb);
end; $$;

revoke all on function public.discover_people(text, integer) from public;
revoke all on function public.send_connection_request(uuid) from public;
revoke all on function public.decide_connection(uuid, text) from public;
revoke all on function public.list_connections() from public;
revoke all on function public.get_or_create_conversation(uuid) from public;
revoke all on function public.list_conversations() from public;
revoke all on function public.list_direct_messages(uuid, integer) from public;
revoke all on function public.send_direct_message(uuid, text, text, jsonb) from public;
revoke all on function public.create_introduction(uuid, uuid, text) from public;
revoke all on function public.list_introductions() from public;
revoke all on function public.list_token_activity(text, text) from public;
revoke all on function public.list_crews(uuid) from public;
revoke all on function public.list_crew_requests(uuid) from public;
revoke all on function public.request_seat_profiled(uuid, text, text, text, text) from public;
revoke all on function public.list_room_messages(uuid, integer) from public;
revoke all on function public.pin_room_message(bigint) from public;
revoke all on function public.create_room_poll(uuid, text, text[]) from public;
revoke all on function public.vote_room_poll(uuid, uuid) from public;
revoke all on function public.list_room_polls(uuid) from public;

grant execute on function public.discover_people(text, integer) to authenticated;
grant execute on function public.send_connection_request(uuid) to authenticated;
grant execute on function public.decide_connection(uuid, text) to authenticated;
grant execute on function public.list_connections() to authenticated;
grant execute on function public.get_or_create_conversation(uuid) to authenticated;
grant execute on function public.list_conversations() to authenticated;
grant execute on function public.list_direct_messages(uuid, integer) to authenticated;
grant execute on function public.send_direct_message(uuid, text, text, jsonb) to authenticated;
grant execute on function public.create_introduction(uuid, uuid, text) to authenticated;
grant execute on function public.list_introductions() to authenticated;
grant execute on function public.list_token_activity(text, text) to authenticated;
grant execute on function public.list_crews(uuid) to anon, authenticated;
grant execute on function public.list_crew_requests(uuid) to authenticated;
grant execute on function public.request_seat_profiled(uuid, text, text, text, text) to authenticated;
grant execute on function public.list_room_messages(uuid, integer) to authenticated;
grant execute on function public.pin_room_message(bigint) to authenticated;
grant execute on function public.create_room_poll(uuid, text, text[]) to authenticated;
grant execute on function public.vote_room_poll(uuid, uuid) to authenticated;
grant execute on function public.list_room_polls(uuid) to authenticated;

revoke all on public.connections, public.introductions, public.direct_conversations, public.direct_conversation_members, public.direct_messages, public.crew_events, public.crew_watchlist, public.saved_tokens, public.token_alerts, public.chart_annotations from anon, authenticated;
grant select on public.connections, public.introductions, public.direct_conversation_members, public.direct_messages, public.crew_events, public.crew_watchlist, public.saved_tokens, public.token_alerts, public.chart_annotations to authenticated;
grant insert, update, delete on public.crew_events, public.crew_watchlist, public.saved_tokens, public.token_alerts, public.chart_annotations, public.room_polls, public.room_poll_options, public.room_poll_votes, public.message_reactions to authenticated;
grant usage, select on sequence public.direct_messages_id_seq to authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array['connections','introductions','direct_messages','crew_events','crew_watchlist','token_alerts'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end $$;

commit;
