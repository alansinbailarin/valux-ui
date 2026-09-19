import { expect, test } from "@playwright/test";

import { dragTouch } from "./utils/touch";

/**
 * Encodes four gesture findings from the mobile/touch audit as executable
 * specs, driving real drag sequences via `dragTouch` (see
 * e2e/utils/touch.ts) instead of `.click()`.
 */

test.describe("Sheet pull-to-dismiss", () => {
  test("dragging the panel down ~200px closes it", async ({ page }) => {
    await page.goto("/sheet");
    await page.getByRole("button", { name: "auto", exact: true }).click();

    const panel = page.locator("[data-vx-sheet]");
    await expect(panel).toBeVisible();
    await page.waitForTimeout(500); // let the open slide settle before dragging

    const box = await panel.boundingBox();
    if (!box) throw new Error("Sheet panel has no bounding box");
    // Drag from the header area — text, not the interactive Close (X)
    // button, which usePullDismiss explicitly ignores (INTERACTIVE guard
    // in src/a11y/usePullDismiss.ts).
    const start = { x: box.x + box.width / 2, y: box.y + 30 };
    const end = { x: start.x, y: start.y + 200 };

    await dragTouch(panel, start, end, { moveTarget: "element" });

    // usePullDismiss's playPullExit runs its own WAAPI exit before calling
    // onDismiss -> setOpen(false); once phase reaches "closed" the portal
    // unmounts entirely (SheetContent renders null).
    await expect(panel, "Sheet should close after a >200px downward drag").toHaveCount(0, {
      timeout: 2000,
    });
  });
});

test.describe("Scrolled Sheet body must not dismiss on drag", () => {
  test("dragging down inside a scrolled Sheet.Body scrolls, not dismisses", async ({ page }) => {
    // audit: usePullDismiss.ts:74 guards `panel.scrollTop`, but with a
    // Sheet.Body present the REAL scroller is `.vx-sheet__body` (see
    // src/sheet/SheetLayout.tsx — SheetBody = scrollBody(...)), whose
    // scrollTop is independent of the outer panel's. So this guard never
    // actually fires for Body-bearing sheets, and a downward drag over a
    // scrolled body starts the dismiss gesture instead of scrolling back
    // toward the top.
    await page.goto("/sheet");
    await page.getByRole("button", { name: "Términos" }).click();

    const panel = page.locator("[data-vx-sheet]");
    await expect(panel).toBeVisible();
    await page.waitForTimeout(500);

    const body = panel.locator(".vx-sheet__body");
    await expect(body).toBeVisible();

    // Scroll partway down so scrollTop > 0 on the REAL scroller.
    await body.evaluate((el) => {
      el.scrollTop = 200;
    });
    await expect
      .poll(() => body.evaluate((el) => el.scrollTop))
      .toBeGreaterThan(0);

    const box = await body.boundingBox();
    if (!box) throw new Error("Sheet body has no bounding box");
    const start = { x: box.x + box.width / 2, y: box.y + 40 };
    const end = { x: start.x, y: start.y + 150 };

    await dragTouch(panel, start, end, { moveTarget: "element" });
    await page.waitForTimeout(1000);

    await expect(
      panel,
      "Sheet should stay open — the drag started over a scrolled body and should scroll it, not dismiss",
    ).toHaveAttribute("data-vx-phase", "open");
  });
});

test.describe("Toast swipe-back cancel", () => {
  test("a small horizontal swipe under the dismiss threshold leaves the toast in place", async ({ page }) => {
    await page.goto("/toast");
    await page.getByRole("button", { name: "Disparar sticky" }).click();

    const card = page.locator("[data-vx-toast]").first();
    await expect(card).toBeVisible();

    const box = await card.boundingBox();
    if (!box) throw new Error("Toast card has no bounding box");
    const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    // Well under useToastSwipe's commit threshold (90px, or a 0.55px/ms flick).
    const end = { x: start.x + 40, y: start.y };

    await dragTouch(card, start, end, { moveTarget: "element" });
    await page.waitForTimeout(500);

    await expect(
      card,
      "toast should still be present after a sub-threshold swipe-and-release",
    ).toBeVisible();
  });
});

test.describe("Switch drag", () => {
  test("dragging past the midpoint toggles; releasing back under it does not", async ({ page }) => {
    await page.goto("/switch");

    const input = page.getByRole("switch", { name: "Sonidos" });
    await expect(input).not.toBeChecked();

    const track = input.locator("xpath=following-sibling::span[contains(@class,'vx-switch__track')]");
    await expect(track).toBeVisible();

    // Mirrors useSwitchDrag.ts's own travel formula so the drag distances
    // below are correct regardless of the rendered size (md here).
    const travel = await track.evaluate((el) => {
      const thumb = el.querySelector<HTMLElement>("[data-vx-thumb]");
      if (!thumb) throw new Error("thumb not found");
      return el.clientWidth - thumb.offsetWidth - thumb.offsetLeft * 2;
    });

    const box = await track.boundingBox();
    if (!box) throw new Error("Switch track has no bounding box");
    const midY = box.y + box.height / 2;
    const start = { x: box.x + box.width * 0.25, y: midY };

    // Overshoot well past the midpoint (progress > 0.5) to commit ON.
    const commitEnd = { x: start.x + travel + 12, y: midY };
    await dragTouch(track, start, commitEnd, { moveTarget: "document" });
    await expect(input, "dragging past the midpoint should toggle the switch on").toBeChecked();

    // Now drag back a SMALL amount that keeps progress comfortably above
    // 0.5 (from=1, dx = -0.15*travel -> progress ~0.85) — releasing here
    // must not toggle it back off.
    const backStart = { x: commitEnd.x, y: midY };
    const backEnd = { x: backStart.x - travel * 0.15, y: midY };
    await dragTouch(track, backStart, backEnd, { moveTarget: "document" });
    await expect(
      input,
      "releasing a drag that stayed past the midpoint should NOT toggle the switch back off",
    ).toBeChecked();
  });
});
