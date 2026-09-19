import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Root-level mode forcing (`<html data-vx-mode="light">`, the no-FOUC
// pattern) must be able to beat a dark OS. The system-dark media blocks
// used to open with a bare `:root, [data-vx-mode="system"]` — equal
// specificity (0,1,0) to the light block but later in the file, so on a
// dark-OS machine an explicit light choice on <html> could never win:
// panels, menus and every surface token stayed dark. The fix gates the
// match with `:where()` (zero added specificity, so themer overrides at
// :root keep their standing) instead of raising specificity.
//
// String-level pinning, like modes-dark-tokens.test.ts: the cascade here
// broke silently once and this shape of regression survives every runtime
// test that only checks one mode at a time.

const FILES_WITH_SYSTEM_DARK_BLOCKS = [
  "src/styles/modes.css",
  "src/styles/menu-tokens.css",
  "src/styles/dialog-tokens.css",
];

describe("system-dark media blocks vs explicit light on :root", () => {
  for (const file of FILES_WITH_SYSTEM_DARK_BLOCKS) {
    it(`${file}: the :root selector steps aside for explicit light`, async () => {
      const raw = await readFile(resolve(file), "utf8");
      // Comments off before scanning: the guard's own explanatory comment
      // (or any future one) may name `:root` in prose.
      const css = raw.replace(/\/\*[\s\S]*?\*\//g, "");
      // Brace-bounded extraction, not split(): a naive split leaks every
      // rule AFTER the dark block into it — this test's first draft flagged
      // the (correctly bare) :root of a later @media (pointer: coarse).
      const mediaBlocks = css
        .split("@media (prefers-color-scheme: dark)")
        .slice(1)
        .map((tail) => {
          let depth = 0;
          for (let i = tail.indexOf("{"); i < tail.length; i += 1) {
            if (tail[i] === "{") depth += 1;
            if (tail[i] === "}" && (depth -= 1) === 0) return tail.slice(0, i);
          }
          return tail;
        });

      expect(
        mediaBlocks.length,
        `${file} should contain a system-dark media block`,
      ).toBeGreaterThan(0);

      for (const block of mediaBlocks) {
        // Any :root inside the dark block must carry the guard…
        const roots = block.match(/:root[^\s,{]*/g) ?? [];
        for (const selector of roots) {
          expect(
            selector,
            `${file}: bare :root inside a dark media block beats explicit light`,
          ).toBe(':root:where(:not([data-vx-mode="light"]))');
        }
      }
    });
  }
});
