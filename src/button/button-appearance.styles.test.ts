import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { readCssProperty, resolveDarkAlias } from "../../test/cssTokens";

describe("Button appearance styles", () => {
  it("maps semantic colors into reusable Button variables", async () => {
    const css = await readFile(resolve("src/styles/button-colors.css"), "utf8");

    expect(css).toContain('[data-vx-color="primary"]');
    expect(css).toContain('[data-vx-color="neutral"]');
    expect(css).toContain('[data-vx-color="danger"]');
    expect(css).toContain("--vx-button-solid-tone:");
    expect(css).toContain("--vx-button-accent-tone:");
    expect(css).toContain("--vx-button-on-tone:");
    expect(css).toContain("--vx-button-foreground-tone:");
    expect(css).toContain("var(--vx-color-primary-solid)");
    expect(css).toContain("var(--vx-color-danger-solid)");
  });

  it("maps neutral to the adaptive on-surface tone (black in light, white in dark)", async () => {
    const css = await readFile(resolve("src/styles/button-colors.css"), "utf8");
    const neutral = css.match(
      /\[data-vx-color="neutral"\]\s*\{([^}]*)\}/,
    )?.[1];

    expect(neutral).toContain(
      "--vx-button-solid-tone: var(--vx-color-on-surface);",
    );
    expect(neutral).toContain(
      "--vx-button-on-tone: var(--vx-color-surface);",
    );
    expect(neutral).toContain(
      "--vx-button-foreground-tone: var(--vx-color-on-surface);",
    );
  });

  it("lightens the primary foreground for dark mode contrast", async () => {
    const [colors, modes] = await Promise.all([
      readFile(resolve("src/styles/button-colors.css"), "utf8"),
      readFile(resolve("src/styles/modes.css"), "utf8"),
    ]);
    const primary = colors.match(/\[data-vx-color="primary"\]\s*\{([^}]*)\}/)?.[1];
    const dark = modes.match(/\[data-vx-mode="dark"\]\s*\{([^}]*)\}/)?.[1];

    // Foreground uses (soft/ghost/outline text) read a mode-aware token...
    expect(primary).toContain(
      "--vx-button-foreground-tone: var(--vx-color-primary-foreground);",
    );
    // ...which dark mode lightens so brand text stays readable on dark.
    // Dark's literal palette lives once in modes.css's :root alias block;
    // the [data-vx-mode="dark"] block just references it via var().
    const foreground = resolveDarkAlias(
      modes,
      readCssProperty(dark ?? "", "--vx-color-primary-foreground"),
    );
    expect(foreground).toMatch(
      /^color-mix\(\s*in srgb,\s*#f4f4f5 \d+%,\s*#ffffff\s*\)$/,
    );
  });

  it("maps success, warning, and info to their semantic tokens", async () => {
    const css = await readFile(resolve("src/styles/button-colors.css"), "utf8");

    for (const color of ["success", "warning", "info"]) {
      expect(css).toContain(`[data-vx-color="${color}"]`);
      expect(css).toContain(`var(--vx-color-${color}-solid)`);
      expect(css).toContain(`var(--vx-color-on-${color})`);
      expect(css).toContain(`var(--vx-color-${color}-foreground)`);
    }
  });

  it("defines success, warning, and info tokens in light and dark modes", async () => {
    const css = await readFile(resolve("src/styles/modes.css"), "utf8");
    const light = css.match(/\[data-vx-mode="light"\][^{]*\{([^}]*)\}/)?.[1];
    const dark = css.match(/\[data-vx-mode="dark"\]\s*\{([^}]*)\}/)?.[1];

    for (const color of ["success", "warning", "info"]) {
      expect(light).toContain(`--vx-color-${color}-solid:`);
      expect(light).toContain(`--vx-color-on-${color}:`);
      expect(dark).toContain(`--vx-color-${color}-solid:`);
      expect(dark).toContain(`--vx-color-on-${color}:`);
    }
  });

  it("defines every variant from semantic variables", async () => {
    const css = await readFile(
      resolve("src/styles/button-variants.css"),
      "utf8",
    );

    for (const variant of ["solid", "outline", "soft", "ghost"]) {
      expect(css).toContain(`[data-vx-variant="${variant}"]`);
    }
    expect(css).toContain("var(--vx-button-solid-tone)");
    expect(css).toContain("var(--vx-button-accent-tone)");
    expect(css).toContain("var(--vx-button-on-tone)");
    expect(css).not.toContain("--vx-button-variant-shadow:"); // flat by default
    expect(css).toContain("transparent 60%");
  });

  it.each([
    ["xs", "1.75rem", "0.75rem"],
    ["sm", "2rem", "0.8125rem"],
    ["md", "2.5rem", "0.875rem"],
    ["lg", "3rem", "1rem"],
  ])(
    "maps the %s size override to control tokens",
    async (size, height, fontSize) => {
      const css = await readFile(
        resolve("src/styles/button-sizes.css"),
        "utf8",
      );
      const block = css.match(
        new RegExp(`\\.vx-button\\[data-vx-size="${size}"\\] \\{([^}]*)\\}`),
      )?.[1];

      expect(block).toContain(`--vx-control-height: ${height};`);
      expect(block).toContain(`--vx-font-size-control: ${fontSize};`);
    },
  );

  it("uses a dark danger solid with white text in dark mode", async () => {
    const css = await readFile(resolve("src/styles/modes.css"), "utf8");
    const darkMode = css.match(
      /\[data-vx-mode="dark"\]\s*\{([^}]*)\}/,
    )?.[1];

    // The literal palette lives once in modes.css's :root alias block; the
    // [data-vx-mode="dark"] block references it via var().
    expect(resolveDarkAlias(css, readCssProperty(darkMode ?? "", "--vx-color-danger-solid"))).toBe(
      "#b91c1c",
    );
    expect(resolveDarkAlias(css, readCssProperty(darkMode ?? "", "--vx-color-on-danger"))).toBe(
      "#ffffff",
    );
  });
});
