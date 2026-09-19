import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { oklchLightness } from "../theme/color/oklchLightness";
import { parseColor } from "../theme/color/parseColor";
import type { Rgb } from "../theme/color/color.types";
import { extractCssBlock, readCssProperty } from "../../test/cssTokens";

/**
 * There used to be three parallel surface systems — --vx-card-* in
 * tokens.css/modes.css, --vx-menu-surface in menu-tokens.css and
 * --vx-dialog-surface in dialog-tokens.css — and they drifted. These tests
 * pin the single ladder they all consume:
 *
 *   --vx-surface-1  page
 *   --vx-surface-2  raised   (Card)
 *   --vx-surface-3  overlay  (Menu / Dialog / Popover / Select)
 */

const WHITE: Rgb = [255, 255, 255];
const NEUTRAL_PRIMARY = "#171717";
const CHROMATIC_PRIMARY = "#2563eb";

/** A light panel this far below white starts reading as gray paper. The
 * regression this guards (a 4% primary tint at 82% opacity) landed at 3.45. */
const MAX_LIGHT_PANEL_DELTA = 2;
/** …but it still has to actually respond to a themed primary. */
const MIN_CHROMATIC_RESPONSE = 3;

function readTokens(css: string, marker: string) {
  return extractCssBlock(css, marker);
}

function stripComments(css: string) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function mix(a: Rgb, b: Rgb, amountOfA: number): Rgb {
  const t = amountOfA / 100;
  return [0, 1, 2].map((i) => a[i] * t + b[i] * (1 - t)) as unknown as Rgb;
}

function rgb(color: string): Rgb {
  const parsed = parseColor(color);
  if (!parsed) throw new Error(`not a color: ${color}`);
  return parsed;
}

/** Reproduces --vx-surface-3 -> --vx-*-surface for the LIGHT mode, where
 * overlay-lift is 0% so the plane starts from the page surface. */
function lightPanel(primary: string, tint: number, opacity: number) {
  const plane = mix(rgb(primary), WHITE, tint);
  // Composited over a white page, which is the worst case for "reads gray".
  return mix(plane, WHITE, opacity);
}

describe("surface ladder", () => {
  it("defines all three rungs where providers re-derive them", async () => {
    const tokens = await readFile(resolve("src/styles/tokens.css"), "utf8");
    const derived = readTokens(tokens, ":root,\n[data-vx-provider] {");

    expect(readCssProperty(derived, "--vx-surface-1")).toBe(
      "var(--vx-color-surface)",
    );
    expect(readCssProperty(derived, "--vx-surface-2")).toBe(
      "var(--vx-color-surface-raised)",
    );
    expect(readCssProperty(derived, "--vx-surface-3")).toContain(
      "--vx-surface-overlay-lift",
    );
  });

  it("never re-declares a rung per mode — only the inherited scalars flip", async () => {
    // Re-declaring --vx-surface-* inside [data-vx-mode="dark"] would break a
    // nested [data-vx-provider] that carries no mode of its own (and the
    // portal nodes usePortalTheme themes), which is how the white-menus-in-
    // dark bug worked. Mode blocks may only set the scalars.
    const files = await Promise.all(
      ["modes.css", "menu-tokens.css", "dialog-tokens.css"].map((file) =>
        readFile(resolve("src/styles", file), "utf8"),
      ),
    );
    for (const css of files) {
      expect(stripComments(css)).not.toMatch(/--vx-surface-[123]\s*:/);
    }
  });

  it("has Card on rung 2 and every overlay on rung 3", async () => {
    const [card, menu, dialog, popover, select] = await Promise.all(
      [
        "card.css",
        "menu-tokens.css",
        "dialog-tokens.css",
        "popover.css",
        "select.css",
      ].map((file) => readFile(resolve("src/styles", file), "utf8")),
    );

    expect(card).toContain("var(--vx-surface-1)");
    expect(card).toContain("var(--vx-surface-2)");
    // …and never reaches for the overlay plane (comments aside).
    expect(stripComments(card)).not.toContain("--vx-surface-3");

    expect(menu).toMatch(/--vx-menu-surface:[\s\S]*?var\(--vx-surface-3\)/);
    expect(dialog).toMatch(
      /--vx-dialog-surface:[\s\S]*?var\(--vx-surface-3\)/,
    );
    // Popover and Select ride the menu panel, so they inherit rung 3 too.
    expect(popover).toContain("var(--vx-menu-surface)");
    expect(select).toContain("var(--vx-menu-surface)");
  });

  it("keeps the glass treatment on top of the rung, not instead of it", async () => {
    const [menuTokens, menuContent, dialogTokens, dialogContent] =
      await Promise.all(
        [
          "menu-tokens.css",
          "menu-content.css",
          "dialog-tokens.css",
          "dialog-content.css",
        ].map((file) => readFile(resolve("src/styles", file), "utf8")),
      );

    expect(menuTokens).toContain("--vx-menu-backdrop: blur(20px)");
    expect(menuContent).toContain("var(--vx-menu-backdrop)");
    expect(dialogTokens).toContain("--vx-dialog-backdrop: blur(24px)");
    expect(dialogContent).toContain("var(--vx-dialog-backdrop)");
  });
});

describe("light panel surfaces are themed, not hardcoded white", () => {
  it("derives them from the surface tokens plus a small primary tint", async () => {
    const [tokens, menu, dialog] = await Promise.all(
      ["tokens.css", "menu-tokens.css", "dialog-tokens.css"].map((file) =>
        readFile(resolve("src/styles", file), "utf8"),
      ),
    );

    // The regression: light panels were pinned to color-mix(#ffffff N%), so
    // a themed `primary` tinted the dark panel but not the light one.
    expect(menu).not.toContain("#ffffff");
    expect(dialog).not.toContain("#ffffff");
    expect(readTokens(tokens, ":root,\n[data-vx-provider] {")).toMatch(
      /--vx-surface-3:[\s\S]*?var\(--vx-color-primary\)/,
    );
  });

  it("stays visually neutral on a white page while still taking the theme", async () => {
    const [tokens, menuCss, dialogCss] = await Promise.all(
      ["tokens.css", "menu-tokens.css", "dialog-tokens.css"].map((file) =>
        readFile(resolve("src/styles", file), "utf8"),
      ),
    );
    const root = readTokens(tokens, ":root {");
    const tint = Number.parseFloat(
      readCssProperty(root, "--vx-surface-overlay-tint") ?? "",
    );
    const opacities = [
      Number.parseFloat(
        readCssProperty(
          readTokens(menuCss, ":root,\n[data-vx-provider] {"),
          "--vx-menu-opacity",
        ) ?? "",
      ),
      Number.parseFloat(
        readCssProperty(
          readTokens(dialogCss, ":root,\n[data-vx-provider] {"),
          "--vx-dialog-opacity",
        ) ?? "",
      ),
    ];

    for (const opacity of opacities) {
      // Neutral (default) primary: the panel must still read as white paper.
      const neutral = lightPanel(NEUTRAL_PRIMARY, tint, opacity);
      const delta = 100 - oklchLightness(neutral);
      expect(delta).toBeLessThanOrEqual(MAX_LIGHT_PANEL_DELTA);

      // Chromatic primary: the panel must visibly take the theme's hue.
      const themed = lightPanel(CHROMATIC_PRIMARY, tint, opacity);
      const spread = Math.max(...themed) - Math.min(...themed);
      expect(spread).toBeGreaterThanOrEqual(MIN_CHROMATIC_RESPONSE);
    }
  });
});
