# Valux UI

Valux UI provides accessible React components for modern Next.js applications. It ships plain CSS, TypeScript types, and no styling runtime.

The first release contains fifteen focused primitives: `Button`, `Menu`,
`Popover`, `Tooltip`, `Dialog`, `Sheet`, `Toast`, `Input`, `TextArea`,
`Switch`, `Checkbox`, `Radio`, `Select`, `ContextMenu`, and `Drawer` —
all sharing one theme, ONE pronounced radius, and one motion signature.

## Requirements

- React 18 or 19
- ReactDOM 18 or 19
- Node.js 18 or newer
- A bundler that supports package exports and CSS imports

Valux UI works with Next.js, but the component API uses standard React and DOM behavior.

## Install

```bash
pnpm add @valux/ui
```

## Use Button

Import the component and its stylesheet:

```tsx
import { Button } from "@valux/ui";
import "@valux/ui/styles.css";

export function SaveAction() {
  return <Button>Save</Button>;
}
```

`Button` accepts native `<button>` props. It forwards its ref, preserves your `className`, and defaults `type` to `button` to avoid accidental form submissions.

`Button` is a client component, so you can render it directly inside a Next.js Server Component—React establishes the client boundary automatically. `ValuxProvider` stays server-safe.

```tsx
import { Button } from "@valux/ui";

export function SubmitAction() {
  return (
    <Button type="submit" disabled aria-label="Submit changes">
      Submit
    </Button>
  );
}
```

Render the same component as a strictly typed link with `as="a"`:

```tsx
<Button as="a" href="/documentation">
  Documentation
</Button>
```

The anchor form accepts native anchor props and forwards an
`HTMLAnchorElement` ref. When disabled, it removes navigation, leaves the tab
order, exposes `aria-disabled`, and ignores clicks. Native buttons continue
using the browser `disabled` attribute.

The cursor defaults to `pointer` and can be intentionally overridden without
discarding other styles:

```tsx
<Button cursor="grab" style={{ userSelect: "none" }}>
  Drag action
</Button>
```

Enabled and disabled states transition in both directions. Pointer presses use
a short compression and damped release; reduced-motion preferences disable
that motion. Keyboard focus uses an internal border/highlight treatment without
an external ring.

### Appearance and content

Combine four visual variants with three semantic colors:

```tsx
<Button variant="solid" color="primary">Save</Button>
<Button variant="outline" color="neutral">Cancel</Button>
<Button variant="soft" color="danger">Delete</Button>
<Button variant="ghost">More options</Button>
```

- `variant`: `solid`, `outline`, `soft`, or `ghost`
- `color`: `neutral` (default), `primary`, `danger`, `success`, `warning`, or `info`
- `size`: `xs`, `sm`, `md`, or `lg`

`neutral` is the default: an adaptive tone that is near-black in light mode and
near-white in dark mode. `primary` follows your theme's chosen brand color (set
through `ValuxProvider`), so use it for the main call to action.

`size` overrides the inherited theme `density` for a single button, so you can
place differently sized controls side by side without nesting providers:

```tsx
<Button size="sm">Compact</Button>
<Button size="lg" variant="soft" color="neutral">Prominent</Button>
```

Buttons also support loading, decorative icon slots, icon-only controls, and
full-width layouts:

```tsx
<Button loading startIcon={<SaveIcon />} fullWidth>
  Save changes
</Button>

<Button loading loadingText="Saving changes...">
  Save changes
</Button>

<Button iconOnly aria-label="Open settings">
  <SettingsIcon />
</Button>
```

Without `loadingText`, loading preserves the original accessible name and shows
only the spinner. A custom `loadingText` displays beside the spinner and becomes
the visible loading label. Loading exposes `aria-busy` and disables both native
buttons and link buttons. `iconOnly` requires an `aria-label` through the
TypeScript contract and intentionally ignores loading text to remain square.
Start and end icons are decorative and do not alter the accessible name. Icon
slots accept components from Heroicons, Lucide, or any other React icon source.

## Use Menu

`Menu` is a morphing actions menu: the trigger visually becomes the panel —
it compresses, streaks toward its destination with motion blur, unfolds with a
spring, and reverses back into the trigger on close (the trigger content
travels with the returning body and settles with a small rebound).

The canonical trigger is a library `Button` via `asChild`: it follows the
theme (primary color, density), and with `surface="trigger"` the menu
adopts that same brand color — full color continuity for free.

