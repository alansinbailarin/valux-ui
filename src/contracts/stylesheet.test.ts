import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("public stylesheet", () => {
  it("imports ordered modules that preserve theme and Button behavior", async () => {
    const entry = await readFile(resolve("src/styles.css"), "utf8");

    expect(entry.trim()).toBe(
      [
        '@import "./styles/tokens.css";',
        '@import "./styles/modes.css";',
        '@import "./styles/variants.css";',
        '@import "./styles/button-colors.css";',
        '@import "./styles/button-variants.css";',
        '@import "./styles/button.css";',
        '@import "./styles/button-content.css";',
        '@import "./styles/button-sizes.css";',
        '@import "./styles/menu-tokens.css";',
        '@import "./styles/menu-content.css";',
        '@import "./styles/menu-item.css";',
        '@import "./styles/dialog-tokens.css";',
        '@import "./styles/dialog-scrim.css";',
        '@import "./styles/dialog-content.css";',
        '@import "./styles/dialog-parts.css";',
        '@import "./styles/dialog-layout.css";',
        '@import "./styles/sheet.css";',
        '@import "./styles/popover.css";',
        '@import "./styles/tooltip.css";',
        '@import "./styles/toast.css";',
        '@import "./styles/input.css";',
        '@import "./styles/switch.css";',
        '@import "./styles/checkbox.css";',
        '@import "./styles/radio.css";',
        '@import "./styles/select.css";',
        '@import "./styles/drawer.css";',
        '@import "./styles/card.css";',
        '@import "./styles/card-parts.css";',
        '@import "./styles/transitions.css";',
        '@import "./styles/cursor.css";',
        '@import "./styles/mode-orb.css";',
      ].join("\n"),
    );

    const css = (
      await Promise.all(
        ["tokens.css", "modes.css", "variants.css", "button.css"].map(
          (file) => readFile(resolve("src/styles", file), "utf8"),
        ),
      )
    ).join("\n");

    expect(css).toContain("--vx-color-primary:");
    expect(css).toContain("--vx-color-on-primary:");
    expect(css).toContain("--vx-color-danger:");
    expect(css).toContain("--vx-color-danger-foreground:");
    expect(css).toContain("--vx-color-surface:");
    expect(css).toContain("--vx-color-surface-raised:");
    expect(css).toContain("--vx-color-on-surface:");
    expect(css).toContain("--vx-radius-control:");
    expect(css).toContain("--vx-control-height:");
    expect(css).toContain("--vx-font-family:");
    expect(css).toContain('[data-vx-mode="dark"]');
    expect(css).toContain("--vx-radius-control: 1rem;");
    expect(css).toContain('[data-vx-density="xs"]');
    expect(css).toContain('[data-vx-density="lg"]');
    expect(css).toMatch(
      /\.vx-button\s*\{[^}]*background:\s*var\(--vx-button-background\);/,
    );
    expect(css).toMatch(
      /\.vx-button\s*\{[^}]*color:\s*var\(--vx-button-foreground\);/,
    );
    expect(css).toMatch(/\.vx-button\s*\{[^}]*cursor:\s*pointer;/);
    expect(css).toMatch(
      /\.vx-button:disabled,[^{]+\{[^}]*cursor:\s*not-allowed;/,
    );
    expect(css).toContain(".vx-button:focus-visible");
    expect(css).toMatch(
      /\.vx-button:focus-visible\s*\{[^}]*outline:\s*none;/,
    );
    expect(css).toMatch(
      /\.vx-button:focus-visible\s*\{[^}]*border-color:\s*var\(--vx-color-focus\);/,
    );
    expect(css).toMatch(
      /\.vx-button\s*\{[^}]*transition:[^}]*opacity[^}]*filter/,
    );
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("provides a CSS press fallback that reduced motion disables", async () => {
    const button = await readFile(resolve("src/styles/button.css"), "utf8");

    expect(button).toMatch(
      /\.vx-button:active:not\(:disabled\):not\(\[aria-disabled="true"\]\)\s*\{[^}]*transform:\s*translateY/,
    );

    const reducedMotion = button.slice(
      button.indexOf("@media (prefers-reduced-motion"),
    );
    expect(reducedMotion).toMatch(
      /\.vx-button:active\s*\{[^}]*transform:\s*none;/,
    );
  });

  it("defines a content-sized morphing menu surface and item stagger", async () => {
    const [tokens, content, item] = await Promise.all([
      readFile(resolve("src/styles/menu-tokens.css"), "utf8"),
      readFile(resolve("src/styles/menu-content.css"), "utf8"),
      readFile(resolve("src/styles/menu-item.css"), "utf8"),
    ]);

    expect(tokens).toContain("--vx-menu-surface:");
    expect(tokens).toContain("--vx-menu-z:");
    // The menu surface is the kit's overlay plane at the menu's own opacity.
    // --vx-surface-3 is what carries the wash of the theme primary color, in
    // BOTH modes — light panels used to be pinned to #ffffff and ignored the
    // theme entirely. src/contracts/surface-ladder.test.ts proves the chain
    // and the resulting color; here we just pin the wiring.
    expect(tokens).toMatch(/--vx-menu-surface:[\s\S]*?var\(--vx-surface-3\)/);
    expect(tokens).not.toContain("#ffffff");
    expect(content).toMatch(/\[data-vx-menu\]\s*\{[^}]*width:\s*max-content;/);
    expect(content).toContain("transform-origin: top left;");
    expect(item).toContain("[data-vx-menu-item]");
    expect(item).toContain("[data-vx-menu-item][data-vx-destructive]");
  });

  it("does not match Button declarations from a later selector", () => {
    const css = ".vx-button { color: inherit; } .other { cursor: pointer; }";

    expect(css).not.toMatch(/\.vx-button\s*\{[^}]*cursor:\s*pointer;/);
  });

  it.each([
    ["xs", "0.75rem", "1rem"],
    ["sm", "0.8125rem", "1.125rem"],
    ["md", "0.875rem", "1.25rem"],
    ["lg", "1rem", "1.5rem"],
  ])(
    "maps %s density to control typography",
    async (density, fontSize, lineHeight) => {
      const css = await readFile(resolve("src/styles/variants.css"), "utf8");
      const block = css.match(
        new RegExp(`\\[data-vx-density="${density}"\\] \\{([^}]*)\\}`),
      )?.[1];

      expect(block).toContain(`--vx-font-size-control: ${fontSize};`);
      expect(block).toContain(`--vx-line-height-control: ${lineHeight};`);
    },
  );

  it.each([
    ["xs", "0.375rem"],
    ["sm", "0.5rem"],
    ["md", "0.625rem"],
    ["lg", "0.75rem"],
  ])("maps %s density to icon spacing", async (density, iconGap) => {
    const css = await readFile(resolve("src/styles/variants.css"), "utf8");
    const block = css.match(
      new RegExp(`\\[data-vx-density="${density}"\\] \\{([^}]*)\\}`),
    )?.[1];

    expect(block).toContain(`--vx-button-icon-gap: ${iconGap};`);
  });

  it("drives a themeable, 2px focus ring from a token", async () => {
    const [tokens, button] = await Promise.all([
      readFile(resolve("src/styles/tokens.css"), "utf8"),
      readFile(resolve("src/styles/button.css"), "utf8"),
    ]);

    expect(tokens).toContain("--vx-focus-width: 0.125rem;");
    expect(button).toMatch(
      /\.vx-button:focus-visible\s*\{[^}]*inset 0 0 0 var\(--vx-focus-width\) var\(--vx-color-focus\)/,
    );
  });

  it("keeps Button FLAT by default (no inner highlight, no drop shadow)", async () => {
    const button = await readFile(resolve("src/styles/button.css"), "utf8");

    expect(button).toMatch(
      /\.vx-button\s*\{[^}]*border:\s*1px solid var\(--vx-button-variant-border\);/,
    );
    expect(button).not.toMatch(/\.vx-button\s*\{[^}]*box-shadow:/);
    expect(button).not.toContain("--vx-button-variant-highlight");
    expect(button).toMatch(
      /\.vx-button:disabled,[^{]+\{[^}]*border-color:\s*var\(--vx-color-disabled\);[^}]*box-shadow:\s*none;/,
    );
  });
});
