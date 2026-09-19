import { expect, test } from "@playwright/test";

/**
 * The mode orb: a fixed sphere, bottom right, that flips dark/light as a
 * wave washing out of it (a View Transition whose new snapshot is revealed
 * through a growing clip-path circle — mode-orb.css).
 *
 * The mechanism under test, beyond "the attribute flips":
 *  - the flip rides document.startViewTransition, NOT the kit's
 *    runViewTransition (that engine resolves against a route change, and a
 *    theme flip navigates nowhere — riding it would hang the transition);
 *  - the wave CSS is scoped by [data-vx-wave] for exactly the transition's
 *    lifetime, so future route transitions never inherit the theme wipe;
 *  - reduced motion means NO view transition at all — an instant flip, not
 *    a slower disguise of the same sweep.
 */

declare global {
  interface Window {
    __vtCalls: number;
  }
}

/** Counts startViewTransition calls without changing its behavior. */
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

// The SITE's orb specifically: the wall also exhibits a ModeOrb specimen
// with the same accessible name (inert, but visible to role queries).
const orb = (page: import("@playwright/test").Page) =>
  page.locator("button.site-orb");

test.describe("mode orb", () => {
  test("click flips the mode, persists it, and a second click flips back", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(orb(page)).toBeVisible();

    // Playwright's default color scheme is light, so the first flip lands
    // on dark.
    await orb(page).click();
    await expect(page.locator("html")).toHaveAttribute("data-vx-mode", "dark");

    // The page, not just the attribute: the section below the hero must
    // actually repaint from the kit's surface tokens.
    const sectionBg = await page
      .locator("main > section:last-of-type")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(sectionBg).toBe("rgb(9, 9, 11)"); // --vx-dark-color-surface-base

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-vx-mode", "dark");

    await orb(page).click();
    await expect(page.locator("html")).toHaveAttribute("data-vx-mode", "light");
  });

  test("the flip rides a view transition scoped by data-vx-wave", async ({
    page,
  }) => {
    await spyOnViewTransitions(page);
    await page.goto("/");

    await orb(page).click();
    await expect(page.locator("html")).toHaveAttribute("data-vx-mode", "dark");
    expect(await page.evaluate(() => window.__vtCalls)).toBe(1);

    // The origin/radius handed to the wave keyframes came from the orb.
    const wave = await page.evaluate(() => {
      const s = document.documentElement.style;
      return {
        x: s.getPropertyValue("--vx-wave-x"),
        r: Number.parseFloat(s.getPropertyValue("--vx-wave-r")),
      };
    });
    expect(wave.x).toMatch(/px$/);
    expect(wave.r).toBeGreaterThan(500); // must reach the far corner

    // The scope flag retires with the transition ("" arms, "go" releases,
    // finished removes); navigations after this must not inherit the wipe.
    await expect(page.locator("html")).not.toHaveAttribute("data-vx-wave", {
      timeout: 5000,
    });
  });

  test("explicit light beats a dark OS (root cascade regression)", async ({
    page,
  }) => {
    // The bug this pins: modes.css's system-dark media block opened with a
    // bare `:root` — same specificity as the light block but later in the
    // file — so on a dark-OS machine an explicit light choice on <html>
    // could never repaint the surfaces. The user's exact report: "puse
    // claro y la siguiente sección siempre se ve oscuro".
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    // Effective mode is dark, so the first click lands on light.
    await orb(page).click();
    await expect(page.locator("html")).toHaveAttribute("data-vx-mode", "light");

    const sectionBg = await page
      .locator("main > section:last-of-type")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(sectionBg).toBe("rgb(255, 255, 255)"); // light surface-base
  });

  test("reduced motion: instant flip, no view transition at all", async ({
    page,
  }) => {
    await spyOnViewTransitions(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await orb(page).click();
    await expect(page.locator("html")).toHaveAttribute("data-vx-mode", "dark");
    expect(await page.evaluate(() => window.__vtCalls)).toBe(0);
  });
});
