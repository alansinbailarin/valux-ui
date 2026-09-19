# Button

The base control. Plain CSS, themed from the provider, with a WAAPI press
animation (compress on press, spring back on release) and a CSS fallback
when JavaScript is unavailable.

```tsx
import { Button } from "@valux/ui";

<Button color="primary" onClick={save}>Save</Button>
<Button variant="soft" startIcon={<ShareIcon />}>Share</Button>
<Button variant="ghost" iconOnly aria-label="More options"><DotsIcon /></Button>
<Button as="a" href="/pricing" variant="outline">Pricing</Button>
```

## Props (`ButtonProps`)

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `"solid" \| "outline" \| "soft" \| "ghost"` | `"solid"` | Flat by default — no inner highlight or drop shadow anywhere. |
| `color` | `"neutral" \| "primary" \| "danger" \| "success" \| "warning" \| "info"` | `"neutral"` | `neutral` adapts black/white to the mode; `primary` is the theme brand color. |
| `size` | `"xs" \| "sm" \| "md" \| "lg"` | `"md"` | Independent from provider `density` (which scales everything). |
| `iconOnly` | `boolean` | `false` | Requires `aria-label` (enforced by the types). |
| `startIcon` / `endIcon` | `ReactNode` | — | Sized and spaced automatically. |
| `loading` | `boolean` | `false` | Disables interaction, shows a spinner; `loadingText` replaces the label. |
| `fullWidth` | `boolean` | `false` | Stretches to the container. |
| `disabled` | `boolean` | `false` | Flattened styling, `cursor: not-allowed`. |
| `as` | `"button" \| "a"` | `"button"` | `as="a"` renders a real anchor with `href`; disabled anchors drop the href and block clicks. |
| `cursor` | CSS cursor | auto | Escape hatch. |

## Behavior

- Press motion runs on the compositor (transform only); reduced motion
  disables it.
- Touch pointers are never pointer-captured — capturing on `pointerdown`
  suppresses the synthesized click on iOS Safari (every tap would go dead).
- Focus ring: a themed 2px inset ring (`--vx-focus-width`,
  `--vx-color-focus`) on `:focus-visible` only.
- Buttons are the canonical triggers for Menu, Dialog, and Sheet via
  `asChild` — the surfaces adopt their colors and geometry.
