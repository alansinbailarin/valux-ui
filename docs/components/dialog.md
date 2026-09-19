# Dialog

The Menu grown into a modal: by default the panel morphs out of its trigger
with the same choreography, scaled up for a larger surface. A subtle scrim
fades in behind it, page scroll locks, the background becomes inert, and
focus is trapped inside.

Every dialog ships a built-in **X** close button in the top-right corner —
it is the one dismiss control; you never add a Cancel button.

```tsx
import { Button, Dialog } from "@valux/ui";

<Dialog>
  <Dialog.Trigger asChild>
    <Button color="primary">Edit profile</Button>
  </Dialog.Trigger>
  <Dialog.Content size="sm">
    <Dialog.Header>
      <Dialog.Icon tone="primary"><PencilIcon /></Dialog.Icon>
      <Dialog.Title>Edit profile</Dialog.Title>
      <Dialog.Description>Update your visible name.</Dialog.Description>
    </Dialog.Header>
    <Dialog.Body>
      <input aria-label="Name" />
    </Dialog.Body>
    <Dialog.Footer>
      <Dialog.Close asChild>
        <Button color="primary">Save</Button>
      </Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog>
```

## Parts

- **`Dialog`** — root. `open` / `defaultOpen` / `onOpenChange`.
- **`Dialog.Trigger`** — native button or `asChild`; same reveal/ghost
  choreography contract as the Menu trigger.
- **`Dialog.Content`** — the panel:
  - `placement`: `"trigger"` (default — anchored next to its trigger,
    collision-aware) or `"center"` (classic centered modal; the morph still
    travels from the trigger).
  - `size`: definite widths — `"sm"` (24rem) · `"md"` (36rem, default) ·
    `"lg"` (48rem) · `"full"` (the whole viewport; opens with no overshoot
    so content never scales past its final size).
  - `surface`: `"auto"` follows the theme; `"trigger"` adopts the trigger's
    solid colors.
  - `dismissable`: `false` ignores Esc and outside clicks (explicit close
    only).
  - `alert`: announce as `role="alertdialog"` (destructive/urgent confirms;
    pair with `dismissable={false}`).
  - `initialFocus`: ref to the element focused on open (default: first
    tabbable).
  - `closeLabel`: accessible label for the built-in X (default `"Close"`).
- **`Dialog.Header` / `Dialog.Body` / `Dialog.Footer`** — structural parts.
  With a `Body`, only it scrolls: the header, the X, and the footer stay
  pinned. The footer right-aligns actions and stacks them full-width on
  narrow screens (primary on top).
- **`Dialog.Icon`** — tinted icon badge above the title. Bring any svg;
  `tone`: `"primary" | "danger" | "success" | "warning" | "info" |
  "neutral"`. Decorative (`aria-hidden`).
- **`Dialog.Title` / `Dialog.Description`** — styled, fully customizable;
  they wire `aria-labelledby` / `aria-describedby` automatically (a dev
  warning fires if the dialog ends up with no accessible name).
- **`Dialog.Close`** — closes from inside (native button or `asChild`) for
  confirm actions like "Save".

## Behavior

- Modal: focus trap + focus return to trigger, iOS-proof scroll lock
  (pinned body), inert background, scrim (tint + blur on desktop; tint only
  on touch devices, like native platforms).
- Dialogs stack: a dialog can open another dialog (or a menu). Esc and
  outside clicks only ever dismiss the TOPMOST layer.
- No trigger? A controlled `<Dialog open>` without a `Dialog.Trigger`
  renders centered with a quick scale-fade in and out instead of the morph.
- Pull-to-close gesture (same as Menu): the gesture scrubs the return morph;
  short of the commit point it rewinds, past it the close completes
  immediately. Trackpad inertia is swallowed after the commit.
- Reduced motion swaps every morph for an instant crossfade.
