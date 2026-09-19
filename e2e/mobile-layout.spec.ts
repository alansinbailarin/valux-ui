import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

/**
 * Encodes three mobile-layout findings from the audit: the 16px iOS-zoom
 * floor, WCAG 2.5.8 (24x24 CSS px) touch-target minimums, and safe-area
 * insets on corner-anchored toasts.
 *
 * These all key off `@media (pointer: coarse)` CSS or a physically small
 * viewport, so — unlike touch-action.spec.ts / gestures.spec.ts, which are
 * meaningful cross-browser — this file only makes sense on a touch device.
 * Restricted to the mobile-safari project (iPhone 15, pointer: coarse) so
 * a full `pnpm exec playwright test` run doesn't spuriously fail these on
 * desktop chromium/webkit, where `pointer: coarse` never matches.
 */
test.beforeEach(async ({}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile-safari",
    "coarse-pointer / touch-target checks only apply on a touch device project",
  );
});

async function fontSizePx(locator: Locator): Promise<number> {
  const value = await locator.evaluate((el) => getComputedStyle(el).fontSize);
  return parseFloat(value);
}

test.describe("16px font-size floor on coarse pointers (prevents iOS auto-zoom)", () => {
  test("Input control is >= 16px", async ({ page }) => {
    await page.goto("/input");
    const control = page.locator(".vx-input__control").first();
    await expect(control).toBeVisible();

    const size = await fontSizePx(control);
    expect(size, ".vx-input__control font-size (px)").toBeGreaterThanOrEqual(16);
  });

  test("Select search field is >= 16px", async ({ page }) => {
    // audit: the 16px floor in input.css is scoped to `.vx-input__control`
    // only. The Select combobox search box (.vx-select__search input,
    // select.css) has its own 0.8125rem (13px) font-size and no matching
    // `@media (pointer: coarse)` override, so it still triggers iOS's
    // input-zoom.
    await page.goto("/select");
    await page.getByRole("combobox", { name: "Fruta favorita" }).click();

    const search = page.locator(".vx-select__search input");
    await expect(search).toBeVisible();

    const size = await fontSizePx(search);
    expect(size, ".vx-select__search input font-size (px)").toBeGreaterThanOrEqual(16);
  });
});

test.describe("Touch target sizes (WCAG 2.5.8 24x24 CSS px floor)", () => {
  const MIN = 24;

  test("measures targets across the kit and reports actuals", async ({ page }) => {
    const results: { name: string; width: number; height: number }[] = [];

    const record = async (name: string, locator: Locator) => {
      await expect(locator, `${name} should be visible before measuring`).toBeVisible();
      const box = await locator.boundingBox();
      if (!box) throw new Error(`${name}: no bounding box`);
      results.push({ name, width: box.width, height: box.height });
      expect
        .soft(box.width, `${name} width (px)`)
        .toBeGreaterThanOrEqual(MIN);
      expect
        .soft(box.height, `${name} height (px)`)
        .toBeGreaterThanOrEqual(MIN);
    };

    // --- Number steppers (Input type="number", "Precio" demo) ---
    await page.goto("/input");
    const steppers = page.locator(".vx-input__step");
    await record("Number stepper (increase)", steppers.nth(0));
    await record("Number stepper (decrease)", steppers.nth(1));

    // --- Checkbox sm / md box ---
    await page.goto("/selection");
    await record(
      "Checkbox sm box",
      page.getByRole("checkbox", { name: "sm" }).locator("xpath=following-sibling::span[contains(@class,'vx-check__box')]"),
    );
    await record(
      "Checkbox md box",
      page.getByRole("checkbox", { name: "md" }).locator("xpath=following-sibling::span[contains(@class,'vx-check__box')]"),
    );

    // --- Radio ring (sm) ---
    await record(
      "Radio ring sm",
      page.getByRole("radio", { name: "sm" }).locator("xpath=following-sibling::span[contains(@class,'vx-radio__ring')]"),
    );

    // --- Switch sm track ---
    await page.goto("/switch");
    await record(
      "Switch sm track",
      page.getByRole("switch", { name: "sm" }).locator("xpath=following-sibling::span[contains(@class,'vx-switch__track')]"),
    );

    // --- Dialog close X ---
    // Dialog morphs (scales up from the trigger), so width/height genuinely
    // change during the animation — unlike Sheet/Drawer, which slide
    // (translate only, size is constant throughout). Wait for the morph to
    // settle before measuring or boundingBox() catches it mid-scale.
    await page.goto("/dialog");
    await page.getByRole("button", { name: "Eliminar" }).click();
    await page.waitForTimeout(800);
    await record("Dialog close (X)", page.locator(".vx-dialog__x"));

    // --- Sheet close X ---
    await page.goto("/sheet");
    await page.getByRole("button", { name: "auto", exact: true }).click();
    await page.waitForTimeout(500);
    await record("Sheet close (X)", page.locator(".vx-sheet__x"));

    // --- Drawer close X ---
    await page.goto("/drawer");
    await page.getByRole("button", { name: "Abrir carrito" }).click();
    await page.waitForTimeout(500);
    await record("Drawer close (X)", page.locator(".vx-drawer__x"));

    // --- Menu item ---
    // Menu also morphs (same useMorph as Dialog) — same settle wait needed.
    await page.goto("/menu");
    await page.getByRole("button", { name: "Acciones del documento" }).click();
    await page.waitForTimeout(800);
    await record("Menu item", page.getByRole("menuitem").first());

    // Surface the full actuals table in the HTML report regardless of
    // pass/fail (soft assertions above let every target get measured).
    const table = results
      .map((r) => `${r.name}: ${r.width.toFixed(1)}x${r.height.toFixed(1)}px`)
      .join("\n");
    test.info().annotations.push({ type: "touch-target-actuals", description: table });
    console.log(`\nTouch target actuals (mobile-safari):\n${table}`);
  });
});

test.describe("Safe-area insets on corner toasts (informational)", () => {
  test("records computed left/right on corner-anchored toasters", async ({ page }) => {
    await page.goto("/toast");

    const corners: Array<"top-left" | "top-right" | "bottom-left" | "bottom-right"> = [
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
    ];

    const readings: string[] = [];
    for (const corner of corners) {
      await page.getByRole("button", { name: corner, exact: true }).click();
      const toaster = page.locator("[data-vx-toaster]");
      await expect(toaster).toHaveAttribute("data-vx-position", corner);

      const style = await toaster.evaluate((el) => {
        const computed = getComputedStyle(el);
        return { left: computed.left, right: computed.right };
      });
      readings.push(`${corner}: left=${style.left} right=${style.right}`);
    }

    // audit: toast.css only wraps top/bottom offsets in
    // `max(1rem, env(safe-area-inset-top|bottom))`; top-left/-right and
    // bottom-left/-right use a bare `1rem` for their left/right offset —
    // no `env(safe-area-inset-left|right)`. On a device with a landscape
    // notch/home-indicator inset this places corner toasts under it.
    // Recorded only, not asserted — the audit finding is about the source
    // (no env() at all in the left/right rules), which a computed-style
    // readout on this viewport (no lateral inset) can't distinguish from
    // "env() resolved to 0".
    const report = readings.join("\n");
    test.info().annotations.push({ type: "safe-area-actuals", description: report });
    console.log(`\nCorner toast left/right (mobile-safari):\n${report}`);
  });
});
