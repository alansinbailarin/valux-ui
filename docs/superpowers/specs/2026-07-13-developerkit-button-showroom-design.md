# DeveloperKit Button Showroom Design

## Goal

Replace the static theme examples with one basic interactive showroom focused only on `Button`.

## Interface

- A compact controls panel and a live preview.
- Controls: color mode (`system`, `light`, `dark`), primary color picker, tint strength, radius, density, and font (`sans`, `mono`).
- Changes update the preview immediately through `DeveloperKitProvider`.
- The preview contains the existing button only.
- Layout stacks on small screens and uses two columns when space permits.

## Behavior and accessibility

- Native color and range inputs retain associated labels.
- Option groups expose their selected state and support keyboard focus.
- Every interactive control uses the pointer cursor where appropriate.
- Provider defaults remain the initial state; selecting a custom color passes it as `primary`.

## Code organization

- Keep state orchestration in a small client component.
- Split reusable controls, constants, and types when needed to respect the project's line limits.
- Remove the obsolete static preview data/components after the interactive showroom replaces them.

## Verification

- Add interaction tests for the controls and provider output.
- Run lint, typecheck, tests, production builds, and package validation through `pnpm verify`.
- Start the Next.js development server and confirm the showroom responds locally.
