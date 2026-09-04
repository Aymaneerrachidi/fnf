# FNF — Friends, Not Followers

FNF is a private social network for traders. It helps people discover compatible traders, join small crews, talk in voice rooms, share research, and inspect live market context without leaving the conversation.

FNF does **not** execute trades, custody funds, sell signals, or prove that a token is safe.

![FNF public website](docs/fnf-preview.png)

## Product loop

```text
Create a trading profile
        ↓
Discover compatible people and crews
        ↓
Request or offer an open seat
        ↓
Talk, share context, and schedule sessions
        ↓
Build trusted connections and introductions
```

## Functionality index

| Area | Main purpose |
| --- | --- |
| Public website | Explain FNF and preview real crews, cultures, and public proof |
| Accounts | Email/password, X, and Discord authentication through Supabase |
| Home | Personal overview and shortcuts into the authenticated product |
| Crews | Search public rooms and inspect their full thesis before applying |
| People | Compatibility discovery, mutual connections, and introductions |
| Messages | Consent-based direct messages between accepted connections |
| Markets | Exact-contract market-cap charts and informational risk context |
| My rooms | Rooms the user owns or has been accepted into |
| Requests | Owner inbox for approving or declining seat applications |
| Activity | Real-time social and market notifications |
| Profile | Identity, availability, trading preferences, languages, and avatar |
| Live room | Voice, screen sharing, chat, images, polls, charts, events, and administration |

## Public website

The logged-out experience introduces the product before asking for an account.

### Navigation and hero buttons

| Button | Function |
| --- | --- |
| **FNF** | Returns to the top of the public page. |
| **Browse crews** | Scrolls to the public crew board. |
| **How it works** | Scrolls to the matching-process section. |
| **Safety** | Scrolls to the safety and product-boundary section. |
| **Turn on/off interface sounds** | Enables or disables the mechanical keyboard click sound. The preference is kept in the browser. |
| **Sign in** | Opens the account dialog. |
| **Start a crew** | Opens authentication when logged out or room creation when authenticated. |
| **Open menu / Close menu** | Opens or closes the complete mobile navigation. |

### Public crew board

| Control | Function |
| --- | --- |
| **Search crews** | Filters rooms by name, thesis, language, or active hours. |
| **All rooms** | Clears the trading-style filter. |
| **Memecoins / Perps / Day trading** | Filters the board by trading category. |
| **More filters** | Reveals language, hours, and room-style controls. |
| **Crew card** | Opens the complete room preview and application state. |
| **Start a crew** | Opens room creation when the filters return no useful room. |

The public page also contains the matching explanation, worldwide-discovery story, room-size rules, clan showcase, public trader proof, safety statement, and footer navigation. External proof links open their original public sources.

## Accounts and authentication

FNF requires an account before users can access private social features.

| Button | Function |
| --- | --- |
| **Continue with X** | Starts Supabase OAuth with X/Twitter. The provider must be enabled in Supabase. |
| **Continue with Discord** | Starts Supabase OAuth with Discord. The provider must be enabled in Supabase. |
| **Create account** | Creates an email/password account and sends confirmation when confirmation is enabled. |
| **Sign in** | Authenticates an existing account. Transient network failures are retried. |
| **Already have an account?** | Switches the dialog from sign-up to sign-in. |
| **Need an account?** | Switches from sign-in to sign-up. |
| **Close account dialog** | Closes authentication without changing the current page. |
| **Got it** | Closes the post-registration confirmation message. |

After authentication, protected routes redirect to `/app`. Supabase persists and refreshes the browser session.

## Authenticated navigation

The desktop sidebar groups controls by purpose. Mobile uses a horizontally scrollable keyboard-style bottom rail.

### Global controls

| Button | Function |
| --- | --- |
| **FNF** | Opens authenticated Home. |
| **Open market** | Opens a market drawer over the current page without losing page context. |
| **Profile/account card** | Opens Profile. |
| **Sign out** | Ends the session and returns to the public website. |
| **Notification popup** | Opens the related room, message, person, or market context and marks it read. |

