import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  extractCssBlock,
  readCssProperty,
  tokenNames,
} from "../../test/cssTokens";

// src/styles/modes.css defines dark values in two places: explicit
// [data-vx-mode="dark"] and the @media (prefers-color-scheme: dark) block
// that resolves mode="system" (and un-annotated :root) on a dark OS. They
// previously drifted: the system-dark block was missing 12 tokens
// (success, warning, info, and their -solid, -on-, -foreground variants),
// so the default mode shipped light-mode green, amber, and blue on dark
// surfaces. This test pins the two blocks to the same token names so that
// regression can't come back silently.

describe("modes.css dark token parity", () => {
  it("defines the same token names for explicit dark and system-dark", async () => {
    const css = await readFile(resolve("src/styles/modes.css"), "utf8");

    const explicitDark = tokenNames(extractCssBlock(css, '[data-vx-mode="dark"] {'));
    const mediaDarkBlock = extractCssBlock(css, "@media (prefers-color-scheme: dark)");
    const systemDark = tokenNames(extractCssBlock(mediaDarkBlock, '[data-vx-mode="system"]'));

    expect(explicitDark.size).toBeGreaterThan(0);
    expect(systemDark).toEqual(explicitDark);
  });

  it("gives them identical values too, not just identical names", async () => {
    const css = await readFile(resolve("src/styles/modes.css"), "utf8");

    const explicit = extractCssBlock(css, '[data-vx-mode="dark"] {');
    const system = extractCssBlock(
      extractCssBlock(css, "@media (prefers-color-scheme: dark)"),
      '[data-vx-mode="system"]',
    );

    for (const token of tokenNames(explicit)) {
      expect([token, readCssProperty(system, token)]).toEqual([
        token,
        readCssProperty(explicit, token),
      ]);
    }
  });

  it("covers success, warning, and info tokens in both dark blocks (previously missing)", async () => {
    const css = await readFile(resolve("src/styles/modes.css"), "utf8");

    const explicitDark = tokenNames(extractCssBlock(css, '[data-vx-mode="dark"] {'));
    const mediaDarkBlock = extractCssBlock(css, "@media (prefers-color-scheme: dark)");
    const systemDark = tokenNames(extractCssBlock(mediaDarkBlock, '[data-vx-mode="system"]'));

    const previouslyMissing = [
      "--vx-color-success",
      "--vx-color-success-solid",
      "--vx-color-on-success",
      "--vx-color-success-foreground",
      "--vx-color-warning",
      "--vx-color-warning-solid",
      "--vx-color-on-warning",
      "--vx-color-warning-foreground",
      "--vx-color-info",
      "--vx-color-info-solid",
      "--vx-color-on-info",
      "--vx-color-info-foreground",
    ];

    for (const token of previouslyMissing) {
      expect(explicitDark.has(token)).toBe(true);
      expect(systemDark.has(token)).toBe(true);
    }
  });
});
