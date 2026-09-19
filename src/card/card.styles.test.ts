import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { readCssProperty, resolveDarkAlias } from "../../test/cssTokens";

describe("Card styles", () => {
  it("defines card tokens on the root", async () => {
    const css = await readFile(resolve("src/styles/tokens.css"), "utf8");
    expect(css).toContain("--vx-card-padding: 1rem;");
    expect(css).toContain("--vx-card-gap: 0.5rem;");
    expect(css).toContain("--vx-card-shadow:");
    expect(css).toContain("--vx-card-border-alpha: 15%;");
    expect(css).toContain("--vx-card-raised-border-alpha: 15%;");
    expect(css).toContain("--vx-card-subtle-alpha: 4%;");
  });

  it("uses the kit's single radius and the shared surface ladder", async () => {
    const css = await readFile(resolve("src/styles/card.css"), "utf8");
    expect(css).toContain("border-radius: var(--vx-radius-control);");
    // Card consumes the ladder (1 = page, 2 = raised), not its own system.
    expect(css).toContain("background: var(--vx-surface-1);");
    expect(css).toContain("background: var(--vx-surface-2);");
    expect(css).not.toMatch(/--vx-card-radius/);
  });

  it("styles the three variants", async () => {
    const css = await readFile(resolve("src/styles/card.css"), "utf8");
    expect(css).toContain('.vx-card[data-vx-variant="outline"]');
    expect(css).toContain('.vx-card[data-vx-variant="elevated"]');
    expect(css).toContain('.vx-card[data-vx-variant="soft"]');
    expect(css).toContain(
      "var(--vx-card-elevated-shadow, var(--vx-card-shadow))",
    );
  });

  it("never relies on shadow in dark: elevated flips to raised surface + highlight via tokens", async () => {
    const modes = await readFile(resolve("src/styles/modes.css"), "utf8");
    const darkBlock =
      modes.match(/\[data-vx-mode="dark"\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    // lift 100% == elevated sits on the raised plane instead of the page.
    expect(
      resolveDarkAlias(
        modes,
        readCssProperty(darkBlock, "--vx-card-elevated-lift"),
      ),
    ).toBe("100%");
    // The literal shadow lives once in modes.css's :root alias block; the
    // [data-vx-mode="dark"] block references it via var().
    const shadow = resolveDarkAlias(
      modes,
      readCssProperty(darkBlock, "--vx-card-shadow"),
    );
    expect(shadow).toContain("inset 0 1px 0");
  });

  it("raises the outline border contrast in dark and drops the raised hairline", async () => {
    const modes = await readFile(resolve("src/styles/modes.css"), "utf8");
    const darkBlock =
      modes.match(/\[data-vx-mode="dark"\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    expect(
      resolveDarkAlias(
        modes,
        readCssProperty(darkBlock, "--vx-card-border-alpha"),
      ),
    ).toBe("22%");
    // Dark already separates elevated/soft with the raised fill + inset
    // highlight, so the light-mode hairline is switched off.
    expect(
      resolveDarkAlias(
        modes,
        readCssProperty(darkBlock, "--vx-card-raised-border-alpha"),
      ),
    ).toBe("0%");
    expect(modes).toContain("--vx-card-border-alpha: 15%;");
  });

  it("exposes padding, per-section surface, and the separator", async () => {
    const [card, parts] = await Promise.all([
      readFile(resolve("src/styles/card.css"), "utf8"),
      readFile(resolve("src/styles/card-parts.css"), "utf8"),
    ]);
    // padding="none" zeroes the TOKENS, so the first/last-child padding
    // rules in card-parts.css follow instead of fighting on specificity.
    expect(card).toMatch(
      /\.vx-card\[data-vx-padding="none"\]\s*\{[^}]*--vx-card-padding:\s*0px;[^}]*--vx-card-gap:\s*0px;/,
    );
    expect(parts).toMatch(
      /\[data-vx-padding="none"\][\s\S]*?\{[^}]*--vx-card-padding:\s*0px;/,
    );
    expect(parts).toContain('.vx-card__header[data-vx-surface="subtle"]');
    expect(parts).toContain('.vx-card__footer[data-vx-surface="subtle"]');
    expect(parts).toContain("var(--vx-card-subtle-alpha)");
    expect(parts).toContain(".vx-card__separator");
    expect(parts).toMatch(
      /\.vx-card__separator\[data-vx-inset="content"\]\s*\{[^}]*--vx-card-separator-inset:\s*var\(--vx-card-padding\);/,
    );
  });

  it("is wired into the public stylesheet after drawer", async () => {
    const entry = await readFile(resolve("src/styles.css"), "utf8");
    const drawer = entry.indexOf('@import "./styles/drawer.css";');
    const card = entry.indexOf('@import "./styles/card.css";');
    const parts = entry.indexOf('@import "./styles/card-parts.css";');
    expect(drawer).toBeGreaterThan(-1);
    expect(card).toBeGreaterThan(drawer);
    expect(parts).toBeGreaterThan(card);
  });
});
