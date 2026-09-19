import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

/**
 * Encodes the audit's non-text-contrast findings:
 *  - Button: the `:focus-visible` ring is an INSET box-shadow/border drawn
 *    in `var(--vx-color-focus)` directly over the button's own solid fill
 *    (see src/styles/button.css + button-colors.css). In light mode
 *    `--vx-color-focus` (#2563eb) is the EXACT same hex as
 *    `--vx-color-info-solid` (#2563eb) — the audit clocked this at 1.00:1
 *    specifically on the Info color. Measuring all six solid colors here
 *    shows the problem is actually WIDER than the audit's single
 *    example: because the ring color is fixed
 *    (`--vx-color-focus` = #2563eb, a blue) while the fill changes per
 *    color, WCAG relative luminance (which weights blue lowest, 0.0722)
 *    makes several other saturated fills land far below 3:1 too, even
 *    though they don't look alike to the eye:
 *      Neutral 3.47:1 (near-black fill)   -> PASSES (barely clears 3:1)
 *      Primary 3.47:1 (near-black fill)   -> PASSES (barely clears 3:1)
 *      Warning  2.41:1                    -> FAILS
 *      Danger   1.07:1                    -> FAILS
 *      Success  1.03:1                    -> FAILS
 *      Info     1.00:1 (identical color!) -> FAILS
 *  - Select: focused and hovered options share one token,
 *    `--vx-menu-item-hover` = color-mix(on-surface, transparent 95%) — a
 *    5% tint — measured here at 1.11:1 against a non-focused sibling,
 *    matching the audit's ~1.10:1.
 *
 * WCAG 2.2 SC 1.4.11 (Non-text Contrast) wants UI component/focus
 * indicators at >= 3:1 against their surroundings; that's the bar used
 * below.
 *
 * Both `background-color`/`border-color` here are CSS-transitioned
 * (~150-250ms in this kit). Reading getComputedStyle mid-transition
 * returns an interpolated value AND Chromium serializes those
 * in-flight reads as oklab()/color() instead of plain rgb() — so every
 * read below (a) waits past the relevant transition duration and (b)
 * still normalizes through a 1x1 canvas, which forces the browser to
 * resolve any color notation down to plain 0-255 sRGB bytes.
 */

const MIN_CONTRAST = 3;
const RING_CONTRAST_KNOWN_FAILING = new Set(["Danger", "Success", "Warning", "Info"]);

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const la = relativeLuminance(a) + 0.05;
  const lb = relativeLuminance(b) + 0.05;
  return la > lb ? la / lb : lb / la;
}

/** Resolves `el`'s own background/border colors to plain [r,g,b] via canvas. */
async function ownColors(locator: Locator): Promise<{ background: [number, number, number]; border: [number, number, number] }> {
  return locator.evaluate((el) => {
    const style = getComputedStyle(el);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    const toRgb = (color: string): [number, number, number] => {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      return [data[0], data[1], data[2]];
    };
    return { background: toRgb(style.backgroundColor), border: toRgb(style.borderColor) };
  });
}

/** Composites `locator`'s own (possibly translucent) background over its
 * closest panel ancestor's background, over an opaque light-mode base —
 * using a 1x1 canvas so the browser does the real alpha math instead of
 * us re-implementing color-mix()'s compositing by hand. */
async function compositedBackground(locator: Locator, base = "#ffffff"): Promise<[number, number, number]> {
  return locator.evaluate((el, baseColor) => {
    const panel = el.closest("[data-vx-select-panel], [data-vx-menu]") as HTMLElement | null;
    const panelBg = panel ? getComputedStyle(panel).backgroundColor : baseColor;
    const ownBg = getComputedStyle(el).backgroundColor;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = panelBg;
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = ownBg;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return [data[0], data[1], data[2]] as [number, number, number];
  }, base);
}

