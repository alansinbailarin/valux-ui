import { expect, test } from "@playwright/test";

/**
 * The close is a morph: the panel shrinks back INTO the trigger while a ghost
 * of the trigger's content (the "…" icon) fades up inside it. Two things have
 * to hold for that to read as one object returning home.
 *
 * 1. The content leaves as a WAVE, top-down, on the beat the panel is still
 *    holding its full size (morphKeyframes' CLOSE_HOLD). Every row blinking
 *    out on the same frame the box starts collapsing is what read as "you
 *    click and, in one go, the content pops and the container shrinks".
 * 2. Nothing is still aboard by the time the ghost owns the frame — a row
 *    that survives rides the collapse down and prints on top of the icon as a
 *    speck. The panel's top-left transform-origin makes the label the worst
 *    offender: it barely travels, so it stays legible the whole way.
 */

interface Frame {
  t: number;
  phase: string;
  /** Every content row's opacity, in DOM order (label, items, separator). */
  rows: number[];
  ghost: number;
}

/**
 * rAF-samples every menu row's computed opacity across the whole close. The
 * ghost is mounted by the "closing" phase itself, so a missing node means
 * "not this phase yet" — reading it as a number would quietly manufacture an
 * opacity the browser never painted.
 */
async function sampleClose(page: import("@playwright/test").Page): Promise<Frame[]> {
  return page.evaluate(
    () =>
      new Promise<Frame[]>((resolve) => {
        const frames: Frame[] = [];
        const t0 = performance.now();
        const tick = () => {
          const panel = document.querySelector<HTMLElement>("[data-vx-menu]");
          const t = Math.round(performance.now() - t0);
          if (!panel || t > 1000) return resolve(frames);
          const ghost = panel.querySelector(".vx-menu-ghost__inner");
          const rows = [
            ...panel.querySelectorAll(
              "[data-vx-menu-label],[data-vx-menu-item],[data-vx-menu-separator]",
            ),
          ].map((el) => Number(getComputedStyle(el).opacity));
          if (ghost) {
            frames.push({
              t,
              phase: panel.dataset.vxPhase ?? "",
              rows,
              ghost: Number(getComputedStyle(ghost).opacity),
            });
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
}

/**
 * Rows do not all start at the same opacity — a disabled item rests at 0.4 —
 * so compare each row against its OWN brightest sample. What matters is how
 * far through its exit a row is, not its absolute alpha.
 */
function normalize(frames: Frame[]): number[][] {
  const peak = frames[0].rows.map((_, i) => Math.max(...frames.map((f) => f.rows[i]), 0.0001));
  return frames.map((f) => f.rows.map((value, i) => value / peak[i]));
}

async function openThenSample(page: import("@playwright/test").Page): Promise<Frame[]> {
  await page.goto("/menu");
  await page.getByRole("button", { name: "Acciones del documento" }).click();
  await page.locator('[data-vx-menu][data-vx-phase="open"]').waitFor({ timeout: 5000 });

  const sampling = sampleClose(page);
  await page.keyboard.press("Escape");
  const frames = await sampling;

  expect(frames.length, "close should produce sampled frames").toBeGreaterThan(5);
  expect(frames.every((f) => f.phase === "closing")).toBe(true);
  expect(frames[0].rows.length, "the demo menu has label + 4 items + separator").toBe(6);
  return frames;
}

test.describe("menu exit cascade", () => {
  test("rows leave as a top-down wave, never all on the same frame", async ({ page }) => {
    const progress = normalize(await openThenSample(page));

    // The wave only ever runs toward the trigger: a row is never further
    // through its exit than the row above it. The tolerance absorbs subpixel
    // opacity rounding, not a reordering.
    for (const rows of progress) {
      for (let i = 1; i < rows.length; i += 1) {
        expect(
          rows[i],
          `row ${i} should not lead row ${i - 1} out (${rows.join(", ")})`,
        ).toBeGreaterThanOrEqual(rows[i - 1] - 0.02);
      }
    }

    // ...and it is a wave, not a switch: some frame has to catch the rows
    // spread across their exits. Before the stagger they left in lockstep,
    // every row reporting an identical opacity on every frame.
    const spread = Math.max(...progress.map((rows) => Math.max(...rows) - Math.min(...rows)));
    expect(spread, "rows should be caught mid-cascade, at different opacities").toBeGreaterThan(0.4);
  });

  test("nothing but the returning icon is on screen while the panel travels", async ({ page }) => {
    const frames = await openThenSample(page);

    // Once the ghost is more present than absent, the handoff has happened:
    // the panel now reads as the trigger coming back, and any surviving menu
    // content is a foreign body inside it.
    const handoff = frames.filter((f) => f.ghost >= 0.5);
    expect(handoff.length, "the trigger ghost should fade up during the close").toBeGreaterThan(0);

    for (const frame of handoff) {
      expect(
        Math.max(...frame.rows),
        `every row should be invisible once the ghost owns the frame (t=${frame.t}ms, ghost=${frame.ghost})`,
      ).toBeLessThanOrEqual(0.05);
    }
  });
});
