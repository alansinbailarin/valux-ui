# DeveloperKit code organization design

## Goal

Keep every project file focused, readable, and easy to extend without changing
DeveloperKit's public API or runtime behavior.

## Scope

The rule applies to library source, demo code, tests, styles, scripts, and
project documentation. Existing duplicate starter files are removed.

## Organization rules

- Keep types beside their owning domain in `*.types.ts` files.
- Keep React component files focused on rendering and component behavior.
- Use one local barrel per public domain and one root barrel for package exports.
- Keep production TypeScript and TSX files at or below 120 lines.
- Keep test files at or below 180 lines.
- Split files earlier when they contain multiple responsibilities, regardless of
  line count.
- Prefer descriptive modules over generic shared utility or global type folders.
- Avoid barrel imports inside a domain when a direct import prevents cycles.

ESLint enforces the TypeScript and TSX line limits. CSS and documentation use
the same responsibility rule through their directory structure and review.

## Target structure

```text
src/
├── button/
│   ├── Button.tsx
│   ├── Button.types.ts
│   ├── Button.test.tsx
│   └── index.ts
├── theme/
│   ├── DeveloperKitProvider.tsx
│   ├── DeveloperKitProvider.types.ts
│   ├── DeveloperKitProvider.test.tsx
│   ├── color/
│   │   ├── color.types.ts
│   │   ├── parseColor.ts
│   │   ├── contrast.ts
│   │   ├── surfaceTint.ts
│   │   ├── color.test.ts
│   │   └── index.ts
│   └── index.ts
├── styles/
│   ├── tokens.css
│   ├── modes.css
│   ├── variants.css
│   └── button.css
├── styles.css
└── index.ts
```

The demo extracts theme example data and preview rendering from `app/page.tsx`
when doing so creates clearer responsibilities.

## CSS packaging

`src/styles.css` remains the single documented consumer entry point. It imports
the focused CSS modules in stable cascade order. The package build copies the
entry point and its complete `styles/` dependency tree into `dist`, preserving
relative imports.

## Public API

The root `src/index.ts` continues exporting `Button`, `DeveloperKitProvider`, and
their existing public types. Local barrels define each domain's public surface.
Internal color parsing and contrast helpers remain private to the theme domain.

## Tests and verification

Existing behavior tests remain the safety net for this structural refactor.
Additional package tests verify that public exports resolve through the new
barrels and all referenced CSS modules ship in the npm tarball.

Completion requires lint, type checking, all tests, library build, publint,
package dry-run, Next.js production build, and an HTTP 200 response from the
demo.

## Repository hygiene

Remove unused `app/page 2.tsx` and `README 2.md`. Add `CONTRIBUTING.md` with the
organization rules so future components follow the same structure.

## iCloud follow-up

The project currently lives under `~/Desktop`, which may be synchronized by
iCloud Desktop and Documents. Handle this after the refactor as a separate
filesystem decision. Prefer moving the project to a non-synchronized developer
directory over disabling Desktop synchronization globally.
