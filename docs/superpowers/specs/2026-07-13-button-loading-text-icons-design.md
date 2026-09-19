# Button Loading Text and Icons Design

## Goal

Add optional, consumer-defined loading text and improve Button icon sizing without coupling DeveloperKit consumers to an icon package.

## Public API

- Add `loadingText?: ReactNode` to both Button element branches.
- When `loading` is true and `loadingText` is omitted, show only the centered spinner.
- When `loading` is true and `loadingText` is present, show the spinner followed by that content.
- Ignore `loadingText` in `iconOnly` mode so the control remains square.

## Layout and accessibility

- Overlay normal and loading content in the same inline grid cell so the Button reserves the larger width and does not jump during state changes.
- Keep the original accessible name during spinner-only loading.
- When visible loading text exists, expose it as the loading control's accessible content and hide the replaced visual content from assistive technology.
- Continue exposing `aria-busy` and disabled interaction semantics.

## Icons

- Keep `startIcon`, `endIcon`, and icon-only children typed as consumer-provided React nodes.
- Size slotted icons at `1.25em` and icon-only SVGs at `1.375em`; both scale with density.
- Use official `@heroicons/react` only as a dev dependency in the showroom and import individual 24px outline icons.

## Showroom and tests

- Add an editable optional loading-text input; an empty value demonstrates spinner-only mode.
- Replace the local checkmark drawing with individual Heroicons imports.
- Cover custom loading text, spinner-only behavior, icon-only behavior, accessibility, CSS sizing, showroom interaction, package contract, and full build verification.

