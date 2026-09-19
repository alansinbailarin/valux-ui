import { describe, expect, it } from "vitest";

import {
  buildGhostReturnKeyframes,
  buildMorphKeyframes,
  DIALOG_PRESET,
} from "./morphKeyframes";

// Trigger 56x56 over a 200x180 panel.
const bx = 56 / 200;
const by = 56 / 180;

describe("buildMorphKeyframes", () => {
  it("applies preset streak and blur (DIALOG travels softer with more blur)", () => {
    const frames = buildMorphKeyframes("open", bx, by, { preset: DIALOG_PRESET });
    const streakX = bx + (1 - bx) * DIALOG_PRESET.streak;

    expect(frames[2].transform).toContain(`scale(${streakX}`);
    expect(frames[2].filter).toBe(`blur(${DIALOG_PRESET.blur}px)`);
  });


  it("travels: compressed keyframes carry the full translate to the trigger, settled ones none", () => {
    const travel = { x: -320, y: -140 };
    const open = buildMorphKeyframes("open", bx, by, { travel });
    const close = buildMorphKeyframes("close", bx, by, { travel });

    // open: starts at the trigger, ends at the panel's own place
    expect(open[0].transform).toBe(`translate(-320px,-140px) scale(${bx},${by})`);
    expect(open[open.length - 1].transform).toBe("scale(1,1)");
    // close: starts in place, lands exactly on the trigger
    expect(close[0].transform).toBe("scale(1,1)");
    expect(String(close[close.length - 1].transform)).toContain("translate(-320px,-140px)");
    // mid-flight frames sit strictly between the endpoints
    const mid = /translate\((-?[\d.]+)px,(-?[\d.]+)px\)/.exec(String(open[2].transform));
    expect(mid).not.toBeNull();
    expect(Number(mid?.[1])).toBeGreaterThan(-320);
    expect(Number(mid?.[1])).toBeLessThan(0);
  });

  it("open: starts as the trigger circle and settles as the panel rect", () => {
    const frames = buildMorphKeyframes("open", bx, by);

    expect(frames[0]).toMatchObject({
      offset: 0,
      transform: `scale(${bx},${by})`,
      borderRadius: "999px",
      filter: "blur(0px)",
    });
    expect(frames[frames.length - 1]).toMatchObject({
      offset: 1,
      transform: "scale(1,1)",
      filter: "blur(0px)",
    });
  });

  it("open: dips below trigger scale (anticipation) then exceeds 1 (overshoot)", () => {
    const frames = buildMorphKeyframes("open", bx, by);
    const anticipation = frames[1].transform as string;
    const overshoot = frames.some((frame) =>
      /scale\(1\.\d+/.test(String(frame.transform)),
    );

    expect(anticipation).toContain(`scale(${bx * 0.8}`);
    expect(overshoot).toBe(true);
  });

  it("open: blurs during travel and is sharp at both ends", () => {
    const frames = buildMorphKeyframes("open", bx, by);
    const blurs = frames.map((frame) =>
      Number(String(frame.filter).match(/blur\(([\d.]+)px\)/)?.[1]),
    );

    expect(Math.max(...blurs)).toBeGreaterThanOrEqual(10);
    expect(blurs[0]).toBe(0);
    expect(blurs[blurs.length - 1]).toBe(0);
  });

  it("settles at the provided panel radius instead of a hardcoded one", () => {
    const open = buildMorphKeyframes("open", bx, by, { settleRadius: "8px" });
    const close = buildMorphKeyframes("close", bx, by, { settleRadius: "8px" });

    expect(open[open.length - 1].borderRadius).toBe("8px");
    expect(close[0].borderRadius).toBe("8px");
  });

  it("close: crossfades out at the tail so the trigger beneath takes over", () => {
    const frames = buildMorphKeyframes("close", bx, by);

    expect(frames[0].opacity).toBe(1);
    expect(frames[frames.length - 1].opacity).toBe(0);
  });

  it("ghost: lands near-natural so the real content settles without a bounce", () => {
    const frames = buildGhostReturnKeyframes(bx, by);
    const last = frames[frames.length - 1];

    // Starts at natural size inside the full panel; lands a whisper small and
    // the real content finishes the settle with a plain ease-out (no rebound).
    expect(frames[0].transform).toBe("scale(1.0000,1.0000)");
    expect(last.transform).toBe(
      `scale(${(0.95 / bx).toFixed(4)},${(0.95 / by).toFixed(4)})`,
    );
    expect(frames[0].opacity).toBe(0);
    expect(last.opacity).toBe(1);
    expect(frames.map((f) => f.offset)).toEqual([
      0, 0.14, 0.24, 0.34, 0.46, 0.6, 0.74, 0.82, 0.9, 1,
    ]);
  });

  it("ghost: mirrors the panel stop for stop, so the pair cannot drift", () => {
    const panel = buildMorphKeyframes("close", bx, by);
    const ghost = buildGhostReturnKeyframes(bx, by);

    expect(ghost.map((f) => f.offset)).toEqual(panel.map((f) => f.offset));
  });

  it("close: every stop moves BOTH axes — neither one parks mid-flight", () => {
    const frames = buildMorphKeyframes("close", bx, by);
    const scales = frames.map((frame) => {
      const [, x, y] = /scale\(([\d.]+),([\d.]+)\)/.exec(String(frame.transform)) ?? [];
      return { x: Number(x), y: Number(y) };
    });

    // v9 held the width at exactly 1 for the first 41% (which reads as the
    // panel stretching sideways) and then froze the height while the width
    // caught up. Both axes must descend on every segment until they land.
    for (let i = 1; i < scales.length; i += 1) {
      const landed = scales[i - 1].x === bx && scales[i - 1].y === by;
      if (landed) continue;
      expect(scales[i].x, `width should keep moving at stop ${i}`).toBeLessThan(scales[i - 1].x);
      expect(scales[i].y, `height should keep moving at stop ${i}`).toBeLessThan(scales[i - 1].y);
    }
  });

  it("close: contracts monotonically — no undershoot past the trigger, no rebound", () => {
    const frames = buildMorphKeyframes("close", bx, by);

    for (const frame of frames) {
      const [, x, y] = /scale\(([\d.]+),([\d.]+)\)/.exec(String(frame.transform)) ?? [];
      expect(Number(x)).toBeGreaterThanOrEqual(bx);
      expect(Number(y)).toBeGreaterThanOrEqual(by);
    }
  });

  it("close: the corners are resolved before the body lands", () => {
    const frames = buildMorphKeyframes("close", bx, by, { settleRadius: "8px" });
    const landing = frames.filter((frame) => (frame.offset ?? 0) >= 0.46);

    // A radius still settling under an arriving body was the "and THEN the
    // corners show up" beat. Past the streak it never changes again.
    expect(landing.every((frame) => frame.borderRadius === "999px")).toBe(true);
    expect(frames[0].borderRadius).toBe("8px");
  });

  it("close: reverses back to the rounded trigger circle", () => {
    const frames = buildMorphKeyframes("close", bx, by);

    expect(frames[0]).toMatchObject({ offset: 0, transform: "scale(1,1)" });
    expect(frames[frames.length - 1]).toMatchObject({
      offset: 1,
      transform: `scale(${bx},${by})`,
      borderRadius: "999px",
      filter: "blur(0px)",
    });
  });
});