### Product routes

| Sidebar button | Route | Function |
| --- | --- | --- |
| **Home** | `/app` | Personal command center. |
| **Crews** | `/discover` | Global searchable crew board. |
| **People** | `/people` | Compatibility discovery and social graph. |
| **Messages** | `/messages` | Private mutual-connection inbox. |
| **Markets** | `/markets` | Full exact-contract market workspace. |
| **My rooms** | `/rooms` | Owned and accepted rooms. |
| **Requests** | `/requests` | Owner seat-request inbox. |
| **Activity** | `/notifications` | Notification history and unread state. |
| **Profile** | `/profile` | Social identity and matching preferences. |

Direct routes:

- `/room/:crewId` opens an accepted live room.
- `/token/:network/:contractAddress` opens exact token context.

## Home

| Button/card | Function |
| --- | --- |
| **Meet people** | Opens People discovery. |
| **Start a crew** | Opens room creation. |
| **Rooms you can enter** | Opens My rooms. |
| **People online** | Opens People and live presence. |
| **Market context** | Opens Markets. |
| **Open network** | Opens People when traders are online. |
| **See all** | Opens the complete My rooms list. |
| **Room card** | Opens the room preview. |
| **Manage room** | Opens a room owned by the current user. |
| **Enter room** | Opens a room where the user is an accepted member. |
| **Find a crew** | Opens crew discovery from an empty Home state. |

## Crews and applications

### Crew discovery

| Control | Function |
| --- | --- |
| **Search rooms, thesis, language or hours** | Filters loaded rooms in real time. |
| **All** | Shows every trading category. |
| **Memecoins / Perps / Day trading** | Filters rooms by category. |
| **Language selector** | Filters by primary room language. |
| **Room card body** | Opens complete room details. |
| **Manage room / Enter room** | Opens the live workspace when membership exists. |

### Room details and applications

| Button | Availability and function |
| --- | --- |
| **Close crew details** | Closes the room preview. |
| **Enter room** | Available to accepted members; opens voice, feed, and market context. |
| **Request a seat** | Sends the owner the applicant’s reason, availability, contribution, preferences, and optional introduction link. |
| **Close** | Closes a completed application state. |

Owners see the applicant’s FNF trading profile before deciding.

## Creating a crew

Room creation stores a real crew in Supabase. It does not create a mock card.

Fields include crew name, thesis, description, trading category, language, active market hours, voice/text preference, four-to-eight seat limit, room image, symbol, accent, and public-preview preference.

| Button | Function |
| --- | --- |
| **Create crew** | Validates the form, creates the room, and makes the current user its owner. |
| **Cancel** | Closes creation without saving. |
| **Close** | Closes the dialog. |
| **See it on the board** | Opens the newly created crew preview. |

## People and social graph

Recommendations use trading category, language, overlapping hours, communication style, availability, and mutual-room context. Cards explain each match rather than displaying follower counts.

| Button | Function |
| --- | --- |
| **Search people or bios** | Filters by display name, handle, location, or bio. |
| **Connect** | Sends a mutual connection request. |
| **Request sent** | Disabled confirmation that a request is pending. |
| **Pass** | Declines an incoming connection request. |
| **Connect** on an incoming request | Accepts the connection and enables DMs. |
| **Message** | Opens or creates a DM with an accepted connection. |
| **Connection row** | Opens a DM with that person. |
| **Make an introduction** | Opens trusted introductions when the user has at least two connections. |
| **Send introduction** | Introduces two connections with a written reason. |
| **Close introduction dialog** | Cancels the introduction. |

Presence includes online, away, in room, in voice, available, looking for a crew, do not disturb, and last active. Offline users are hidden from a live room’s connected-members list.

## Direct messages

