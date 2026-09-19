import { describe, expect, it } from "vitest";

import { resolveDialogPosition } from "./dialogPlacement";

const viewport = { width: 1000, height: 800 };
const trigger = { top: 700, left: 850, width: 56, height: 56 };
const panel = { width: 400, height: 300 };

describe("resolveDialogPosition", () => {
  it("centers the panel and points the origin back at the trigger", () => {
    const pos = resolveDialogPosition("center", trigger, panel, viewport);

    expect(pos.left).toBe(300);
    expect(pos.top).toBe(250);
    // trigger center (878, 728) relative to panel box -> bottom-right corner
    expect(pos.originX).toBe("100%");
    expect(pos.originY).toBe("100%");
  });

  it("delegates trigger placement to the collision-aware menu logic", () => {
    const pos = resolveDialogPosition(
      "trigger",
      { top: 100, left: 100, width: 56, height: 56 },
      panel,
      viewport,
    );

    expect(pos).toMatchObject({ left: 100, top: 100, originX: "0%", originY: "0%" });
    expect(pos.width).toBeUndefined();
  });
});
