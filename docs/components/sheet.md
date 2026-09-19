# Sheet

The bottom sheet. Unlike the Dialog it does **not** morph from its trigger:
the panel slides up from the bottom edge (and slides — or is dragged — back
down). Full width, safe-area aware, with the same glass material, scrim, and
built-in X as the Dialog.

```tsx
import { Button, Sheet } from "@valux/ui";

<Sheet>
  <Sheet.Trigger asChild>
    <Button variant="ghost">Quick settings</Button>
  </Sheet.Trigger>
  <Sheet.Content expandable>
    <Sheet.Header>
      <Sheet.Title>Quick settings</Sheet.Title>
      <Sheet.Description>Preferences for this notebook.</Sheet.Description>
    </Sheet.Header>
    <Sheet.Body>{/* form controls */}</Sheet.Body>
    <Sheet.Footer>
      <Sheet.Close asChild><Button color="primary">Done</Button></Sheet.Close>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet>
```

## Parts

- **`Sheet`** — root. `open` / `defaultOpen` / `onOpenChange`.
- **`Sheet.Trigger`** — native button or `asChild`. The trigger stays put
  (no morph choreography).
- **`Sheet.Content`**:
  - `height`: `"auto"` (hugs content, up to `85dvh`) · `"half"` (50dvh) ·
    `"full"` (almost the whole viewport). Content scrolls internally past
    the detent.
  - `expandable`: lets users pull the sheet UP — its height follows the
    gesture continuously, and on release the midpoint decides: past 50% of
    the way it completes the expansion, short of it it springs back.
    Pulling down collapses first; a further pull dismisses.
  - `dismissable`, `closeLabel`: as in the Dialog.
- **`Sheet.Header` / `Sheet.Body` / `Sheet.Footer`** — same structural
  contract as the Dialog (pinned chrome, one scroll region with the
  progressive top fog, stacked mobile actions).
- **`Sheet.Title` / `Sheet.Description`** — automatic aria wiring, same as
  the Dialog parts. **`Sheet.Close`** closes from inside.

## Behavior

- FLOATING: the sheet rises from the bottom but stays detached from the
  screen edges — an outer gutter on all sides (safe-area aware) with the
  full panel radius on every corner.

- Modal: focus trap and return, iOS-proof scroll lock, inert background,
  scrim. Participates in the same layer stack as dialogs and menus (Esc and
  outside clicks dismiss only the topmost layer).
- Pull-to-dismiss: drag down (touch/mouse) or two-finger swipe (trackpad,
  inside or outside). The sheet follows the gesture; releasing past the
  threshold — or flicking — plays a WAAPI exit from the exact release point
  (panel slide + scrim fade from its dragged dimness). Releasing early
  springs back.
- Glass is OFF while the sheet slides and fades in at the settle (mobile
  GPUs can't afford a moving backdrop blur).
- Reduced motion swaps the slides for instant transitions.