```tsx
import { Button, Menu } from "@valux/ui";
import "@valux/ui/styles.css";

<Menu>
  <Menu.Trigger asChild>
    <Button color="primary" iconOnly aria-label="Actions">+</Button>
  </Menu.Trigger>
  <Menu.Content>
    <Menu.Item icon={<PencilIcon />} onSelect={edit}>Edit</Menu.Item>
    <Menu.Item icon={<ShareIcon />} disabled>Share</Menu.Item>
    <Menu.Item icon={<TrashIcon />} destructive onSelect={remove}>
      Delete
    </Menu.Item>
  </Menu.Content>
</Menu>
```

- `Menu`: `open` / `defaultOpen` / `onOpenChange` (controlled or uncontrolled).
- `Menu.Trigger`: renders a native button, or use `asChild` to merge the
  behavior onto your own element (for example a library `Button`).
- `Menu.Content`: `side` / `align` (`"auto"` by default — collision-aware, it
  opens toward available space), and `surface`: `"auto"` follows the theme
  (white in light, dark in dark), `"trigger"` adopts the trigger's solid
  colors for perfect morph color continuity.
- `Menu.Item`: `icon`, `disabled`, `destructive`, `shortcut` (decorative
  trailing hint like `"⌘D"`), `onSelect` (runs and closes).
- `Menu.Separator` and `Menu.Label` group related actions into sections.

The menu is portaled but inherits the nearest `ValuxProvider` theme,
and it shares the kit's single radius token with every control.
Keyboard: arrows move (skipping disabled items), Home/End jump, typing
letters jumps to the matching item (type-ahead), Enter/Space activate,
Esc/Tab/outside-click close; focus returns to the trigger. Reduced motion
replaces the morph with an instant crossfade.

## Use Popover

`Popover` is the Menu's morphing body with free-form content and no menu
semantics — anchored to its trigger, collision-aware, **non-modal** (no
scrim or scroll lock; Esc, outside click, or the pull gesture dismiss it).
`Popover.Trigger` / `Popover.Content` (`side`, `align`, `surface`,
`dismissable`) / `Popover.Close` — same contracts as the Menu.

## Use Tooltip

`Tooltip` buds out of its control on hover (after a 400ms `delay`) or
keyboard focus — the trigger never hides, it never opens from touch, and it
wires `aria-describedby` automatically. `Tooltip.Trigger` (`asChild`) +
`Tooltip.Content` (`side`, `align`).

## Use Dialog

`Dialog` is the Menu grown into a modal: by default the panel morphs out of
its trigger with the same choreography (compression, blurred streak, spring
settle, ghosted return), scaled up for a larger surface. A subtle scrim fades
in behind it, the page scroll locks, and the background becomes inert.

Every dialog ships a built-in "X" close button in the top-right corner — it
is the one dismiss control, so you never add your own Cancel button.

```tsx
import { Button, Dialog } from "@valux/ui";
import "@valux/ui/styles.css";

<Dialog>
  <Dialog.Trigger asChild>
    <Button color="primary">Edit profile</Button>
  </Dialog.Trigger>
  <Dialog.Content size="sm">
    <Dialog.Title>Edit profile</Dialog.Title>
    <Dialog.Description>Update your visible name.</Dialog.Description>
    <input aria-label="Name" />
    <Dialog.Close asChild>
      <Button color="primary">Save</Button>
    </Dialog.Close>
  </Dialog.Content>
</Dialog>
```

- `Dialog`: `open` / `defaultOpen` / `onOpenChange` (controlled or
  uncontrolled).
- `Dialog.Trigger`: native button or `asChild`, same contract as the Menu
  trigger.
- `Dialog.Content`:
  - `placement`: `"trigger"` (default — opens from the trigger, collision
    aware) or `"center"` (classic centered modal; the morph still travels
    from the trigger). For a bottom sheet, use the `Sheet` component.
  - `surface`: `"auto"` follows the theme, `"trigger"` adopts the trigger's
    colors for full color continuity.
  - `size`: `"sm"`, `"md"` (default), `"lg"`, or `"full"` — `"full"` hands
    the entire viewport to the panel.
  - `dismissable`: set `false` to ignore Esc and outside clicks (explicit
    close only).
  - `closeLabel`: accessible label for the built-in X (default `"Close"`).
