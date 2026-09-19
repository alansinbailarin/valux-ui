# DeveloperKit Theme Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an SSR-safe `DeveloperKitProvider` that configures semantic color tokens, surface tint, radius, density, and font family for every DeveloperKit component.

**Architecture:** A server-compatible wrapper writes scoped CSS variables and data attributes. Pure color utilities calculate readable foregrounds and normalized tint percentages. CSS owns mode resolution and semantic token derivation, while components consume only shared tokens.

**Tech Stack:** React 18/19, TypeScript 5, plain CSS custom properties, CSS `color-mix(in oklab, ...)`, Vitest, React Testing Library, jest-axe, tsdown, Next.js 16 playground.

## Global constraints

- Keep `Button` usable without a provider.
- Provider must not use `"use client"`, React context, effects, or browser globals.
- Public modes: `system`, `light`, `dark`.
- Public radius values: `none`, `sm`, `md`, `lg`, `full`.
- Public density values: `xs`, `sm`, `md`, `lg`.
- `surfaceTint` accepts 0-100 and maps to a 0-20% primary mix.
- Primary action color remains full strength while only surfaces change with tint.
- Auto contrast supports opaque `#rgb`, `#rrggbb`, integer RGB, and percentage RGB.
- Unsupported primary syntax requires explicit `onPrimary`.
- Font family is consumer-provided CSS and applies only to DeveloperKit components.
- Providers are nestable; omitted values inherit.
- No new runtime dependency.
- Preserve pointer, reduced-motion, and axe accessibility checks.
- This workspace has no Git repository, so commit steps are unavailable.

---

## File map

- Create `src/theme/color.ts`: color parsing, luminance, contrast, and tint normalization.
- Create `src/theme/color.test.ts`: pure color utility contract.
- Create `src/theme/DeveloperKitProvider.tsx`: public SSR-safe provider and theme types.
- Create `src/theme/DeveloperKitProvider.test.tsx`: provider DOM, error, nesting, and SSR tests.
- Modify `src/styles.css`: semantic defaults, explicit modes, scales, and Button mappings.
- Modify `src/styles.test.ts`: stylesheet contract.
- Modify `src/index.ts`: public provider and type exports.
- Modify `app/layout.tsx`: root font provider.
- Modify `app/page.tsx`: default, red-tinted, radius, density, light, and dark previews.
- Modify `README.md`: provider API, scale tables, nesting, and color limitations.

---

### Task 1: Implement color and tint utilities with TDD

**Files:**
- Create: `src/theme/color.test.ts`
- Create: `src/theme/color.ts`

**Interfaces:**
- Produces: `resolveOnPrimary(primary, onPrimary?)` and `resolveSurfaceTint(surfaceTint?)` for the provider.

- [ ] **Step 1: Write failing color utility tests**

Create `src/theme/color.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { resolveOnPrimary, resolveSurfaceTint } from "./color";

describe("resolveOnPrimary", () => {
  it("chooses the higher-contrast foreground for hex colors", () => {
    expect(resolveOnPrimary("#fef08a")).toBe("#18181b");
    expect(resolveOnPrimary("#18181b")).toBe("#ffffff");
    expect(resolveOnPrimary("#f00")).toBe("#18181b");
  });

  it("supports integer and percentage rgb colors", () => {
    expect(resolveOnPrimary("rgb(254, 240, 138)")).toBe("#18181b");
    expect(resolveOnPrimary("rgb(9% 9% 11%)")).toBe("#ffffff");
  });

  it("preserves an explicit foreground for any CSS color", () => {
    expect(resolveOnPrimary("var(--brand)", "var(--brand-text)")).toBe(
      "var(--brand-text)",
    );
  });

  it("rejects unsupported colors without an explicit foreground", () => {
    expect(() => resolveOnPrimary("var(--brand)")).toThrow(
      /set color\.onPrimary/i,
    );
  });
});

describe("resolveSurfaceTint", () => {
  it("maps the public 0-100 range to 0-20 percent", () => {
    expect(resolveSurfaceTint(0)).toEqual({ surface: "0%", raised: "0%" });
    expect(resolveSurfaceTint(50)).toEqual({ surface: "10%", raised: "6%" });
    expect(resolveSurfaceTint(100)).toEqual({ surface: "20%", raised: "12%" });
  });

  it("clamps out-of-range values", () => {
    expect(resolveSurfaceTint(-1)?.surface).toBe("0%");
    expect(resolveSurfaceTint(120)?.surface).toBe("20%");
  });

  it("returns undefined when omitted and rejects non-finite values", () => {
    expect(resolveSurfaceTint()).toBeUndefined();
    expect(() => resolveSurfaceTint(Number.NaN)).toThrow(/finite number/i);
    expect(() => resolveSurfaceTint(Number.POSITIVE_INFINITY)).toThrow(
      /finite number/i,
    );
  });
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
pnpm test src/theme/color.test.ts
```