DMs are consent-based: only accepted mutual connections can message freely.

| Control | Function |
| --- | --- |
| **Conversation row** | Selects a private thread. |
| **Message field** | Writes a message. `Enter` sends; `Shift + Enter` inserts a new line. |
| **Send** | Sends through Supabase and updates both users in real time. |

Unread counts appear on conversations and Activity. New DMs create notifications.

## Live room workspace

The room is the core product. It combines live communication, social context, and informational charts.

### Top bar

| Button/status | Function |
| --- | --- |
| **Back arrow / Leave room** | Disconnects from LiveKit and returns to My rooms. |
| **LIVE ROOM** | Confirms that signaling is active. |
| **Person/people count** | Counts connected participants, not total membership. |
| **Invite** | Copies the room URL. Access still requires accepted membership. |

### Room navigation

All six controls remain visible in a two-row keyboard layout.

| Button | Function |
| --- | --- |
| **Feed** | Shows messages, images, charts, polls, and pinned context. |
| **Watch** | Opens the crew token watchboard. |
| **Sessions** | Opens scheduled events. |
| **People** | Shows currently connected members. |
| **Requests** | Owner-only application queue. |
| **Settings** | Opens room identity, culture, membership, and archive controls. |

### Voice and screen controls

| Button | Function |
| --- | --- |
| **Unmute** | Requests microphone access and publishes local audio. |
| **Mute** | Stops publishing microphone audio. |
| **Deafen** | Mutes remote audio locally. |
| **Undeafen** | Restores remote audio. |
| **Share screen** | Opens browser screen/window/tab selection and publishes the chosen screen. |
| **Stop share** | Stops the screen-share track. |
| **Leave** | Disconnects voice/presence and returns to the app. |

Production microphone and screen sharing require HTTPS. Browsers also allow them on `localhost` during development.

### Feed and chat

| Button/control | Function |
| --- | --- |
| **Add image** | Opens a JPEG, PNG, WebP, or GIF picker. The control becomes **Uploading…** while Supabase stores the file. |
| **Create poll** | Opens the poll composer. |
| **Close poll** | Closes the poll composer. |
| **Add option** | Adds another poll choice, up to five. |
| **Post poll** | Stores the poll and posts it to the feed. |
| **Poll option** | Casts or updates the current user’s vote. |
| **Message room** | Writes text or an exact contract. `Enter` sends and `Shift + Enter` adds a line. |
| **Send** | Sends the message; disabled when empty. |
| **Pin message** | Owner-only control that pins important room context. |
| **Token card in chat** | Reopens the shared chart in the room stage. |

If a complete Solana or EVM contract appears in a message, FNF resolves it and posts a rich market card. FNF does not guess from a ticker.

### Crew watchboard

| Control | Function |
| --- | --- |
| **Add current chart** | Adds the open token to the crew watchboard. |
| **Sentiment selector** | Labels it Watching, Interesting, Needs research, Too risky, or Dead. |
| **Why is the room watching?** | Adds the crew’s reason. |
| **Watch item** | Reopens its chart and snapshot. |
| **Delete/trash** | Removes it from the watchboard. |

### Sessions

| Control | Function |
| --- | --- |
| **Schedule** | Opens event creation for owners and moderators. |
| **Session name** | Names the conversation. |
| **Starts** | Stores the time; viewers see it in their local timezone. |
| **Type** | Voice room, thesis discussion, research session, or crew hangout. |
| **Minutes** | Sets expected duration. |
| **Context** | Explains what members should bring. |
| **Schedule session** | Saves the event. |
| **Enter room** | Returns to Feed while remaining connected. |

### People, requests, and settings

