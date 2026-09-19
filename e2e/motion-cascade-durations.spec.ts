import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * Measured settle durations vs the motion audit's platform-norm claims.
 * Informational only — never fails the suite on timing. Split out of
 * motion-cascade.spec.ts to keep each spec file under the max-lines budget.
 */

// ---------------------------------------------------------------------
// Durations vs platform norms (informational — must not fail the suite)
// ---------------------------------------------------------------------

const AUDIT_CLAIMS_MS: Record<string, number> = {
  menu: 500,
  dialog: 540,
  popover: 500,
  toast: 900,
  tooltip: 300,
};

async function measureSettleMs(
  page: Page,
  path: string,
  selector: string,
  trigger: () => Promise<void>,
): Promise<number | null> {
  await page.goto(path);
  try {
    const start = Date.now();
    await trigger();
    await page.locator(selector).first().waitFor({ state: "attached", timeout: 3000 });
    // Menu/Dialog/Popover drive their morph via panel.animate() (runMorph.ts)
    // and CANCEL the animation the instant its onfinish fires (so the
    // settled state matches plain CSS instead of a lingering WAAPI fill) —
    // a canceled animation drops out of getAnimations() almost immediately,
    // so "all finished" is rarely observable. Toast/Tooltip instead use
    // plain CSS animations/transitions, which stay in getAnimations() with
    // playState "finished" once done. Treat BOTH shapes as settled: either
    // every currently-tracked animation reports "finished", or the
    // animation set has gone from non-empty back to empty (post-cancel).
    await page.evaluate((sel) => {
      (window as unknown as { __settleSeen?: boolean }).__settleSeen = false;
      void sel;
    }, selector);
    await page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        const anims = (el as Element & { getAnimations: (opts?: { subtree?: boolean }) => Animation[] }).getAnimations({
          subtree: true,
        });
        const w = window as unknown as { __settleSeen?: boolean };
        if (anims.length > 0) {
          w.__settleSeen = true;
          return anims.every((a) => a.playState === "finished");
        }
        return w.__settleSeen === true;
      },
      selector,
      { timeout: 5000, polling: 16 },
    );
    return Date.now() - start;
  } catch {
    return null;
  }
}

test.describe("measured settle durations vs audit claims (informational)", () => {
  test("wall-clock time from trigger click to all animations finished", async ({ page }, testInfo) => {
    const results: Record<string, number | null> = {};

    results.menu = await measureSettleMs(page, "/menu", "[data-vx-menu]", async () => {
      await page.getByRole("button", { name: "Acciones del documento" }).click();
    });

    results.dialog = await measureSettleMs(page, "/test", "[data-vx-dialog]", async () => {
      await page.getByRole("button", { name: "Edit profile", exact: true }).click();
    });

    results.popover = await measureSettleMs(page, "/popover", "[data-vx-popover]", async () => {
      await page.getByRole("button", { name: "Abrir", exact: true }).click();
    });

    results.toast = await measureSettleMs(page, "/toast", "[data-vx-toast]", async () => {
      await page.getByRole("button", { name: "success", exact: true }).click();
    });

    results.tooltip = await measureSettleMs(page, "/tooltip", "[data-vx-tooltip]", async () => {
      await page.getByRole("button", { name: "Instantáneo", exact: true }).hover();
    });

    const rows = Object.entries(results).map(([surface, ms]) => {
      const claim = AUDIT_CLAIMS_MS[surface];
      const measured = ms === null ? "timeout(>5000ms settle poll)" : `${ms}ms`;
      const diff = ms === null ? "n/a" : `${ms - claim >= 0 ? "+" : ""}${ms - claim}ms`;
      return `  ${surface.padEnd(8)} measured=${measured.padEnd(24)} audit_claim=${claim}ms  diff=${diff}`;
    });
    const table = `Measured settle durations (trigger click -> getAnimations() all finished):\n${rows.join("\n")}`;

     
    console.log(`\n[motion-cascade] ${table}\n`);
    testInfo.annotations.push({ type: "measured-durations", description: table });

    // Informational only — never fail the suite on timing.
    expect(true).toBe(true);
  });
});