- `Dialog.Title` / `Dialog.Description`: styled, fully customizable heading
  and supporting copy; they wire `aria-labelledby` / `aria-describedby`
  automatically (a dev warning fires if the dialog ends up unnamed).
- `Dialog.Header`, `Dialog.Body`, `Dialog.Footer`: structural parts. With a
  `Body`, only it scrolls — the header, the X, and the footer stay pinned.
  The footer right-aligns actions and stacks them full-width on narrow
  screens. The Sheet mirrors all three.
- `Dialog.Icon`: a tinted icon badge above the title. Bring any svg; pick a
  semantic `tone` (`primary`, `danger`, `success`, `warning`, `info`,
  `neutral`) and it colors itself from the theme.
- `Dialog.Close`: closes from inside — native button or `asChild` — for
  confirm actions like "Save".
- `alert`: announce as `role="alertdialog"` for destructive or urgent
  confirmations (pair with `dismissable={false}`).
- `initialFocus`: a ref to the element that should receive focus on open.
- No trigger? A controlled `<Dialog open>` without a `Dialog.Trigger`
  renders centered with a quick scale-fade instead of the morph.
- Dialogs stack: a dialog can open another dialog (or a menu); Esc and
  outside clicks only ever dismiss the TOPMOST layer.

Menus and dialogs can also be closed by gesture: pull down with a finger
(touch) or swipe down with two fingers (trackpad), inside or outside the
panel. The gesture scrubs the return morph itself — stop short or pull back
up and it springs back open; pass the commit point and the close finishes
instantly.

The dialog is modal: focus is trapped inside while open and returns to the
trigger on close, the body scroll is locked, and everything behind the scrim
is `inert`. Reduced motion swaps the morph for an instant crossfade.

## Use Sheet

`Sheet` is the bottom sheet: it does NOT morph from its trigger — the panel
slides up from the bottom edge, full width, with a grabber and the same
built-in X. Drag it down (or two-finger swipe) to dismiss; release early and
it springs back.

```tsx
import { Button, Sheet } from "@valux/ui";

<Sheet>
  <Sheet.Trigger asChild>
    <Button variant="ghost">Quick settings</Button>
  </Sheet.Trigger>
  <Sheet.Content>
    <Sheet.Title>Quick settings</Sheet.Title>
    <Sheet.Description>Preferences for this notebook.</Sheet.Description>
    {/* form controls */}
  </Sheet.Content>
</Sheet>
```

- `Sheet`: `open` / `defaultOpen` / `onOpenChange`.
- `Sheet.Content`: `dismissable`, `closeLabel`, and `height` — `"auto"`
  (hugs content), `"half"`, or `"full"` detents; safe-area aware, content
  scrolls internally past the detent. Add `expandable` to let users pull the
  sheet UP to (almost) full height; pulling down collapses it back before a
  further pull dismisses.
- `Sheet.Title` / `Sheet.Description`: same automatic aria wiring as the
  Dialog parts. `Sheet.Close` closes from inside.

## Use Toast

Liquid notifications: a title pill fused onto a description panel that
GENERATES itself and reabsorbs on exit. Mount `<Toaster />` ONCE, then call
`toast(...)` from anywhere — no hooks, no context. Toasts queue one at a
time (the waiting line stacks behind as complete cards and passes to the
front); `toast.promise(promise, { loading, success, error })` shows a
spinner pill that settles in place. See `docs/components/toast.md`.

## Use Input & TextArea

Text fields with curated types — `text · email · password · search ·
number · tel · url` — where each `type` wires the right mobile keyboard
and behavior (password ships an eye toggle, number gets styled steppers).
Variants `outline`/`soft`, sizes on the Button height scale, validation
with a NEUTRAL border (the tone lives in the status dot/message). See
`docs/components/input.md`.

## Use Switch

A real checkbox styled as a pill track with an elongated chip thumb: it
squishes while pressed, DRAGS with a liquid-glass lens that grows past the
track, and the chip is light while off / dark while on in both modes. See
`docs/components/switch.md`.

## Use Checkbox & Radio

Native inputs with the kit's signature: the checkmark DRAWS itself in
(indeterminate bar included) and the radio inverts — primary outer circle,
surface-colored dot popping in. `RadioGroup` handles naming, arrow keys,
and controlled/uncontrolled value. See `docs/components/checkbox.md`.

