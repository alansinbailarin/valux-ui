import { describe, expect, it } from "vitest";

import { resolvePlacement } from "./placement";

const viewport = { width: 1000, height: 800 };
const panel = { width: 200, height: 180 };

describe("resolvePlacement", () => {
  it("auto: opens down-right (bottom/start) when there is room", () => {
    const r = resolvePlacement(
      { top: 100, left: 100, width: 52, height: 52 },
      panel,
      viewport,
    );
    expect(r).toMatchObject({ side: "bottom", align: "start", left: 100, top: 100 });
  });

  it("flips to top when there is no room below", () => {
    const r = resolvePlacement(
      { top: 700, left: 100, width: 52, height: 52 },
      panel,
      viewport,
    );
    expect(r.side).toBe("top");
    expect(r.top).toBe(572);
  });

  it("aligns end when there is no room to the right", () => {
    const r = resolvePlacement(
      { top: 100, left: 900, width: 52, height: 52 },
      panel,
      viewport,
    );
    expect(r.align).toBe("end");
    expect(r.left).toBe(752);
  });

  it("clamps to stay within the viewport", () => {
    const r = resolvePlacement(
      { top: 100, left: 950, width: 52, height: 52 },
      panel,
      viewport,
      "bottom",
      "start",
    );
    expect(r.left).toBe(792);
  });

  it("honors an explicit side and align", () => {
    const r = resolvePlacement(
      { top: 100, left: 100, width: 52, height: 52 },
      panel,
      viewport,
      "top",
      "end",
    );
    expect(r).toMatchObject({ side: "top", align: "end" });
  });
});
