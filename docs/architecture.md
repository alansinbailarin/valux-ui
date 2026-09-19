# Architecture & repository structure

For contributors (and coding agents). Consumer docs live in
`docs/components/` and `docs/getting-started.md`.

## Layout

```
src/
  <component>/       One folder per public component (button, menu, dialog,
                     sheet, popover, tooltip, toast). COLOCATION RULE:
                     everything that changes together lives together —
                     implementation, *.types.ts, *.test.tsx, hooks, and an
                     index.ts barrel that defines the public surface.
  theme/             ValuxProvider + theme tokens/types.
  morph/             The shared motion engine (planMorph, keyframes,
                     scrub/close gestures). Components consume it; it never
                     imports from components.
  a11y/              Cross-cutting behavior: portals, focus trap, scroll
                     lock, dismiss layering, gesture utilities. Same rule:
                     no imports from components.
  styles/            ALL CSS, deliberately NOT colocated (see below).
  styles.css         The only stylesheet entry: ordered @imports.
  contracts/         Package-level guard tests: public exports, stylesheet
                     import order, required-file structure.
  index.ts           Public entry: re-exports each component barrel.
docs/                Markdown sources; scripts/build-llms.mjs compiles them
                     to llms.txt / llms-full.txt.
app/                 Next.js showroom (not shipped): one route per
                     component + color-demo, sharing ShowroomShell.
```

## Why these choices

- **Tests colocated with source.** A component's folder is its whole
  blast radius: touch `dialog/`, run `vitest src/dialog`. Nothing to hunt
  for in a parallel `tests/` tree that drifts out of sync.
- **Types colocated as `*.types.ts`.** Public prop types are part of the
  component, not a global `types/` bucket; the barrel decides what leaves
  the folder.
- **CSS centralized in `src/styles/`, not per-component.** Two reasons:
  (1) the published artifact is ONE plain stylesheet
  (`@valux/ui/styles.css`) built by copying, not by a CSS-in-JS build;
  (2) cascade order is a real API here — tokens → modes → components —
  and `src/styles.css`'s import list is the single place that order is
  defined (and `contracts/stylesheet.test.ts` locks it).
- **`morph/` and `a11y/` are dependencies of components, never the
  reverse.** That keeps the motion engine and behavior primitives
  reusable by every new component (the roadmap builds on them).
- **`contracts/` holds what has no single owner.** Export-surface,
  file-structure, and stylesheet-order tests are package-wide contracts;
  they'd be homeless in any one component folder.

## Rules of thumb when adding a component

1. New folder `src/<name>/` with `index.ts` barrel; re-export it from
   `src/index.ts`.
2. CSS goes in `src/styles/<name>.css`, imported from `src/styles.css` in
   cascade order (and the stylesheet contract test updated).
3. Docs page in `docs/components/<name>.md`, added to
   `scripts/build-llms.mjs` SOURCES; showroom route in `app/<name>/`.
4. Files stay under the lint line limit — split hooks/parts into their own
   modules rather than growing one file.
5. Reuse `morph/` + `a11y/` primitives; if a new primitive is needed, it
   goes there, not inside the component.
