# Card Phase 1 (Surface) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the static `Card` primitive — full optional anatomy (Media/Header/Title/Subtitle/Body/Footer), three variants (`outline` default, `elevated`, `soft`), correct light/dark surface differentiation, contracts, and a showroom demo page.

**Architecture:** New `src/card/` module following the kit's compound-component pattern (like `Dialog.Header`): a `Card` root that emits `data-vx-variant`, layout parts as thin class-carrying wrappers, and a `CardMedia` with an `src` shortcut plus overlay children. Styling is plain CSS on `--vx-*` tokens; dark mode never relies on shadow (elevated switches to `surface-raised` + inset highlight). A new `oklchLightness` helper in `src/theme/color/` backs a testable dark-contrast rule.

**Tech Stack:** React 19 + TypeScript, plain CSS (`src/styles/`), Vitest 4 + Testing Library + jest-axe, existing contract tests in `src/contracts/`.

**Spec:** `docs/superpowers/specs/2026-07-23-card-design.md` (this plan covers Phase 1 only; pressable and expandable are separate plans).

---

### Task 1: Card root component (variants)

**Files:**
- Create: `src/card/Card.types.ts`
- Create: `src/card/Card.tsx`
- Test: `src/card/Card.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/card/Card.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "./Card";

describe("Card root", () => {
  it("renders a div with the base class and default outline variant", () => {
    render(<Card data-testid="card">Hello</Card>);
    const card = screen.getByTestId("card");
    expect(card.tagName).toBe("DIV");
    expect(card).toHaveClass("vx-card");
    expect(card).toHaveAttribute("data-vx-variant", "outline");
    expect(card).toHaveTextContent("Hello");
  });

  it("applies the requested variant", () => {
    render(<Card data-testid="card" variant="elevated" />);
    expect(screen.getByTestId("card")).toHaveAttribute(
      "data-vx-variant",
      "elevated",
    );
  });

  it("merges a caller className after the base class", () => {
    render(<Card data-testid="card" className="extra" />);
    expect(screen.getByTestId("card")).toHaveClass("vx-card", "extra");
  });

  it("forwards its ref to the root element", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Card ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/card/Card.test.tsx`
Expected: FAIL — cannot resolve `./Card`.

- [ ] **Step 3: Write the types and minimal implementation**

```ts
// src/card/Card.types.ts
import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";

export type CardVariant = "outline" | "elevated" | "soft";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Surface look. Default "outline". */
  variant?: CardVariant;
}

export interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {
  /** Shortcut: renders an <img> cover. Omit to use free children only. */
  src?: string;
  /** Required for meaning when src is set; defaults to decorative "". */
  alt?: string;
  /** Reserved aspect ratio (avoids layout shift). Default 16/9. */
  ratio?: number;
  /** Optional native <img> props passthrough for the shortcut image. */
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">;
  /** Overlaid content (App Store text-over-cover). */
  children?: ReactNode;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level. Default "h3". */
  as?: "h2" | "h3" | "h4" | "h5" | "h6";
}
```

```tsx
// src/card/Card.tsx
import { forwardRef } from "react";

import type { CardProps } from "./Card.types";

/** Composable surface: bordered by default, with elevated and soft looks.
 * Every anatomy part (Media/Header/Body/Footer) is optional. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "outline", className, children, ...props },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={["vx-card", className].filter(Boolean).join(" ")}
      data-vx-card=""
      data-vx-variant={variant}
    >
      {children}
    </div>
  );
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/card/Card.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/card/Card.types.ts src/card/Card.tsx src/card/Card.test.tsx
git commit -m "feat(card): Card root with outline/elevated/soft variants"
```

---

### Task 2: Layout parts — Header, Title, Subtitle, Body, Footer

