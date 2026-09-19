/**
 * Small CSS-parsing helpers shared by the styles.css contract tests. Not a
 * test file itself (no *.test.ts suffix, lives outside src/) so vitest's
 * `src/**` / `app/**` include globs never pick it up as a suite, and
 * tsdown never bundles it (nothing under src/ imports it).
 */

export function extractCssBlock(css: string, marker: string): string {
  const markerIndex = css.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`CSS: expected to find "${marker}"`);
  }
  const braceStart = css.indexOf("{", markerIndex);
  let depth = 0;
  let i = braceStart;
  for (; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  return css.slice(braceStart + 1, i);
}

export function tokenNames(block: string): Set<string> {
  const names = new Set<string>();
  for (const match of block.matchAll(/(--vx-[\w-]+)\s*:/g)) {
    names.add(match[1]);
  }
  return names;
}

export function readCssProperty(block: string, name: string): string | undefined {
  const match = block.match(new RegExp(`${name}:\\s*([\\s\\S]+?);`));
  return match?.[1]?.trim();
}

/**
 * modes.css declares its dark palette once, in a `:root { --vx-dark-*: … }`
 * block, and both `[data-vx-mode="dark"]` and the `@media` system-dark
 * block reference it via `var(--vx-dark-*)` instead of repeating literals.
 * Tests that want the resolved literal (a hex color, a color-mix()
 * expression, …) resolve that one level of indirection here.
 */
export function resolveDarkAlias(modesCss: string, value: string | undefined): string | undefined {
  if (!value) return value;
  const aliasMatch = value.match(/^var\((--vx-dark-[\w-]+)\)$/);
  if (!aliasMatch) return value;
  const root = extractCssBlock(modesCss, ":root {");
  return readCssProperty(root, aliasMatch[1]);
}
