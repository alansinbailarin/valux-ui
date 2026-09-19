# ModeOrb

The color-mode switch: a fixed sphere (bottom right) whose face previews
the mode a click will bring. Toggling doesn't swap the theme — it reveals
it as a wave washing out of the orb across the page, with a crest of foam
riding the front.

```tsx
import { ModeOrb } from "@valux/ui";

// Mount ONCE (e.g. in your root layout):
<ModeOrb />
```

- Sets `data-vx-mode` on `<html>`; every kit token follows. The choice
  persists in `localStorage` (`vx-mode`) — replay it before first paint
  with an inline script to avoid a flash.
- The wave rides `document.startViewTransition`, scoped by `data-vx-wave`
  so no other transition inherits its choreography. Frames are driven by
  production, never by the clock: a cold first flip holds the front at the
  orb instead of teleporting it mid-screen.
- **Reduced motion**: an instant flip — no wave, no disguise.
- `className` / `style` pass through (e.g. `position: "relative"` with `right`/`bottom: "auto"` to place it
  in-flow for demos — never `static`: the sphere is a ::before that needs
  a positioned host).
