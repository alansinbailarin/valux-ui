# DeveloperKit Code Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the entire project into focused domain modules with colocated type files, local barrels, enforceable size limits, and no public API changes.

**Architecture:** Each library domain owns its component, types, tests, and local barrel. Theme color work is divided into parsing, contrast, and tint modules. CSS keeps one public entry point backed by focused files that are all copied into the npm package. Demo data and rendering are separated from its page shell.

**Tech Stack:** TypeScript, React 18/19, Next.js 16, CSS custom properties, ESLint 9, Vitest 4, tsdown, pnpm.

## Global Constraints

- Apply the organization rule to library code, demo, tests, CSS, scripts, and documentation.
- Keep production TypeScript and TSX files at or below 120 nonblank, noncomment lines.
- Keep test files at or below 180 nonblank, noncomment lines.
- Split earlier when a file has multiple responsibilities.
- Keep types beside their owning domain in `*.types.ts` files.
- Preserve all existing runtime behavior and public package exports.
- Keep `developerkit/styles.css` as the only documented CSS entry point.
- Do not initialize Git or create commits without user authorization.

---

### Task 1: Add structural enforcement

**Files:**
- Create: `src/structure.test.ts`
- Modify: `eslint.config.mjs`

**Interfaces:**
- Produces: automated file-presence and line-limit rules used by later tasks.

- [ ] **Step 1: Write the failing structure test**

Create a Vitest test that asserts these files exist:

```ts
const expectedFiles = [
  "src/button/Button.types.ts",
  "src/button/index.ts",
  "src/theme/DeveloperKitProvider.types.ts",
  "src/theme/color/parseColor.ts",
  "src/theme/color/contrast.ts",
  "src/theme/color/surfaceTint.ts",
  "src/theme/color/index.ts",
  "src/theme/index.ts",
  "src/styles/tokens.css",
  "src/styles/modes.css",
  "src/styles/variants.css",
  "src/styles/button.css",
];
```

Also assert `app/page 2.tsx` and `README 2.md` do not exist.

- [ ] **Step 2: Verify RED**

Run: `pnpm test src/structure.test.ts`

Expected: FAIL because the target modules do not exist and duplicate files remain.

- [ ] **Step 3: Configure ESLint limits**

Add a production override with:

```js
"max-lines": ["error", { max: 120, skipBlankLines: true, skipComments: true }]
```

Add a later `**/*.test.{ts,tsx}` override using `max: 180`.

- [ ] **Step 4: Verify the rule detects current debt**

Run: `pnpm lint`

Expected: FAIL on at least `src/theme/color.ts` before it is split.

---

### Task 2: Separate public types and barrels

**Files:**
- Create: `src/button/Button.types.ts`
- Create: `src/button/index.ts`
- Create: `src/theme/DeveloperKitProvider.types.ts`
- Create: `src/theme/index.ts`
- Modify: `src/button/Button.tsx`
- Modify: `src/theme/DeveloperKitProvider.tsx`
- Modify: `src/index.ts`
- Modify tests: `src/button/Button.test.tsx`, `src/theme/DeveloperKitProvider.test.tsx`

**Interfaces:**
- Produces: `ButtonProps`, `DeveloperKitMode`, `DeveloperKitRadius`, `DeveloperKitDensity`, `DeveloperKitColorTheme`, `DeveloperKitTheme`, and `DeveloperKitProviderProps` from colocated type modules.
- Preserves: all exports already available from package root.

- [ ] **Step 1: Point tests at desired local barrels**

Import `Button` and `ButtonProps` from `./index`; import provider and its public
types from `./index`. Add type-only assignments proving the types resolve.

- [ ] **Step 2: Verify RED**

Run: `pnpm typecheck`

Expected: FAIL because local barrel files do not exist.

- [ ] **Step 3: Create type modules and barrels**

Move `ButtonProps` to `Button.types.ts`. Move every theme interface and union to
`DeveloperKitProvider.types.ts`. Keep the internal `ThemeStyle` type there but do
not export it from the domain barrel.

Use direct imports from type modules inside component implementations. Export
components and public types from each local `index.ts`. Make `src/index.ts`
re-export only from `./button` and `./theme`.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm test src/button/Button.test.tsx src/theme/DeveloperKitProvider.test.tsx && pnpm typecheck`

Expected: all selected tests pass and TypeScript exits 0.

---

### Task 3: Split color responsibilities

**Files:**
- Create: `src/theme/color/color.types.ts`
- Create: `src/theme/color/parseColor.ts`
- Create: `src/theme/color/contrast.ts`
- Create: `src/theme/color/surfaceTint.ts`
- Create: `src/theme/color/index.ts`
- Move: `src/theme/color.test.ts` to `src/theme/color/color.test.ts`
- Delete: `src/theme/color.ts`
- Modify: `src/theme/DeveloperKitProvider.tsx`

**Interfaces:**
- `parseColor(color: string): Rgb | null`
- `resolveOnPrimary(primary: string, onPrimary?: string): string`
- `resolveSurfaceTint(surfaceTint?: number): { surface: string; raised: string } | undefined`

- [ ] **Step 1: Update test imports to desired color barrel**

Move the existing tests and change their import to `./index`.

- [ ] **Step 2: Verify RED**

Run: `pnpm test src/theme/color/color.test.ts`

Expected: FAIL because `src/theme/color/index.ts` does not exist.

- [ ] **Step 3: Extract modules without changing algorithms**

Put `Rgb` in `color.types.ts`; hex and RGB parsing in `parseColor.ts`; luminance,
contrast, and foreground resolution in `contrast.ts`; tint clamping and percent
formatting in `surfaceTint.ts`. Export only the two provider-facing resolvers
from the local barrel.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm test src/theme/color/color.test.ts src/theme/DeveloperKitProvider.test.tsx && pnpm typecheck`

