# DeveloperKit Button Visual Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the default Button a restrained technical identity with a static upper-edge highlight, calculated border, and minimal shadow.

**Architecture:** Add three provider-scoped derived CSS tokens so the effect recalculates for custom primary colors and modes. Consume those tokens in the existing Button stylesheet and neutralize the depth for disabled buttons. No React API or runtime code changes.

**Tech Stack:** CSS custom properties, CSS `color-mix()`, Vitest, TypeScript, pnpm

## Global Constraints

- Add no React props, variants, runtime logic, or dependencies.
- Preserve existing background, text color, radius, density, typography, hover, focus-visible, and reduced-motion behavior.
- Use `inset 0 1px 0` for the upper highlight and `0 1px 2px` for the exterior shadow.
- Derive highlight from primary plus 24% white, border from primary plus 18% black, and shadow from on-surface plus 82% transparency.
- Disabled buttons have no shadow and use the disabled background as their border color.
- The repository has no `.git` directory, so commit steps are omitted.

---

### Task 1: Add tested Button depth tokens and styles

**Files:**
- Modify: `src/styles.test.ts`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/button.css`

**Interfaces:**
- Consumes: `--dk-color-primary`, `--dk-color-on-surface`, and `--dk-color-disabled` semantic tokens.
- Produces: internal `--dk-button-highlight`, `--dk-button-border`, and `--dk-button-shadow` CSS tokens consumed by `.dk-button`.

- [ ] **Step 1: Write the failing stylesheet contract test**

Add this test inside the existing `describe("public stylesheet", ...)` block in `src/styles.test.ts`:

```ts
it("gives Button scoped upper-edge depth and flattens disabled state", async () => {
  const [tokens, button] = await Promise.all([
    readFile(resolve("src/styles/tokens.css"), "utf8"),
    readFile(resolve("src/styles/button.css"), "utf8"),
  ]);

  expect(tokens).toContain(
    "--dk-button-highlight: color-mix(\n    in srgb,\n    var(--dk-color-primary),\n    white 24%\n  );",
  );
  expect(tokens).toContain(
    "--dk-button-border: color-mix(\n    in srgb,\n    var(--dk-color-primary),\n    black 18%\n  );",
  );
  expect(tokens).toContain(
    "--dk-button-shadow: color-mix(\n    in srgb,\n    var(--dk-color-on-surface),\n    transparent 82%\n  );",
  );
  expect(button).toMatch(
    /\.dk-button\s*\{[^}]*border:\s*1px solid var\(--dk-button-border\);/,
  );
  expect(button).toMatch(
    /\.dk-button\s*\{[^}]*box-shadow:\s*inset 0 1px 0 var\(--dk-button-highlight\),\s*0 1px 2px var\(--dk-button-shadow\);/,
  );
  expect(button).toMatch(
    /\.dk-button:disabled\s*\{[^}]*border-color:\s*var\(--dk-color-disabled\);[^}]*box-shadow:\s*none;/,
  );
});
```

- [ ] **Step 2: Run the focused test to verify RED**

Run: `pnpm vitest run src/styles.test.ts`

Expected: FAIL because the three `--dk-button-*` tokens and Button depth declarations do not exist.

- [ ] **Step 3: Add provider-scoped derived depth tokens**

Append these declarations inside the existing `:root, [data-dk-provider]` block in `src/styles/tokens.css`, after `--dk-color-on-disabled`:

```css
  --dk-button-highlight: color-mix(
    in srgb,
    var(--dk-color-primary),
    white 24%
  );
  --dk-button-border: color-mix(
    in srgb,
    var(--dk-color-primary),
    black 18%
  );
  --dk-button-shadow: color-mix(
    in srgb,
    var(--dk-color-on-surface),
    transparent 82%
  );
```

- [ ] **Step 4: Apply depth and disabled flattening**

In `src/styles/button.css`, replace `border: 0;` in `.dk-button` with:

```css
  border: 1px solid var(--dk-button-border);
```

Add this immediately after the existing `line-height` declaration:

```css
  box-shadow:
    inset 0 1px 0 var(--dk-button-highlight),
    0 1px 2px var(--dk-button-shadow);
```

Add these declarations to `.dk-button:disabled` after its color:

```css
  border-color: var(--dk-color-disabled);
  box-shadow: none;
```

- [ ] **Step 5: Run the focused test to verify GREEN**

Run: `pnpm vitest run src/styles.test.ts`

Expected: all stylesheet tests PASS.

---

### Task 2: Verify package and showroom

**Files:**
- Verify only; no source changes expected.

**Interfaces:**
- Consumes: the completed Button CSS and existing verification scripts.
- Produces: a validated npm package and showroom build.

- [ ] **Step 1: Run the complete package verification**

Run: `pnpm verify`

Expected: lint, typecheck, all tests, package build, contract, publint, and pack checks exit 0.

- [ ] **Step 2: Build the showroom**

Run: `pnpm build:demo`

Expected: Next.js production build exits 0 and prerenders `/`.

- [ ] **Step 3: Confirm the running showroom**

Run: `curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' http://localhost:3000`

Expected: `200`. If the existing server is no longer running, start it with `pnpm dev`, wait for the ready message, and repeat the exact curl command.
