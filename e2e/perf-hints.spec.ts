import { expect, test } from "@playwright/test";

/**
 * Encodes the audit finding around dialog-content.css:24-27:
 *
 *   [data-vx-dialog][data-vx-phase="opening"],
 *   [data-vx-dialog][data-vx-phase="closing"] {
 *     will-change: transform, filter;
 *   }
 *
 * `will-change` is scoped to the opening/closing phases only. But the
 * pull-to-close scrub gesture (src/morph/useCloseScrub.ts, wired up in
 * DialogContentSurface.tsx via `active: phase === "open" && dismissable`)
 * runs precisely at phase="open" — the one phase NOT covered by the
 * will-change rule. So the panel is unpromoted for the entire duration of
 * a drag, and `backdrop-filter` (dialog-tokens.css:11, a known-expensive
 * property) stays on throughout instead of being turned off for the
 * gesture, as the audit recommends.
 *
 * Both assertions below are EXPECTED TO FAIL against the current source —
 * that's the point, they document the gap.
 */

test("dialog scrub gesture at phase=open runs unpromoted (will-change/backdrop-filter)", async ({
  page,
}) => {
  await page.goto("/test");
  // /dialog's only active showroom demo (app/dialog/DialogDemos.tsx) sets
  // dismissable={false}, which makes useCloseScrub's `active` flag false —
  // the scrub gesture never attaches there at all. /test's "Edit profile"
  // dialog (app/test/DialogAndSheetTiles.tsx) uses the default
  // dismissable=true, so the gesture is actually live.
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();

  const panel = page.locator("[data-vx-dialog]");
  await expect(panel).toHaveAttribute("data-vx-phase", "open", { timeout: 5000 });

  const box = await panel.boundingBox();
  if (!box) throw new Error("Dialog panel has no bounding box once open.");

  const startX = box.x + box.width / 2;
  const startY = box.y + Math.min(24, box.height / 4);

  // useCloseScrub.onPointerMove requires the target to be inside the panel
  // and dy >= 8px before it flips `dragging = true` and starts applying the
  // scrub transform — walk past that threshold with a few incremental
  // pointer moves while the mouse button is held.
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  for (const dy of [10, 20, 30, 45, 60]) {
    await page.mouse.move(startX, startY + dy, { steps: 3 });
  }

  const midDrag = await panel.evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      willChange: style.willChange,
      backdropFilter: style.backdropFilter || (style as unknown as { webkitBackdropFilter?: string }).webkitBackdropFilter,
      phase: el.getAttribute("data-vx-phase"),
    };
  });

  await page.mouse.up();

  expect(midDrag.phase, "gesture must be exercised while phase is still 'open' (the uncovered phase)").toBe(
    "open",
  );

  // dialog-content.css:24-27 only promotes during opening/closing — the
  // scrub gesture runs at phase="open", so will-change resolves to "auto"
  // (no promotion) for the whole drag. EXPECTED TO FAIL.
  expect(
    midDrag.willChange,
    `panel should be layer-promoted (will-change != "auto") while being dragged at phase="open", got "${midDrag.willChange}" — dialog-content.css:24-27 only covers phase="opening"/"closing"`,
  ).not.toBe("auto");

  // Nothing currently turns backdrop-filter off during the drag (audit
  // recommendation) — it stays at the full token value the whole time.
  // EXPECTED TO FAIL.
  expect(
    midDrag.backdropFilter,
    `backdrop-filter should be disabled during the scrub drag, got "${midDrag.backdropFilter}" — dialog-tokens.css:11 keeps it on unconditionally`,
  ).toBe("none");
});
