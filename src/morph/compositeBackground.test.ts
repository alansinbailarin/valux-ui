import { describe, expect, it } from "vitest";

import { compositeOver } from "./compositeBackground";

describe("compositeOver", () => {
  it("blends a translucent glass color over an opaque page color", () => {
    // 88%-alpha white glass over a dark page -> near-white, tinted by the page
    expect(compositeOver("rgba(255, 255, 255, 0.88)", "rgb(10, 10, 20)")).toBe(
      "rgb(226, 226, 227)",
    );
  });

  it("understands Chrome's color(srgb ...) serialization of color-mix", () => {
    expect(
      compositeOver("color(srgb 1 1 1 / 0.5)", "rgb(0, 0, 0)"),
    ).toBe("rgb(128, 128, 128)");
  });

  it("returns null for unparseable colors instead of guessing", () => {
    expect(compositeOver("oklch(0.7 0.1 200)", "rgb(0, 0, 0)")).toBeNull();
  });
});