Expected: FAIL because `src/theme/color.ts` does not exist.

- [ ] **Step 3: Implement color parsing and contrast**

Create `src/theme/color.ts` with these exact behaviors:

```ts
type Rgb = readonly [red: number, green: number, blue: number];

const DARK_FOREGROUND = "#18181b";
const LIGHT_FOREGROUND = "#ffffff";

function parseHex(color: string): Rgb | null {
  const short = /^#([\da-f])([\da-f])([\da-f])$/i.exec(color);
  if (short) {
    return short.slice(1).map((channel) => Number.parseInt(channel + channel, 16)) as unknown as Rgb;
  }

  const full = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color);
  if (!full) return null;

  return full.slice(1).map((channel) => Number.parseInt(channel, 16)) as unknown as Rgb;
}

function parseRgb(color: string): Rgb | null {
  const integers = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(color);
  if (integers) {
    const channels = integers.slice(1).map(Number);
    return channels.every((channel) => channel >= 0 && channel <= 255)
      ? (channels as unknown as Rgb)
      : null;
  }

  const percentages = /^rgb\(\s*(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*\)$/i.exec(color);
  if (!percentages) return null;

  const values = percentages.slice(1).map(Number);
  if (!values.every((channel) => channel >= 0 && channel <= 100)) return null;

  return values.map((channel) => (channel / 100) * 255) as unknown as Rgb;
}

function parseColor(color: string): Rgb | null {
  const normalized = color.trim();
  return parseHex(normalized) ?? parseRgb(normalized);
}

function linearize(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance([red, green, blue]: Rgb): number {
  return (
    0.2126 * linearize(red) +
    0.7152 * linearize(green) +
    0.0722 * linearize(blue)
  );
}

function contrastRatio(first: Rgb, second: Rgb): number {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

export function resolveOnPrimary(
  primary: string,
  onPrimary?: string,
): string {
  if (onPrimary) return onPrimary;

  const parsedPrimary = parseColor(primary);
  if (!parsedPrimary) {
    throw new Error(
      `[DeveloperKitProvider] Cannot calculate text contrast for primary "${primary}". Set color.onPrimary explicitly.`,
    );
  }

  const dark = parseColor(DARK_FOREGROUND)!;
  const light = parseColor(LIGHT_FOREGROUND)!;

  return contrastRatio(parsedPrimary, dark) >= contrastRatio(parsedPrimary, light)
    ? DARK_FOREGROUND
    : LIGHT_FOREGROUND;
}

function formatPercent(value: number): string {
  return `${Number(value.toFixed(3))}%`;
}

export function resolveSurfaceTint(surfaceTint?: number):
  | { surface: string; raised: string }
  | undefined {
  if (surfaceTint === undefined) return undefined;
  if (!Number.isFinite(surfaceTint)) {
    throw new Error("[DeveloperKitProvider] color.surfaceTint must be a finite number.");
  }

  const clamped = Math.min(100, Math.max(0, surfaceTint));
  const effective = clamped * 0.2;

  return {
    surface: formatPercent(effective),
    raised: formatPercent(effective * 0.6),
  };
}
```

- [ ] **Step 4: Verify GREEN**

Run `pnpm test src/theme/color.test.ts`.

Expected: 7 tests pass.

---

### Task 2: Implement the SSR-safe provider with TDD

**Files:**
- Create: `src/theme/DeveloperKitProvider.test.tsx`
- Create: `src/theme/DeveloperKitProvider.tsx`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `resolveOnPrimary` and `resolveSurfaceTint`.
- Produces: `DeveloperKitProvider`, `DeveloperKitProviderProps`, `DeveloperKitTheme`, and theme union types.

- [ ] **Step 1: Write failing provider tests**

Create `src/theme/DeveloperKitProvider.test.tsx` with tests that assert:

