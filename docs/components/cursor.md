# Cursor

A rounded arrowhead that replaces the native pointer across the page: an
OS-composited static tier for everyone, and — on fine pointers without
reduced motion — a live arrow that trails the hand with easing and turns
its tip toward the direction of travel.

```tsx
import { Cursor } from "@valux/ui";

// Mount ONCE (e.g. in your root layout):
<Cursor />
```

Nothing happens from styles alone: the whole system is gated behind a
`data-vx-cursor` attribute the component manages, so importing the kit's
CSS never hijacks a page's cursor.

- **Zero-flash**: server-render `data-vx-cursor="static"` on `<html>`.
- **Pressables** (`a`, `button`, `[role="button"]`, `label`, `summary`)
  invert the arrow's fill — feedback by dress, never by shape. Text fields
  keep the native I-beam.
- **Theming**: `--vx-cursor-ink` / `--vx-cursor-edge`, mode-aware out of
  the box.
- **Reduced motion / coarse pointers**: the static tier only — same
  drawing, standing still. No JS cursor is ever mounted there.
