import { expect, test } from "@playwright/test";

/**
 * The landing's cursor system, two tiers:
 *  - static: a rounded arrowhead via `cursor: url(data:svg)` on :root, with
 *    keyword fallbacks — what reduced-motion and coarse pointers get;
 *  - live: PointerArrow hides the native cursor everywhere and drives the
 *    same drawing with position easing and direction-turning.
 *
 * The tiers must never both be active (two arrows chasing each other), and
 * reduced motion must kill the live tier entirely, not just slow it.
 */

const arrow = (page: import("@playwright/test").Page) =>
  page.locator(".vx-cursor");

test.describe("landing cursor", () => {
  test("live tier: native cursor hidden, arrow trails and turns", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-vx-cursor", "live");

    // Native cursor hidden everywhere, including over pressables.
    for (const target of ["body", ".site-orb"]) {
      expect(
        await page
          .locator(target)
          .evaluate((el) => getComputedStyle(el).cursor),
      ).toBe("none");
    }

    // A horizontal sweep: the arrow must chase (position between start and
    // target while easing) and point rightward (angle ≈ 0).
    await page.mouse.move(200, 400);
    await page.waitForTimeout(900); // settle
    await page.mouse.move(600, 400, { steps: 10 });
    // The matrix composes rotate·translate(-tip): the point pinned to the
    // pointer is the TIP under the full transform, never the raw e/f.
    const mid = await arrow(page).evaluate((el) => {
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      const tip = m.transformPoint(new DOMPoint(26, 16));
      return { x: tip.x, y: tip.y, angle: (Math.atan2(m.b, m.a) * 180) / Math.PI };
    });
    expect(mid.x).toBeGreaterThan(150);
    expect(Math.abs(mid.angle)).toBeLessThan(45); // heading right

    // Downward leg: the tip turns toward the new direction.
    await page.mouse.move(600, 700, { steps: 10 });
    await page.waitForTimeout(120);
    const down = await arrow(page).evaluate((el) => {
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      return (Math.atan2(m.b, m.a) * 180) / Math.PI;
    });
    expect(down).toBeGreaterThan(30); // rotated toward +y

    // Settling: the drive loop must go idle (no perpetual rAF) yet the
    // arrow must end pinned to the pointer.
    await page.waitForTimeout(1400); // slower chase needs longer to converge
    const settled = await arrow(page).evaluate((el) => {
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      const tip = m.transformPoint(new DOMPoint(26, 16));
      return { x: tip.x, y: tip.y };
    });
    expect(Math.abs(settled.x - 600)).toBeLessThan(2);
    expect(Math.abs(settled.y - 700)).toBeLessThan(2);
  });

  test("pressables invert the arrow's dress, never its shape", async ({
    page,
  }) => {
    await page.goto("/");
    const orb = page.locator("button.site-orb");
    const box = (await orb.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(arrow(page)).toHaveClass(/vx-cursor--press/);
    await page.mouse.move(80, 80);
    await expect(arrow(page)).not.toHaveClass(/vx-cursor--press/);

    // ...and the arrow wears the theme's ink: flipping to dark re-dresses
    // it. The dress GLIDES (160ms fill transition) and the flip triggers a
    // full-page recalc, so no fixed wait is honest — poll to the settled
    // color instead of catching a mid-flight blend.
    const fill = () =>
      page
        .locator(".vx-cursor path")
        .evaluate((el) => getComputedStyle(el).fill);
    const setMode = (mode: string) =>
      page.evaluate((m) => {
        document.documentElement.dataset.vxMode = m;
      }, mode);
    await setMode("light");
    await expect.poll(fill, { timeout: 3000 }).toBe("rgb(17, 17, 19)");
    await setMode("dark");
    await expect.poll(fill, { timeout: 3000 }).toBe("rgb(250, 250, 250)");
  });

  test("reduced motion: live tier absent, static arrow cursor in charge", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForTimeout(300);

    // Kit contract: reduced motion keeps the STATIC tier (the attribute is
    // "static", never "live") — same drawing, standing still, OS-composited.
    await expect(page.locator("html")).toHaveAttribute(
      "data-vx-cursor",
      "static",
    );
    const cursor = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).cursor);
    expect(cursor).toContain("url"); // the static SVG arrow
    expect(cursor).toContain("auto"); // with its keyword fallback
  });
});
