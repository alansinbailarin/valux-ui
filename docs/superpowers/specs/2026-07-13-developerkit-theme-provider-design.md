# DeveloperKit theme provider design

## Summary

Add an SSR-safe, scoped `DeveloperKitProvider` that exposes a global semantic token layer to every DeveloperKit component. Consumers configure color, surface tint, color mode, radius, density, and font family through one typed `theme` object. The provider renders a wrapper element with CSS variables and data attributes, so it works in React Server Components without context, effects, or hydration.

The existing Button remains usable without a provider. Root CSS defaults preserve the current black Button in light mode and white Button in dark mode.

## Goals

- Provide one stable theme API for current and future DeveloperKit components.
- Keep theming SSR-safe and compatible with React 18, React 19, and Next.js.
- Support `system`, `light`, and `dark` color modes.
- Support arbitrary CSS primary colors when consumers supply a matching foreground color.
- Automatically choose a readable black or white foreground for supported literal colors.
- Tint neutral surfaces from the primary color without weakening the primary action color.
- Configure component radius, density, and font family globally.
- Allow nested providers to inherit unspecified tokens and override selected values.
- Preserve accessibility, reduced motion, package validation, and existing Button behavior.

## Non-goals

- A client-side theme toggle or persisted user preference.
- A React context API or theme hook.
- Multiple semantic roles such as danger, success, warning, or info.
- Per-component size or radius props.
- A generated 50-950 color palette.
- Bundled fonts or font loading.
- Automatic contrast calculation for every CSS color syntax.

## Public API

```tsx
import { Button, DeveloperKitProvider } from "developerkit";
import "developerkit/styles.css";

export function App() {
  return (
    <DeveloperKitProvider
      theme={{
        mode: "system",
        color: {
          primary: "#ef4444",
          onPrimary: "#ffffff",
          surfaceTint: 20,
        },
        radius: "md",
        density: "sm",
        fontFamily: "var(--font-geist)",
      }}
    >
      <Button>Continue</Button>
    </DeveloperKitProvider>
  );
}
```

Public types:

```ts
export type DeveloperKitMode = "system" | "light" | "dark";
export type DeveloperKitRadius = "none" | "sm" | "md" | "lg" | "full";
export type DeveloperKitDensity = "xs" | "sm" | "md" | "lg";

export interface DeveloperKitColorTheme {
  primary?: string;
  onPrimary?: string;
  surfaceTint?: number;
}

export interface DeveloperKitTheme {
  mode?: DeveloperKitMode;
  color?: DeveloperKitColorTheme;
  radius?: DeveloperKitRadius;
  density?: DeveloperKitDensity;
  fontFamily?: string;
}

export interface DeveloperKitProviderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  theme?: DeveloperKitTheme;
}
```

`DeveloperKitProvider` forwards native div attributes and its ref. Consumer `className` is preserved. Consumer `style` is merged after generated theme variables so advanced users can intentionally override any public token.

## Defaults and inheritance

The stylesheet defines defaults on `:root`:

- Mode: system.
- Primary: `#171717` in light mode and `#f4f4f5` in dark mode.
- On-primary: `#ffffff` in light mode and `#18181b` in dark mode.
- Surface tint: 0.
- Radius: `md`.
- Density: `md`.
- Font family: `inherit`.

The provider only writes values that appear in its `theme` object. Omitted values inherit from the nearest provider or the root defaults. An explicit `mode="system"` restores system color selection inside a parent provider with an explicit light or dark mode.

## Provider rendering

The provider renders one wrapper:

```html
<div
  data-dk-provider=""
  data-dk-mode="light"
  data-dk-radius="md"
  data-dk-density="sm"
  style="--dk-color-primary: #ef4444; ..."
>
  ...
</div>
```

Attributes for omitted theme properties are omitted. The wrapper does not set layout properties, background, or foreground color. It only establishes inherited DeveloperKit variables. This prevents the provider from changing consumer layouts or styling non-DeveloperKit content.

No file in the provider implementation uses `"use client"`. The component performs deterministic string and number transformations during render.

## Semantic color model

Public color tokens:

- `--dk-color-primary`
- `--dk-color-on-primary`
- `--dk-color-surface`
- `--dk-color-surface-raised`
- `--dk-color-on-surface`
- `--dk-color-border`
- `--dk-color-focus`
- `--dk-surface-tint`

The Button background uses `--dk-color-primary` unchanged. Its text uses `--dk-color-on-primary`. Hover color mixes primary with on-surface by a small mode-aware amount. Focus uses `--dk-color-focus`.

Surfaces derive from a mode-specific neutral base and the primary color with `color-mix(in oklab, ...)`. `surfaceTint` accepts 0-100, is clamped, and maps linearly to a real primary mix of 0-20%. For example, `surfaceTint: 50` produces a 10% primary tint. This keeps surfaces recognizable as surfaces even at maximum tint.

`--dk-color-surface-raised` uses 60% of the effective surface tint. Borders mix on-surface into the base surface at a fixed accessible strength. Future components must consume semantic tokens rather than define component-specific color systems.

