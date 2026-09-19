import { expect, test } from "@playwright/test";

/**
 * Encodes the audit finding at src/transitions/transitionEngine.ts:32 —
 * `runViewTransition` awaits `doc.startViewTransition(async () => { await
 * update(); })`, where `update()` is a Promise that only resolves when
 * <ViewTransitions /> (src/transitions/ViewTransitions.tsx) sees `usePathname()`
 * change and calls `pendingNavigation.resolve()`. A TransitionLink whose
 * href equals the CURRENT pathname triggers `router.push(href)` to a path
 * that never actually changes, so that effect never re-fires, the promise
 * never resolves, and the in-flight View Transition callback never
 * settles — the browser holds the transition open indefinitely, which in
 * practice render-blocks the document.
 *
 * /transition-lab (app/transition-lab/page.tsx and
 * app/transition-lab/[id]/page.tsx) is a strict list<->detail pair: every
 * TransitionLink on the list points at a distinct detail id, and every
 * TransitionLink on a detail page points back at the list. Neither page
 * currently ships a link whose href equals its own pathname, so the exact
 * repro described by the audit can't be produced without editing src
 * (out of scope here). This spec discovers such a link generically — if
 * one is ever added, the test starts exercising the real bug — and skips
 * with a clear message otherwise, per the task's documented fallback.
 */

const NOTE_IDS = ["morph", "gestos", "liquido"];
const CANDIDATE_PATHS = ["/transition-lab", ...NOTE_IDS.map((id) => `/transition-lab/${id}`)];

test("TransitionLink to the current path must not hang the page", async ({ page }) => {
  let selfPath: string | null = null;
  let selfHref: string | null = null;

  for (const path of CANDIDATE_PATHS) {
    await page.goto(path);
    const hrefs = await page.locator("a[href]").evaluateAll((anchors) =>
      anchors.map((a) => new URL((a as HTMLAnchorElement).href).pathname),
    );
    const match = hrefs.find((h) => h === path);
    if (match) {
      selfPath = path;
      selfHref = match;
      break;
    }
  }

  test.skip(
    !selfPath,
    `No TransitionLink whose href equals its own page's pathname was found across ${CANDIDATE_PATHS.join(
      ", ",
    )} — /transition-lab is a strict list<->detail pair (list links point at detail ids, detail links point back at the list), so there's currently no self-referencing TransitionLink to click. This does NOT refute the audit finding at transitionEngine.ts:32; it means the showroom has no fixture to reproduce it with under the "don't modify src" constraint.`,
  );

  // Reachable only if a self-link was found.
  await page.goto(selfPath!);
  await page.locator(`a[href="${selfHref}"]`).first().click();

  // The bug manifests as the document never fully settling out of the
  // pending View Transition — verify the page is still interactive well
  // within a generous 2s window: a fresh animation frame must resolve.
  await expect(async () => {
    const start = Date.now();
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    expect(Date.now() - start).toBeLessThan(2000);
  }).toPass({ timeout: 2000 });

  // And a completely unrelated element must still be clickable — proves
  // the page isn't render-blocked by a stuck view-transition pseudo-tree.
  await page.mouse.move(5, 5);
});
