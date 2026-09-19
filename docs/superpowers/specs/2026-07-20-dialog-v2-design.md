# DeveloperKit `Dialog` v2 — Menu-Grade Morph Modal

Date: 2026-07-20
Status: Approved design, ready for implementation planning

## Goal

Rebuild the `Dialog` on the foundations that made the `Menu` succeed. The
dialog behaves "like the Menu, but big": by default it morphs OUT OF its
trigger (collision-aware, anchored near it) and can optionally be sent to
`center` (classic modal) or `sheet` (bottom sheet, the mobile modal). Same
approved motion signature — anticipation, streak, color-morph, ghost return,
seamless handoffs — adapted to a larger panel, plus full modal accessibility
and a subtle scrim.

The first Dialog (July 14) was discarded because its animation looked wrong
(scaled text, color snaps, hard swaps). Every one of those problems has since
been solved in the Menu and verified frame-by-frame; this spec reuses that
machinery rather than reinventing it.

## Locked decisions (brainstorming)

1. **Model: Menu-en-grande.** Default placement is anchored to the trigger
   (`placement="trigger"`, collision-aware like the Menu). Optional
   `placement="center"` and `placement="sheet"`. The morph always ORIGINATES
   from the trigger rect; only the destination changes.
2. **Motion: the Menu's approved signature, adapted.** The shared engine is
   parameterized with presets — `MENU` keeps today's exact values (zero
   regression; the existing 162 tests are the contract) and `DIALOG` runs
   longer (~620ms open / ~560ms close), slightly softer streak (0.85), a bit
   more blur (12px). Color-morph (composited trigger color ↔ panel), dense
   ghost anchors, opaque-until-revealed close handoff, `landed` icon
   re-entrance — all inherited.
3. **Modality: modal with a subtle scrim.** Focus trap + body scroll lock +
   background inert (the tested hooks recovered from `ad55987`) + a soft dim
   (~20% + light backdrop blur). `Esc` and scrim-click close, gated by
   `dismissable` (default true).
4. **Scope v1: Lean, por partes.** No `Dialog.Shared` per-child morphing (the
   ghost covers the return), no sheet drag-to-dismiss, no `alertdialog`, no
   nested dialogs — all noted for future cycles.

## Public API

```tsx
<Dialog>
  <Dialog.Trigger asChild>
    <Button color="primary">Editar perfil</Button>
  </Dialog.Trigger>

  <Dialog.Content aria-labelledby="t">      {/* default: anchored to trigger */}
    <h2 id="t">Editar perfil</h2>
    …form…
    <Dialog.Close asChild><Button>Guardar</Button></Dialog.Close>
  </Dialog.Content>
</Dialog>
```

