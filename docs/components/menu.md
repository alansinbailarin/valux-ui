# Menu

A morphing actions menu: the trigger visually **becomes** the panel. On open
it compresses, streaks toward its destination with motion blur, and unfolds
with a spring; on close it reverses into the trigger, with the trigger's
content traveling inside the returning body (a "ghost") and landing exactly
where the real trigger sits.

```tsx
import { Button, Menu } from "@valux/ui";

<Menu>
  <Menu.Trigger asChild>
    <Button color="primary" iconOnly aria-label="Actions">+</Button>
  </Menu.Trigger>
  <Menu.Content>
    <Menu.Label>Note</Menu.Label>
    <Menu.Item icon={<PencilIcon />} shortcut="⌘N" onSelect={create}>New note</Menu.Item>
    <Menu.Item icon={<ShareIcon />} disabled>Share</Menu.Item>
    <Menu.Separator />
    <Menu.Item icon={<TrashIcon />} destructive onSelect={remove}>Delete</Menu.Item>
  </Menu.Content>
</Menu>
```

## Parts

- **`Menu`** — root. `open` / `defaultOpen` / `onOpenChange` (controlled or
  uncontrolled).
- **`Menu.Trigger`** — renders a native button, or `asChild` merges the
  behavior onto your own element (typically a library `Button`). The trigger
  hides while the menu is open (the panel IS the trigger) and reveals in a
  crossfade as the body lands; trailing icons re-enter with a slide+blur
  entrance the instant the panel unmounts.
- **`Menu.Content`** — the panel. `side` / `align` default `"auto"`
  (collision-aware). `surface`: `"auto"` follows the theme (white glass in
  light, dark glass in dark); `"trigger"` adopts the trigger's solid colors
  for full color continuity through the morph.
- **`Menu.Item`** — `icon`, `disabled`, `destructive`, `onSelect` (runs and
  closes), `shortcut` (trailing hint like `"⌘D"`; string shortcuts are
  FUNCTIONAL while the menu is open — the matching combo activates the
  item).
- **`Menu.Separator`**, **`Menu.Label`** — group related actions.

## Behavior

- Content-sized panel (up to `min(60vh, 24rem)`, then scrolls); glass
  surface with a whisper of the theme primary; rounding derived from the
  kit's single radius token; items hover as full pills.
- Keyboard: arrows move (skipping disabled), Home/End jump, type-ahead jumps
  to matches, Enter/Space activate, Esc/Tab/outside-click close. Focus
  returns to the trigger.
- Pull-to-close gesture: drag down on touch, or two-finger swipe on
  trackpads (inside or outside the panel) — the gesture scrubs the return
  morph itself. Release short of the commit point and it springs back open;
  past it, the close completes immediately.
- The panel is portaled but inherits the nearest provider's theme (applied
  at portal creation, so first-paint colors are correct).
- Reduced motion replaces the morph with an instant swap.
