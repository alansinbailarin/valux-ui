# Button Loading Text and Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional loading text, larger density-aware icons, Heroicons showroom examples, and complete regression coverage.

**Architecture:** Button forwards a new ReactNode prop into a focused content composer. The composer overlays normal and loading layers in an inline grid to preserve intrinsic width, while CSS owns scalable icon dimensions; Heroicons remain isolated to the demo.

**Tech Stack:** React 19, TypeScript, CSS custom properties, Vitest, Testing Library, jest-axe, Heroicons React 2.2

## Global Constraints

- Add no runtime dependency to the published package.
- Preserve button/anchor overloads and refs.
- Preserve icon-only square geometry.
- Keep production files below the configured line limit.
- Maintain reduced-motion and accessibility behavior.

---

### Task 1: Optional loading content

**Files:**
- Modify: `src/button/Button.types.ts`
- Modify: `src/button/Button.tsx`
- Modify: `src/button/ButtonContent.types.ts`
- Modify: `src/button/ButtonContent.tsx`
- Modify: `src/button/Button.content.test.tsx`

**Interfaces:**
- Produces: `loadingText?: ReactNode` and layered Button content.

- [x] Add failing tests for custom text, omitted text, icon-only suppression, and accessible naming.
- [x] Run the focused test and confirm RED.
- [x] Forward `loadingText` and render mutually appropriate loading content.
- [x] Run the focused test and confirm GREEN.

### Task 2: Loading layout and icon sizing

**Files:**
- Modify: `src/styles/button-content.css`
- Modify: `src/button-content.styles.test.ts`

**Interfaces:**
- Produces: `.dk-button__body`, `.dk-button__loading`, 1.25em slot icons, and 1.375em icon-only SVGs.

- [x] Add failing CSS contract assertions for layered layout and sizes.
- [x] Run the stylesheet test and confirm RED.
- [x] Implement inline-grid overlay, loading row, and scalable dimensions.
- [x] Run the stylesheet test and confirm GREEN.

### Task 3: Heroicons showroom and editable loading text

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `app/_components/showroom/ShowroomIcon.tsx`
- Create: `app/_components/showroom/LoadingTextControl.tsx`
- Modify: `app/_components/showroom/showroom.types.ts`
- Modify: `app/_components/showroom/ShowroomControls.tsx`
- Modify: `app/_components/showroom/ButtonPreview.tsx`
- Modify: `app/_components/showroom/ButtonShowroom.tsx`
- Modify: `app/_components/showroom/ButtonShowroom.test.tsx`

**Interfaces:**
- Consumes: `Button.loadingText`.
- Produces: optional showroom text input and individual Heroicons examples.

- [x] Add failing showroom tests for edited/cleared loading text and Heroicons markup.
- [x] Run the showroom test and confirm RED.
- [x] Install `@heroicons/react` as a dev dependency and implement the controls/examples.
- [x] Run showroom and accessibility tests and confirm GREEN.

### Task 4: Public contract and verification

**Files:**
- Modify: `README.md`
- Verify: declarations, package, demo, and local server.

- [x] Document spinner-only and custom-text usage.
- [x] Run `pnpm verify` and require exit code `0`.
- [x] Run `pnpm build:demo` and require exit code `0`.
- [x] Confirm the showroom returns HTTP `200`.
