# DeveloperKit Button Foundation Design

## Status

Approved for immediate implementation.

## Scope

This phase completes the Button foundation before visual variants, semantic
colors, loading, icons, icon-only mode, and full-width support.

## Public API

`Button` is a strictly typed polymorphic component with two valid forms:

```tsx
<Button disabled cursor="wait">Save</Button>
<Button as="a" href="/docs" cursor="grab">Documentation</Button>
```

- The default form accepts native button attributes and a button ref.
- `as="a"` accepts native anchor attributes, requires anchor-compatible props,
  and forwards an anchor ref.
- Shared library props are `as`, `disabled`, and `cursor`.
- Consumer `className`, `style`, event handlers, data attributes, and ARIA
  attributes remain supported.
- Cursor defaults to `pointer`; `cursor` intentionally overrides it.

## Interaction

- Native buttons keep `type="button"` as the safe default.
- Disabled native buttons use the native `disabled` attribute.
- Disabled anchors expose `aria-disabled="true"`, remove `href`, leave the tab
  order, and do not invoke the consumer click handler.
- Enabled/disabled changes transition color, border, shadow, opacity, and
  saturation in both directions.
- Pointer press uses a restrained compression with slight vertical travel.
  Release uses a critically damped overshoot and returns to rest.
- Pointer cancellation returns directly to rest.
- Motion is skipped when reduced motion is requested or Web Animations is
  unavailable.

## Focus and accessibility

There is no external focus ring or outline. Keyboard `:focus-visible` remains
perceivable through an internal border and inset highlight. Pointer focus does
not show the treatment. Native keyboard activation remains browser-owned.

## Showroom

Add controls for element (`Button` or `Link`), state (`Enabled` or `Disabled`),
and cursor (`Pointer`, `Default`, or `Grab`). Press motion is inspected by
interacting with the preview. Existing theme controls remain unchanged.

## Testing

Cover both ref/prop branches, disabled anchor navigation, consumer click
handlers, custom cursors, SSR, pointer motion, reduced motion, CSS focus and
state-transition contracts, showroom controls, and axe. Run `pnpm verify` and
`pnpm build:demo` before completion.