| Button | Function |
| --- | --- |
| **Remove member** | Owner-only removal of a non-owner. The member receives a notification. |
| **Approve** | Accepts a seat request and notifies the applicant in real time. |
| **Decline** | Declines the request and informs the applicant. |
| **Change room image** | Selects a new room image for the next save. |
| **Save room** | Persists room identity and culture changes. |
| **Archive room** | Requires a second confirmation click, then removes the room from discovery. |
| **Leave room** in Settings | Removes a non-owner’s membership. A new request is required to return. |

Owner settings include name, thesis, description, manifesto, rituals, application question, symbol, accent, image, category, language, hours, communication style, room size, and public-preview state.

## Market context and charts

Market tools support conversations; there is no order entry.

Supported networks: **Solana, Base, BNB Chain, and Robinhood Chain**.

### Exact-contract search

| Control | Function |
| --- | --- |
| **Paste Solana or 0x contract address** | Accepts a complete Solana or EVM contract. Ticker guessing is disabled to prevent false matches. |
| **Resolve contract** | Finds exact pools, selects deepest liquidity, loads security context, and opens the market-cap chart. |
| **Exact pools** | Opens alternate pools for the same contract. |
| **Pool result** | Switches to that exact pool. |

When upstream data exists, the overview shows market capitalization, liquidity, 24-hour volume, holder count, top-ten concentration, buys, sells, total trades, and automated security status. Missing data appears as **Not indexed**, never invented.

Charts convert OHLC prices into market-cap candles using the current supply scale. Available timeframes are **1m, 5m, 15m, 1h, 4h, and 1d**.

### Market buttons

| Button | Function |
| --- | --- |
| **1m / 5m / 15m / 1h / 4h / 1d** | Reloads the selected candle timeframe. |
| **Copy CA** | Copies the exact contract. |
| **Source** | Opens the indexed pool source. |
| **Post to room** | Posts the chart into the current room feed. |
| **Show online friend** | Lists online members available for a chart handoff. |
| **Friend row** | Sends that trader a real-time chart notification. |
| **Save token / Saved** | Adds or removes the exact token from the personal market shelf. |
| **Add MC alert** | Opens an above/below market-cap threshold form. |
| **Save alert** | Saves the threshold. |
| **Saved-token row** | Selects a token for comparison; up to four are supported. |
| **Remove from comparison** | Removes that token from the comparison board. |
| **Delete alert** | Deletes a market alert. |
| **Close market drawer** | Returns to the underlying page without losing its state. |

GoPlus supplies automated contract and holder context. Critical flags can block chart display. A clear state still does not guarantee safety.

## Notifications and alerts

Activity receives real-time notifications for seat decisions, connections, DMs, introductions, member removal, chart handoffs, events, and market-cap thresholds.

| Button | Function |
| --- | --- |
| **Activity** | Opens notification history. Its badge is the unread count. |
| **Notification row** | Marks the item read and opens its destination. |
| **Mark all read** | Marks every unread notification read. |
| **Popup notification** | Opens the related destination immediately. |

Market alerts are evaluated while the authenticated app is open. The database RPC stores a persistent notification and disables the one-shot alert after it crosses. A browser-local fallback still displays the popup if the newest migration has not reached the environment.

## Profile

Profile data powers discovery and compatibility explanations. Fields include avatar, name, handle, location, availability, X, Discord, trading category, languages, market hours, room preference, communication style, experience, and bio.

| Button | Function |
| --- | --- |
| **Change photo** | Opens the avatar picker. |
| **Additional languages** | Expands/collapses optional languages to keep the form readable. |
| **Language button** | Adds or removes a language, up to five. |
| **Save profile** | Updates identity and matching data. The UI refreshes immediately after both writes succeed. |

FNF intentionally avoids public wallet balances and follower counts.

## Data and infrastructure

