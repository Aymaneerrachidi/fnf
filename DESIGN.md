# Design System: FNF

## 1. Visual Theme & Atmosphere

FNF is a restrained degen social-trading interface: light paper surfaces, ciel-blue utility accents, tiny-room intimacy, and clean spring motion. Density is balanced, variance is moderate, and motion stays functional.

## 2. Color Palette & Roles

- **Paper Canvas** (#F4EADB) — primary page background.
- **Warm Surface** (#FFF8EE) — cards, nav, inputs, overlays.
- **Ciel Wash** (#D8EDF7) — soft secondary surface and focus fill.
- **Deep Ink** (#1C2D3A) — primary text.
- **Muted Ledger** (#637586) — descriptions and metadata.
- **FNF Blue** (#315F76) — single accent for CTAs, progress, focus, active states.

No green terminal palette, no neon glow, no pure black.

## 3. Typography Rules

- **Display:** Unbounded — titles only, left untouched.
- **Body/UI:** Manrope — readable small UI, descriptions, forms.
- **Nav/Footer:** Oxanium — distinctive brand/navigation voice.
- **Data:** Chivo Mono — numbers, stats, compact labels.

Small text must never overlap title text. Body lines stay relaxed and readable.

## 4. Component Styling

- **Buttons:** flat, tactile, pill controls except the receipt-style nav CTA.
- **Cards:** soft rounded surfaces, light tinted shadows, no jagged clipping.
- **Rows:** separated crew, thesis, signal, and action zones. No text superposition.
- **Inputs:** visible labels via placeholders/select defaults, strong focus border, 44px minimum height.

## 5. Layout Principles

Use grid for crew rows and section structure. Mobile collapses to one column. No horizontal scroll. Images are supporting material, not blurry backgrounds behind controls.

## 6. Motion & Interaction

Motion is minimal and UX-led:

- opacity/translate reveals only;
- subtle nav scroll progress;
- row reflow animation on filtering;
- tiny image zoom on hover;
- reduced-motion support everywhere.

No pinning, no huge scroll hijacks, no exaggerated hover physics.

## 7. Anti-Patterns

Never ship overlapping text, cropped action arrows, low-quality navbar images, green terminal styling, generic SaaS cards, excessive animation, decorative micro-labels, or duplicated filter labels.
