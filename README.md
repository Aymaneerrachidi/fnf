# FNF

Friends, not followers. FNF is a frontend MVP for finding small private trading rooms around trading style, language, market hours, and room culture.

![FNF interface preview](docs/fnf-preview.png)

## What is included

- Full-screen retro-futurist landing experience
- Searchable and filterable crew floor
- Matching flow for memecoins, perps, and day trading
- Worldwide room discovery by language and market hours
- Clan performance showcase
- Public trader proof cards for Rasmr, Orangie, and Requisiem
- Create-room and room-detail interactions
- Mechanical keyboard-inspired buttons with optional click audio
- Responsive desktop and mobile layouts
- Reduced-motion support

## Run locally

```bash
npm install
npm run dev
```

Vite serves the project at `http://localhost:5173` by default.

Build and preview the production bundle:

```bash
npm run build
npm run preview
```

## Architecture

The project is a React application built with Vite. It includes an optional
Supabase backend for crew discovery, creation, seat requests, authentication,
and realtime-ready room messages. Without environment credentials it falls
back to the local crew data, so visual development remains self-contained.

- React 19 for component and interaction state
- Motion and GSAP for restrained entrance and scroll animation
- Tailwind CSS plus a project-specific CSS system
- Phosphor icons
- Self-hosted typefaces and local visual assets
- Web Audio API synthesis for the mechanical click feedback
- Supabase email authentication, Postgres, RLS, and Realtime for the first backend slice

## Project structure

```text
src/
  components/   Interface sections and overlays
  hooks/        Shared interaction behavior
  lib/          Supabase client and session bootstrap
  services/     Frontend data access layer
  data.js       Mock crews and local asset references
  index.css     Brand, layout, responsive, and motion system
public/
  assets/       Runtime imagery and video
  fonts/        Self-hosted typography
docs/
  fnf-preview.png
  BACKEND.md
supabase/
  migrations/   Database schema, policies, and RPC functions
  seed.sql      Optional demo-room data
```

Backend setup is documented in [docs/BACKEND.md](docs/BACKEND.md).

## Notes

- All trading information is mock frontend content.
- FNF does not provide financial advice or validate tokens.
- External trader proof links open their original public source.
- The visual direction uses original FNF-generated keycap artwork and user-supplied clan media.