## Use Select

A single-value picker: the trigger looks like an Input field and the panel
MORPHS out of it (Menu choreography). Options are data (`{ value, label,
description?, disabled? }[]`), keyboard is complete (arrows, type-ahead),
and `searchable` adds a combobox filter inside the panel. See
`docs/components/select.md`.

## Use ContextMenu

The Menu summoned at a point: right-click (long-press on touch) opens the
same panel, morphing from an invisible anchor under the pointer.
`ContextMenu.Trigger` wraps any area; Content/Item/Label/Separator are the
Menu's own parts. See `docs/components/context-menu.md`.

## Use Drawer

The Sheet's sibling for the sides: a floating full-height card sliding in
from the left or right edge (nav, carts, filters), detached from the
screen with outer gutters. Same modal contract, plus a sideways pull
gesture to dismiss. See `docs/components/drawer.md`.

## Use view transitions (Hero)

SwiftUI-style page transitions: mount `<ViewTransitions />` once, navigate
with `<TransitionLink href>`, and any `<Hero name>` shared between the two
pages FLIES to its new home (icon, title, excerpt becoming the detail
header). `useViewTransition()` morphs same-page state changes too. Import from
`@valux/ui/transitions` (requires the Next.js App Router — optional
peer; the main entry stays Next-free). See
`docs/components/view-transitions.md`.

## Configure every component

Wrap your application, layout, or feature with `ValuxProvider`. The
provider is server-safe and scopes its theme to its descendants.

```tsx
import { ValuxProvider } from "@valux/ui";

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <ValuxProvider
      theme={{
        mode: "system",
        color: { primary: "#ef4444", surfaceTint: 40 },
        density: "md",
        fontFamily: "var(--font-sans)",
      }}
    >
      {children}
    </ValuxProvider>
  );
}
```

- `mode`: `system`, `light`, or `dark`
- `color.primary`: any hex or `rgb()` color
- `color.onPrimary`: optional foreground override
- `color.surfaceTint`: `0` through `100`; gently mixes the primary color into surfaces
- Rounding is not configurable per component or size: the whole kit shares
  one pronounced radius (`--vx-radius-control`, `1rem`).
- `density`: `xs`, `sm`, `md`, or `lg`
- `fontFamily`: any CSS font-family value, inherited by all Valux UI components

Valux UI calculates an accessible `onPrimary` for supported hex and `rgb()`
colors. When `primary` is a CSS variable or another color syntax, provide
`onPrimary` explicitly:

```tsx
<ValuxProvider
  theme={{
    color: {
      primary: "var(--brand)",
      onPrimary: "var(--brand-foreground)",
    },
  }}
>
  {children}
</ValuxProvider>
```

Providers can be nested. Unspecified values inherit from the nearest parent,
so a feature can change only its density.

## Customize tokens directly

The Provider writes namespaced CSS custom properties. You can override them
globally, inside a scoped container, or through the provider's `style` prop:

```css
:root {
  --vx-color-primary: #14532d;
  --vx-color-on-primary: #ffffff;
  --vx-radius-control: 1.25rem;
  --vx-control-height: 3rem;
}
```

The default primary is black in light mode and white in dark mode. The
stylesheet includes semantic surface, foreground, border, focus, spacing,
typography, radius, and motion tokens. Enabled buttons use a pointer cursor.
Disabled buttons use a not-allowed cursor.

## Accessibility

Valux UI uses a native `<button>` element, so keyboard activation and disabled semantics come from the browser. The stylesheet provides a visible `:focus-visible` ring and honors reduced-motion preferences.

Component tests use React Testing Library and `jest-axe`. Automated checks cannot find every accessibility issue. Review keyboard behavior, focus visibility, labels, and contrast in your application.

## Develop locally

Install dependencies and start the Next.js playground:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Use these commands before preparing a release:

```bash
pnpm test        # Run component and accessibility tests
pnpm lint        # Run ESLint
pnpm typecheck   # Check TypeScript
pnpm build       # Build ESM, CommonJS, types, and CSS
pnpm build:demo  # Build the Next.js playground
pnpm verify      # Run package verification
```

`pnpm verify` also runs publint and inspects the npm package with a dry run. It does not publish the package.

## Contributing

See the [contributor guide](./CONTRIBUTING.md) for project structure, testing, styling, and verification conventions.

## License

[MIT](./LICENSE)
