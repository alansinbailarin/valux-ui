#!/usr/bin/env node
/**
 * Computes WCAG contrast ratios for Valux UI's actual color pairs by
 * parsing the real CSS files — no browser, no jsdom. This is a REPORT, not
 * a gate: it always exits 0 and is not chained into `pnpm verify`.
 *
 * Known-suspect pairs from the audit:
 *  - focus ring vs solid button fills (non-text, SC 2.4.11, 3:1). The ring
 *    is drawn INSET (src/styles/button.css:52-56), so its neighbour is the
 *    button's own fill, not the surface behind it.
 *  - muted text (placeholders, helper/description text, menu shortcuts and
 *    section labels) vs --vx-color-surface-base (SC 1.4.3, 4.5:1).
 *  - control borders vs surface (SC 1.4.11, 3:1).
 *
 * color-mix() is resolved approximately via scripts/lib/contrast-color.mjs
 * (in-srgb premultiplied mixing, matching the CSS Color 4 algorithm for the
 * two forms this codebase uses). Anything that resolver can't handle
 * (currentcolor, etc.) is listed as "unresolved" rather than guessed at.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { stripComments, parseRules, parseDeclarations, getDeclaration, stripBorderShorthand } from "./lib/contrast-css.mjs";
import { resolveValue, compositeOver, contrastRatio } from "./lib/contrast-color.mjs";

const STYLES = resolve(import.meta.dirname, "..", "src/styles");
const css = {};
for (const file of ["tokens", "modes", "input", "select", "checkbox", "radio", "switch", "menu-item", "button-variants", "button-colors"]) {
  css[file] = stripComments(await readFile(resolve(STYLES, `${file}.css`), "utf8"));
}

function mergeDecls(bodies) {
  const merged = new Map();
  for (const body of bodies) for (const [k, v] of parseDeclarations(body)) merged.set(k, v);
  return merged;
}

const tokenRules = parseRules(css.tokens);
const base = mergeDecls(tokenRules.map((r) => r.body));
const modeRules = parseRules(css.modes).filter((r) => !r.selector.startsWith("@media"));
const lightBody = modeRules.find((r) => r.selector.includes('data-vx-mode="light"'))?.body ?? "";
const darkBody = modeRules.find((r) => r.selector === '[data-vx-mode="dark"]')?.body ?? "";
const tokenMaps = {
  light: new Map([...base, ...parseDeclarations(lightBody)]),
  dark: new Map([...base, ...parseDeclarations(darkBody)]),
};

// The outline button border mixes --vx-button-accent-tone (set per
// data-vx-color variant in button-colors.css, not in :root) with
// transparent. We audit the "primary" color variant as the representative
// case, substituting its accent-tone token in textually before resolving.
const outlineBorderRaw = getDeclaration(css["button-variants"], '.vx-button[data-vx-variant="outline"] {', "--vx-button-variant-border");
const accentToneRaw = getDeclaration(css["button-colors"], '.vx-button[data-vx-color="primary"] {', "--vx-button-accent-tone");
const outlineBorder = outlineBorderRaw?.replace("var(--vx-button-accent-tone)", accentToneRaw ?? "var(--vx-button-accent-tone)");

// Menu shortcuts dim via `opacity`, not a color-mix — approximate the
// element's effective color as its inherited on-surface text blended
// toward the background by that same opacity fraction.
const shortcutOpacity = getDeclaration(css["menu-item"], ".vx-menu-item__shortcut {", "opacity");
const shortcutRaw = shortcutOpacity ? `color-mix(in srgb, var(--vx-color-on-surface), transparent ${100 - Number(shortcutOpacity) * 100}%)` : null;

const FOCUS_VS_FILL = ["primary", "danger", "success", "warning", "info"].map((tone) => ({
  section: "focus ring vs solid fill (3:1, non-text)",
  label: `focus vs ${tone}-solid`,
  threshold: 3,
  fgRaw: "var(--vx-color-focus)",
  bgRaw: `var(--vx-color-${tone}-solid)`,
}));

const MUTED_TEXT = [
  ["input.css placeholder", getDeclaration(css.input, ".vx-input__control::placeholder {", "color")],
  ["input.css helper text (.vx-input__msg)", getDeclaration(css.input, ".vx-input__msg {", "color")],
  ["select.css placeholder", getDeclaration(css.select, ".vx-select__value[data-vx-placeholder] {", "color")],
  ["checkbox.css description", getDeclaration(css.checkbox, ".vx-check__description {", "color")],
  ["radio.css description", getDeclaration(css.radio, ".vx-radio__description {", "color")],
  ["switch.css description", getDeclaration(css.switch, ".vx-switch__description {", "color")],
  ["menu-item.css shortcut (opacity-approximated)", shortcutRaw],
  ["menu-item.css section label", getDeclaration(css["menu-item"], "[data-vx-menu-label] {", "color")],
].map(([label, fgRaw]) => ({ section: "muted text vs surface-base (4.5:1)", label, threshold: 4.5, fgRaw, bgRaw: "var(--vx-color-surface-base)" }));

const CONTROL_BORDERS = [
  ["input.css field border", getDeclaration(css.input, ".vx-input {", "--vx-input-line")],
  ["select.css field border", stripBorderShorthand(getDeclaration(css.select, ".vx-select__field {", "border") ?? "")],
  ["checkbox.css box border", stripBorderShorthand(getDeclaration(css.checkbox, ".vx-check__box {", "border") ?? "")],
  ["radio.css ring border", stripBorderShorthand(getDeclaration(css.radio, ".vx-radio__ring {", "border") ?? "")],
  ["switch.css track fill (border-equivalent)", getDeclaration(css.switch, ".vx-switch__track {", "background")],
  ["button-variants.css outline border (primary)", outlineBorder],
].map(([label, fgRaw]) => ({ section: "control borders vs surface (3:1)", label, threshold: 3, fgRaw, bgRaw: "var(--vx-color-surface)" }));

const pairs = [...FOCUS_VS_FILL, ...MUTED_TEXT, ...CONTROL_BORDERS];

function evaluate(pair, tokenMap) {
  if (!pair.fgRaw || !pair.bgRaw) return { status: "unresolved", note: "declaration not found in CSS" };
  const bg = resolveValue(pair.bgRaw, tokenMap);
  const fg = resolveValue(pair.fgRaw, tokenMap);
  if (!bg || !fg) return { status: "unresolved", note: `could not resolve "${!fg ? pair.fgRaw : pair.bgRaw}"` };
  const ratio = contrastRatio(compositeOver(fg, bg.rgb), bg.rgb);
  return { status: ratio >= pair.threshold ? "PASS" : "FAIL", ratio };
}

const rows = [];
let failures = 0;
const unresolved = [];
for (const mode of ["light", "dark"]) {
  for (const pair of pairs) {
    const result = evaluate(pair, tokenMaps[mode]);
    if (result.status === "FAIL") failures += 1;
    if (result.status === "unresolved") unresolved.push(`[${mode}] ${pair.label}: ${result.note}`);
    rows.push([
      mode,
      pair.label,
      result.ratio ? `${result.ratio.toFixed(2)}:1` : "-",
      `${pair.threshold}:1`,
      result.status.toUpperCase(),
    ]);
  }
}

const widths = [0, 0, 0, 0, 0];
for (const row of rows) row.forEach((cell, i) => (widths[i] = Math.max(widths[i], cell.length)));
console.log(["mode", "pair", "ratio", "threshold", "status"].map((h, i) => h.padEnd(widths[i])).join("  "));
for (const row of rows) console.log(row.map((cell, i) => cell.padEnd(widths[i])).join("  "));

if (unresolved.length) {
  console.log("\nUnresolved (not guessed at):");
  for (const line of unresolved) console.log(`  - ${line}`);
}

console.log(`\n${failures} failures`);
