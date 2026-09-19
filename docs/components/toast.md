# Toast

Liquid notifications: a title pill fused onto a description panel (one goo
silhouette) that GENERATES itself — the pill morphs in, the panel stretches
out of it, the text breathes last — and reabsorbs on exit.

```tsx
import { Toaster, toast } from "@valux/ui";

// Mount ONCE (e.g. in your root layout):
<Toaster position="top" />

// Fire from anywhere (no hooks, no context):
toast("Saved");
toast({
  title: "Everything went well!",
  description: "Your changes are safe. Keep editing.",
  tone: "success",
});
```

## API

- **`<Toaster />`** — the stack host. `position`: `"top"` (default,
  centered) · `"top-left"` · `"top-right"` · `"bottom"` · `"bottom-left"` ·
  `"bottom-right"`. Lateral positions anchor the pill (and the liquid
  stretch) to that side. `maxVisible` (default `1`).
- **`toast(options | string)`** → id. Options: `title`, `description?`
  (omit it for a compact pill-only toast), `tone?`
  (`"neutral" | "success" | "danger" | "warning" | "info"`), `duration?`
  (ms, default 4000; `0` = sticky).
- **`toast.dismiss(id?)`** — programmatic dismissal; with no id it clears
  everything (stage + queue).
- **`toast.promise(promise, { loading, success, error })`** — fires a
  sticky pill with a spinner, then SETTLES it in place when the promise
  resolves or rejects: the pill pulses while its icon and title crossfade,
  and (if the settled message has a `description`) the panel stretches out
  of it with the same liquid generation. `success` / `error` accept a
  string, options, or a callback receiving the value / reason. Returns the
  original promise untouched.

## Queueing rules

- Only `maxVisible` toasts are on stage; the rest wait in a FIFO queue and
  enter ONE BY ONE as each visible toast expires or is dismissed.
- Queued toasts' timers do not run until they are shown.
- Re-firing an IDENTICAL toast (same title/description/tone) refreshes the
  existing one's timer instead of queueing a duplicate.
- While toasts wait, up to two of them stack behind the stage card as
  COMPLETE cards (icon, title, description — real toasts, slightly
  scaled and dimmed). They fade in after the stage card finishes forming,
  and on promotion the waiting card simply SLIDES TO THE FRONT — same
  element, no re-entrance — while the rest of the line steps up.

## Behavior

Researched against toast-UX best practice (aria-live patterns, Sonner):

- Auto-dismiss pauses while hovered AND while the window is hidden or
  unfocused — a toast never expires where nobody could read it. Click
  dismisses; swipe horizontally to throw it away. `toast.dismiss()` with no
  id clears everything.
- `action: { label, onClick }` renders a tabbable button (e.g. "Undo");
  focus is NEVER stolen by a toast (WCAG 4.1.3).
- A persistent visually-hidden `aria-live` region mirrors each new toast —
  screen readers reliably announce regions that pre-exist their content.
- Tones color the icon dot and title from the theme (`role="alert"` for
  danger/warning, `role="status"` otherwise).
- INVERTED vs the theme for maximum contrast: dark chip on light themes,
  light chip on dark — all derived from the provider's surface tokens (the
  primary wash included). The silhouette carries a hairline rim + soft
  elevation via drop-shadow (a border cannot follow a goo shape).
- Reduced motion swaps all animations for instant transitions.
