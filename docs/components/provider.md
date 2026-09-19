# ValuxProvider

Wraps your application (or any subtree) and scopes the theme to its
descendants. Server-safe: it renders a plain `div` with data attributes and
CSS custom properties — no context is required at runtime for styling.

```tsx
import { ValuxProvider } from "@valux/ui";
import "@valux/ui/styles.css";

<ValuxProvider theme={{ mode: "system", color: { primary: "#4f46e5" } }}>
  <App />
</ValuxProvider>
```

## Theme options (`ValuxTheme`)

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `mode` | `"system" \| "light" \| "dark"` | `"system"` | Dark mode swaps every surface/text token. |
| `color.primary` | CSS color string | near-black | The brand color. Buttons, menus, and dialogs derive hovers, washes, and foregrounds from it. |
| `color.onPrimary` | CSS color string | auto | Text color on primary surfaces; computed from `primary`'s luminance when omitted. |
| `color.surfaceTint` | `number` (0–100) | `0` | Washes the page surfaces with a hint of `primary`. |
| `density` | `"xs" \| "sm" \| "md" \| "lg"` | `"md"` | Control heights, paddings, and typography scale together. |
| `fontFamily` | CSS font stack | system | Applied to every component. |

Providers nest: an inner provider only overrides what it specifies, so a
feature can change only its density.

## Rounding

Rounding is deliberately **not** configurable per component or per size: the
whole kit shares one pronounced radius token, `--vx-radius-control` (`1rem`).
Panels (menu, dialog, sheet) derive `calc(var(--vx-radius-control) * 1.5)`;
menu items hover as full pills. Advanced consumers can override the token in
CSS, but the API intentionally offers no radius prop.

## Tokens

Every visual decision is a `--vx-*` custom property (colors, radius, density,
motion, per-component surfaces). Override them on `:root`, on a provider, or
on a single component instance:

```css
.my-feature {
  --vx-color-primary: #0ea5e9;
  --vx-dialog-max-inline: min(94vw, 44rem);
}
```

Portaled surfaces (menu, dialog, sheet) copy the nearest provider's theme
onto their portal node at creation, so they always match their surroundings
— including derived `color-mix` tokens.