**Files:**
- Create: `src/card/CardLayout.tsx`
- Test: `src/card/CardLayout.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/card/CardLayout.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  CardBody,
  CardFooter,
  CardHeader,
  CardSubtitle,
  CardTitle,
} from "./CardLayout";

describe("Card layout parts", () => {
  it("renders each part with its class", () => {
    render(
      <>
        <CardHeader data-testid="header" />
        <CardBody data-testid="body" />
        <CardFooter data-testid="footer" />
      </>,
    );
    expect(screen.getByTestId("header")).toHaveClass("vx-card__header");
    expect(screen.getByTestId("body")).toHaveClass("vx-card__body");
    expect(screen.getByTestId("footer")).toHaveClass("vx-card__footer");
  });

  it("renders the title as an h3 by default", () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByRole("heading", { level: 3, name: "Title" });
    expect(title).toHaveClass("vx-card__title");
  });

  it("honors the title `as` heading level", () => {
    render(<CardTitle as="h2">Top</CardTitle>);
    expect(
      screen.getByRole("heading", { level: 2, name: "Top" }),
    ).toBeInTheDocument();
  });

  it("renders the subtitle with its class", () => {
    render(<CardSubtitle data-testid="sub">Sub</CardSubtitle>);
    expect(screen.getByTestId("sub")).toHaveClass("vx-card__subtitle");
  });

  it("merges caller classNames", () => {
    render(<CardBody data-testid="body" className="extra" />);
    expect(screen.getByTestId("body")).toHaveClass("vx-card__body", "extra");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/card/CardLayout.test.tsx`
Expected: FAIL — cannot resolve `./CardLayout`.

- [ ] **Step 3: Write minimal implementation**

Same thin-part factory the Dialog layout uses (`src/dialog/DialogLayout.tsx`), plus the heading special case:

```tsx
// src/card/CardLayout.tsx
import type { HTMLAttributes } from "react";

import type { CardTitleProps } from "./Card.types";

function part(className: string) {
  return function Part({
    className: extra,
    children,
    ...props
  }: HTMLAttributes<HTMLDivElement>) {
    return (
      <div {...props} className={[className, extra].filter(Boolean).join(" ")}>
        {children}
      </div>
    );
  };
}

/** Groups Title + Subtitle above the body. */
export const CardHeader = part("vx-card__header");

/** Free content region. */
export const CardBody = part("vx-card__body");

/** Action row: right-aligned, kit control gap. */
export const CardFooter = part("vx-card__footer");

/** Semantic heading for the card. Default h3; override with `as`. */
export function CardTitle({
  as: Heading = "h3",
  className,
  children,
  ...props
}: CardTitleProps) {
  return (
    <Heading
      {...props}
      className={["vx-card__title", className].filter(Boolean).join(" ")}
    >
      {children}
    </Heading>
  );
}

/** Secondary line under the title. */
export function CardSubtitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={["vx-card__subtitle", className].filter(Boolean).join(" ")}
    >
      {children}
    </p>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/card/CardLayout.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/card/CardLayout.tsx src/card/CardLayout.test.tsx
git commit -m "feat(card): header/title/subtitle/body/footer layout parts"
```

---

### Task 3: CardMedia

**Files:**
- Create: `src/card/CardMedia.tsx`
- Test: `src/card/CardMedia.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/card/CardMedia.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardMedia } from "./CardMedia";

describe("CardMedia", () => {
  it("renders a cover img from the src shortcut", () => {
    render(<CardMedia data-testid="media" src="/cover.jpg" alt="Cover" />);
    const media = screen.getByTestId("media");
    expect(media).toHaveClass("vx-card__media");
    const img = screen.getByRole("img", { name: "Cover" });
    expect(img).toHaveAttribute("src", "/cover.jpg");
    expect(img).toHaveClass("vx-card__media-img");
  });

  it("defaults to a decorative empty alt", () => {
    render(<CardMedia src="/cover.jpg" data-testid="media" />);
    const img = screen.getByTestId("media").querySelector("img");
    expect(img).toHaveAttribute("alt", "");
  });

  it("reserves the aspect ratio inline (default 16/9)", () => {
    render(<CardMedia data-testid="media" src="/c.jpg" />);
    expect(screen.getByTestId("media").style.aspectRatio).toBe(
      String(16 / 9),
    );
  });

  it("renders children in an overlay layer", () => {
    render(
      <CardMedia data-testid="media" src="/c.jpg">
        <span>Over</span>
      </CardMedia>,
    );
    const overlay = screen.getByText("Over").parentElement;
    expect(overlay).toHaveClass("vx-card__media-overlay");
  });

  it("works with free children and no src", () => {
    render(
      <CardMedia data-testid="media">
        <span>Gradient</span>
      </CardMedia>,
    );
    expect(screen.getByTestId("media").querySelector("img")).toBeNull();
    expect(screen.getByText("Gradient")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/card/CardMedia.test.tsx`
