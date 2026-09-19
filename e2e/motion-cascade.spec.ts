import { expect, test } from "@playwright/test";

/**
 * Encodes the motion/CSS audit findings around menu-item stagger and
 * prefers-reduced-motion handling.
 *
 * Two of the sub-checks below are EXPECTED TO FAIL against the current
 * source (menu-item.css:32-34 dead stagger, tooltip.css:60-90 unguarded
 * reduced motion) — that's the point: these specs encode the audit, they
 * don't rubber-stamp the status quo.
 *
 * The "measured settle durations vs audit claims" suite lives in
 * motion-cascade-durations.spec.ts (split out to keep each file under the
 * repo's max-lines lint budget).
 */

// ---------------------------------------------------------------------
// 1. Dead menu-item stagger (menu-item.css:20-24 vs :32-34)
// ---------------------------------------------------------------------

test.describe("dead menu-item stagger", () => {
  test("transition-property drops opacity/transform even though the delay ladder survives", async ({
    page,
  }) => {
    await page.goto("/menu");

    // "Hey Jude" card menu: Compartir, Duplicar, Renombrar(disabled), —,
    // Eliminar — exactly 4 [data-vx-menu-item] elements.
    await page.getByRole("button", { name: "Acciones del documento" }).click();

    const opening = page.locator('[data-vx-menu][data-vx-phase="opening"]');
    await opening.waitFor({ state: "attached", timeout: 5000 });

    const items = page.locator("[data-vx-menu-item]");
    await expect(items).toHaveCount(4);

    const snapshot = await items.evaluateAll((els) =>
      els.map((el) => {
        const style = getComputedStyle(el);
        return { property: style.transitionProperty, delay: style.transitionDelay };
      }),
    );

    // menu-item.css:20-23 declares `transition: opacity …, transform …,
    // background-color …`. menu-item.css:32-34 redeclares the SAME
    // selector `[data-vx-menu-item]` at equal specificity with just
    // `transition: background-color .25s ease`, which — because shorthand
    // resets the whole longhand group — wins outright (source order tie)
    // and drops opacity/transform from transition-property entirely.
    expect(
      snapshot[0].property,
      "transition-property on a menu item should still include opacity — menu-item.css:32-34 resets it to background-color only",
    ).toContain("opacity");
    expect(
      snapshot[0].property,
      "transition-property on a menu item should still include transform — menu-item.css:32-34 resets it to background-color only",
    ).toContain("transform");

    // The nth-child stagger ladder (menu-item.css:70-84) sets ONLY the
    // longhand `transition-delay`, at much higher specificity than either
    // `[data-vx-menu-item]` rule, so it isn't affected by the reset above
    // — the 1st and 4th item genuinely get different delay values. It's
    // just moot in practice: nothing in the (reset) property list ever
    // reads that delay, so items snap in instead of staggering.
    expect(
      snapshot[3].delay,
      "1st vs 4th item transition-delay should differ (stagger ladder is present at the CSS level)",
    ).not.toBe(snapshot[0].delay);
  });
});

// ---------------------------------------------------------------------
// 2. Reduced motion actually wins?
// ---------------------------------------------------------------------
//
// Menu and Tooltip both drive their "opening" phase through a JS state
// machine (useMorph / useSheetPhase) that ALSO calls prefersReducedMotion()
// and short-circuits straight to the settled phase when it's true. Under a
// Playwright `reducedMotion: 'reduce'` context that means the live
// "opening" attribute is present for at most one paint — far too transient
// to reliably observe via click-and-poll. To test the CSS cascade itself
// (the actual audit claim) deterministically, these two cases inject a
// synthetic element carrying the same data-vx-* attributes the real
// component would render and read getComputedStyle on it directly. This
// exercises the exact same stylesheet/specificity match, without racing
// the app's own reduced-motion short-circuit. Checkbox and Switch have no
// such JS phase machine (they're plain :checked / attribute CSS), so those
// two use real interaction.