```tsx
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DeveloperKitProvider } from "./DeveloperKitProvider";

describe("DeveloperKitProvider", () => {
  it("maps a complete theme to scoped attributes and variables", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DeveloperKitProvider
        ref={ref}
        data-testid="provider"
        className="consumer"
        theme={{
          mode: "dark",
          color: { primary: "#ef4444", surfaceTint: 50 },
          radius: "lg",
          density: "sm",
          fontFamily: "var(--font-geist)",
        }}
      >
        Content
      </DeveloperKitProvider>,
    );

    const provider = screen.getByTestId("provider");
    expect(provider).toHaveAttribute("data-dk-provider", "");
    expect(provider).toHaveAttribute("data-dk-mode", "dark");
    expect(provider).toHaveAttribute("data-dk-radius", "lg");
    expect(provider).toHaveAttribute("data-dk-density", "sm");
    expect(provider).toHaveClass("consumer");
    expect(provider).toHaveTextContent("Content");
    expect(provider.style.getPropertyValue("--dk-color-primary")).toBe("#ef4444");
    expect(provider.style.getPropertyValue("--dk-color-on-primary")).toBe("#18181b");
    expect(provider.style.getPropertyValue("--dk-surface-tint")).toBe("10%");
    expect(provider.style.getPropertyValue("--dk-surface-tint-raised")).toBe("6%");
    expect(provider.style.getPropertyValue("--dk-font-family")).toBe("var(--font-geist)");
    expect(ref.current).toBe(provider);
  });

  it("lets consumer style intentionally override generated variables", () => {
    render(
      <DeveloperKitProvider
        data-testid="provider"
        theme={{ color: { primary: "#ef4444" } }}
        style={{ "--dk-color-primary": "#2563eb" } as React.CSSProperties}
      />,
    );
    expect(screen.getByTestId("provider").style.getPropertyValue("--dk-color-primary")).toBe("#2563eb");
  });

  it("omits unspecified values so nested providers inherit", () => {
    render(
      <DeveloperKitProvider theme={{ color: { primary: "#ef4444" } }}>
        <DeveloperKitProvider data-testid="nested" theme={{ radius: "full" }} />
      </DeveloperKitProvider>,
    );
    const nested = screen.getByTestId("nested");
    expect(nested.style.getPropertyValue("--dk-color-primary")).toBe("");
    expect(nested).not.toHaveAttribute("data-dk-mode");
    expect(nested).toHaveAttribute("data-dk-radius", "full");
  });

  it("accepts CSS variables when onPrimary is explicit", () => {
    render(
      <DeveloperKitProvider
        data-testid="provider"
        theme={{ color: { primary: "var(--brand)", onPrimary: "var(--brand-text)" } }}
      />,
    );
    expect(screen.getByTestId("provider").style.getPropertyValue("--dk-color-on-primary")).toBe("var(--brand-text)");
  });

  it("rejects unsupported primary colors without onPrimary", () => {
    expect(() => render(<DeveloperKitProvider theme={{ color: { primary: "var(--brand)" } }} />)).toThrow(/set color\.onPrimary/i);
  });

  it("renders on the server without browser APIs", () => {
    const html = renderToString(
      <DeveloperKitProvider theme={{ mode: "system", density: "lg" }}>
        Server content
      </DeveloperKitProvider>,
    );
    expect(html).toContain("data-dk-mode=\"system\"");
    expect(html).toContain("Server content");
  });
});
```

- [ ] **Step 2: Verify RED**

Run `pnpm test src/theme/DeveloperKitProvider.test.tsx`.

Expected: FAIL because the provider module does not exist.

- [ ] **Step 3: Implement provider and public types**

Create `src/theme/DeveloperKitProvider.tsx`:

```tsx
import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes } from "react";

import { resolveOnPrimary, resolveSurfaceTint } from "./color";

export type DeveloperKitMode = "system" | "light" | "dark";
export type DeveloperKitRadius = "none" | "sm" | "md" | "lg" | "full";
export type DeveloperKitDensity = "xs" | "sm" | "md" | "lg";

export interface DeveloperKitColorTheme {
  primary?: string;
  onPrimary?: string;
  surfaceTint?: number;
}

export interface DeveloperKitTheme {
  mode?: DeveloperKitMode;
  color?: DeveloperKitColorTheme;
  radius?: DeveloperKitRadius;
  density?: DeveloperKitDensity;
  fontFamily?: string;
}

export interface DeveloperKitProviderProps extends HTMLAttributes<HTMLDivElement> {
  theme?: DeveloperKitTheme;
}

type ThemeStyle = CSSProperties & Record<`--dk-${string}`, string | number | undefined>;

export const DeveloperKitProvider = forwardRef<HTMLDivElement, DeveloperKitProviderProps>(
  function DeveloperKitProvider(
    { children, className, style, theme, ...props },
    ref,
  ) {
    const color = theme?.color;
    const tint = resolveSurfaceTint(color?.surfaceTint);
    const themeStyle: ThemeStyle = {};

    if (color?.primary) {
      themeStyle["--dk-color-primary"] = color.primary;
      themeStyle["--dk-color-on-primary"] = resolveOnPrimary(
        color.primary,
        color.onPrimary,
      );
    } else if (color?.onPrimary) {
      themeStyle["--dk-color-on-primary"] = color.onPrimary;
    }

    if (tint) {
      themeStyle["--dk-surface-tint"] = tint.surface;
      themeStyle["--dk-surface-tint-raised"] = tint.raised;
    }

    if (theme?.fontFamily) {
      themeStyle["--dk-font-family"] = theme.fontFamily;
    }

    return (
      <div
        {...props}
        ref={ref}
        data-dk-provider=""
        data-dk-mode={theme?.mode}
        data-dk-radius={theme?.radius}
        data-dk-density={theme?.density}
        className={className}
        style={{ ...themeStyle, ...style }}
      >
        {children}
      </div>
    );
  },
);
```

