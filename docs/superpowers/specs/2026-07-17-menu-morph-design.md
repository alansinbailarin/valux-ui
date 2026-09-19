# DeveloperKit `Menu` — Morphing Actions Menu Design

Date: 2026-07-17
Status: Approved design, ready for implementation planning

## Goal

Add a `Menu` component: a distinctive **actions menu** whose trigger (e.g. a `+`
button) visually **morphs into the menu** — a single continuous body that
travels and grows out of the trigger, tight to its content, and compresses back
into the trigger on close. The motion is a spring ("springy" feel, validated in
the visual companion), the panel is content-sized (measured, no dead space), the
background is **not** dimmed, and clicking outside closes it. Target feel: a
polished iOS-style menu.

Follows DeveloperKit conventions: plain CSS with `--dk-*` tokens, zero runtime
dependencies, `"use client"` on interactive modules, TDD per `CONTRIBUTING.md`,
files ≤120 effective lines.

## Locked decisions (brainstorming + visual companion)

1. **Kind: actions menu.** Each item is an action; selecting it fires `onSelect` and closes the menu. No persisted selection. ARIA `role="menu"` / `role="menuitem"`.
2. **Name: `Menu`.**
3. **Motion: single-body morph.** The trigger travels and grows into a content-sized panel; the trigger glyph dissolves; items fade + translate in staggered. Reverse on close. Spring feel ("springy").
4. **Content-sized.** The panel is measured (natural width/height) and the morph animates to that exact size — no fixed oversized dimensions, no dead space; side padding only.
5. **Non-modal.** No scrim/dim, no focus trap, no scroll lock, no background inert. Dismiss on outside-click and Esc.
6. **Placement: auto with override.** Default is collision-aware (opens toward available space, stays in viewport). Optional `side` / `align` props force a direction. The FLIP always originates from the trigger rect.
7. **Reuse + adapt the morph foundation.** Recover the tested spring sampler (`spring.ts`), reduced-motion helper (`reducedMotion.ts`), `useDismiss`, and `usePortalNode` from `ad55987`. The morph itself animates the panel's **size and position** (width / height / top / left) with spring-sampled keyframes via the Web Animations API — **not** transform-scale FLIP — so text stays crisp as the box grows (matching the approved mock). This size-morph (`buildSizeKeyframes` + `runSizeMorph` + `useMorph`) is new; the transform-scale FLIP modules (`flip.ts`, `buildMorphKeyframes.ts`, `runMorph.ts`) are **not** recovered.
8. **v1 scope: Lean.** Items with icon + label, `disabled`, and `destructive` (danger) styling; full keyboard a11y; auto-placement + override; reduced-motion. One spec, internal milestones M1–M3.

## Public API

Compound component. Interactive modules carry `"use client"`.

```tsx
<Menu>                                   {/* root: open state + context + morph phase */}
  <Menu.Trigger>+</Menu.Trigger>         {/* FLIP origin; children free; asChild; default <button> */}
  <Menu.Content side="auto" align="auto">{/* portaled; role="menu"; morphs from the trigger */}
    <Menu.Item icon={<Edit />} onSelect={editar}>Editar</Menu.Item>
    <Menu.Item icon={<Copy />} onSelect={dup}>Duplicar el elemento</Menu.Item>
    <Menu.Item disabled>Compartir</Menu.Item>
    <Menu.Item destructive icon={<Trash />} onSelect={borrar}>Eliminar</Menu.Item>
  </Menu.Content>
</Menu>
```

### Parts

| Part | Responsibility |
|---|---|
| `Menu` (root) | Owns open state — uncontrolled (`defaultOpen`) or controlled (`open` + `onOpenChange`). Provides `MenuContext`: morph phase (`closed`/`opening`/`open`/`closing`), trigger ref, item registry for roving focus, and open/close orchestration. |
| `Menu.Trigger` | Renders children (default `<button type="button">`; `asChild` merges props onto a single custom child, e.g. the library `Button`). FLIP origin rect. `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`. Toggles on click. Visually hidden while the menu is open (the panel *is* the trigger). |
| `Menu.Content` | Portaled to `document.body`. `role="menu"`, `aria-labelledby` = trigger id, `aria-orientation="vertical"`. Morphs from the trigger rect to its measured content size. Placement auto + override. Non-modal dismiss (outside-click + Esc). No scrim / trap / scroll-lock. |
| `Menu.Item` | `role="menuitem"`. Props: `icon?`, `disabled?`, `destructive?`, `onSelect?`. Click / Enter / Space → `onSelect()` then close. Arrow keys move focus (roving `tabindex`). `aria-disabled` when disabled. |

