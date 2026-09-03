# FNF backend

The backend is cloud-first: hosted Supabase provides authentication, Postgres,
row-level security, and realtime room events. LiveKit Cloud and hosted
market-data APIs stay separate so each system has one clear job. Docker and a
local database are not required.

## What works

- Public crew discovery through a safe `list_crews` database function
- Required email accounts with persistent browser sessions
- Atomic crew creation with the creator installed as owner
- Atomic seat requests with capacity and membership checks
- Private member-only room messages prepared for Supabase Realtime
- Cloud market-data proxy for DEX Screener discovery and GeckoTerminal OHLCV
- Authenticated LiveKit Cloud token endpoint restricted to active room members
- Existing local crew data as a development fallback when no backend is configured

## Set up the hosted Supabase project

1. Create a Supabase project.
2. In **Authentication > Providers**, keep anonymous sign-ins disabled and
   enable email/password authentication.
3. In the hosted dashboard SQL editor, run
   `supabase/migrations/202609030001_initial_backend.sql`.
4. Optionally run `supabase/seed.sql` to add the demo rooms.
5. Copy `.env.example` to `.env.local` and add the project URL and publishable
   anon key.
6. Restart `npm run dev`. The local frontend now talks directly to Supabase
   Cloud through its public API.

## Deploy through cloud APIs

The Supabase CLI talks to the hosted project API and does not require Docker:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase functions deploy market-data
npx supabase functions deploy livekit-token
```

Add LiveKit Cloud credentials to the hosted function secret store:

```bash
npx supabase secrets set LIVEKIT_URL=wss://YOUR_PROJECT.livekit.cloud
npx supabase secrets set LIVEKIT_API_KEY=YOUR_KEY
npx supabase secrets set LIVEKIT_API_SECRET=YOUR_SECRET
npx supabase secrets set ALLOWED_ORIGINS=https://YOUR_FNF_DOMAIN
```

`LIVEKIT_API_SECRET` remains server-side. The browser only receives a short-lived
room token after the function confirms that the current user is an active member.

Never put a service-role key in a `VITE_` variable. Vite variables are shipped
to the browser. The publishable anon key is safe because authorization is
enforced by the database policies and security-definer functions.

## Data model

```text
auth.users
  └─ profiles
       ├─ trading_profiles
       ├─ crews (owner)
       ├─ crew_members
       ├─ seat_requests
       └─ room_messages
```

The landing page can only read the fields returned by `list_crews`. Profile,
membership, request, and message rows are not publicly enumerable. Room
messages can only be selected or inserted by active members.

## Next backend slices

1. Profile onboarding and Solana wallet signature verification
2. Owner inbox to accept or decline seat requests
3. Authenticated room shell with message subscriptions
4. LiveKit token endpoint for voice and screen sharing
5. Cached token search and OHLCV endpoints for the FNF chart
6. Moderation, reports, rate limits, and audit events
