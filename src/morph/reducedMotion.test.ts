import { afterEach, describe, expect, it, vi } from "vitest";

import { prefersReducedMotion } from "./reducedMotion";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("prefersReducedMotion", () => {
  it("is true when the media query matches", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));

    expect(prefersReducedMotion()).toBe(true);
  });

  it("is false when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);

    expect(prefersReducedMotion()).toBe(false);
  });
});