### Props (v1)

- `Menu`: `open?`, `defaultOpen?`, `onOpenChange?`, `children`.
- `Menu.Trigger`: `asChild?`, native button props.
- `Menu.Content`: `side?: "top" | "bottom" | "left" | "right" | "auto"` (default `"auto"`), `align?: "start" | "center" | "end" | "auto"` (default `"auto"`), native div props.
- `Menu.Item`: `icon?: ReactNode`, `disabled?: boolean`, `destructive?: boolean`, `onSelect?: () => void`, native button props.

## Morph engine (size-based → `src/morph/`)

Zero-dependency Web Animations API + spring. Recovered from `ad55987`:
`spring.ts` (`sampleSpring`) and `reducedMotion.ts` (`prefersReducedMotion`),
with their tests. New (size-based, not transform-scale): `buildSizeKeyframes.ts`,
`runSizeMorph.ts`, `useMorph.ts`.

Open sequence:
1. Trigger click → phase `opening`.
2. Measure the trigger rect (origin, viewport coords).
3. Mount `Content` portaled, invisible, content-sized by CSS (`width: max-content`); measure its natural rect (placed position + content size).
4. `runSizeMorph(trigger → panel)`: `buildSizeKeyframes` interpolates `left`/`top`/`width`/`height` from the trigger rect to the panel rect at each spring-progress sample; `panel.animate(...)` runs it. The box travels and grows; **text stays crisp** (no scale). The trigger glyph fades out; items fade + translate in, staggered.
5. `onfinish` → phase `open`.

Close = exact reverse (panel → trigger) → phase `closed`, unmount, reveal
trigger. Reduced-motion (`prefersReducedMotion()`) → skip the size animation;
the panel appears/disappears at its placed position with a short crossfade;
items do not travel. The "springy" defaults come from the spring sampler config,
exposed via `--dk-motion-spring-*` tokens.

## Placement (`src/menu/placement.ts`)

Pure geometry (unit-tested): given the trigger rect and the viewport, resolve
effective `side` + `align` with collision handling (flip the side, shift along
the axis to stay on screen). Explicit `side`/`align` props force the choice
and skip auto-resolution. The morph origin is always the trigger rect,
regardless of the resolved placement.

## Accessibility (non-modal WAI-ARIA menu)

| Concern | Behavior |
|---|---|
| Focus | On open, focus the first enabled `menuitem` (roving `tabindex`). On close, restore focus to the trigger. |
| Keyboard | ↑/↓ move between items, Home/End jump to first/last, Enter/Space activate, Esc closes, Tab closes. Type-ahead deferred to a later spec. |
| Dismiss | `useDismiss` (recovered): outside-click + Esc. No scrim, inert, or scroll-lock (non-modal). |
| Roles | `role="menu"` on Content, `role="menuitem"` on Item, `aria-orientation="vertical"`, `aria-haspopup`/`aria-expanded`/`aria-controls` on Trigger, `aria-disabled` on disabled items. |
| `destructive` | Visual only (danger color); no extra semantics. |

Keyboard/roving lives in `src/menu/useMenuKeyboard.ts`. Tests use React Testing
Library + `jest-axe`.

## Styling & tokens (`src/styles/menu-*.css`)

Plain CSS, `data-dk-*` driven; added to `src/styles.css` import order and the
`structure.test.ts` required-files list.

