import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Button content styles", () => {
  it("defines loading, icon-only, full-width, and reduced-motion behavior", async () => {
    const css = await readFile(resolve("src/styles/button-content.css"), "utf8");

    expect(css).toContain("[data-vx-loading]");
    expect(css).toContain(".vx-button__spinner");
    expect(css).toContain(".vx-button__body");
    expect(css).toContain(".vx-button__loading");
    expect(css).toContain(".vx-button__loading-text");
    expect(css).toContain("[data-vx-icon-only]");
    expect(css).toContain("[data-vx-full-width]");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css.indexOf("[data-vx-full-width]")).toBeGreaterThan(
      css.indexOf("[data-vx-icon-only]"),
    );
    expect(css).toMatch(/\.vx-button__icon\s*>\s*svg[^}]*1\.25em/);
    expect(css).toMatch(
      /\[data-vx-icon-only\][^{]+\.vx-button__content\s*>\s*svg[^}]*1\.375em/,
    );
    expect(css).toMatch(/\.vx-button__body\s*\{[^}]*inline-grid/);
    expect(css).toMatch(
      /\.vx-button__content,[^{]+\.vx-button__loading\s*\{[^}]*grid-area:\s*1\s*\/\s*1/,
    );
    expect(css).toMatch(
      /\.vx-button__content\s*\{[^}]*gap:\s*var\(--vx-button-icon-gap\)/,
    );
    expect(css).toMatch(
      /\.vx-button__loading\s*\{[^}]*gap:\s*var\(--vx-control-gap\)/,
    );
  });
});
