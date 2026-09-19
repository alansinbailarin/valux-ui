# Contributing to DeveloperKit

Keep changes focused, testable, and easy to navigate. Follow these conventions for every contribution.

## Organize code by domain

- Organize files by feature or domain so each directory owns one responsibility.
- Place a domain's public types beside their owner in a `*.types.ts` file.
- Keep component TSX focused on rendering and behavior. Do not declare public interfaces in component files.
- Give each public domain one local barrel. Use the root barrel only to define the package API.
- Use direct imports inside a domain when barrel imports could create cycles.

## Keep files focused

- Keep production `.ts`, `.tsx`, `.mts`, and `.mjs` files at or below 120 effective lines.
- Keep test files at or below 180 effective lines.
- Count nonblank, non-comment lines as effective lines.
- Split a file before it reaches the limit when its responsibilities differ.

## Structure styles by responsibility

Split CSS into focused files for tokens, modes, variants, and components. Preserve one stylesheet entry for consumers.

## Test changes

Use TDD for behavior and structure changes:

1. Write or update a test and confirm RED.
2. Make the smallest focused change and confirm GREEN.
3. Refactor while the tests stay green.

Every enabled clickable control must use a pointer cursor. Cover behavior, accessibility, and public contracts with tests where applicable.

## Verify your work

Run the full verification suite before a release:

```bash
pnpm verify
```

Run the playground production build whenever you change the playground:

```bash
pnpm build:demo
```
