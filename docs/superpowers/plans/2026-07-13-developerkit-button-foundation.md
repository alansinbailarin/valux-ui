# DeveloperKit Button Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Complete the typed polymorphic Button foundation and expose its interaction states in the showroom.

**Architecture:** Discriminated Button/anchor prop unions provide strict public types. A focused interaction hook owns pointer motion while Button branches preserve native element semantics; CSS owns focus and enabled/disabled transitions.

**Tech Stack:** React 18/19, TypeScript, CSS, Web Animations API, Vitest, React Testing Library, jest-axe, Next.js

## Global Constraints

- Do not add runtime dependencies.
- Keep production files focused and below 120 effective lines.
- Preserve native event handlers, refs, data attributes, and ARIA attributes.
- Do not add visual variants, semantic colors, loading, icons, icon-only, or full-width APIs in this phase.
- Keep cursor `pointer` by default and allow `cursor` to override it.
- Use an internal `:focus-visible` treatment without an external ring or outline.
- Honor reduced motion.

---

### Task 1: Public polymorphic contract

**Files:**
- Modify: `src/button/Button.types.ts`
- Modify: `src/button/Button.test.tsx`
- Modify: `src/button/index.ts`
- Modify: `src/index.test.ts`
- Modify: `scripts/verify-package.mjs`

**Interfaces:**
- Produces: `ButtonAsButtonProps`, `ButtonAsAnchorProps`, `ButtonProps`, and overloaded `ButtonComponent` refs.

- [x] Write failing compile/runtime tests for anchor props/ref, button props/ref, disabled anchor semantics, click suppression, cursor override, and SSR.
- [x] Run `pnpm vitest run src/button/Button.test.tsx src/index.test.ts` and confirm failures are caused by missing polymorphism.
- [x] Add discriminated native prop unions and export their names.
- [x] Implement separate native Button and anchor render branches with a shared content wrapper.
- [x] Re-run focused tests and confirm they pass.

### Task 2: Professional interaction and focus

**Files:**
- Modify: `src/button/Button.motion.ts`
- Create: `src/button/useButtonInteraction.ts`
- Modify: `src/button/Button.tsx`
- Modify: `src/styles/button.css`
- Modify: `src/button/Button.test.tsx`
- Modify: `src/styles.test.ts`

**Interfaces:**
- Produces: `useButtonInteraction(elementRef, disabled, handlers)` and CSS contracts for state/focus transitions.

- [x] Update tests first with exact press, release, cancellation, disabled-change, focus-visible, and reduced-motion expectations.
- [x] Run focused tests and confirm the new expectations fail.
- [x] Move pointer orchestration into the hook and update motion keyframes with restrained travel and damping.
- [x] Add bidirectional disabled transitions and internal focus treatment without outline.
- [x] Re-run focused tests and confirm they pass.

### Task 3: Showroom controls

**Files:**
- Modify: `app/_components/showroom/showroom.types.ts`
- Modify: `app/_components/showroom/showroom.constants.ts`
- Modify: `app/_components/showroom/ShowroomControls.tsx`
- Modify: `app/_components/showroom/ButtonShowroom.tsx`
- Modify: `app/_components/showroom/ButtonShowroom.test.tsx`

**Interfaces:**
- Produces: element, enabled state, and cursor controls wired to the preview.

- [x] Write failing showroom tests that switch Button/Link, Enabled/Disabled, and Pointer/Default/Grab.
- [x] Run the focused showroom test and confirm it fails for missing controls.
- [x] Add typed options and render the correct polymorphic preview.
- [x] Re-run showroom and axe tests and confirm they pass.

### Task 4: Verification

**Files:**
- Modify: `README.md`
- Verify: package and showroom

**Interfaces:**
- Produces: documented public API and verified publish artifacts.

- [x] Document anchor, disabled-anchor, cursor, focus, and motion behavior.
- [x] Run `pnpm verify` and require exit code `0`.
- [x] Run `pnpm build:demo` and require exit code `0`.
- [x] Confirm `http://127.0.0.1:3000` returns `200`.
