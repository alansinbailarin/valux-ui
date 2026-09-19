import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { parseColor } from "../theme/color/parseColor";
import { oklchLightness } from "../theme/color/oklchLightness";
import type { Rgb } from "../theme/color/color.types";
import {
  extractCssBlock,
  readCssProperty,
  resolveDarkAlias,
} from "../../test/cssTokens";

/** Spec rule: in dark mode, surface-raised must differ from surface-base
 * by >= 5 OKLCH lightness points, so cards never flatten into the page. */
const MINIMUM_DARK_SURFACE_DELTA = 5;

/**
 * The rule that was missing, and that let flat light cards ship: EVERY Card
 * variant, in EVERY mode, has to be distinguishable from the page it sits
 * on. Only the dark surface delta was ever checked, so light — where the
 * page is white, `elevated` shares the page's own fill, and a drop shadow
 * does not register at all — went unverified.
 *
 * A variant passes on either cue:
 *   - its fill is >= 2.5 OKLCH L away from the page, or
 *   - it carries an edge whose alpha is >= 15%.
 * Shadow deliberately counts for nothing: it is exactly the cue that fails
 * on white, and in dark the kit does not use one.
 */
const MINIMUM_SURFACE_DELTA = 2.5;
const MINIMUM_BORDER_ALPHA = 15;

type Mode = "light" | "dark";

/** Which tokens each variant's fill and edge come from. Asserted against
 * card.css below, so this table cannot drift away from the stylesheet. */
const VARIANTS = [
  { name: "outline", lift: null, borderAlpha: "--vx-card-border-alpha" },
  {
    name: "elevated",
    lift: "--vx-card-elevated-lift",
    borderAlpha: "--vx-card-raised-border-alpha",
  },
  { name: "soft", lift: "100%", borderAlpha: "--vx-card-raised-border-alpha" },
] as const;

async function readStyles() {
  const [tokens, modes, card] = await Promise.all([
    readFile(resolve("src/styles/tokens.css"), "utf8"),
    readFile(resolve("src/styles/modes.css"), "utf8"),
    readFile(resolve("src/styles/card.css"), "utf8"),
  ]);
  return { tokens, modes, card };
}

/** Resolves a token for one mode: the mode block wins, the :root defaults in
 * tokens.css are the fallback, and one level of `var(--vx-dark-*)` alias is
 * followed (modes.css keeps the dark literals in a single alias block). */
function tokenFor(
  { tokens, modes }: { tokens: string; modes: string },
  mode: Mode,
  name: string,
): string {
  const block = extractCssBlock(
    modes,
    mode === "dark" ? '[data-vx-mode="dark"] {' : '[data-vx-mode="light"],',
  );
  const value =
    resolveDarkAlias(modes, readCssProperty(block, name)) ??
    readCssProperty(extractCssBlock(tokens, ":root {"), name);
  if (!value) throw new Error(`no value for ${name} in ${mode} mode`);
  return value;
}

function color(value: string): Rgb {
  const rgb = parseColor(value);
  if (!rgb) throw new Error(`not a parseable color: ${value}`);
  return rgb;
}

function percent(value: string): number {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) throw new Error(`not a percentage: ${value}`);
  return parsed;
}

/** color-mix(in srgb, raised <lift>, base) — sRGB is a plain channel lerp. */
function mix(base: Rgb, raised: Rgb, lift: number): Rgb {
  const t = lift / 100;
  return [0, 1, 2].map((i) => base[i] * (1 - t) + raised[i] * t) as unknown as Rgb;
}

describe("Card surface contrast rule", () => {
  it("keeps raised surfaces distinguishable from the base in dark mode", async () => {
    const styles = await readStyles();

    const base = color(tokenFor(styles, "dark", "--vx-color-surface-base"));
    const raised = color(
      tokenFor(styles, "dark", "--vx-color-surface-raised-base"),
    );

    const delta = oklchLightness(raised) - oklchLightness(base);
    expect(delta).toBeGreaterThanOrEqual(MINIMUM_DARK_SURFACE_DELTA);
  });

  it("wires each variant to the tokens this rule measures", async () => {
    const { card } = await readStyles();

    // outline: real border off --vx-card-border-alpha.
    expect(card).toMatch(
      /\.vx-card\[data-vx-variant="outline"\]\s*\{[\s\S]*?var\(--vx-card-border-alpha\)/,
    );
    // elevated + soft: the shared hairline, off --vx-card-raised-border-alpha.
    expect(card).toMatch(
      /--vx-card-hairline:[\s\S]*?var\(--vx-card-raised-border-alpha\)/,
    );
    expect(card).toMatch(
      /\.vx-card\[data-vx-variant="elevated"\]\s*\{[\s\S]*?var\(--vx-card-hairline\)/,
    );
    expect(card).toMatch(
      /\.vx-card\[data-vx-variant="soft"\]\s*\{[\s\S]*?var\(--vx-card-hairline\)/,
    );
    // elevated's fill rides --vx-card-elevated-lift between the two planes;
    // soft is always the raised plane.
    expect(card).toMatch(
      /\.vx-card\[data-vx-variant="elevated"\]\s*\{[\s\S]*?var\(--vx-card-elevated-lift\)/,
    );
    expect(card).toMatch(
      /\.vx-card\[data-vx-variant="soft"\]\s*\{[\s\S]*?background: var\(--vx-surface-2\);/,
    );
  });

  const cases = (["light", "dark"] as const).flatMap((mode) =>
    VARIANTS.map((variant) => [mode, variant] as const),
  );

  it.each(cases)(
    "%s mode: the %s card is distinguishable from the page",
    async (mode, variant) => {
      const styles = await readStyles();

      const page = color(tokenFor(styles, mode, "--vx-color-surface-base"));
      const raised = color(
        tokenFor(styles, mode, "--vx-color-surface-raised-base"),
      );

      const lift =
        variant.lift === null
          ? 0
          : percent(
              variant.lift.startsWith("--")
                ? tokenFor(styles, mode, variant.lift)
                : variant.lift,
            );
      const fill = mix(page, raised, lift);
      const surfaceDelta = Math.abs(
        oklchLightness(fill) - oklchLightness(page),
      );
      const borderAlpha = percent(
        tokenFor(styles, mode, variant.borderAlpha),
      );

      const distinguishable =
        surfaceDelta >= MINIMUM_SURFACE_DELTA ||
        borderAlpha >= MINIMUM_BORDER_ALPHA;

      expect({
        mode,
        variant: variant.name,
        surfaceDelta: Number(surfaceDelta.toFixed(2)),
        borderAlpha,
        distinguishable,
      }).toMatchObject({ distinguishable: true });
    },
  );
});
