# DeveloperKit Button Showroom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static examples with a basic interactive showroom that applies theme controls to one DeveloperKit button.

**Architecture:** A small client orchestrator owns showroom state and constructs a `DeveloperKitTheme`. A reusable option-group component renders accessible segmented controls, while constants and types stay in focused sibling files. The existing provider scopes all selected values to the live preview.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vitest, Testing Library, jest-axe

## Global Constraints

- Controls are limited to mode, primary color, tint strength, radius, density, and two fonts (`sans`, `mono`).
- The preview contains only the existing `Button` component.
- Production files stay at or below 120 effective lines; test files stay at or below 180 effective lines.
- Public interfaces remain in `*.types.ts` files.
- Every clickable control uses a pointer cursor.
- No new runtime dependency is added.
- The repository has no `.git` directory, so commit steps are intentionally omitted.

---

### Task 1: Add the tested interactive showroom

**Files:**
- Create: `app/_components/showroom/showroom.types.ts`
- Create: `app/_components/showroom/showroom.constants.ts`
- Create: `app/_components/showroom/OptionGroup.tsx`
- Create: `app/_components/showroom/NativeThemeControls.tsx`
- Create: `app/_components/showroom/ShowroomControls.tsx`
- Create: `app/_components/showroom/ButtonShowroom.tsx`
- Create: `app/_components/showroom/ButtonShowroom.test.tsx`
- Modify: `vitest.config.ts`

**Interfaces:**
- Consumes: `DeveloperKitTheme`, `DeveloperKitMode`, `DeveloperKitRadius`, `DeveloperKitDensity`, `DeveloperKitProvider`, and `Button` from `@/src`.
- Produces: `ButtonShowroom(): JSX.Element`, `OptionGroup<T>()`, `ShowroomControls(props)`, and internal `ShowroomFont = "sans" | "mono"`.

- [ ] **Step 1: Include showroom tests in Vitest**

