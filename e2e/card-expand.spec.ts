import { expect, test } from "@playwright/test";

/**
 * The tile→panel expand: clicking the Button card runs a View Transition
 * in which the card's bounds morph into a giant dialog and the specimen
 * travels to the canvas on the panel's right. The pattern every tile will
 * follow.
 *
 * Contract under test, beyond "a panel appears":
 *  - the flip rides startViewTransition, scoped by data-vx-expand, and the
 *    scope retires with the transition;
 *  - the specimen genuinely lands in the right-side canvas;
 *  - it is a dialog: Escape closes it, focus lands inside and returns to
 *    the tile after;
 *  - reduced motion opens instantly with no transition at all.
 */

declare global {
  interface Window {
    __vtCalls: number;
  }
}

async function spyOnViewTransitions(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.__vtCalls = 0;
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => unknown;
    };
    const original = doc.startViewTransition?.bind(document);
    if (!original) return;
    doc.startViewTransition = (cb: () => void) => {
      window.__vtCalls += 1;
      return original(cb);
    };
  });
}

const tile = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Open the Button component" });

test.describe("card expand", () => {
  test("click expands to a dialog; the specimen lands right-of-centre", async ({
    page,
  }) => {
    await spyOnViewTransitions(page);
    await page.goto("/");
    await tile(page).scrollIntoViewIfNeeded();
    await tile(page).click();

    const dialog = page.getByRole("dialog", { name: "Button component" });
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => window.__vtCalls)).toBe(1);

    // The travelled specimen: inside the canvas, in the right portion of
    // the viewport.
    const chip = page.locator(".expand__canvas .specimen-chip button");
    const box = (await chip.boundingBox())!;
    const width = page.viewportSize()!.width;
    expect(box.x + box.width / 2).toBeGreaterThan(width * 0.55);

    // Scope retired once the transition settles.
    await expect(page.locator("html")).not.toHaveAttribute("data-vx-expand", {
      timeout: 5000,
    });

    // Focus landed inside the dialog.
    await expect(page.getByRole("button", { name: "Close" })).toBeFocused();
  });

  test("Escape collapses and hands focus back to the tile", async ({
    page,
  }) => {
    await page.goto("/");
    await tile(page).scrollIntoViewIfNeeded();
    await tile(page).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(tile(page)).toBeFocused();
    // The wall specimen is home again.
    await expect(
      page.locator(".mosaic .specimen-chip button", { hasText: "Button" }),
    ).toBeVisible();
  });

  test("specimens are inert on the wall but LIVE inside the dialog", async ({
    page,
  }) => {
    await page.goto("/");
    const switchTile = page.getByRole("button", {
      name: "Open the Switch component",
    });
    await switchTile.scrollIntoViewIfNeeded();
    await switchTile.click();
    await expect(page.getByRole("dialog", { name: "Switch component" })).toBeVisible();

    // The same control that ignored every click in the wall now toggles.
    const control = page.locator('.expand__canvas input[type="checkbox"]');
    await expect(control).toBeChecked();
    await page.locator(".expand__canvas .specimen-chip").click();
    await expect(control).not.toBeChecked();
  });

  test("reduced motion: instant open, no view transition", async ({ page }) => {
    await spyOnViewTransitions(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await tile(page).scrollIntoViewIfNeeded();
    await tile(page).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await page.evaluate(() => window.__vtCalls)).toBe(0);
  });
});