## Foreground contrast

When `primary` is omitted, the stylesheet provides accessible mode defaults.

When `primary` and `onPrimary` are both supplied, the provider uses them unchanged.

When `primary` is supplied without `onPrimary`, the provider parses opaque literal hex and RGB colors. It calculates WCAG relative luminance, compares contrast against `#18181b` and `#ffffff`, and chooses the candidate with the higher contrast ratio.

Supported automatic formats:

- `#rgb`
- `#rrggbb`
- `rgb(r, g, b)` with integer channels
- `rgb(r% g% b%)` with percentage channels

Alpha colors, CSS variables, named colors, HSL, OKLCH, `color()`, and `color-mix()` require an explicit `onPrimary`. If the provider cannot parse a custom primary and `onPrimary` is missing, it throws a descriptive error that names the invalid combination and shows how to supply `onPrimary`. This prevents silent inaccessible text.

## Radius scale

The provider maps radius names to `--dk-radius-component`:

- `none`: `0`
- `sm`: `0.25rem`
- `md`: `0.5rem`
- `lg`: `0.75rem`
- `full`: `9999px`

All DeveloperKit component containers use this semantic token unless a future component specification documents a different structural need.

## Density scale

Density changes control geometry, not the consumer's global typography scale:

| Density | Control height | Inline padding | Internal gap |
| --- | ---: | ---: | ---: |
| `xs` | `1.75rem` | `0.625rem` | `0.25rem` |
| `sm` | `2rem` | `0.75rem` | `0.375rem` |
| `md` | `2.5rem` | `1rem` | `0.5rem` |
| `lg` | `3rem` | `1.25rem` | `0.625rem` |

The mapped tokens are:

- `--dk-control-height`
- `--dk-control-padding-inline`
- `--dk-control-gap`

Button uses minimum height and inline padding. Density does not reduce the pointer target below 28 CSS pixels. Consumers remain responsible for meeting their target platform's touch-size guidance.

## Typography

`fontFamily` accepts a CSS font-family value and maps it to `--dk-font-family`. It defaults to `inherit` and supports font variables created by `next/font`, for example `var(--font-geist-sans)`.

Only DeveloperKit components consume this token. The provider wrapper does not force the font onto arbitrary consumer content.

## Button migration

Button keeps its existing TypeScript and DOM API. Its CSS moves from component-specific configuration tokens to the semantic layer:

- Background: `--dk-color-primary`.
- Foreground: `--dk-color-on-primary`.
- Radius: `--dk-radius-component`.
- Minimum height: `--dk-control-height`.
- Inline padding: `--dk-control-padding-inline`.
- Internal gap: `--dk-control-gap`.
- Font: `--dk-font-family`.

Existing consumers that only import `developerkit/styles.css` see the same black light-mode and white dark-mode defaults without adding a provider.

## Error handling

- Clamp `surfaceTint` below 0 to 0 and above 100 to 100.
- Reject non-finite `surfaceTint` values with a descriptive error.
- Reject an unparseable custom primary without explicit `onPrimary`.
- Pass valid CSS strings through unchanged when enough contrast information is supplied.
- TypeScript prevents unsupported mode, radius, and density names.

## Testing

Unit and component tests verify:

- Provider default rendering without client-only behavior.
- Native wrapper props, class name, style, children, and ref forwarding.
- Mode, radius, and density data attributes.
- Primary, on-primary, font, and surface-tint variables.
- Surface-tint clamping and non-finite rejection.
- Automatic black/white foreground selection for light and dark literal colors.
- Required `onPrimary` for unsupported CSS color formats.
- Nested providers omit unspecified variables and inherit through CSS.
- Server rendering through `react-dom/server` without browser globals.
- Button has unchanged native behavior and no axe violations.
- Stylesheet defines root defaults, explicit modes, system mode, semantic tokens, radius scales, density scales, reduced motion, pointer cursors, and `color-mix(in oklab, ...)`.
- Package build, types, publint, dry-run tarball, and Next.js playground build remain valid.

## Playground and documentation

The root layout uses a provider to apply the Geist font variable globally to DeveloperKit components. The playground shows:

- Default system theme.
- A nested red primary theme with visible surface tint.
- Radius choices.
- Density choices.
- Light and dark examples without a client-side toggle.

The README documents installation, provider usage, defaults, accepted color formats, explicit `onPrimary` requirements, scale tables, nesting, direct token overrides, and server compatibility.

## Success criteria

- Existing Button usage remains valid without a provider.
- One provider configuration changes every DeveloperKit component under its wrapper.
- A red primary keeps a fully red Button while only surfaces vary with `surfaceTint`.
- Radius, density, and font choices apply through shared semantic tokens.
- Providers can nest without resetting omitted parent values.
- Light, dark, and system modes work without hydration or effects.
- Automated contrast behavior never silently accepts an unsupported custom primary without foreground guidance.
- All tests, lint, type checks, builds, package checks, and automated accessibility checks pass.
