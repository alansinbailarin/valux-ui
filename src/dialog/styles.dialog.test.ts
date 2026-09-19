import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("dialog stylesheet contracts", () => {
  it("defines a modal dialog surface, scrim fade, and sheet modifier", async () => {
    const [tokens, scrim, content] = await Promise.all([
      readFile(resolve("src/styles/dialog-tokens.css"), "utf8"),
      readFile(resolve("src/styles/dialog-scrim.css"), "utf8"),
      readFile(resolve("src/styles/dialog-content.css"), "utf8"),
    ]);

    expect(tokens).toContain("--vx-dialog-z: 1200;");
    // Derived from the shared overlay plane, which is where the theme
    // primary wash lives (see src/contracts/surface-ladder.test.ts).
    expect(tokens).toMatch(
      /--vx-dialog-surface:[\s\S]*?var\(--vx-surface-3\)/,
    );
    expect(tokens).not.toContain("#ffffff");
    expect(tokens).toContain("--vx-dialog-scrim:");
    expect(scrim).toMatch(/\[data-vx-dialog-scrim\]\s*\{[^}]*position:\s*fixed;/);
    expect(scrim).toContain('[data-vx-dialog-scrim][data-vx-phase="closing"]');
    expect(content).toMatch(/\[data-vx-dialog\]\s*\{[^}]*width:\s*max-content;/);
    expect(content).toContain('.vx-dialog-trigger[data-vx-morph-origin="hidden"]');
    expect(content).toContain(".vx-dialog-ghost__inner");
  });

  it("styles the dialog parts: title, description, X, sizes, detached pop", async () => {
    const parts = await readFile(resolve("src/styles/dialog-parts.css"), "utf8");

    expect(parts).toContain(".vx-dialog__title");
    expect(parts).toContain(".vx-dialog__description");
    expect(parts).toMatch(/\.vx-dialog__x\s*\{[^}]*position:\s*absolute;/);
    expect(parts).toContain('[data-vx-dialog][data-vx-size="sm"]');
    expect(parts).toContain('[data-vx-dialog][data-vx-size="lg"]');
    expect(parts).toMatch(/\[data-vx-size="full"\]\s*\{[^}]*height:\s*100dvh;/);
    expect(parts).toContain("[data-vx-dialog][data-vx-detached]");
  });

  it("gives the sheet slide animations, detents, and floating gutters", async () => {
    const sheet = await readFile(resolve("src/styles/sheet.css"), "utf8");

    // FLOATING: detached from every screen edge, radius on all corners.
    expect(sheet).toMatch(
      /\[data-vx-sheet\]\s*\{[^}]*bottom:\s*max\(var\(--vx-sheet-gutter\)/,
    );
    expect(sheet).toMatch(/border-radius:\s*var\(--vx-dialog-radius\);/);
    expect(sheet).toContain("@keyframes vx-sheet-up");
    expect(sheet).toContain(':not([data-vx-skip-morph])');
    expect(sheet).toContain('[data-vx-sheet][data-vx-height="half"]');
    expect(sheet).toContain("[data-vx-sheet][data-vx-expanded]");
    expect(sheet).toContain('[data-vx-sheet][data-vx-height="full"]');
    expect(sheet).toContain("env(safe-area-inset-bottom)");
    expect(sheet).toContain("env(safe-area-inset-top)");
  });

  it("lays out Header/Body/Footer with a pinned-chrome scroll region and toned icon", async () => {
    const layout = await readFile(resolve("src/styles/dialog-layout.css"), "utf8");

    expect(layout).toContain(":has(.vx-dialog__body)");
    expect(layout).toMatch(/\.vx-dialog__body[\s\S]{0,120}overflow-y:\s*auto;/);
    expect(layout).toContain(".vx-dialog__footer");
    expect(layout).toContain("flex-direction: column-reverse;");
    expect(layout).toContain('.vx-dialog__icon[data-vx-tone="danger"]');
    expect(layout).toContain(".vx-sheet__footer");
    expect(layout).toMatch(/\.vx-dialog__fog[\s\S]{0,200}position:\s*sticky;/);
    expect(layout).toContain("[data-vx-scrolled] > .vx-dialog__fog");
  });

  it("shares ONE pronounced radius token across button, menu, and dialog", async () => {
    const [tokens, variants, menu, dialog] = await Promise.all([
      readFile(resolve("src/styles/tokens.css"), "utf8"),
      readFile(resolve("src/styles/variants.css"), "utf8"),
      readFile(resolve("src/styles/menu-tokens.css"), "utf8"),
      readFile(resolve("src/styles/dialog-tokens.css"), "utf8"),
    ]);

    expect(tokens).toContain("--vx-radius-control: 1rem;");
    expect(variants).not.toContain("data-vx-radius");
    expect(menu).toContain(
      "--vx-menu-radius: calc(var(--vx-radius-control) * 1.5);",
    );
    expect(menu).toContain("--vx-menu-item-radius: 999px;");
    expect(dialog).toContain(
      "--vx-dialog-radius: calc(var(--vx-radius-control) * 1.5);",
    );
  });
});
