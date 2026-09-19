import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

/**
 * Encodes the mobile/touch audit's `touch-action` finding: Sheet, Dialog,
 * Menu, Popover and Select all drag their panel VERTICALLY to dismiss
 * (Sheet via `usePullDismiss`, the other four via `useCloseScrub`), but
 * their stylesheets (sheet.css, dialog-content.css, menu-content.css,
 * popover.css, select.css) never set `touch-action` on the dragged panel.
 * Left at the default `auto`, iOS treats the same finger-down-and-move as
 * "the user wants to scroll" and can cancel the gesture into a page scroll
 * / pull-to-refresh instead of letting the pointer sequence drive the
 * dismiss drag.
 *
 * Switch, Drawer and Toast already set `touch-action` (switch.css: `none`
 * on both track and thumb; drawer.css / toast.css: `pan-y` on the dragged
 * surface) — those three are included as regression guards so a future
 * refactor can't silently drop the existing fix.
 *
 * `getComputedStyle(...).touchAction` is a plain CSS read: it does not
 * depend on gesture simulation, so this file is meaningful (and left
 * unrestricted) across all three configured projects — chromium, webkit,
 * and mobile-safari.
 */

async function touchActionOf(locator: Locator): Promise<string> {
  return locator.evaluate((el) => getComputedStyle(el).touchAction);
}

test.describe("Missing touch-action (audit regression targets)", () => {
  test("Sheet panel has no touch-action — iOS can cancel the pull-to-dismiss drag as a scroll", async ({ page }) => {
    await page.goto("/sheet");
    await page.getByRole("button", { name: "auto", exact: true }).click();

    const panel = page.locator("[data-vx-sheet]");
    await expect(panel).toBeVisible();
    await page.waitForTimeout(800); // morph/slide settle

    const touchAction = await touchActionOf(panel);
    expect(touchAction, "Sheet panel (.vx-sheet) touch-action").not.toBe("auto");
  });

  test("Dialog panel has no touch-action — the close-scrub drag is exposed to iOS scroll cancellation", async ({ page }) => {
    await page.goto("/dialog");
    await page.getByRole("button", { name: "Eliminar" }).click();

    const panel = page.locator("[data-vx-dialog]");
    await expect(panel).toBeVisible();
    await page.waitForTimeout(800);

    const touchAction = await touchActionOf(panel);
    expect(touchAction, "Dialog panel (.vx-dialog) touch-action").not.toBe("auto");
  });

  test("Menu panel has no touch-action — same close-scrub gesture as Dialog", async ({ page }) => {
    await page.goto("/menu");
    await page.getByRole("button", { name: "Acciones del documento" }).click();

    const panel = page.locator("[data-vx-menu]");
    await expect(panel).toBeVisible();
    await page.waitForTimeout(800);

    const touchAction = await touchActionOf(panel);
    expect(touchAction, "Menu panel (.vx-menu) touch-action").not.toBe("auto");
  });

  test("Popover panel has no touch-action — same close-scrub gesture as Dialog/Menu", async ({ page }) => {
    await page.goto("/popover");
    await page.getByRole("button", { name: "Abrir", exact: true }).click();

    const panel = page.locator("[data-vx-popover]");
    await expect(panel).toBeVisible();
    await page.waitForTimeout(800);

    const touchAction = await touchActionOf(panel);
    expect(touchAction, "Popover panel (.vx-popover) touch-action").not.toBe("auto");
  });

  test("Select panel has no touch-action — same close-scrub gesture as Dialog/Menu/Popover", async ({ page }) => {
    await page.goto("/select");
    await page.getByRole("combobox", { name: "País" }).click();

    const panel = page.locator("[data-vx-select-panel]");
    await expect(panel).toBeVisible();
    await page.waitForTimeout(800);

    const touchAction = await touchActionOf(panel);
    expect(touchAction, "Select panel (.vx-select-panel) touch-action").not.toBe("auto");
  });
});

test.describe("Known-good touch-action (regression guards)", () => {
  test("Switch track already sets touch-action: none", async ({ page }) => {
    await page.goto("/switch");

    const track = page
      .getByRole("switch", { name: "Notificaciones" })
      .locator("xpath=following-sibling::span[contains(@class,'vx-switch__track')]");
    await expect(track).toBeVisible();

    const touchAction = await touchActionOf(track);
    expect(touchAction, "Switch track (.vx-switch__track) touch-action").not.toBe("auto");
  });

  test("Drawer panel already sets touch-action: pan-y", async ({ page }) => {
    await page.goto("/drawer");
    await page.getByRole("button", { name: "Abrir carrito" }).click();

    const panel = page.locator("[data-vx-drawer]");
    await expect(panel).toBeVisible();
    await page.waitForTimeout(800);

    const touchAction = await touchActionOf(panel);
    expect(touchAction, "Drawer panel (.vx-drawer) touch-action").not.toBe("auto");
  });

  test("Toast card already sets touch-action: pan-y", async ({ page }) => {
    await page.goto("/toast");
    await page.getByRole("button", { name: "Disparar sticky" }).click();

    const card = page.locator("[data-vx-toast]").first();
    await expect(card).toBeVisible();

    const touchAction = await touchActionOf(card);
    expect(touchAction, "Toast card (.vx-toast) touch-action").not.toBe("auto");
  });
});
