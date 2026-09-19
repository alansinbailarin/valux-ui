# Switch

Native-feel toggle: a REAL checkbox (`role="switch"`) styled as a fully
round pill track with an elongated WHITE chip thumb (soft corners,
deliberately not a circle), so forms and keyboard work for free. While
dragging, the thumb becomes a LIQUID LENS: it grows past the track as
bright translucent glass and the fill color follows your finger;
releasing past the midpoint commits.

```tsx
import { Switch } from "@valux/ui";

<Switch label="Notifications" description="Push and email." defaultChecked />
<Switch label="Dark mode" checked={dark} onChange={(e) => setDark(e.target.checked)} />
```

## API

- `label` — visible label beside the control (clicking it toggles);
  `description` adds a secondary line wired via `aria-describedby`.
- `labelFirst` — settings-row layout: label on the left, control on the
  right, space-between.
- `size` — `"sm" | "md" | "lg"` track sizes.
- Everything else passes through to the underlying checkbox: `checked` /
  `defaultChecked`, `onChange` (a real change event), `name` (submits
  `"on"` in native forms), `disabled`, `required`, …

## Behavior

- Checked track is the theme primary; unchecked is an on-surface wash.
  The chip stays WHITE in every state and mode.
- Press-and-hold stretches the chip toward the empty side (the iOS
  squish). DRAGGING turns it into the glass lens — bigger than the
  track, blurring what's behind — and release past the midpoint commits.
  A plain tap just toggles.
- Space toggles from the keyboard; focus shows the kit focus ring on the
  track.
- Reduced motion disables the transitions.