Change `vitest.config.ts` to:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "app/**/*.test.{ts,tsx}"],
    clearMocks: true,
    restoreMocks: true,
  },
});
```

- [ ] **Step 2: Write the failing interaction and accessibility tests**

Create `app/_components/showroom/ButtonShowroom.test.tsx`:

```tsx
import { fireEvent, render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { ButtonShowroom } from "./ButtonShowroom";

describe("ButtonShowroom", () => {
  it("applies controls to the button preview", () => {
    render(<ButtonShowroom />);
    const preview = screen.getByTestId("button-preview");

    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    fireEvent.change(screen.getByLabelText("Color primario"), {
      target: { value: "#ef4444" },
    });
    fireEvent.change(screen.getByLabelText("Intensidad"), {
      target: { value: "50" },
    });
    fireEvent.click(
      within(screen.getByRole("group", { name: "Redondeado" })).getByRole(
        "button",
        { name: "Full" },
      ),
    );
    fireEvent.click(
      within(screen.getByRole("group", { name: "Densidad" })).getByRole(
        "button",
        { name: "Lg" },
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Mono" }));

    expect(preview).toHaveAttribute("data-dk-mode", "dark");
    expect(preview).toHaveAttribute("data-dk-radius", "full");
    expect(preview).toHaveAttribute("data-dk-density", "lg");
    expect(preview.style.getPropertyValue("--dk-color-primary")).toBe(
      "#ef4444",
    );
    expect(preview.style.getPropertyValue("--dk-surface-tint")).toBe("10%");
    expect(preview.style.getPropertyValue("--dk-font-family")).toBe(
      "var(--font-geist-mono)",
    );
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<ButtonShowroom />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
```

- [ ] **Step 3: Run the test to verify RED**

Run: `pnpm test -- app/_components/showroom/ButtonShowroom.test.tsx`

Expected: FAIL because `./ButtonShowroom` does not exist.

- [ ] **Step 4: Define focused internal types and constants**

Create `app/_components/showroom/showroom.types.ts`:

```ts
import type {
  DeveloperKitDensity,
  DeveloperKitMode,
  DeveloperKitRadius,
} from "@/src";

export type ShowroomFont = "sans" | "mono";

export interface ShowroomControlsProps {
  mode: DeveloperKitMode;
  primary?: string;
  tint: number;
  radius: DeveloperKitRadius;
  density: DeveloperKitDensity;
  font: ShowroomFont;
  onModeChange: (value: DeveloperKitMode) => void;
  onPrimaryChange: (value: string) => void;
  onTintChange: (value: number) => void;
  onRadiusChange: (value: DeveloperKitRadius) => void;
  onDensityChange: (value: DeveloperKitDensity) => void;
  onFontChange: (value: ShowroomFont) => void;
}

export interface NativeThemeControlsProps {
  primary?: string;
  tint: number;
  onPrimaryChange: (value: string) => void;
  onTintChange: (value: number) => void;
}

export interface Option<T extends string> {
  label: string;
  value: T;
}

export interface OptionGroupProps<T extends string> {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}
```

Create `app/_components/showroom/showroom.constants.ts`:

```ts
import type {
  DeveloperKitDensity,
  DeveloperKitMode,
  DeveloperKitRadius,
} from "@/src";

import type { Option, ShowroomFont } from "./showroom.types";

export const MODE_OPTIONS: readonly Option<DeveloperKitMode>[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export const RADIUS_OPTIONS: readonly Option<DeveloperKitRadius>[] = [
  { label: "None", value: "none" },
  { label: "Sm", value: "sm" },
  { label: "Md", value: "md" },
  { label: "Lg", value: "lg" },
  { label: "Full", value: "full" },
];

export const DENSITY_OPTIONS: readonly Option<DeveloperKitDensity>[] = [
  { label: "Xs", value: "xs" },
  { label: "Sm", value: "sm" },
  { label: "Md", value: "md" },
  { label: "Lg", value: "lg" },
];

export const FONT_OPTIONS: readonly Option<ShowroomFont>[] = [
  { label: "Sans", value: "sans" },
  { label: "Mono", value: "mono" },
];

export const FONT_FAMILIES: Record<ShowroomFont, string> = {
  sans: "var(--font-geist-sans)",
  mono: "var(--font-geist-mono)",
};
```

- [ ] **Step 5: Implement the accessible option group**

Create `app/_components/showroom/OptionGroup.tsx`:

```tsx
import type { OptionGroupProps } from "./showroom.types";

export function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: OptionGroupProps<T>) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-medium text-zinc-500">{label}</legend>
      <div
        role="group"
        aria-label={label}
        className="flex flex-wrap gap-1 rounded-xl bg-zinc-100 p-1"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-950 aria-pressed:bg-white aria-pressed:text-zinc-950 aria-pressed:shadow-sm"
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
```

- [ ] **Step 6: Implement native color controls**

Create `app/_components/showroom/NativeThemeControls.tsx`:

```tsx
import type { NativeThemeControlsProps } from "./showroom.types";

export function NativeThemeControls({
  primary,
  tint,
  onPrimaryChange,
  onTintChange,
}: NativeThemeControlsProps) {
  return (
    <div className="space-y-5">
      <label className="flex items-center justify-between gap-4 text-xs font-medium text-zinc-500">
        Color primario
        <input
          aria-label="Color primario"
          type="color"
          value={primary ?? "#18181b"}
          onChange={(event) => onPrimaryChange(event.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border border-zinc-200 bg-transparent p-1"
        />
      </label>
      <label className="block space-y-2 text-xs font-medium text-zinc-500">
        <span className="flex justify-between">
          <span>Intensidad</span>
          <output>{tint}%</output>
        </span>
        <input
          aria-label="Intensidad"
          type="range"
          min="0"
          max="100"
          step="10"
          value={tint}
          onChange={(event) => onTintChange(Number(event.target.value))}
          className="w-full cursor-pointer accent-zinc-950"
        />
      </label>
    </div>
  );
}
```

- [ ] **Step 7: Implement the controls panel**

Create `app/_components/showroom/ShowroomControls.tsx`:

```tsx
import {
  DENSITY_OPTIONS,
  FONT_OPTIONS,
  MODE_OPTIONS,
  RADIUS_OPTIONS,
} from "./showroom.constants";
import type { ShowroomControlsProps } from "./showroom.types";
import { NativeThemeControls } from "./NativeThemeControls";
import { OptionGroup } from "./OptionGroup";

export function ShowroomControls(props: ShowroomControlsProps) {
  return (
    <aside className="space-y-5 border-b border-zinc-200 bg-white p-5 lg:border-b-0 lg:border-r lg:p-6">
      <div>
        <p className="text-sm font-semibold">Theme controls</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">Button preview</p>
      </div>
      <OptionGroup
        label="Modo"
        options={MODE_OPTIONS}
        value={props.mode}
        onChange={props.onModeChange}
      />
      <NativeThemeControls
        primary={props.primary}
        tint={props.tint}
        onPrimaryChange={props.onPrimaryChange}
        onTintChange={props.onTintChange}
      />
      <OptionGroup
        label="Redondeado"
        options={RADIUS_OPTIONS}
        value={props.radius}
        onChange={props.onRadiusChange}
      />
      <OptionGroup
        label="Densidad"
        options={DENSITY_OPTIONS}
        value={props.density}
        onChange={props.onDensityChange}
      />
      <OptionGroup
        label="Tipografía"
        options={FONT_OPTIONS}
        value={props.font}
        onChange={props.onFontChange}
      />
    </aside>
  );
}
```

- [ ] **Step 8: Implement the stateful preview**

Create `app/_components/showroom/ButtonShowroom.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button, DeveloperKitProvider } from "@/src";
import type {
  DeveloperKitDensity,
  DeveloperKitMode,
  DeveloperKitRadius,
  DeveloperKitTheme,
} from "@/src";

import { FONT_FAMILIES } from "./showroom.constants";
import { ShowroomControls } from "./ShowroomControls";
import type { ShowroomFont } from "./showroom.types";

export function ButtonShowroom() {
  const [mode, setMode] = useState<DeveloperKitMode>("system");
  const [primary, setPrimary] = useState<string>();
  const [tint, setTint] = useState(0);
  const [radius, setRadius] = useState<DeveloperKitRadius>("md");
  const [density, setDensity] = useState<DeveloperKitDensity>("md");
  const [font, setFont] = useState<ShowroomFont>("sans");
  const theme: DeveloperKitTheme = {
    mode,
    color: { primary, surfaceTint: tint },
    radius,
    density,
    fontFamily: FONT_FAMILIES[font],
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:grid lg:grid-cols-[19rem_1fr]">
      <ShowroomControls
        mode={mode}
        primary={primary}
        tint={tint}
        radius={radius}
        density={density}
        font={font}
        onModeChange={setMode}
        onPrimaryChange={setPrimary}
        onTintChange={setTint}
        onRadiusChange={setRadius}
        onDensityChange={setDensity}
        onFontChange={setFont}
      />
      <DeveloperKitProvider
        data-testid="button-preview"
        theme={theme}
        className="flex min-h-96 items-center justify-center bg-[var(--dk-color-surface)] p-8 text-[var(--dk-color-on-surface)] transition-colors"
      >
        <Button>Continue</Button>
      </DeveloperKitProvider>
    </section>
  );
}
```

- [ ] **Step 9: Run the focused tests to verify GREEN**

Run: `pnpm test -- app/_components/showroom/ButtonShowroom.test.tsx`

Expected: 2 tests PASS.

---

### Task 2: Replace the static page and remove obsolete examples

**Files:**
- Modify: `app/page.tsx`
- Delete: `app/_components/ThemePreview.tsx`
- Delete: `app/_data/theme-examples.ts`
- Delete: `app/_data/theme-examples.types.ts`

**Interfaces:**
- Consumes: `ButtonShowroom` from `app/_components/showroom/ButtonShowroom.tsx`.
- Produces: the `/` route containing the interactive showroom.

- [ ] **Step 1: Replace the page body**

Change `app/page.tsx` to:

```tsx
import { ButtonShowroom } from "./_components/showroom/ButtonShowroom";

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-zinc-100 px-4 py-10 text-zinc-950 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 max-w-2xl">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            DeveloperKit / Showroom
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Button
          </h1>
          <p className="mt-4 text-sm leading-6 text-zinc-600 sm:text-base">
            Adjust the theme and see every token applied live.
          </p>
        </header>
        <ButtonShowroom />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Remove superseded static demo files**

Delete `ThemePreview.tsx`, `theme-examples.ts`, and `theme-examples.types.ts`, then verify no references remain:

Run: `rg "ThemePreview|themeExamples|ThemeExample" app`

Expected: no matches.

- [ ] **Step 3: Run focused tests and static checks**

Run: `pnpm test -- app/_components/showroom/ButtonShowroom.test.tsx && pnpm lint && pnpm typecheck`

Expected: all commands exit 0.

---

### Task 3: Verify and run the showroom

**Files:**
- Verify only; no source changes expected.

**Interfaces:**
- Consumes: the complete showroom and existing package validation scripts.
- Produces: a verified package and running local development server.

- [ ] **Step 1: Run the full verification suite**

Run: `pnpm verify`

Expected: lint, typecheck, all tests, library build, package contract, publint, and pack checks exit 0.

- [ ] **Step 2: Run the playground production build**

Run: `pnpm build:demo`

Expected: Next.js production build exits 0 and includes `/`.

- [ ] **Step 3: Start the development server**

Run: `pnpm dev`

Expected: Next.js reports ready at `http://localhost:3000` and remains running.

- [ ] **Step 4: Confirm the route responds**

Run: `curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' http://localhost:3000`

Expected: `200`.