test.describe("reduced motion vs specificity", () => {
  // NOTE: `test.use({ reducedMotion: "reduce" })` does not reliably flip
  // `window.matchMedia("(prefers-reduced-motion: reduce)")` in this
  // Playwright/Chromium combination (verified directly: it leaves `.matches`
  // false). `page.emulateMedia()` does, so each test below sets it
  // explicitly before navigating — this is what actually puts the browser's
  // real prefers-reduced-motion media feature into the "reduce" state that
  // the CSS cascade evaluates against.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("menu item: prefers-reduced-motion wins (transition fully disabled)", async ({
    page,
  }) => {
    await page.goto("/menu");
    const result = await page.evaluate(() => {
      const menu = document.createElement("div");
      menu.setAttribute("data-vx-menu", "");
      menu.setAttribute("data-vx-phase", "opening");
      const item = document.createElement("button");
      item.setAttribute("data-vx-menu-item", "");
      menu.appendChild(item);
      document.body.appendChild(menu);
      const style = getComputedStyle(item);
      const out = { property: style.transitionProperty, duration: style.transitionDuration };
      menu.remove();
      return out;
    });
    // menu-item.css:129-133's reduced-motion block targets the bare
    // `[data-vx-menu-item]` selector at (0,1,0) — same specificity as the
    // dead-stagger rule at :32-34, but it comes LAST in the file, so on a
    // tie it wins: transition-property resolves to "none".
    expect(result.duration).toBe("0s");
  });

  test("tooltip: prefers-reduced-motion LOSES to tooltip.css:60-90 (audit: fully unguarded)", async ({
    page,
  }) => {
    await page.goto("/tooltip");
    const result = await page.evaluate(() => {
      const el = document.createElement("div");
      el.setAttribute("data-vx-tooltip", "");
      el.setAttribute("data-vx-side", "top");
      el.setAttribute("data-vx-phase", "opening");
      document.body.appendChild(el);
      const style = getComputedStyle(el);
      const out = { duration: style.animationDuration, name: style.animationName };
      el.remove();
      return out;
    });
    // tooltip.css:60 — `[data-vx-tooltip][data-vx-side="top"][data-vx-phase="opening"]`
    // is (0,3,0). The reduced-motion block at tooltip.css:375-378 is
    // `[data-vx-tooltip][data-vx-phase="opening"], […="closing"]` — only
    // (0,2,0). Lower specificity always loses regardless of source order,
    // so the 0.3s entrance animation survives prefers-reduced-motion.
    // EXPECTED TO FAIL — this is the audit's headline finding.
    expect(
      result.duration,
      `tooltip animation-duration should be 0s under prefers-reduced-motion, got ${result.duration} (animation: ${result.name}) — tooltip.css:60-90 is unguarded (0,3,0) vs the reduce block at (0,2,0)`,
    ).toBe("0s");
  });

  test("checkbox tick: prefers-reduced-motion LOSES to the :checked rule (specificity)", async ({
    page,
  }) => {
    await page.goto("/selection");
    const checkboxLabel = page.locator('[data-vx-check]', { hasText: "Acepto los términos" });
    await checkboxLabel.locator(".vx-check__box").click();
    const duration = await checkboxLabel
      .locator(".vx-check__mark")
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    // checkbox.css:124-130 targets the bare `.vx-check__mark` — (0,1,0).
    // checkbox.css:75-78's `.vx-check__input:checked + .vx-check__box
    // .vx-check__mark` is (0,4,0) and wins outright. EXPECTED TO FAIL.
    expect(
      duration,
      "checkbox tick transition-duration should be 0s under prefers-reduced-motion — checkbox.css:124-130 (0,1,0) loses to the :checked rule at (0,4,0)",
    ).toBe("0s");
  });

  test("switch thumb: prefers-reduced-motion correctly wins", async ({ page }) => {
    await page.goto("/test");
    const duration = await page
      .locator(".vx-switch__thumb")
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    // switch.css:99-117 and the reduced-motion block at :183-189 both
    // target the bare `.vx-switch__thumb` — (0,1,0), a tie — but the
    // reduce block is declared LAST in the file, so it wins.
    expect(duration).toBe("0s");
  });
});