- Files: `menu-tokens.css`, `menu-content.css`, `menu-item.css`.
- Tokens: panel `--dk-menu-surface` / `--dk-menu-radius` / `--dk-menu-shadow` / padding, item padding / hover / `--dk-menu-item-radius`, destructive color (reuses `--dk-color-danger*`), `--dk-menu-z`, and the shared `--dk-motion-spring-*`.
- Attribute hooks: `data-dk-side`, `data-dk-align`, `data-dk-phase` on Content; `data-dk-menu-origin` on the trigger; `data-dk-destructive` / `data-dk-disabled` on items.
- Reduced-motion media query flattens the morph to a crossfade.

## File structure

```
src/morph/   spring.ts  reducedMotion.ts  (recovered) · buildSizeKeyframes.ts  runSizeMorph.ts  useMorph.ts  (new, size-based)
src/a11y/    useDismiss.ts  usePortalNode.ts                                              (recovered)
src/menu/
  Menu.tsx  MenuContext.ts  MenuTrigger.tsx  MenuContent.tsx  MenuItem.tsx
  Menu.types.ts  useMenuState.ts  placement.ts  useMenuKeyboard.ts  index.ts
src/styles/  menu-tokens.css  menu-content.css  menu-item.css
```

`src/index.ts` re-exports `./menu`. Public API is exported from
`src/menu/index.ts` as a compound `Menu` (Trigger/Content/Item attached). Files
stay ≤120 effective lines; split further if a module grows.

## Testing strategy (TDD)

- **Recovered modules**: bring the existing `spring`, `reducedMotion`, and `useDismiss` tests — they must pass unchanged in the new location.
- **Size-morph** (new): unit-test `buildSizeKeyframes` (pure: interpolates left/top/width/height across spring samples); contract-test `runSizeMorph` (mock `animate` + `getBoundingClientRect`; assert size keyframes + reduced-motion skip).
- **Pure functions** (`placement.ts`): unit tests for collision flip/shift, no DOM.
- **State, dismiss, roles, keyboard** (RTL + `jest-axe`): open/close (controlled + uncontrolled); outside-click and Esc close; roles/aria; roving focus and arrow-key navigation; `onSelect` fires and closes; `disabled` items are skipped; axe passes for the open menu.
- **Contract-level motion** (jsdom): mock `HTMLElement.prototype.animate` and `getBoundingClientRect`; assert phase transitions and that the morph is applied to the body; reduced-motion path asserted separately (same pattern as `Button.motion.test.tsx`).
- **CSS structure tests**: token definitions, `data-dk-*` selectors, import order, reduced-motion rule (mirrors the Button style tests).
- **Structure test**: add the new `src/morph/**`, `src/a11y/**`, `src/menu/**`, and `src/styles/menu-*.css` required files.

## Implementation milestones (one spec)

- **M1 — Morph foundation**: recover `spring` + `reducedMotion` + `useDismiss` + `usePortalNode` (with tests) into `src/morph/` and `src/a11y/`; build the new size-morph (`buildSizeKeyframes` + `runSizeMorph` + `useMorph`) with tests; wire nothing to a component yet; suite green.
- **M2 — Menu core**: compound API (`Menu`/`Trigger`/`Content`/`Item`) + `useMenuState` + portal + single-body morph (trigger → content-sized panel) + outside-click/Esc dismiss + basic focus (first item / restore) + reduced-motion + tokens/CSS. Fixed placement (one direction).
- **M3 — Placement + keyboard**: `placement.ts` auto-collision + `side`/`align` override; full roving keyboard (↑/↓/Home/End/Enter/Esc/Tab); `disabled`/`destructive` polish.

Each milestone is independently verifiable (tests green, demo route drivable in
the browser).

## Out of scope (future specs)

- Separators, section labels/headers, trailing shortcut/hint text.
- Nested submenus (each morphing).
- Type-ahead search.
- A `Select` (single/multi value) variant — a different component/spec.

## Open items to confirm at plan time

- Exact spring constants for the "springy" default (tunable via tokens; reviewed in the browser during M2).
- `Menu.Content` vs `Menu.Panel` naming (assumed `Content`).
- Whether `asChild` on `Trigger` ships in M2 or M3 (assumed M2, default `<button>` always available).
