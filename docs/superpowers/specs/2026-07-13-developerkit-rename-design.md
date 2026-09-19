# DeveloperKit rename and relocation design

## Goal

Rename the unpublished DeveloperKit project completely to DeveloperKit and move it
out of iCloud-managed Desktop without losing work or weakening verification.

## Naming contract

- Product and documentation name: `DeveloperKit`
- npm package name: `developerkit`
- destination directory: `/Users/agpsalgado/Developer/developerkit`
- React provider: `DeveloperKitProvider`
- public types: `DeveloperKitMode`, `DeveloperKitRadius`,
  `DeveloperKitDensity`, `DeveloperKitColorTheme`, `DeveloperKitTheme`, and
  `DeveloperKitProviderProps`
- CSS custom property prefix: `--dk-`
- component class prefix: `.dk-`
- provider attribute prefix: `data-dk-`

The library is unpublished, so the rename is intentionally clean. It will not
ship deprecated DeveloperKit aliases or duplicate `--dk-*` tokens.

## File organization

Rename provider source, type, and test files to `DeveloperKitProvider.*`.
Update local barrels, the package root barrel, demo modules, tests, scripts,
README, contributor guide, package metadata, and architecture documents.
Rename current DeveloperKit design/plan filenames to DeveloperKit equivalents and
update internal links or references.

The clean project state must contain no case-insensitive `developerkit` text or
path names outside generated dependency metadata that belongs to third-party
packages. Generated `dist` and `.next` output is rebuilt after the rename.

## Behavior and compatibility

Color parsing, contrast, tint, theme inheritance, SSR behavior, Button DOM
semantics, visual output, accessibility behavior, and package formats remain
unchanged. Only public naming and CSS/data prefixes change.

Tests must first express the desired DeveloperKit API and prefixes, fail against
the current source, and then pass after implementation. Package-contract checks
must require the new public values and types.

## Relocation

Complete and verify the rename at the current path first. Stop local Next.js
processes before moving. Create `/Users/agpsalgado/Developer` and move the whole
project directory to `/Users/agpsalgado/Developer/developerkit`.

Because source and destination are on the same local filesystem, try the direct
directory move first. If iCloud or dependency volume makes that fail, delete
only `node_modules`, move the remaining project, and run `pnpm install` at the
destination. Never disable Desktop and Documents synchronization globally.

After moving, verify the old directory is absent, the new directory exists, and
run package verification plus the Next.js production build from the new path.
The user must reopen `/Users/agpsalgado/Developer/developerkit` in the IDE.

## Completion checks

- `rg -i developerkit` finds no project-owned source, configuration, or docs.
- No project-owned path contains `developerkit` or `my-app` as its project name.
- ESLint, TypeScript, all tests, library build, package contract, publint, and
  package dry-run pass as `developerkit`.
- The npm tarball is named `developerkit-0.1.0.tgz` in dry-run output.
- The Next.js production demo builds and serves HTTP 200.
- The project resides outside iCloud Desktop at the approved destination.
