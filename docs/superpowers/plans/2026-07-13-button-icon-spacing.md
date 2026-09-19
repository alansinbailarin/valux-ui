# Button Icon Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Button icons more density-aware breathing room without affecting loading spacing.

**Architecture:** A dedicated internal CSS custom property separates icon/text rhythm from general control spacing. Existing density selectors own the scale and Button content consumes the token.

**Tech Stack:** CSS custom properties, Vitest

## Global Constraints

- Add no public prop or runtime dependency.
- Preserve loading spacing.
- Preserve all four density modes.

---

### Task 1: Icon gap token

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/variants.css`
- Modify: `src/styles/button.css`
- Modify: `src/styles.test.ts`
- Modify: `src/button-content.styles.test.ts`

**Interfaces:**
- Produces: internal `--dk-button-icon-gap` with xs/sm/md/lg values.

- [x] Add failing tests for the token scale and Button content usage.
- [x] Run focused tests and confirm RED.
- [x] Add the token and apply it only to Button content.
- [x] Run focused tests and confirm GREEN.

### Task 2: Verification

**Files:**
- Verify: package and showroom.

- [x] Run `pnpm verify` and require exit code `0`.
- [x] Run `pnpm build:demo` and require exit code `0`.
- [x] Confirm the showroom returns HTTP `200`.