Update `src/index.ts`:

```ts
export { Button } from "./button/Button";
export type { ButtonProps } from "./button/Button";
export { DeveloperKitProvider } from "./theme/DeveloperKitProvider";
export type {
  DeveloperKitColorTheme,
  DeveloperKitDensity,
  DeveloperKitMode,
  DeveloperKitProviderProps,
  DeveloperKitRadius,
  DeveloperKitTheme,
} from "./theme/DeveloperKitProvider";
```

- [ ] **Step 4: Verify GREEN and types**

Run:

```bash
pnpm test src/theme/DeveloperKitProvider.test.tsx
pnpm typecheck
```

Expected: 6 provider tests pass and TypeScript exits 0.

---

### Task 3: Replace Button-specific CSS with semantic token scales

**Files:**
- Modify: `src/styles.test.ts`
- Modify: `src/styles.css`
- Test: `src/button/Button.test.tsx`

**Interfaces:**
- Consumes: provider data attributes and variables.
- Produces: root defaults and semantic tokens for every component.

- [ ] **Step 1: Extend stylesheet contract tests before CSS changes**

Replace the current single stylesheet assertion with tests for:

```ts
expect(css).toContain("--dk-color-primary:");
expect(css).toContain("--dk-color-on-primary:");
expect(css).toContain("--dk-color-surface:");
expect(css).toContain("--dk-color-surface-raised:");
expect(css).toContain("--dk-color-on-surface:");
expect(css).toContain("--dk-color-border:");
expect(css).toContain("--dk-radius-component:");
expect(css).toContain("--dk-control-height:");
expect(css).toContain("--dk-control-padding-inline:");
expect(css).toContain("--dk-control-gap:");
expect(css).toContain("--dk-font-family:");
expect(css).toContain("color-mix(in oklab");
expect(css).toContain('[data-dk-mode="light"]');
expect(css).toContain('[data-dk-mode="dark"]');
expect(css).toContain('[data-dk-mode="system"]');
expect(css).toContain('[data-dk-radius="full"]');
expect(css).toContain('[data-dk-density="xs"]');
expect(css).toContain('[data-dk-density="lg"]');
expect(css).toMatch(/\.dk-button\s*\{[\s\S]*?background:\s*var\(--dk-color-primary\)/);
expect(css).toMatch(/\.dk-button\s*\{[\s\S]*?min-height:\s*var\(--dk-control-height\)/);
expect(css).toMatch(/\.dk-button\s*\{[\s\S]*?cursor:\s*pointer;/);
expect(css).toContain("@media (prefers-reduced-motion: reduce)");
```

- [ ] **Step 2: Verify RED**

Run `pnpm test src/styles.test.ts`.

Expected: FAIL because the semantic token layer and data selectors are missing.

- [ ] **Step 3: Implement CSS semantic layer**

Rewrite `src/styles.css` with:

1. Light defaults on `:root`, `[data-dk-mode="light"]`, and `[data-dk-mode="system"]`.
2. Dark defaults on `[data-dk-mode="dark"]` and inside the system dark-media query.
3. Derived values on `:root, [data-dk-provider]` so nested primary overrides recompute surfaces.
4. Radius selectors using exact values `0`, `.25rem`, `.5rem`, `.75rem`, `9999px`.
5. Density selectors using exact height, padding, and gap values from the design spec.
6. Button mapped to semantic tokens.

Core derived block:

```css
:root,
[data-dk-provider] {
  --dk-color-surface: color-mix(
    in oklab,
    var(--dk-color-surface-base),
    var(--dk-color-primary) var(--dk-surface-tint)
  );
  --dk-color-surface-raised: color-mix(
    in oklab,
    var(--dk-color-surface-raised-base),
    var(--dk-color-primary) var(--dk-surface-tint-raised)
  );
  --dk-color-border: color-mix(
    in oklab,
    var(--dk-color-surface),
    var(--dk-color-on-surface) 18%
  );
  --dk-color-primary-hover: color-mix(
    in oklab,
    var(--dk-color-primary),
    var(--dk-color-on-surface) 12%
  );
  --dk-color-disabled-surface: color-mix(
    in oklab,
    var(--dk-color-surface-raised),
    var(--dk-color-on-surface) 12%
  );
  --dk-color-disabled-foreground: color-mix(
    in oklab,
    var(--dk-color-on-surface),
    transparent 35%
  );
}
```

Button block:

```css
.dk-button {
  display: inline-flex;
  min-height: var(--dk-control-height);
  align-items: center;
  justify-content: center;
  gap: var(--dk-control-gap);
  border: 0;
  border-radius: var(--dk-radius-component);
  padding: 0 var(--dk-control-padding-inline);
  background: var(--dk-color-primary);
  color: var(--dk-color-on-primary);
  cursor: pointer;
  font-family: var(--dk-font-family);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
}
```

Keep hover, focus-visible, disabled, transitions, pointer behavior, and reduced-motion behavior using semantic tokens.

- [ ] **Step 4: Verify CSS, Button, and accessibility GREEN**

Run `pnpm test src/styles.test.ts src/button/Button.test.tsx`.

Expected: stylesheet contract and all 3 Button tests pass with zero axe violations.

---

### Task 4: Update playground and README

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: public provider API and semantic CSS tokens.
- Produces: working examples for consumers and visual review.

- [ ] **Step 1: Wrap the playground in the root font provider**

Import `DeveloperKitProvider` in `app/layout.tsx` and wrap `children` inside the body:

```tsx
<DeveloperKitProvider
  className="flex min-h-full flex-1 flex-col"
  theme={{ fontFamily: "var(--font-geist-sans)" }}
>
  {children}
</DeveloperKitProvider>
```

- [ ] **Step 2: Show default and nested themes**

Update `app/page.tsx` to render server-side theme samples. Each sample wraps a panel in `DeveloperKitProvider`, uses `var(--dk-color-surface)`, `var(--dk-color-on-surface)`, and `var(--dk-color-border)` for the preview surface, and displays an enabled and disabled Button.

Required examples:

- Default system theme.
- Red theme with `primary: "#ef4444"`, `surfaceTint: 50`, `radius: "lg"`, `density: "lg"`.
- Explicit light theme with `radius: "none"`, `density: "xs"`.
- Explicit dark theme with `radius: "full"`, `density: "sm"`.

- [ ] **Step 3: Document provider setup and scales**

Add README sections after basic Button usage:

- `## Configure a theme` with the approved provider example.
- `### Color and surface tint` explaining full-strength primary, 0-100 safe tint, auto contrast formats, and explicit `onPrimary` for CSS variables and advanced formats.
- `### Radius` table for none/sm/md/lg/full.
- `### Density` table for xs/sm/md/lg.
- `### Font family` with `next/font` variable example.
- `### Nest themes` showing a red nested provider inheriting parent density and font.
- `### Server compatibility` stating that the provider has no client directive, context, effects, or browser globals.

Update the direct-token example to use semantic `--dk-color-primary`, `--dk-color-on-primary`, `--dk-radius-component`, and `--dk-font-family` names.

- [ ] **Step 4: Verify playground build**

Run `pnpm build:demo`.

Expected: Next.js compiles, type-checks, and statically prerenders `/`.

---

### Task 5: Run complete release verification

**Files:**
- Generated: `dist/index.js`, `dist/index.cjs`, declarations, and `dist/styles.css`.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: verified publishable package artifacts.

- [ ] **Step 1: Run full package verification**

Run `pnpm verify`.

Expected:

- ESLint exits 0.
- TypeScript exits 0.
- All Vitest suites pass.
- tsdown emits ESM, CJS, and both declaration formats.
- publint reports `All good!`.
- Package dry-run includes provider code through the main entry plus `dist/styles.css`, README, LICENSE, and package metadata.

- [ ] **Step 2: Verify public type declarations**

Run:

```bash
rg -n "DeveloperKitProvider|DeveloperKitTheme|DeveloperKitRadius|DeveloperKitDensity" dist/index.d.ts dist/index.d.cts
```

Expected: all four public API names appear in both declaration files.

- [ ] **Step 3: Verify local HTTP response**

Run `pnpm dev`, request `http://localhost:3000`, and expect HTTP 200 with no server compilation errors.
