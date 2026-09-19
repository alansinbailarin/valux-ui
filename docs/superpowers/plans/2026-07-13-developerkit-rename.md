# DeveloperKit Rename and Relocation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the unpublished component library completely to DeveloperKit, verify its new public contract, and move it from iCloud Desktop to `/Users/agpsalgado/Developer/developerkit`.

**Architecture:** Apply the rename from contracts inward: tests first, then provider/types and CSS prefixes, then package metadata and documentation. Verify the complete package before moving the directory. Relocate only after all local checks pass, using dependency removal/reinstallation solely as an approved fallback.

**Tech Stack:** TypeScript, React 19, Next.js 16, CSS, Vitest, ESLint, tsdown, pnpm, macOS APFS/iCloud Desktop.

## Global Constraints

- Product: `DeveloperKit`; npm package: `developerkit`.
- Provider: `DeveloperKitProvider`; public theme types use `DeveloperKit*`.
- CSS properties use `--dk-`, classes use `.dk-`, attributes use `data-dk-`.
- Do not preserve compatibility aliases because the package is unpublished.
- Preserve component behavior, accessibility, SSR, visual output, and package formats.
- Production source stays at or below 120 effective lines; tests stay at or below 180.
- Use `apply_patch` for source edits and file renames; mechanical documentation replacement may use a bulk rewrite.
- Do not initialize Git.
- Stop servers before moving the project.

---

### Task 1: Express the DeveloperKit contract in tests

**Files:**
- Modify: `src/index.test.ts`
- Modify: `src/structure.test.ts`
- Modify: `src/theme/DeveloperKitProvider.test.tsx`
- Modify: `src/styles.test.ts`

**Interfaces:**
- Produces the desired `DeveloperKitProvider`, `DeveloperKit*` type, `--dk-*`, `.dk-button`, and `data-dk-*` contracts.

- [ ] **Step 1: Change public API test imports**

Replace provider and type imports with these names:

```ts
import { Button, DeveloperKitProvider } from "./index";
import type {
  ButtonProps,
  DeveloperKitColorTheme,
  DeveloperKitDensity,
  DeveloperKitMode,
  DeveloperKitProviderProps,
  DeveloperKitRadius,
  DeveloperKitTheme,
} from "./index";
```

- [ ] **Step 2: Change structure expectations**

Require `src/theme/DeveloperKitProvider.tsx`, `.types.ts`, and `.test.tsx`.
Forbid the three legacy provider paths. Keep all other structure assertions.

- [ ] **Step 3: Change provider and CSS expectations**

Update provider tests to import from `./index`, render `DeveloperKitProvider`,
and assert `data-dk-provider`, `data-dk-mode`, `data-dk-radius`,
`data-dk-density`, and `--dk-*` styles. Update CSS tests to require `.dk-button`,
`--dk-*`, and `data-dk-*` selectors.

- [ ] **Step 4: Verify RED**

Run: `pnpm test src/index.test.ts src/structure.test.ts src/theme/DeveloperKitProvider.test.tsx src/styles.test.ts`

Expected: FAIL because DeveloperKit exports, files, and prefixes do not exist.

Run: `pnpm typecheck`

Expected: FAIL on missing DeveloperKit exports.

---

### Task 2: Rename provider API and CSS prefixes

**Files:**
- Create: `src/theme/DeveloperKitProvider.tsx`
- Create: `src/theme/DeveloperKitProvider.types.ts`
- Create: `src/theme/DeveloperKitProvider.test.tsx`
- Delete: `src/theme/DeveloperKitProvider.tsx`
- Delete: `src/theme/DeveloperKitProvider.types.ts`
- Delete: `src/theme/DeveloperKitProvider.test.tsx`
- Modify: `src/theme/index.ts`
- Modify: `src/index.ts`
- Modify: `src/button/Button.tsx`
- Modify: `src/styles/*.css`
- Modify: `src/theme/color/contrast.ts`
- Modify: `src/theme/color/surfaceTint.ts`

**Interfaces:**
- Produces `DeveloperKitProvider` and all seven DeveloperKit theme types.
- Preserves `Button` and `ButtonProps`.

- [ ] **Step 1: Rename provider files and symbols**

Move existing implementation/types/tests with `apply_patch`. Rename every
provider/type symbol. Keep the implementation algorithm unchanged.

- [ ] **Step 2: Rename internal CSS/data contract**

Change `hk-button` to `dk-button`, every `--dk-` to `--dk-`, and every
`data-dk-` to `data-dk-` across source CSS and provider output. Update error
prefixes to `[DeveloperKitProvider]`.

- [ ] **Step 3: Update barrels and demo imports**

