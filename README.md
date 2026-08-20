# FNF

Friends and Family. A Solana crew-finding product: eight traders, one room,
one written thesis.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Identity

Locked dark. There is no light mode.

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#07080a` | page ground |
| `--paper-2` | `#0d0f12` | panels, cards |
| `--paper-3` | `#171a1f` | inputs, raised surfaces |
| `--ink` | `#edefec` | text, primary button fill |
| `--volt` | `#14f195` | the one accent, always with `--on-volt` text |
| `--haze` | `#9945ff` | ambient background wash only, never a UI colour |
| `--danger` | `#ff5a52` | form errors only |

Type is Satoshi (self-hosted, `public/fonts`), 900 for display at
`-0.045em` tracking, 400/500 for body. Numbers use tabular figures.

Radius rule: surfaces `3px`, anything clickable is a full pill. Purple never
appears as a border, label or button, only as light behind the page.

## Motion

- `Hero` and card reveals use Motion (`motion/react`).
- `HowItWorks` is the only GSAP leaf: the section title pins while the steps
  move past it, and each picture scrubs from `scale 0.86 / opacity 0.18` into
  focus and back out.
- Every animation honours `prefers-reduced-motion`.

## Images

Placeholders currently point at `picsum.photos`. Every slot lives in
`src/data.js` under `IMG`. To ship real art: drop the file at the listed
`path`, then change that entry's `src` to the same path. Nothing else changes.

Shared style for all five, so they read as one set: 35mm film grain, hard
natural light, muted and desaturated (the site greyscales them anyway), no
text, no logos, no readable screens, no brand marks.

**1. `/assets/hero-crew.jpg` (1200x1600, portrait)**
> Editorial documentary photograph, three young friends in a bare concrete
> apartment at 5am, sitting on the floor around a single laptop, blue pre-dawn
> window light plus one warm lamp, candid, faces partly turned away from
> camera, 35mm film grain, muted colour.

**2. `/assets/room-desk.jpg` (1400x1050, landscape)**
> Overhead still life on a scratched dark desk, a phone lying face down, an
> open notebook covered in handwriting, a cold coffee, a tangled cable, one
> hard directional light from the left, 35mm film grain, near monochrome.

**3. `/assets/handshake.jpg` (1000x1000, square)**
> Close documentary photograph of two hands meeting in a short handshake over
> a plain table in a dim room, shallow depth of field, single hard light
> source, 35mm film grain.

**4. `/assets/walk-together.jpg` (1920x1080, wide)**
> Wide photograph of four friends walking together through a concrete
> underpass at night, seen from behind, lit by a single overhead strip light,
> long shadows, cinematic 35mm film grain.

**5. `/assets/ledger.jpg` (900x1200, portrait)**
> Macro photograph of a handwritten page of numbers on cheap lined paper, ink
> smudged, torn corner, raking side light, heavy 35mm grain, near monochrome.

## State

All data is local to the session (`src/data.js`). Join requests, created
crews and filters live in React state. There is no backend yet; the 380ms
pending state in `CrewFinder` is where a real API call slots in.