Expected: all selected tests pass and TypeScript exits 0.

---

### Task 4: Split CSS while preserving one consumer entry

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/modes.css`
- Create: `src/styles/variants.css`
- Create: `src/styles/button.css`
- Modify: `src/styles.css`
- Modify: `src/styles.test.ts`
- Modify: `scripts/copy-styles.mjs`

**Interfaces:**
- Produces: `dist/styles.css` plus `dist/styles/*.css` with working relative imports.

- [ ] **Step 1: Change stylesheet test to require focused imports**

Assert `src/styles.css` contains, in order:

```css
@import "./styles/tokens.css";
@import "./styles/modes.css";
@import "./styles/variants.css";
@import "./styles/button.css";
```

Read and concatenate those modules before running existing token and Button CSS
assertions.

- [ ] **Step 2: Verify RED**

Run: `pnpm test src/styles.test.ts`

Expected: FAIL because the public stylesheet has not been split.

- [ ] **Step 3: Move CSS by responsibility**

Move defaults and derived semantic tokens to `tokens.css`; light/dark selectors
and media query to `modes.css`; radius and density selectors to `variants.css`;
Button states and reduced motion to `button.css`. Leave only ordered imports in
`src/styles.css`.

- [ ] **Step 4: Copy the CSS dependency tree**

Update the build script to create `dist/styles`, copy `src/styles.css` to
`dist/styles.css`, and recursively copy `src/styles` to `dist/styles` using
`node:fs/promises` `mkdir`, `copyFile`, and `cp`.

- [ ] **Step 5: Verify GREEN and package content**

Run: `pnpm test src/styles.test.ts && pnpm build && pnpm pack --dry-run`

Expected: tests pass and tarball lists the entry stylesheet plus all four CSS modules.

---

### Task 5: Separate demo responsibilities and remove duplicates

**Files:**
- Create: `app/_components/ThemePreview.tsx`
- Create: `app/_data/theme-examples.ts`
- Create: `app/_data/theme-examples.types.ts`
- Modify: `app/page.tsx`
- Delete: `app/page 2.tsx`
- Delete: `README 2.md`

**Interfaces:**
- Produces: `ThemeExample` and `themeExamples` for the demo; `ThemePreview` renders one example.

- [ ] **Step 1: Extract demo data and preview rendering**

Move the example type to `theme-examples.types.ts`, constants to
`theme-examples.ts`, and provider panel JSX to `ThemePreview.tsx`. Keep
`app/page.tsx` responsible only for page composition and mapping examples.

- [ ] **Step 2: Remove approved duplicate starter files**

Delete `app/page 2.tsx` and `README 2.md` with `apply_patch`.

- [ ] **Step 3: Verify structure and app types**

Run: `pnpm test src/structure.test.ts && pnpm typecheck && pnpm lint`

Expected: structure test, TypeScript, and ESLint all pass.

---

### Task 6: Document the permanent convention

**Files:**
- Create: `CONTRIBUTING.md`
- Modify: `README.md`

**Interfaces:**
- Produces: contributor-facing rules for all future code.

- [ ] **Step 1: Write concise contribution rules**

Document domain colocation, `*.types.ts`, local/root barrels, direct internal
imports, 120/180 line limits, CSS responsibility splits, tests, and required
`pnpm verify` before release.

- [ ] **Step 2: Link the guide from README**

Add a Development section link to `CONTRIBUTING.md`.

- [ ] **Step 3: Run final verification**

Run: `pnpm verify`

Expected: lint, typecheck,  tests, package build, publint, and pack dry-run exit 0.

Run: `pnpm build:demo`

Expected: Next.js production build exits 0. If Google Fonts are blocked by the
sandbox network, rerun the same command with approved network access.

Run: `curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' http://localhost:3000`

Expected: `200`.

---

### Task 7: Resolve iCloud synchronization safely

**Files:**
- No project files unless the user chooses a new path.

**Interfaces:**
- Produces: an explicit user decision between moving only this project and disabling macOS Desktop synchronization globally.

- [ ] **Step 1: Inspect whether Desktop is iCloud-managed**

Use read-only filesystem and macOS preference checks. Do not change system
preferences or move the workspace yet.

- [ ] **Step 2: Present safe options**

Recommend moving the project to `~/Developer/my-app`, which excludes only this
project from Desktop synchronization. Explain that disabling Desktop and
Documents synchronization affects every file in those folders.

- [ ] **Step 3: Execute only the selected option with approval**

Moving outside the current writable workspace or changing macOS preferences
requires explicit approval immediately before the command. After a move, verify
the project exists at the new path and tell the user to reopen that folder in
the IDE.
