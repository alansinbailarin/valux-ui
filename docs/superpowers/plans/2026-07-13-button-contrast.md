# Button Contrast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Button contrast, soften outline borders, and guarantee disabled cursor semantics.

**Architecture:** The color utility derives a solid-safe primary palette, the Provider exposes it through scoped CSS variables, and variant styles consume separate solid and accent roles. Button owns cursor precedence because inline consumer styles otherwise override disabled CSS.

**Tech Stack:** React, TypeScript, CSS custom properties, Vitest, Testing Library

## Global Constraints

- Add no runtime dependency.
- Preserve the configured primary for non-solid variants.
- Maintain WCAG AA text contrast.
- Keep production files focused and below the configured line limit.

---

### Task 1: Primary contrast palette

**Files:**
- Modify: `src/theme/color/contrast.ts`
- Modify: `src/theme/color/color.types.ts`
- Modify: `src/theme/color/color.test.ts`
- Modify: `src/theme/color/index.ts`
- Modify: `src/theme/DeveloperKitProvider.tsx`
- Modify: `src/theme/DeveloperKitProvider.test.tsx`

**Interfaces:**
- Produces: `resolvePrimaryContrast(primary, onPrimary)` with `solid` and `foreground` values.

- [x] Add failing tests for purple solid derivation and light-color preservation.
- [x] Run focused tests and confirm RED.
- [x] Implement the smallest contrast resolver and Provider variables.
- [x] Run focused tests and confirm GREEN.

### Task 2: Semantic variant tones

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/modes.css`
- Modify: `src/styles/button-colors.css`
- Modify: `src/styles/button-variants.css`
- Modify: `src/button-appearance.styles.test.ts`

**Interfaces:**
- Consumes: `--dk-color-primary-solid`.
- Produces: separate solid/accent roles and a 40% outline border.

- [x] Add failing stylesheet assertions for the new semantic roles.
- [x] Run the stylesheet test and confirm RED.
- [x] Add danger solid tokens and update color/variant recipes.
- [x] Run the stylesheet test and confirm GREEN.

### Task 3: Disabled cursor precedence

**Files:**
- Modify: `src/button/Button.tsx`
- Modify: `src/button/Button.test.tsx`

**Interfaces:**
- Produces: inline `not-allowed` cursor whenever `disabled || loading`.

- [x] Add failing tests for disabled and loading cursor overrides.
- [x] Run the Button test and confirm RED.
- [x] Apply cursor precedence without discarding consumer styles.
- [x] Run the Button test and confirm GREEN.

### Task 4: Verification

**Files:**
- Verify the complete package and showroom.

- [x] Run `pnpm verify` and require exit code `0`.
- [x] Run `pnpm build:demo` and require exit code `0`.
- [x] Confirm the running showroom returns HTTP `200`.