/** Presses Tab until `target` holds focus (or throws past `maxPresses`).
 * A real Tab key sequence is required, not `locator.focus()`: Chromium
 * does not reliably enter the `:focus-visible` state for this button on
 * a bare script-triggered `.focus()` call in this harness, but it does
 * for genuine keyboard traversal — which is also what the audit finding
 * is actually about (what a keyboard user sees via Tab). */
async function tabUntilFocused(page: Page, target: Locator, maxPresses = 150) {
  for (let i = 0; i < maxPresses; i++) {
    const isFocused = await target.evaluate((el) => el === document.activeElement).catch(() => false);
    if (isFocused) return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Could not reach target via Tab within ${maxPresses} presses`);
}

const BUTTON_COLORS = ["Neutral", "Primary", "Danger", "Success", "Warning", "Info"] as const;

test.describe("Button focus-visible ring contrast", () => {
  for (const color of BUTTON_COLORS) {
    test(`solid ${color} button's focus ring has >= ${MIN_CONTRAST}:1 contrast against its own fill`, async ({ page }) => {
      // CONFIRMED: Neutral/Primary pass (3.47:1); Danger/Success/Warning/Info fail.
      test.fail(RING_CONTRAST_KNOWN_FAILING.has(color), `${color} ring/fill contrast is below 3:1 — see file header for measured ratios`);
      await page.goto("/button");

      await page.getByRole("button", { name: "Solid", exact: true }).click();
      await page.getByRole("button", { name: color, exact: true }).click();

      const preview = page.getByTestId("button-preview").getByRole("button", { name: "Continue" });
      await expect(preview).toBeVisible();
      await tabUntilFocused(page, preview);
      await expect(preview).toBeFocused();

      const isFocusVisible = await preview.evaluate((el) => el.matches(":focus-visible"));
      expect(isFocusVisible, "button should be in the :focus-visible state").toBe(true);

      // Let the border-color/box-shadow transition (150ms) finish.
      await page.waitForTimeout(300);

      const { background, border } = await ownColors(preview);
      const ratio = contrastRatio(background, border);
      expect(
        ratio,
        `focus ring (rgb(${border})) vs fill (rgb(${background})) contrast is ${ratio.toFixed(2)}:1, want >= ${MIN_CONTRAST}:1`,
      ).toBeGreaterThanOrEqual(MIN_CONTRAST);
    });
  }
});

test.describe("Select option focus contrast", () => {
  test("the focused option's background is measurably different from a non-focused sibling", async ({ page }) => {
    // CONFIRMED FAILING: measured at 1.11:1, matching the audit's ~1.10:1.
    test.fail();
    await page.goto("/select");

    const combobox = page.getByRole("combobox", { name: "País" });
    await combobox.click();

    const panel = page.locator("[data-vx-select-panel]");
    await expect(panel).toBeVisible();
    await page.waitForTimeout(800);

    // Initial focus lands on the selected option (México, defaultValue="mx").
    const initiallyFocused = page.locator('[data-vx-select-panel] [role="option"][aria-selected="true"]');
    await expect(initiallyFocused).toBeFocused();

    // ArrowDown moves focus to the next option (Estados Unidos) — the
    // previously-focused option becomes our "non-focused sibling".
    await page.keyboard.press("ArrowDown");

    const focusedOption = page.locator('[data-vx-select-panel] [role="option"]:focus');
    await expect(focusedOption).toHaveCount(1);
    const nonFocusedSibling = initiallyFocused;

    // Let the background-color transition (0.25s) finish.
    await page.waitForTimeout(400);

    const focusedBg = await compositedBackground(focusedOption);
    const siblingBg = await compositedBackground(nonFocusedSibling);

    const ratio = contrastRatio(focusedBg, siblingBg);
    expect(
      ratio,
      `focused option bg (rgb(${focusedBg})) vs non-focused sibling bg (rgb(${siblingBg})) contrast is ${ratio.toFixed(2)}:1, want >= ${MIN_CONTRAST}:1`,
    ).toBeGreaterThanOrEqual(MIN_CONTRAST);
  });
});
