# DeveloperKit component library design

## Summary

Convert the existing Next.js starter into a single-package, public React component library named `developerkit`. Keep the current Next.js application as a local playground, but publish only the compiled library artifacts. The first release establishes complete package infrastructure and ships one intentionally minimal `Button` component.

## Goals

- Publish `developerkit` as a public npm package.
- Support React 18 and 19, including Next.js consumers.
- Produce ESM, CommonJS, TypeScript declarations, and standalone CSS.
- Keep the current Next.js app as an unpublished component playground.
- Establish testing, accessibility, linting, type checking, build, and package verification.
- Provide a small token foundation that can grow with future components.

## Non-goals

- Additional components.
- Button variants, sizes, loading states, or icon APIs.
- Storybook, a documentation site, a monorepo, automated releases, or Changesets.
- A Tailwind CSS requirement for package consumers.

## Architecture

The repository remains one npm package with two roles:

```text
app/                    Next.js playground; excluded from npm
src/
  button/
    Button.tsx          Public Button implementation
    Button.test.tsx     Behavior and accessibility tests
  index.ts              Public JavaScript and type exports
  styles.css            Public tokens and component styles
dist/                   Generated package output
```

`tsdown` builds `src/index.ts` into ESM and CommonJS outputs and emits declarations. The build also makes the library CSS available as `developerkit/styles.css`. React and ReactDOM remain external peer dependencies so the package never bundles a second React runtime.

The playground imports the library source during development for fast feedback. npm package metadata includes only `dist`, `README.md`, and `LICENSE`.

## Public package API

Consumer usage:

```tsx
import { Button } from "developerkit";
import "developerkit/styles.css";

export function SaveAction() {
  return <Button>Save</Button>;
}
```

`Button` extends the native HTML button props. It forwards its ref, preserves consumer `className`, defaults `type` to `button`, and passes all other native attributes through unchanged.

The first version has no library-specific props. Future variants and sizes require separate design work and cannot change the native-prop contract unnecessarily.

## Styling and tokens

The package ships plain CSS and does not require Tailwind CSS or a runtime styling library. Public classes use the `hk-` prefix. Public custom properties use the `--dk-` prefix.

The initial semantic token set covers only the first component's needs:

- Button background, foreground, hover, focus, and disabled colors.
- Inline and block spacing.
- Border radius.
- Font family, size, weight, and line height.
- Focus-ring width and offset.
- Fast motion duration and easing.

Consumers can override tokens on `:root` or a scoped container. Defaults must meet WCAG AA contrast for normal text.

The enabled Button uses `cursor: pointer`. A disabled Button is not clickable and uses `cursor: not-allowed`. Every future interactive component must explicitly define an appropriate pointer cursor for enabled clickable states.

## Accessibility

The Button uses native `<button>` semantics instead of recreating button behavior with ARIA. It preserves accessible naming through its children or native `aria-*` attributes. Keyboard activation, disabled semantics, and focus behavior remain native.

The stylesheet provides a visible `:focus-visible` ring and does not remove outlines without an equivalent replacement. Disabled state is communicated through the native `disabled` attribute and a visual state that does not rely only on opacity.

Automated accessibility checks use `jest-axe`. ESLint retains JSX accessibility rules. Automated checks complement, but do not replace, keyboard and visual review in the playground.

## Testing and verification

Vitest runs component tests in a DOM environment with React Testing Library and `@testing-library/jest-dom`. Tests verify:

- Rendering with an accessible role and name.
- Native attribute forwarding.
- `type="button"` default and explicit type override.
- Consumer `className` preservation.
- Ref forwarding.
- Native disabled state.
- No detectable `jest-axe` violations in the supported states.

Required project checks:

- `pnpm lint`
- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `pnpm pack --dry-run`

The dry-run package inspection must contain compiled ESM, CommonJS, declarations, CSS, README, and license, while excluding `app`, tests, source files, and local build caches.

## Packaging and release

The package uses the public npm name `developerkit`, semantic version `0.1.0`, and a public publish configuration. Package exports expose:

- `developerkit` for JavaScript and TypeScript.
- `developerkit/styles.css` for stylesheet import.

`react` and `react-dom` declare peer ranges compatible with versions 18 and 19. The initial release is manual with `pnpm publish`; CI release automation is deferred.

The README documents installation, stylesheet import, Button usage, token overrides, development commands, and package verification. The package uses the permissive MIT license and includes a `LICENSE` file before publication.

## Error handling and boundaries

The minimal Button has no asynchronous work or runtime error channel. Invalid native combinations remain browser and TypeScript concerns. The library does not silently transform consumer props beyond adding its base class and defaulting `type` to `button`.

Build and package failures stop publication. No publish command is part of routine verification, preventing accidental external releases.

## Success criteria

- The playground renders the packaged Button design.
- All lint, test, accessibility, type, and build checks pass.
- Package dry-run contains only intended public artifacts.
- A separate React 18 or 19 consumer can import `Button` and `styles.css` without Tailwind CSS.
- Enabled Button visibly uses a pointer cursor; disabled Button is visibly and semantically disabled.