Export only new DeveloperKit names from `src/theme/index.ts`; keep root barrel
domain-only. Update `app/layout.tsx`, `app/_components/ThemePreview.tsx`, and
`app/_data/theme-examples.types.ts` to the new provider/type names.

- [ ] **Step 4: Verify GREEN for behavior**

Run: `pnpm test src/index.test.ts src/structure.test.ts src/theme/DeveloperKitProvider.test.tsx src/styles.test.ts src/button/Button.test.tsx src/theme/color/color.test.ts`

Expected: 22 tests pass.

Run: `pnpm typecheck && pnpm lint`

Expected: both exit 0.

---

### Task 3: Rename package, documentation, and project records

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Modify: `CONTRIBUTING.md`
- Modify: `scripts/verify-package.mjs`
- Modify: `app/page.tsx`
- Rename and modify: all `docs/superpowers/**/*developerkit*` files
- Modify: `.superpowers/sdd/*.md`
- Delete generated: `tsconfig.tsbuildinfo`

**Interfaces:**
- Produces npm package metadata for `developerkit@0.1.0` and DeveloperKit-only docs.

- [ ] **Step 1: Rename package metadata and contract verifier**

Set `package.json.name` to `developerkit`, update description text, and change
the verifier's public runtime/type names. Update README install/import examples
to `developerkit` and all visible app metadata/copy to DeveloperKit.

- [ ] **Step 2: Rename architecture documents**

Rename every plan/spec path containing the legacy product slug to the same path
using `developerkit`. Update project-owned documentation and SDD records to the
new name. After the mechanical pass, rewrite migration prose that became
ambiguous so it refers to “the legacy name” without retaining that spelling.

- [ ] **Step 3: Remove stale generated metadata**

Delete `tsconfig.tsbuildinfo`; typecheck will regenerate it using current paths.
Generated `dist` and `.next` are replaced by subsequent builds.

- [ ] **Step 4: Scan naming contract**

Run: `rg -ni 'developerkit|--dk-|\.dk-|data-dk-' -g '!node_modules/**' -g '!.next/**' -g '!dist/**' .`

Expected: no matches.

Run: `find . -path './node_modules' -prune -o -path './.next' -prune -o -iname '*developerkit*' -print`

Expected: no paths.

---

### Task 4: Verify DeveloperKit before relocation

**Files:**
- Generated: `dist/**`, `.next/**`, `tsconfig.tsbuildinfo`

**Interfaces:**
- Validates the complete DeveloperKit npm and demo contract at the original path.

- [ ] **Step 1: Recheck npm availability**

Run: `npm view developerkit name version`

Expected: registry 404 immediately before local finalization. If it exists,
stop and report the naming collision rather than publishing or moving.

- [ ] **Step 2: Run package verification**

Run: `pnpm verify`

Expected: lint, typecheck, 22 tests, ESM/CJS/types/CSS build, package contract,
publint, and dry-run all pass. Dry-run names `developerkit-0.1.0.tgz`.

- [ ] **Step 3: Run demo production build and smoke check**

Run: `pnpm build:demo`, with approved network access if Google Fonts is blocked.
Start production server on an available port, curl `/`, require HTTP 200, then
stop it and confirm the port closes.

---

### Task 5: Move project outside iCloud Desktop

**Files:**
- Move: `/Users/agpsalgado/Desktop/my-app`
- Destination: `/Users/agpsalgado/Developer/developerkit`

**Interfaces:**
- Produces the final non-iCloud workspace path.

- [ ] **Step 1: Confirm destination safety**

Verify `/Users/agpsalgado/Developer/developerkit` does not exist. Stop all local
Next.js processes for this project.

- [ ] **Step 2: Attempt direct same-volume move**

Create `/Users/agpsalgado/Developer`, then move the entire project directory to
`/Users/agpsalgado/Developer/developerkit` using approved elevated filesystem
access. Do not copy or leave a second source tree.

- [ ] **Step 3: Use dependency fallback only on move failure**

If and only if the direct move fails because of `node_modules` or iCloud file
weight, delete `/Users/agpsalgado/Desktop/my-app/node_modules`, retry the move,
then run `pnpm install` from the destination. The user explicitly approved this
fallback.

- [ ] **Step 4: Verify relocation**

Assert old path absent and destination present. Run `pnpm verify` and
`pnpm build:demo` from `/Users/agpsalgado/Developer/developerkit`. Start the
production server, require HTTP 200, and stop it.

- [ ] **Step 5: Hand off new workspace**

Tell the user to reopen `/Users/agpsalgado/Developer/developerkit` in the IDE.
Report whether `node_modules` was preserved or reinstalled. Do not change global
iCloud Desktop settings.
