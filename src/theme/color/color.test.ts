import { describe, expect, it } from "vitest";

import { resolvePrimaryContrast, resolveSurfaceTint } from "./index";
import { oklchLightness } from "./oklchLightness";

function calculateWhiteContrast(color: string): number {
  const channels = color.match(/\d+/g)?.map(Number);

  if (!channels || channels.length !== 3) {
    throw new Error(`Expected an rgb color, received "${color}".`);
  }

  const luminance = channels
    .map((channel) => channel / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    )
    .reduce(
      (total, channel, index) =>
        total + channel * [0.2126, 0.7152, 0.0722][index],
      0,
    );

  return 1.05 / (luminance + 0.05);
}

describe("resolvePrimaryContrast", () => {
  it("slightly darkens a mid-tone primary to support white text", () => {
    const contrast = resolvePrimaryContrast("#8b5cf6");

    expect(contrast.solid).not.toBe("#8b5cf6");
    expect(contrast.foreground).toBe("#ffffff");
    expect(calculateWhiteContrast(contrast.solid)).toBeGreaterThanOrEqual(4.5);
  });

  it("preserves a genuinely light primary with dark text", () => {
    expect(resolvePrimaryContrast("#fef08a")).toEqual({
      solid: "#fef08a",
      foreground: "#18181b",
    });
  });

  it("preserves explicit consumer contrast choices", () => {
    expect(
      resolvePrimaryContrast("var(--brand)", "var(--brand-text)"),
    ).toEqual({
      solid: "var(--brand)",
      foreground: "var(--brand-text)",
    });
  });
});

describe("resolvePrimaryContrast foreground", () => {
  it("chooses the higher-contrast foreground for hex colors", () => {
    expect(resolvePrimaryContrast("#fef08a").foreground).toBe("#18181b");
    expect(resolvePrimaryContrast("#18181b").foreground).toBe("#ffffff");
    expect(resolvePrimaryContrast("#f00").foreground).toBe("#ffffff");
  });

  it("supports integer and percentage rgb colors", () => {
    expect(resolvePrimaryContrast("rgb(254, 240, 138)").foreground).toBe(
      "#18181b",
    );
    expect(resolvePrimaryContrast("rgb(9% 9% 11%)").foreground).toBe("#ffffff");
  });

  it("preserves an explicit foreground for any CSS color", () => {
    expect(
      resolvePrimaryContrast("var(--brand)", "var(--brand-text)").foreground,
    ).toBe("var(--brand-text)");
  });

  it("rejects unsupported colors without an explicit foreground", () => {
    expect(() => resolvePrimaryContrast("var(--brand)")).toThrow(
      /set color\.onPrimary/i,
    );
  });
});

describe("resolveSurfaceTint", () => {
  it("maps the public 0-100 range to 0-20 percent", () => {
    expect(resolveSurfaceTint(0)).toEqual({ surface: "0%", raised: "0%" });
    expect(resolveSurfaceTint(50)).toEqual({ surface: "10%", raised: "6%" });
    expect(resolveSurfaceTint(100)).toEqual({ surface: "20%", raised: "12%" });
  });

  it("clamps out-of-range values", () => {
    expect(resolveSurfaceTint(-1)?.surface).toBe("0%");
    expect(resolveSurfaceTint(120)?.surface).toBe("20%");
  });

  it("returns undefined when omitted and rejects non-finite values", () => {
    expect(resolveSurfaceTint()).toBeUndefined();
    expect(() => resolveSurfaceTint(Number.NaN)).toThrow(/finite number/i);
    expect(() => resolveSurfaceTint(Number.POSITIVE_INFINITY)).toThrow(
      /finite number/i,
    );
  });
});

describe("oklchLightness", () => {
  it("returns 0 for black and 100 for white", () => {
    expect(oklchLightness([0, 0, 0])).toBeCloseTo(0, 5);
    expect(oklchLightness([255, 255, 255])).toBeCloseTo(100, 0);
  });

  it("orders the default dark surfaces (raised is lighter than base)", () => {
    const base = oklchLightness([9, 9, 11]); // #09090b
    const raised = oklchLightness([24, 24, 27]); // #18181b
    expect(raised).toBeGreaterThan(base);
  });
});