Expected: FAIL — cannot resolve `./CardMedia`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/card/CardMedia.tsx
import type { CardMediaProps } from "./Card.types";

/** Cover area. `src` renders an <img>; children overlay the media
 * (App Store text-over-cover). Reserves aspect ratio to avoid layout
 * shift; clips to the card radius via the card's overflow. */
export function CardMedia({
  src,
  alt = "",
  ratio = 16 / 9,
  imgProps,
  className,
  style,
  children,
  ...props
}: CardMediaProps) {
  return (
    <div
      {...props}
      className={["vx-card__media", className].filter(Boolean).join(" ")}
      style={{ aspectRatio: ratio, ...style }}
    >
      {src ? (
        <img
          {...imgProps}
          className={["vx-card__media-img", imgProps?.className]
            .filter(Boolean)
            .join(" ")}
          src={src}
          alt={alt}
        />
      ) : null}
      {children ? (
        <div className="vx-card__media-overlay">{children}</div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/card/CardMedia.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/card/CardMedia.tsx src/card/CardMedia.test.tsx
git commit -m "feat(card): CardMedia with src shortcut, ratio reserve, overlay"
```

---

### Task 4: Compound assembly + package barrel

**Files:**
- Create: `src/card/index.ts`
- Modify: `src/index.ts` (add one export line)
- Test: `src/card/CardCompound.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/card/CardCompound.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "./index";

describe("Card compound component", () => {
  it("exposes all anatomy parts on the root", () => {
    expect(Card.Media).toBeDefined();
    expect(Card.Header).toBeDefined();
    expect(Card.Title).toBeDefined();
    expect(Card.Subtitle).toBeDefined();
    expect(Card.Body).toBeDefined();
    expect(Card.Footer).toBeDefined();
  });

  it("renders the full anatomy composed", () => {
    render(
      <Card data-testid="card" variant="elevated">
        <Card.Media src="/c.jpg" alt="Cover" />
        <Card.Header>
          <Card.Title>Title</Card.Title>
          <Card.Subtitle>Sub</Card.Subtitle>
        </Card.Header>
        <Card.Body>Body</Card.Body>
        <Card.Footer>Footer</Card.Footer>
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(card.querySelector(".vx-card__media")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Body")).toHaveClass("vx-card__body");
    expect(screen.getByText("Footer")).toHaveClass("vx-card__footer");
  });

  it("renders bare children with no parts (all anatomy optional)", () => {
    render(<Card data-testid="card">Just text</Card>);
    expect(screen.getByTestId("card")).toHaveTextContent("Just text");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/card/CardCompound.test.tsx`
Expected: FAIL — cannot resolve `./index`.

- [ ] **Step 3: Write the compound index (Dialog's assembly pattern)**

```ts
// src/card/index.ts
import { Card as CardRoot } from "./Card";
import {
  CardBody,
  CardFooter,
  CardHeader,
  CardSubtitle,
  CardTitle,
} from "./CardLayout";
import { CardMedia } from "./CardMedia";

type CardComponent = typeof CardRoot & {
  Media: typeof CardMedia;
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Subtitle: typeof CardSubtitle;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
};

const Card = CardRoot as CardComponent;
Card.Media = CardMedia;
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Body = CardBody;
Card.Footer = CardFooter;

export { Card };
export type {
  CardMediaProps,
  CardProps,
  CardTitleProps,
  CardVariant,
} from "./Card.types";
```

Then add the barrel line — in `src/index.ts`, after `export * from "./contextmenu";` add:

```ts
export * from "./card";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/card/CardCompound.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/card/index.ts src/card/CardCompound.test.tsx src/index.ts
git commit -m "feat(card): compound assembly and public barrel export"
```

---

### Task 5: Stylesheet — tokens, card.css, card-parts.css

**Files:**
- Modify: `src/styles/tokens.css` (append card tokens inside `:root`)
- Modify: `src/styles/modes.css` (dark border alpha)
- Create: `src/styles/card.css`
- Create: `src/styles/card-parts.css`
- Modify: `src/styles.css` (two imports)
- Test: `src/card/card.styles.test.ts`

- [ ] **Step 1: Write the failing styles test**

The kit tests CSS by reading the files and asserting on rules (see `src/button/button-appearance.styles.test.ts`).

```ts
// src/card/card.styles.test.ts
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Card styles", () => {
  it("defines card tokens on the root", async () => {
    const css = await readFile(resolve("src/styles/tokens.css"), "utf8");
    expect(css).toContain("--vx-card-padding: 1rem;");
    expect(css).toContain("--vx-card-gap: 0.5rem;");
    expect(css).toContain("--vx-card-shadow:");
    expect(css).toContain("--vx-card-border-alpha: 12%;");
  });

  it("uses the kit's single radius and surface tokens", async () => {
    const css = await readFile(resolve("src/styles/card.css"), "utf8");
    expect(css).toContain("border-radius: var(--vx-radius-control);");
    expect(css).toContain("background: var(--vx-color-surface);");
    expect(css).not.toMatch(/--vx-card-radius/);
  });

  it("styles the three variants", async () => {
    const css = await readFile(resolve("src/styles/card.css"), "utf8");
    expect(css).toContain('.vx-card[data-vx-variant="outline"]');
    expect(css).toContain('.vx-card[data-vx-variant="elevated"]');
    expect(css).toContain('.vx-card[data-vx-variant="soft"]');
    expect(css).toContain("box-shadow: var(--vx-card-shadow);");
  });

  it("never relies on shadow in dark: elevated switches to raised surface + highlight", async () => {
    const css = await readFile(resolve("src/styles/card.css"), "utf8");
    const darkBlocks = css
      .split(/(?=\[data-vx-mode="dark"\]|@media \(prefers-color-scheme: dark\))/)
      .slice(1)
      .join("\n");
    expect(darkBlocks).toContain("var(--vx-color-surface-raised)");
    expect(darkBlocks).toContain("inset 0 1px 0");
  });

  it("raises the outline border contrast in dark", async () => {
    const modes = await readFile(resolve("src/styles/modes.css"), "utf8");
    expect(modes).toContain("--vx-card-border-alpha: 22%;");
  });

  it("is wired into the public stylesheet after drawer", async () => {
    const entry = await readFile(resolve("src/styles.css"), "utf8");
    const drawer = entry.indexOf('@import "./styles/drawer.css";');
    const card = entry.indexOf('@import "./styles/card.css";');
    const parts = entry.indexOf('@import "./styles/card-parts.css";');
    expect(drawer).toBeGreaterThan(-1);
    expect(card).toBeGreaterThan(drawer);
    expect(parts).toBeGreaterThan(card);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/card/card.styles.test.ts`
Expected: FAIL — `card.css` missing.

- [ ] **Step 3: Write the CSS**

Append inside the `:root` block of `src/styles/tokens.css` (after `--vx-motion-easing-standard: ease;`):

```css
  --vx-card-padding: 1rem;
  --vx-card-gap: 0.5rem;
  /* used only by elevated; dark mode replaces shadow with raised surface */
  --vx-card-shadow: 0 1px 3px rgb(0 0 0 / 0.06), 0 4px 16px rgb(0 0 0 / 0.1);
  --vx-card-border-alpha: 12%;
```

In `src/styles/modes.css`, add to the `[data-vx-mode="dark"]` block AND to the `@media (prefers-color-scheme: dark)` `:root, [data-vx-mode="system"]` block:

```css
  --vx-card-border-alpha: 22%;
```

Create `src/styles/card.css`:

```css
/* Card — composable surface. Three looks: outline (default), elevated,
   soft. Dark-mode rule: the card/background distinction NEVER depends on
   shadow — elevated switches to a raised surface + inset top highlight. */
.vx-card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--vx-radius-control);
  background: var(--vx-color-surface);
  color: var(--vx-color-on-surface);
  font-family: var(--vx-font-family);
}

.vx-card[data-vx-variant="outline"] {
  border: 1px solid
    color-mix(
      in srgb,
      var(--vx-color-on-surface) var(--vx-card-border-alpha),
      transparent
    );
}

.vx-card[data-vx-variant="elevated"] {
  box-shadow: var(--vx-card-shadow);
}

.vx-card[data-vx-variant="soft"] {
  background: var(--vx-color-surface-raised);
}

/* Dark: elevated communicates depth with a lighter surface + hairline
   highlight; the drop shadow collapses to a faint contact shadow. */
[data-vx-mode="dark"] .vx-card[data-vx-variant="elevated"] {
  background: var(--vx-color-surface-raised);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent),
    0 1px 2px rgb(0 0 0 / 0.35);
}

@media (prefers-color-scheme: dark) {
  :root .vx-card[data-vx-variant="elevated"],
  [data-vx-mode="system"] .vx-card[data-vx-variant="elevated"] {
    background: var(--vx-color-surface-raised);
    box-shadow:
      inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent),
      0 1px 2px rgb(0 0 0 / 0.35);
  }
  [data-vx-mode="light"] .vx-card[data-vx-variant="elevated"] {
    background: var(--vx-color-surface);
    box-shadow: var(--vx-card-shadow);
  }
}
```

Create `src/styles/card-parts.css`:

```css
/* Card anatomy parts. Every part is optional; spacing comes from the
   card tokens so density theming stays centralized. */
.vx-card__media {
  position: relative;
  overflow: hidden;
}

.vx-card__media-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vx-card__media-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--vx-card-padding);
}

.vx-card__header {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: var(--vx-card-padding) var(--vx-card-padding) 0;
}

.vx-card__title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: var(--vx-font-weight-control);
  line-height: 1.35;
}

.vx-card__subtitle {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: color-mix(in srgb, var(--vx-color-on-surface) 62%, transparent);
}

.vx-card__body {
  padding: var(--vx-card-gap) var(--vx-card-padding);
  font-size: var(--vx-font-size-control);
  font-weight: 400;
  line-height: 1.5;
}

.vx-card__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--vx-control-gap);
  padding: var(--vx-card-gap) var(--vx-card-padding) var(--vx-card-padding);
}

/* First/last part adjustments: media touches the card edges; a body or
   header directly after media regains its top padding. */
.vx-card > .vx-card__body:first-child {
  padding-top: var(--vx-card-padding);
}
.vx-card > .vx-card__media + .vx-card__body {
  padding-top: var(--vx-card-padding);
}
.vx-card > .vx-card__body:last-child {
  padding-bottom: var(--vx-card-padding);
}
```

In `src/styles.css`, after `@import "./styles/drawer.css";` add:

```css
@import "./styles/card.css";
@import "./styles/card-parts.css";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/card/card.styles.test.ts`
Expected: PASS (6 tests). Also run `pnpm vitest run src/contracts/stylesheet.test.ts` — expected FAIL (contract not yet updated; fixed in Task 7).

- [ ] **Step 5: Commit**

```bash
git add src/styles/tokens.css src/styles/modes.css src/styles/card.css src/styles/card-parts.css src/styles.css src/card/card.styles.test.ts
git commit -m "feat(card): stylesheet — variants, parts, dark-mode surface strategy"
```

---

### Task 6: Dark-contrast rule (`oklchLightness`)

**Files:**
- Create: `src/theme/color/oklchLightness.ts`
- Modify: `src/theme/color/index.ts`
- Test: `src/card/card-contrast.styles.test.ts`
- Test (unit): extend `src/theme/color/color.test.ts`

- [ ] **Step 1: Write the failing unit test**

Append to `src/theme/color/color.test.ts`:

```ts
import { oklchLightness } from "./oklchLightness";

describe("oklchLightness", () => {
  it("returns 0 for black and 100 for white", () => {
    expect(oklchLightness([0, 0, 0])).toBeCloseTo(0, 5);
    expect(oklchLightness([255, 255, 255])).toBeCloseTo(100, 0);
  });

  it("orders the default dark surfaces (raised is lighter than base)", () => {
    const base = oklchLightness([9, 9, 11]); // #09090b
    const raised = oklchLightness([24, 24, 27]); // #18181b
    expect(raised).toBeGreaterThan(base);
  });
});
```

(Keep the existing imports/describe blocks in that file untouched; add this at the end.)

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/theme/color/color.test.ts`
Expected: FAIL — cannot resolve `./oklchLightness`.

- [ ] **Step 3: Implement the helper**

```ts
// src/theme/color/oklchLightness.ts
import type { Rgb } from "./color.types";

function linearize(channel: number): number {
  const value = channel / 255;

  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}

/** OKLab/OKLCH lightness (0-100) of an sRGB color. Used by surface
 * contrast rules (e.g. Card's dark-mode raised-vs-base check). */
export function oklchLightness([red, green, blue]: Rgb): number {
  const r = linearize(red);
  const g = linearize(green);
  const b = linearize(blue);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return (0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s) * 100;
}
```

Add to `src/theme/color/index.ts`:

```ts
export { oklchLightness } from "./oklchLightness";
```

- [ ] **Step 4: Run unit test to verify it passes**

Run: `pnpm vitest run src/theme/color/color.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the contrast-rule test (fails only if themes flatten)**

```ts
// src/card/card-contrast.styles.test.ts
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { parseColor } from "../theme/color/parseColor";
import { oklchLightness } from "../theme/color/oklchLightness";

/** Spec rule: in dark mode, surface-raised must differ from surface-base
 * by >= 5 OKLCH lightness points, so cards never flatten into the page. */
const MINIMUM_DARK_SURFACE_DELTA = 5;

describe("Card dark-mode surface contrast rule", () => {
  it("keeps raised surfaces distinguishable from the base in dark mode", async () => {
    const modes = await readFile(resolve("src/styles/modes.css"), "utf8");
    const dark = modes.match(/\[data-vx-mode="dark"\]\s*\{([\s\S]*?)\n\}/)?.[1];
    expect(dark).toBeDefined();

    const base = dark?.match(/--vx-color-surface-base:\s*(#[0-9a-fA-F]{3,8})/)?.[1];
    const raised = dark?.match(
      /--vx-color-surface-raised-base:\s*(#[0-9a-fA-F]{3,8})/,
    )?.[1];
    expect(base).toBeDefined();
    expect(raised).toBeDefined();

    const baseRgb = parseColor(base as string);
    const raisedRgb = parseColor(raised as string);
    if (!baseRgb || !raisedRgb) {
      throw new Error("dark surface tokens must parse as colors");
    }

    const delta = oklchLightness(raisedRgb) - oklchLightness(baseRgb);
    expect(delta).toBeGreaterThanOrEqual(MINIMUM_DARK_SURFACE_DELTA);
  });
});
```

(`parseColor` returns `Rgb | null` where `Rgb` is the readonly tuple from `src/theme/color/color.types.ts` — `oklchLightness` takes it directly.)

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm vitest run src/card/card-contrast.styles.test.ts`
Expected: PASS (default dark theme `#18181b` vs `#09090b` clears the 5-point bar).

- [ ] **Step 7: Commit**

```bash
git add src/theme/color/oklchLightness.ts src/theme/color/index.ts src/theme/color/color.test.ts src/card/card-contrast.styles.test.ts
git commit -m "feat(theme): oklchLightness + Card dark surface contrast rule"
```

---

### Task 7: Contracts — structure, exports, stylesheet

**Files:**
- Modify: `src/contracts/structure.test.ts` (extend `requiredFiles`)
- Modify: `src/contracts/exports.test.ts` (Card runtime + types)
- Modify: `src/contracts/stylesheet.test.ts` (two new imports in the expected list)

- [ ] **Step 1: Update the three contracts (tests-first: they ARE the tests)**

In `src/contracts/structure.test.ts`, append to `requiredFiles`:

```ts
  "src/card/Card.tsx",
  "src/card/Card.types.ts",
  "src/card/CardLayout.tsx",
  "src/card/CardMedia.tsx",
  "src/card/index.ts",
  "src/styles/card.css",
  "src/styles/card-parts.css",
  "src/theme/color/oklchLightness.ts",
```

In `src/contracts/exports.test.ts`, extend the barrel import and add assertions. Add `Card` to the runtime import from `"../index"`, add `CardProps, CardVariant` to the type import, then add inside the existing describes:

```ts
const cardProps: CardProps = { variant: "elevated" };
const cardVariant: CardVariant = "soft";
```

```ts
  it("exports the Card compound component", () => {
    expect(Card).toBeDefined();
    expect(Card.Media).toBeDefined();
    expect(Card.Header).toBeDefined();
    expect(Card.Title).toBeDefined();
    expect(Card.Subtitle).toBeDefined();
    expect(Card.Body).toBeDefined();
    expect(Card.Footer).toBeDefined();
    expect(cardProps.variant).toBe("elevated");
    expect(cardVariant).toBe("soft");
  });
```

In `src/contracts/stylesheet.test.ts`, add to the expected import list, after `'@import "./styles/drawer.css";',`:

```ts
        '@import "./styles/card.css";',
        '@import "./styles/card-parts.css";',
```

- [ ] **Step 2: Run the full contract suite**

Run: `pnpm vitest run src/contracts/`
Expected: PASS (structure, exports, stylesheet all green).

- [ ] **Step 3: Commit**

```bash
git add src/contracts/structure.test.ts src/contracts/exports.test.ts src/contracts/stylesheet.test.ts
git commit -m "test(contracts): register Card files, exports, and stylesheet order"
```

---

### Task 8: Accessibility + SSR tests

**Files:**
- Create: `src/card/Card.a11y.test.tsx`
- Create: `src/card/Card.ssr.test.tsx`

- [ ] **Step 1: Write the a11y test**

The kit does not extend expect with `toHaveNoViolations`; it asserts on `violations` directly (see `src/switch/Switch.test.tsx:69`). Same style here:

```tsx
// src/card/Card.a11y.test.tsx
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { Card } from "./index";

describe("Card accessibility", () => {
  it("full anatomy has no axe violations", async () => {
    const { container } = render(
      <main>
        <Card>
          <Card.Media src="/cover.jpg" alt="Team photo" />
          <Card.Header>
            <Card.Title>Quarterly report</Card.Title>
            <Card.Subtitle>Q2 2026</Card.Subtitle>
          </Card.Header>
          <Card.Body>Revenue grew 12%.</Card.Body>
          <Card.Footer>
            <button type="button">Open</button>
          </Card.Footer>
        </Card>
      </main>,
    );
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it("decorative media is hidden from the accessibility tree", async () => {
    const { container } = render(
      <main>
        <Card>
          <Card.Media src="/decor.jpg" />
          <Card.Body>Text</Card.Body>
        </Card>
      </main>,
    );
    expect((await axe(container)).violations).toHaveLength(0);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });
});
```

- [ ] **Step 2: Write the SSR test**

```tsx
// src/card/Card.ssr.test.tsx
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Card } from "./index";

describe("Card SSR", () => {
  it("renders the full anatomy to a string without a DOM", () => {
    const html = renderToString(
      <Card variant="soft">
        <Card.Media src="/c.jpg" alt="" />
        <Card.Header>
          <Card.Title>Title</Card.Title>
        </Card.Header>
        <Card.Body>Body</Card.Body>
      </Card>,
    );
    expect(html).toContain("vx-card");
    expect(html).toContain('data-vx-variant="soft"');
    expect(html).toContain("vx-card__media");
  });
});
```

- [ ] **Step 3: Run both, verify pass**

Run: `pnpm vitest run src/card/`
Expected: PASS — entire card suite green.

- [ ] **Step 4: Commit**

```bash
git add src/card/Card.a11y.test.tsx src/card/Card.ssr.test.tsx
git commit -m "test(card): jest-axe and SSR coverage"
```

---

### Task 9: Showroom demo page

**Files:**
- Create: `app/card/page.tsx`
- Create: `app/card/CardDemos.tsx`
- Modify: `app/_components/showroom/ShowroomShell.tsx` (nav entry)

- [ ] **Step 1: Create the page (existing showroom pattern)**

```tsx
// app/card/page.tsx
import { ShowroomShell } from "../_components/showroom/ShowroomShell";
import { CardDemos } from "./CardDemos";

export const metadata = { title: "Card — Valux" };

export default function Page() {
  return (
    <ShowroomShell
      title="Card"
      description="Superficie componible: media, header, body y footer opcionales, con tres variantes (outline, elevated, soft) que se diferencian del fondo en light y dark."
    >
      <CardDemos />
    </ShowroomShell>
  );
}
```

- [ ] **Step 2: Create the demos**

The showroom pattern (see `app/drawer/DrawerDemos.tsx`) is: import from `@/src`, wrap everything in `DemoBoard` (which provides the light/dark toggle via `ValuxProvider`), one `Demo label="…"` per case — both exported from `app/_components/showroom/DemoSection.tsx`.

```tsx
// app/card/CardDemos.tsx
"use client";

import { Button, Card } from "@/src";

import { DemoBoard, Demo } from "../_components/showroom/DemoSection";

export function CardDemos() {
  return (
    <div className="space-y-8">
      <DemoBoard>
        <Demo label="Variantes — outline (default), elevated, soft">
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              width: "100%",
            }}
          >
            <Card variant="outline">
              <Card.Header>
                <Card.Title>Outline</Card.Title>
                <Card.Subtitle>La variante por defecto</Card.Subtitle>
              </Card.Header>
              <Card.Body>Borde definido, sin sombra.</Card.Body>
            </Card>
            <Card variant="elevated">
              <Card.Header>
                <Card.Title>Elevated</Card.Title>
                <Card.Subtitle>Sombra en light, raised en dark</Card.Subtitle>
              </Card.Header>
              <Card.Body>Flota sobre el fondo.</Card.Body>
            </Card>
            <Card variant="soft">
              <Card.Header>
                <Card.Title>Soft</Card.Title>
                <Card.Subtitle>Superficie tintada</Card.Subtitle>
              </Card.Header>
              <Card.Body>Sin borde ni sombra.</Card.Body>
            </Card>
          </div>
        </Demo>

        <Demo label="Anatomía completa">
          <Card variant="elevated" style={{ maxWidth: 360 }}>
            <Card.Media ratio={16 / 9}>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                }}
              />
            </Card.Media>
            <Card.Header>
              <Card.Title>Informe trimestral</Card.Title>
              <Card.Subtitle>Q2 2026</Card.Subtitle>
            </Card.Header>
            <Card.Body>
              Los ingresos crecieron 12% respecto al trimestre anterior.
            </Card.Body>
            <Card.Footer>
              <Button variant="ghost">Descartar</Button>
              <Button color="primary">Abrir</Button>
            </Card.Footer>
          </Card>
        </Demo>

        <Demo label="Media con texto superpuesto">
          <Card variant="elevated" style={{ maxWidth: 360 }}>
            <Card.Media ratio={4 / 3}>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(160deg, #0ea5e9, #22d3ee)",
                }}
              />
              <div style={{ position: "relative", color: "#fff" }}>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    opacity: 0.85,
                  }}
                >
                  Destacado
                </div>
                <Card.Title as="h4" style={{ color: "#fff" }}>
                  Título sobre media
                </Card.Title>
              </div>
            </Card.Media>
            <Card.Body>Texto de apoyo debajo de la imagen.</Card.Body>
          </Card>
        </Demo>

        <Demo label="Solo contenido">
          <Card style={{ maxWidth: 360 }}>
            <Card.Body>
              Un Card con solo texto también es válido — toda la anatomía es
              opcional.
            </Card.Body>
          </Card>
        </Demo>
      </DemoBoard>
    </div>
  );
}
```

(If `Demo` takes different props than `label` in the current file, mirror the existing usage — the demo content above stays the same.)

- [ ] **Step 3: Register the nav entry**

In `app/_components/showroom/ShowroomShell.tsx`, the nav array (around line 14) lists `["/drawer", "Drawer"]` — add after it:

```ts
  ["/card", "Card"],
```

- [ ] **Step 4: Verify in the dev site**

Run: `pnpm dev` and open `http://localhost:3000/card`.
Expected: the four sections render; variants readable in light AND dark (toggle the mode in the shell). Stop the server after checking.

- [ ] **Step 5: Commit**

```bash
git add app/card/ app/_components/showroom/ShowroomShell.tsx
git commit -m "feat(docs): Card showroom page"
```

---

### Task 10: Full verification + LLM docs regen

**Files:**
- Modify: `llms.txt` / `llms-full.txt` (generated)

- [ ] **Step 1: Run the full verify pipeline**

Run: `pnpm verify`
Expected: lint, typecheck, all tests, library build, package contract, publint, pack — all green. Fix anything red before continuing (do not skip).

- [ ] **Step 2: Regenerate LLM docs**

Run: `pnpm docs:llms`
Expected: `llms.txt` / `llms-full.txt` now mention Card.

- [ ] **Step 3: Commit**

```bash
git add llms.txt llms-full.txt
git commit -m "docs(llms): regenerate with Card"
```

---

## Out of scope (later phases)

- Phase 2 (pressable): `href`/`onClick` polymorphism, `useCardInteraction`, pressed motion, discriminated-union props — separate plan.
- Phase 3 (expandable): `Card.Expanded`, `useCardExpand`, morph overlay, `CardLink` in `@valux/ui/transitions` — separate plan.
- `Card.types.ts` here ships only `CardProps`/`CardVariant`/`CardMediaProps`/`CardTitleProps`; the discriminated union lands in Phase 2 without breaking these names.
