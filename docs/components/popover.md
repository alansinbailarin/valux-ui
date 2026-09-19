# Popover

An anchored, **non-modal** surface that morphs from its trigger — the Menu's
body and choreography with free-form content instead of menu semantics.
Use it for filters, share cards, mini-forms, pickers: anything that belongs
next to the control that opened it.

```tsx
import { Button, Popover } from "@valux/ui";

<Popover>
  <Popover.Trigger asChild>
    <Button variant="soft">Share</Button>
  </Popover.Trigger>
  <Popover.Content>
    <p>Anyone with the link can view.</p>
    <Popover.Close asChild>
      <Button color="primary" fullWidth>Copy link</Button>
    </Popover.Close>
  </Popover.Content>
</Popover>
```

## Parts

- **`Popover`** — root. `open` / `defaultOpen` / `onOpenChange`.
- **`Popover.Trigger`** — native button or `asChild`; same morph contract as
  the Menu trigger (hides while open, reveals in a crossfade, icons re-enter
  animated).
- **`Popover.Content`** — free-form panel. `side` / `align` (`"auto"`,
  collision-aware), `surface` (`"auto"` glass · `"trigger"` adopts the
  trigger's colors), `dismissable`.
- **`Popover.Close`** — closes from inside (native button or `asChild`).

## Behavior

- **Non-modal**: no scrim, no scroll lock, no inert background — the page
  stays interactive. Esc, outside click, and the pull-to-close gesture
  dismiss it; it participates in the layer stack (topmost dismisses first).
- Focus moves to the first tabbable inside on open and returns to the
  trigger on close. Named after its trigger (`aria-labelledby`).
- Same glass material and rounding as the Menu; same portal theme
  inheritance; same reduced-motion fallback.
