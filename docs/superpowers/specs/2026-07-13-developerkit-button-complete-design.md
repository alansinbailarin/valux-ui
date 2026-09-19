# DeveloperKit Complete Button Design

## Status

Approved for immediate implementation.

## Public API

```tsx
<Button
  variant="soft"
  color="danger"
  loading
  startIcon={<Icon />}
  endIcon={<Icon />}
  fullWidth
>
  Delete
</Button>

<Button iconOnly aria-label="Settings">
  <SettingsIcon />
</Button>
```

The API adds:

- `variant?: "solid" | "outline" | "soft" | "ghost"` (`solid` default);
- `color?: "primary" | "neutral" | "danger"` (`primary` default);
- `loading?: boolean`;
- `startIcon?: ReactNode` and `endIcon?: ReactNode`;
- `iconOnly?: boolean`;
- `fullWidth?: boolean`.

All props work on both typed element branches, `<button>` and `as="a"`.

## Appearance architecture

Button exposes `data-dk-variant`, `data-dk-color`, `data-dk-loading`,
`data-dk-icon-only`, and `data-dk-full-width`. Separate stylesheets own
colors, variants, and content states. Color styles map semantic tones to
internal Button variables; variant styles consume those variables. This keeps
all twelve color/variant combinations coherent without duplicated selectors.

Primary derives from the Provider. Neutral derives from surface/foreground.
Danger adds semantic danger/on-danger tokens for light, dark, and system modes.
Disabled treatment remains common to every combination. Focus stays internal.

## Content and state

- Start/end icon wrappers are decorative and use `aria-hidden="true"`.
- `iconOnly` creates a square control; consumers provide `aria-label`.
- `fullWidth` sets inline size to `100%`.
- Loading keeps content in layout but visually hidden, centers a CSS spinner,
  sets `aria-busy="true"`, and uses disabled interaction semantics.
- The existing accessible name remains available while loading.
- Spinner motion stops under reduced motion.

## Showroom

Add controls for variant, color, state (`Enabled`, `Disabled`, `Loading`),
icons (`None`, `Start`, `End`, `Both`), content (`Text`, `Icon only`), and width
(`Auto`, `Full`). Preserve element, cursor, theme, radius, density, tint, and
typography controls. The preview must support every control combination.

## Testing

Test all 12 variant/color pairs, defaults, exported types, disabled precedence,
loading semantics for buttons and anchors, icon slots, icon-only accessible
label, full width, CSS contracts, axe, showroom control wiring, package output,
and demo build.
