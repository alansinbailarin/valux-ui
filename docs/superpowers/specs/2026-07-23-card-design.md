# Valux UI `Card` — Surface, Pressable, Expandable

Date: 2026-07-23
Status: Approved design, ready for implementation planning

## Goal

Add a `Card` primitive to Valux UI: a composable surface (media, header, body,
footer — all optional), that can also be pressable (full-card link or
accessible button) and expandable (the card morphs into a detail panel, App
Store "Today" style). The expandable behavior is built by composing the
machinery the kit already trusts — the Dialog/morph engine for the in-place
overlay, and `Hero`/`TransitionLink` for the navigation mode — never by
writing a second motion engine.

## Locked decisions (brainstorming)

1. **Role: surface + interactive + expandable.** All three capabilities in one
   primitive, shipped in three phases (each phase independently shippable).
2. **Expansion: both modes.** In-place overlay (core package, framework-free)
   AND navigation mode via `@valux/ui/transitions` (`CardLink`, Next-only).
3. **Anatomy: full (option C).** `Card.Media` + `Card.Header`
   (`Card.Title`/`Card.Subtitle`) + `Card.Body` + `Card.Footer`, every part
   optional and composable. Media supports overlaid text (App Store cover
   look).
4. **Variants: `outline` (default), `elevated`, `soft`.** Names align with
   Button's variant vocabulary.
5. **Light/dark surface differentiation is a hard constraint.** In dark mode
   the card-vs-background distinction must NEVER depend on shadow alone:
   `elevated` switches strategy (raised surface + subtle top highlight),
   `outline` raises border contrast. Enforced by a testable contrast rule.
6. **Interactive via `href` + `onClick`.** `href` renders the root as `<a>`
   (whole card is the link); `onClick` gives accessible button semantics.
   Pressed motion reuses the kit's existing signature (subtle iOS-style
   scale, shared motion tokens).
7. **Architecture: reuse over rebuild (approved approach).** Overlay expansion
   composes `useDialogState`-style state, the `src/morph/` engine,
   `adoptTriggerSurface`, and the `src/a11y/` hooks. Navigation expansion is
   thin glue over `Hero` + `TransitionLink`.

## Public API

```tsx
// Phase 1 — static surface
<Card variant="outline">              {/* "outline" (default) | "elevated" | "soft" */}
  <Card.Media src="/cover.jpg" alt="" />   {/* or free children; optional */}
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Subtitle>Subtitle</Card.Subtitle>
  </Card.Header>
  <Card.Body>Free content.</Card.Body>
  <Card.Footer><Button>Action</Button></Card.Footer>
</Card>

// Phase 2 — pressable
<Card href="/detail">…</Card>         {/* renders <a>; whole card is the link */}
<Card onClick={fn}>…</Card>           {/* role="button", Enter/Space, tabIndex */}

// Phase 3 — expandable (in-place overlay)
<Card expandable>
  <Card.Media … />
  <Card.Header>…</Card.Header>
  <Card.Expanded>…detail content…</Card.Expanded>
</Card>

// Phase 3 — expandable (navigation; export @valux/ui/transitions)
<CardLink href="/apps/123" heroId="card-123">…</CardLink>
```

| Part | Responsibility |
|---|---|
| `Card` (root) | Variant + polymorphic render: `<div>` (static), `<a>` (`href`), `role="button"` (`onClick`), expandable trigger (`expandable`). `href` / `onClick` / `expandable` are mutually exclusive — excluded at the type level (discriminated union); at runtime `expandable` wins with a dev warning. |
| `Card.Media` | Cover area. `src`/`alt` shortcut renders `<img>`; free children allowed (gradients, video). Children may overlay the media (App Store text-over-cover). Clips to the card radius; reserves aspect-ratio to avoid layout shift. Visually persists through the expand morph. |
| `Card.Header` | Groups `Card.Title` (semantic heading, `h3` default, `as` configurable) and `Card.Subtitle`. |
| `Card.Body` | Free content section. |
| `Card.Footer` | Actions row. Nested interactive controls work inside pressable cards (inner control clicks do not trigger card navigation; detected via `closest("a, button, input, …")`). |
| `Card.Expanded` | Only mounted/revealed in the expanded state. Content outside it is visible in both states. |
| `CardLink` (transitions) | `Card` + `Hero` + `TransitionLink` composition. The whole card is the source Hero; the destination page declares the receiving Hero with the same `heroId`. |

## Styling

New tokens in `src/styles/tokens.css` (no new radius — the kit's single
`--vx-radius-control` rule holds):

```css
--vx-card-padding: 1rem;
--vx-card-gap: 0.5rem;
/* used only by elevated; near-zero in dark via modes */
--vx-card-shadow: 0 1px 3px rgb(0 0 0 / 0.06), 0 4px 16px rgb(0 0 0 / 0.1);
--vx-card-border-alpha: 12%;  /* border intensity; raised per-mode in modes.css */
```