| Part | Responsibility |
|---|---|
| `Dialog` (root) | `open` / `defaultOpen` / `onOpenChange`; self-healing phase machine (`closed/opening/open/closing`, reconciling on BOTH open and phase — the Menu's race-proof recipe, with its regression test). |
| `Dialog.Trigger` | Default `<button>`; `asChild` merges onto the consumer's element (canonical: a library `Button`). Morph origin rect. `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`. Origin states `hidden` / `closing` / `landed` (icons re-enter exactly at unmount, like the Menu). |
| `Dialog.Content` | Portaled to body; inherits the nearest provider theme via `usePortalTheme`. Props: `placement?: "trigger" \| "center" \| "sheet"` (default `"trigger"`), `side`/`align` overrides for trigger placement, `dismissable?: boolean` (default true), `surface?: "auto" \| "trigger"` (inherited behavior from Menu). Semantics: `role="dialog"`, `aria-modal="true"`, accessible name REQUIRED (`aria-labelledby` or `aria-label`). Free-form content (forms, text); `max` sizing with internal scroll. |
| `Dialog.Close` | Closes via the reverse morph. |

Key differences from Menu: dialog semantics (no menu/menuitem roles, free
content), modal behavior, scrim, larger sizing tokens.

## Motion (shared engine generalized — `src/morph/`)

- `menuMorphKeyframes.ts` → `morphKeyframes.ts` with a preset parameter:
  - `MENU`: `{ open: 500, close: 460, streak: 1.0, blur: 10 }` — today's exact
    behavior; defaults preserve every current call site.
  - `DIALOG`: `{ open: 620, close: 560, streak: 0.85, blur: 12 }`.
- `runMenuMorph.ts` → `runMorph.ts` (preset passed through); `useMorph`
  accepts the preset. Everything else — composited trigger color, panel color
  interpolation, settle radius from computed style, in-flight cancel guard,
  open-finish animation cancel (backdrop-filter fix), ghost counter-scale with
  dense anchors, opaque-tail handoff — is inherited unchanged.
- Content enters with a stagger AFTER the streak (crisp text always — the
  lesson from Dialog v1) and leaves quickly toward the origin on close.
- Reduced motion: instant crossfade, scrim appears without fade.

## Placement (`src/dialog/` reusing `resolvePlacement`)

- `trigger` (default): the Menu's collision logic with dialog-scale margins
  and `max-width: min(92vw, 36rem)`, `max-height` with internal scroll;
  transform-origin at the trigger's corner of the panel.
- `center`: fixed viewport center; the body TRAVELS from the trigger to the
  center (transform-origin computed toward the trigger).
- `sheet`: pinned to the bottom, full width, top-only radius; the body travels
  down and unfolds upward (origin at the bottom edge).

## Scrim

Sibling element under the panel: `--dk-dialog-scrim` (≈20% dim) +
`backdrop-filter: blur(6px)`. Fades in synchronized with the unfold phase (the
background stays clean during the streak), reverses on close. Click closes
when `dismissable`.

## Accessibility (modal)

Recovered, already-tested hooks from `ad55987` into shared `src/a11y/`:

| Hook | Behavior |
|---|---|
| `useFocusTrap` | Focus first focusable (or `[autofocus]`) on open; Tab/Shift+Tab cycle; restore to trigger on close. |
| `useScrollLock` | Lock body scroll, compensating scrollbar width. |
| `useInertBackground` | `inert` + `aria-hidden` on the portal's siblings. |
| `useDismiss` (existing) | Esc + scrim click, gated by `dismissable`. |

Tests: RTL behavior, jest-axe on the open dialog, SSR (content deferred),
click-burst race regression (same pattern that hardened the Menu).

## Styling & tokens

`src/styles/dialog-tokens.css`, `dialog-scrim.css`, `dialog-content.css` added
to the stylesheet order and structure contract. Tokens: `--dk-dialog-scrim`,
`--dk-dialog-surface` (theme-adaptive like the menu's, primary-tinted,
translucent + backdrop), sizing (`--dk-dialog-max-inline`, `--dk-dialog-max-block`),
radius derived from `--dk-radius-control` (capped), `--dk-dialog-z` above the
menu's. Sheet: top-only radius, full-bleed width.

## File structure

```
src/morph/    morphKeyframes.ts (renamed + presets) · runMorph.ts · useMorph.ts
src/a11y/     useFocusTrap.ts · useScrollLock.ts · useInertBackground.ts  (recovered)
              populateGhost moves here from src/menu (shared by Menu + Dialog)
src/dialog/   Dialog.tsx · DialogContext.ts · DialogTrigger.tsx
              DialogContent.tsx · DialogContentSurface.tsx · DialogClose.tsx
              Dialog.types.ts · useDialogState.ts · index.ts
src/styles/   dialog-tokens.css · dialog-scrim.css · dialog-content.css
```

Root barrel exports `Dialog`; structure/style contracts updated; files ≤120
effective lines.

## Milestones (one spec, executed por partes)

- **M1 — Engine generalization + modal a11y**: presets with Menu-identical
  defaults (all current tests stay green untouched — that is the regression
  contract), rename morph modules, recover the three modal hooks with their
  tests, move `populateGhost` to shared.
- **M2 — Dialog core**: compound parts + `trigger` (default) and `center`
  placements + scrim + full modal behavior + tokens/styles + browser & frame
  verification (anim-frames harness gains a dialog specimen).
- **M3 — Sheet + integration**: `placement="sheet"` + showroom/color-demo
  examples + README section.

## Out of scope (future cycles)

Sheet drag-to-dismiss (pointer physics), `Dialog.Shared` per-child morph,
`role="alertdialog"` variant, nested/stacked dialogs, popover mode.

## Open items at plan time

- Exact DIALOG preset numbers (620/560/0.85/12 are first-pass; tuned in the
  browser during M2 with the frames harness).
- Whether `surface="trigger"` needs a contrast guard for large panels (a solid
  brand-colored dialog full of form text may need `--dk-dialog-surface`
  override guidance in the README).
- Sheet safe-area insets (`env(safe-area-inset-bottom)`) — include in M3.
