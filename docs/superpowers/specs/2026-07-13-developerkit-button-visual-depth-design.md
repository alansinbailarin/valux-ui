# DeveloperKit Button Visual Depth Design

## Goal

Give the default `Button` a restrained technical identity using static depth concentrated on its upper edge.

## Visual treatment

- Add `inset 0 1px 0` as the inner highlight along the top edge.
- Add a one-pixel border and `0 1px 2px` exterior shadow.
- Derive effect colors from existing semantic color tokens so custom primary colors and light/dark modes continue to work.
- Keep the existing background, text color, radius, density, typography, hover, focus-visible, and reduced-motion behavior.
- Remove the depth effect from disabled buttons so they remain visually inactive.

The derived colors are:

- Highlight: primary mixed with 24% white.
- Border: primary mixed with 18% black.
- Exterior shadow: on-surface mixed with 82% transparency.
- Disabled: no shadow and a border matching the disabled background.

## Architecture

- Implement the treatment only in the public CSS token and Button style modules.
- Add no React props, variants, runtime logic, or dependencies.
- Define internal `--dk-button-highlight`, `--dk-button-border`, and `--dk-button-shadow` tokens in `tokens.css`.

## Accessibility

- Preserve the existing focus-visible outline and color contrast behavior.
- Do not use the static effect as the sole indicator of state.
- Disabled state retains its semantic colors and native `disabled` behavior.

## Verification

- Add a failing stylesheet contract test before implementation.
- Assert the top inset effect references semantic tokens and the disabled rule removes depth.
- Run the focused stylesheet test, full package verification, and showroom production build.
- Confirm the running showroom responds locally.
