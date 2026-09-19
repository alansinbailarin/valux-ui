# Context menu

The Menu summoned at a POINT: right-click on desktop, LONG-PRESS on
touch (iOS never fires `contextmenu`; the native callout is suppressed).
The panel morphs from an invisible anchor under the pointer, and
everything inside IS the Menu — same items, keyboard, type-ahead,
shortcuts, and pull-to-close gesture.

```tsx
import { ContextMenu } from "@valux/ui";

<ContextMenu>
  <ContextMenu.Trigger>
    <NoteCard />
  </ContextMenu.Trigger>
  <ContextMenu.Content aria-label="Note actions">
    <ContextMenu.Label>Nota</ContextMenu.Label>
    <ContextMenu.Item shortcut="⌘R" onSelect={rename}>Rename</ContextMenu.Item>
    <ContextMenu.Item onSelect={duplicate}>Duplicate</ContextMenu.Item>
    <ContextMenu.Separator />
    <ContextMenu.Item destructive onSelect={remove}>Delete</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu>
```

## API

- **`ContextMenu`** (root) — `onOpenChange?`.
- **`ContextMenu.Trigger`** — wraps the pressable area (any content).
  Desktop: `contextmenu` (the browser menu is prevented). Touch:
  500ms long-press; moving >10px cancels it so scrolling wins.
- **`ContextMenu.Content` / `Item` / `Label` / `Separator`** — the
  Menu's own parts, re-exported: `onSelect`, `destructive`, `icon`,
  functional `shortcut`s, disabled — everything applies. Give the
  Content an `aria-label` (there is no labelled trigger).

## Behavior

- Opens AT the pointer: an invisible 24px anchor is placed under the
  click/finger and the panel morphs out of it (and returns into it on
  close) with the house choreography.
- Esc, outside click/tap, Tab, and the pull gesture dismiss; arrows +
  type-ahead navigate; focus moves into the menu and back out on close.
- Reduced motion swaps the morph for an instant crossfade.