| Service | Responsibility |
| --- | --- |
| React 19 + Vite | Application shell, routing, forms, and state |
| Motion | Page, drawer, modal, and state transitions |
| Supabase Auth | Email/password and OAuth sessions |
| Supabase Postgres | Profiles, crews, memberships, feeds, polls, events, connections, DMs, watchlists, tokens, and alerts |
| Supabase RLS | User, membership, owner, and connection access boundaries |
| Supabase Realtime | Messages, approvals, DMs, and notifications |
| Supabase Storage | Profile, room, and room-feed images |
| Supabase Edge Functions | LiveKit access and aggregated market/security data |
| LiveKit Cloud | Voice, remote audio, and screen sharing |
| DexScreener | Exact token/pool discovery and market snapshots |
| GeckoTerminal | OHLC candle history |
| GoPlus | Automated contract-risk and holder context |
| Lightweight Charts | Market-cap candlesticks |
| Web Audio API | Optional keyboard-click feedback |

## Local development

Requirements: Node.js 20+, npm, Supabase, and LiveKit Cloud.

```bash
npm install
npm run dev
```

Use the URL printed by Vite. Build and preview production:

```bash
npm run build
npm run preview
```

## Environment variables

Create `.env.local`. Never commit secrets.

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY
```

Server-only values belong in Supabase:

```bash
supabase secrets set \
  LIVEKIT_URL=wss://YOUR_PROJECT.livekit.cloud \
  LIVEKIT_API_KEY=YOUR_LIVEKIT_API_KEY \
  LIVEKIT_API_SECRET=YOUR_LIVEKIT_API_SECRET
```

Never expose a Supabase secret/service-role key or LiveKit secret through a `VITE_` variable.

## Supabase setup

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --include-all
npx supabase functions deploy livekit-token
npx supabase functions deploy market-data
```

Persistent market-alert notifications require:

```text
supabase/migrations/202609040003_market_alert_notifications.sql
```

If database CLI login is unavailable, run that file once in Supabase SQL Editor. More detail is available in [docs/BACKEND.md](docs/BACKEND.md).

## OAuth and redirect configuration

For X or Discord:

1. Enable the provider in Supabase Authentication.
2. Add the provider client ID and secret.
3. Register the Supabase callback URL with the provider.
4. Add local and deployed URLs under Supabase **URL Configuration → Redirect URLs**.
5. Set Supabase **Site URL** to production so confirmation emails do not return to localhost.

Example redirect allow-list:

```text
http://localhost:5173/**
http://127.0.0.1:5180/**
https://YOUR_VERCEL_DOMAIN/**
```

## Vercel deployment

Add only public browser variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

The project includes SPA routing for direct visits to `/app`, `/room/:id`, and `/token/:network/:address`. LiveKit and Supabase server secrets remain in Supabase, not Vercel.

## Testing

```bash
npm run build
npm run test:e2e
```

The Playwright suite covers public controls, transient-login recovery, all authenticated routes, profile updates, crew creation, owner management, room messages, pinning, polls, real image uploads, events, mic/deafen/screen sharing, seat approval, real-time member entry, connections, DMs, introductions, notifications, exact-contract context, and mobile navigation.

QA credentials come from `FNF_QA_STATE` or the `FNF_E2E_*` variables. Never commit test passwords.

## Project structure

```text
src/
  components/      Public, product, room, and market UI
  hooks/           Shared browser interactions
  lib/             Supabase client and session bootstrap
  services/        Authenticated data access
  data.js          Public content and filter definitions
  index.css        Brand, responsive, room, and control system
public/
  assets/          Artwork, photos, logos, and video
  fonts/           Self-hosted typography
docs/
  BACKEND.md       Backend setup and architecture
supabase/
  functions/       LiveKit and market-data functions
  migrations/      Schema, RLS, triggers, and RPCs
tests/
  fnf.e2e.spec.js  Complete Playwright flow
```

## Product boundaries

- FNF is a social network, not an exchange or brokerage.
- Charts and market data are conversation tools.
- Market data can be delayed, incomplete, or unavailable.
- Automated scanners reduce risk; they do not prove safety.
- Cryptoassets can lose all value.
- Nothing on FNF is financial advice.
