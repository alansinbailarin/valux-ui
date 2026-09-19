# DeveloperKit Complete Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Button with four variants, three semantic colors, loading, icon slots, icon-only mode, full width, tests, and showroom controls.

**Architecture:** Strict shared props extend both polymorphic branches. Semantic color CSS sets internal variables, variant CSS consumes them, and a content-state stylesheet owns loading/icons/width; Button remains focused on semantic composition.

**Tech Stack:** React 18/19, TypeScript, CSS custom properties, Vitest, React Testing Library, jest-axe, Next.js

## Global Constraints

- Add no runtime dependency.
- Preserve the existing `<button>` and `as="a"` type/ref contracts.
- Keep production files below 120 effective lines.
- Preserve focus-visible, reduced-motion, disabled, cursor, and pointer motion behavior.
- Keep every icon wrapper decorative; require an accessible name from consumer content or `aria-label`.
- Verify all twelve appearance combinations.

---

### Task 1: Appearance API and styles

**Files:**
- Modify: `src/button/Button.types.ts`
- Modify: `src/button/Button.tsx`
- Create: `src/button/Button.appearance.test.tsx`
- Create: `src/styles/button-colors.css`
- Create: `src/styles/button-variants.css`
- Modify: `src/styles/button.css`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/modes.css`
- Modify: `src/styles.css`
- Modify: `src/styles.test.ts`

**Interfaces:**
- Produces: `ButtonVariant`, `ButtonColor`, `variant`, and `color`.

- [ ] Write matrix tests for defaults and all 12 `variant`/`color` pairs, plus stylesheet contracts.
- [ ] Run focused tests and confirm RED for missing data attributes and styles.
- [ ] Add the strict unions and data attributes.
- [ ] Add danger tokens, semantic Button variables, and four variant recipes.
- [ ] Re-run focused tests and confirm GREEN.

### Task 2: Content and loading API

**Files:**
- Modify: `src/button/Button.types.ts`
- Modify: `src/button/Button.tsx`
- Create: `src/button/Button.content.tsx`
- Create: `src/button/Button.content.test.tsx`
- Create: `src/styles/button-content.css`
- Modify: `src/styles.css`

**Interfaces:**
- Produces: `loading`, `startIcon`, `endIcon`, `iconOnly`, `fullWidth`, and `ButtonContent`.

- [ ] Write failing tests for loading Button/anchor semantics, decorative icon slots, icon-only label, full width, and axe.
- [ ] Run focused tests and confirm RED.
- [ ] Add focused content composition and loading spinner markup.
- [ ] Make loading participate in disabled interaction and add content-state CSS.
- [ ] Re-run focused tests and confirm GREEN.

### Task 3: Public package contract

**Files:**
- Modify: `src/button/index.ts`
- Modify: `src/index.test.ts`
- Modify: `scripts/verify-package.mjs`
- Modify: `src/structure.test.ts`
- Modify: `README.md`

**Interfaces:**
- Produces public `ButtonVariant`, `ButtonColor`, and documented examples.

- [ ] Add public type assertions and package declaration checks.
- [ ] Document appearances and content states.
- [ ] Run public contract tests and confirm GREEN.

### Task 4: Showroom matrix

**Files:**
- Create: `app/_components/showroom/ShowroomIcon.tsx`
- Modify: `app/_components/showroom/showroom.types.ts`
- Modify: `app/_components/showroom/showroom.constants.ts`
- Modify: `app/_components/showroom/ShowroomControls.tsx`
- Modify: `app/_components/showroom/ButtonShowroom.tsx`
- Modify: `app/_components/showroom/ButtonShowroom.test.tsx`

**Interfaces:**
- Produces controls for variant, color, loading state, icons, content mode, and width.

- [ ] Write failing tests that operate every new control and inspect preview semantics.
- [ ] Run the showroom test and confirm RED.
- [ ] Add typed options, the decorative preview icon, and conditional content props.
- [ ] Re-run showroom and axe tests and confirm GREEN.

### Task 5: Verification

**Files:**
- Verify: package, demo, and local server

**Interfaces:**
- Produces publishable artifacts with no test files.

- [ ] Run `pnpm verify` and require exit code `0`.
- [ ] Run `pnpm build:demo` and require exit code `0`.
- [ ] Confirm `http://127.0.0.1:3000` returns `200` and includes the new controls.
