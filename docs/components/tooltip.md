# Tooltip

A label that **buds out of its control** on hover or keyboard focus — a
micro version of the kit's morph (scale + slight blur from the edge facing
the trigger). Unlike every other surface, the trigger never hides: you are
pointing at it.

```tsx
import { Button, Tooltip } from "@valux/ui";

<Tooltip>
  <Tooltip.Trigger asChild>
    <Button iconOnly aria-label="Share"><ShareIcon /></Button>
  </Tooltip.Trigger>
  <Tooltip.Content>Share this notebook</Tooltip.Content>
</Tooltip>
```

## Parts

- **`Tooltip`** — root. `delay` (hover delay in ms, default 400; keyboard
  focus shows immediately), plus `open` / `defaultOpen` / `onOpenChange`.
- **`Tooltip.Trigger`** — native button or `asChild` over any element.
- **`Tooltip.Content`** — the chip. `side` (`"top"` default, `"bottom"`,
  `"left"`, `"right"`) / `align`, with automatic flip and viewport clamping.
  Content is free-form and wraps up to 16rem — multi-line just works.
- **`Tooltip.Title` / `Tooltip.Description`** — optional styled lines for
  rich tooltips (bold first line + muted copy). Keep tooltips
  NON-interactive; anything clickable belongs in a Popover.

## Behavior

- Shows on hover (after `delay`) and on `:focus-visible` (immediately);
  hides on leave, blur, press, and Escape.
- **Never opens from touch** — there is no hover on touch; controls must
  carry their own labels there.
- `role="tooltip"` + automatic `aria-describedby` wiring on the trigger
  while visible.
- Inverted high-contrast chip (dark on light themes, light on dark), themed
  radius, `pointer-events: none` (it can never steal a click).
- The entrance is the kit's streak in miniature: a thin seed squeezes out
  of the trigger, stretches into a blurred line mid-flight, and unfolds with
  a soft overshoot; the exit mirrors it back INTO the trigger.
- **Warm group**: right after one tooltip hides, moving to a neighbor shows
  it instantly (no second delay), like native toolbars.
- Any scroll dismisses it (the anchor is drifting away).
- Disabled buttons swallow pointer events in some browsers — wrap a disabled
  trigger in a `span` if it must keep its tooltip.
- Reduced motion disables the animations.