Variant behavior per mode (new `src/styles/card.css` + `card-parts.css`,
wired through `modes.css`'s existing `[data-vx-mode]` + `prefers-color-scheme`
mechanics):

| Variant | Light | Dark |
|---|---|---|
| `outline` (default) | `surface` bg, `--vx-color-border` border | `surface` bg, higher-contrast border (border is the only differentiator) |
| `elevated` | `surface` bg, soft shadow, no border | `surface-raised` bg (lighter than backdrop) + subtle 1px top highlight; shadow nearly zero |
| `soft` | tinted `surface-raised` bg, no border/shadow | `surface-raised` bg, no border |

Because `surface`/`surface-raised` derive from `color-mix` with
`--vx-surface-tint`, cards inherit the user's theme tint from
`ValuxProvider` for free.

**Testable contrast rule:** in dark mode `surface-raised` must differ from
`surface-base` by at least 5 points of lightness (OKLCH L on a 0–100 scale,
computed with the `src/theme/color/` engine; the default theme's `#18181b` vs
`#09090b` passes) so custom themes can't silently flatten cards.

## Interaction (pressable)

- Pressed: subtle scale-down using `--vx-motion-duration-fast` +
  `--vx-motion-easing-standard`. Share logic with `useButtonInteraction` if it
  extracts cleanly; otherwise `useCardInteraction` with the same motion
  constants — no new motion values.
- Hover (fine pointer): subtle background shift for `outline`/`soft`;
  `elevated` slightly deepens its shadow. No variant jumps to a new
  elevation strategy on hover.
- Focus visible: `--vx-color-focus` ring at `--vx-focus-width` (Button
  parity). Keyboard: Enter/Space activate `onClick` cards.
- `prefers-reduced-motion`: no scale, color-only feedback.
- Out of scope (YAGNI): `disabled`, `aria-busy` — add only when a real case
  demands them.

## Expansion

**Overlay mode (core):**

- State: `useDialogState` (or its minimal generalization); uncontrolled by
  default, `open`/`onOpenChange` for control.
- Open: tap → panel morphs FROM the card surface (`adoptTriggerSurface` +
  `src/morph/` keyframes). `Card.Media` scales from collapsed to expanded
  geometry — the detail that sells the App Store effect.
- Close: reused Dialog X, Escape, scrim click, and pull-to-dismiss scrub
  (`usePullDismiss` + `scrubController`) running the morph in reverse under
  the finger.
- A11y on expand: focus trap, scroll lock, inert background, themed portal
  (`src/a11y/` hooks). `role="dialog"` + `aria-labelledby` → `Card.Title`
  when present.
- Reduced motion: simple fade (`reducedMotion.ts`).

**Navigation mode (`@valux/ui/transitions`):**

- `CardLink` is thin glue + a documented recipe generalizing what
  `app/appstore-lab/` already proves. Requires Next.js with View Transitions,
  like the rest of the `transitions` export.

**Degradation:** no View Transitions API → plain navigation without morph; no
Web Animations / reduced motion → fade. Function never breaks; only the
effect degrades.

## File structure

```
src/card/
  Card.tsx              # root: variants + polymorphic render
  Card.types.ts         # discriminated union (static/href/onClick/expandable)
  CardMedia.tsx
  CardLayout.tsx        # Header, Title, Subtitle, Body, Footer (DialogLayout pattern)
  CardExpanded.tsx      # phase 3
  useCardInteraction.ts # phase 2
  useCardExpand.ts      # phase 3
  Card.test.tsx …       # co-located tests per area
  index.ts              # compound assembly: Card.Media, Card.Header, …
src/styles/card.css
src/styles/card-parts.css
src/transitions/CardLink.tsx   # phase 3
app/card/                      # showroom demo page (page.tsx + CardDemos.tsx)
```

Contract updates each phase: `src/contracts/structure.test.ts` (files),
export-surface contract, stylesheet contract, and `pnpm docs:llms` regen.

## Testing

- Unit + Testing Library: optional anatomy, variants → data-attrs, prop
  mutual-exclusion (`@ts-expect-error` type tests).
- jest-axe: static card, link card, button card, expanded overlay
  (trap/inert/aria).
- Styles tests: variant rules per mode; the dark-mode
  `surface-raised`-vs-`surface-base` contrast rule.
- Interaction: keyboard activation, nested-control clicks not triggering card
  press, reduced motion.
- SSR render tests (existing kit pattern).

## Phases

1. **Surface** — full anatomy + 3 variants + light/dark + demo page.
2. **Pressable** — `href`/`onClick` + pressed motion + a11y.
3. **Expandable** — overlay morph + `CardLink` in transitions.

Each phase lands with `pnpm verify` green.
