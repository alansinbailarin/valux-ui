import { describe, expect, it } from "vitest";

import { resolveTooltipPosition } from "./tooltipPlacement";

const viewport = { width: 1000, height: 800 };
const panel = { width: 120, height: 28 };

describe("resolveTooltipPosition", () => {
  it("sits ABOVE the trigger with a gap, centered (never overlapping)", () => {
    const pos = resolveTooltipPosition(
      { top: 400, left: 440, width: 120, height: 36 },
      panel,
      viewport,
    );
    expect(pos).toEqual({ left: 440, top: 400 - 28 - 8, side: "top" });
  });

  it("flips below when there is no room above", () => {
    const pos = resolveTooltipPosition(
      { top: 10, left: 440, width: 120, height: 36 },
      panel,
      viewport,
    );
    expect(pos.side).toBe("bottom");
    expect(pos.top).toBe(10 + 36 + 8);
  });

  it("supports explicit sides and clamps to the viewport", () => {
    const pos = resolveTooltipPosition(
      { top: 400, left: 4, width: 40, height: 36 },
      panel,
      viewport,
      "left",
    );
    expect(pos.side).toBe("left");
    expect(pos.left).toBe(8); // clamped to the edge margin
  });
});
