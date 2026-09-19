/**
 * CSS custom-property + color-mix() resolver, plus the WCAG relative-
 * luminance/contrast math. Used by scripts/audit-contrast.mjs to compute
 * real contrast ratios from the kit's own CSS files without a browser. The
 * contrast math mirrors src/theme/color/primaryContrast.ts exactly (same
 * coefficients, same formula) — reimplemented in plain JS because that
 * file is TypeScript and this script must stay pure Node.
 */
import { splitTopLevelArgs } from "./contrast-css.mjs";

// The trailing percentage in a color-mix() argument is sometimes itself a
// var() (e.g. `var(--vx-color-primary) var(--vx-surface-tint)`, where
// --vx-surface-tint: 0%). Resolve that indirection before falling back to
// treating the whole token as an unqualified color.
function resolvePercentToken(token, tokenMap, seen) {
  const literal = /^(\d+(?:\.\d+)?)%$/.exec(token.trim());
  if (literal) return Number(literal[1]);
  const varMatch = /^var\(\s*(--[\w-]+)\s*\)$/.exec(token.trim());
  if (varMatch && tokenMap.has(varMatch[1]) && !seen.has(varMatch[1])) {
    return resolvePercentToken(tokenMap.get(varMatch[1]), tokenMap, new Set([...seen, varMatch[1]]));
  }
  return null;
}

function splitColorAndPercent(token, tokenMap, seen) {
  const match = /^([\s\S]*?)\s+(\S+)\s*$/.exec(token.trim());
  if (!match) return { color: token.trim(), percent: null };
  const percent = resolvePercentToken(match[2], tokenMap, seen);
  return percent === null ? { color: token.trim(), percent: null } : { color: match[1].trim(), percent };
}

function parseHex(value) {
  const short = /^#([\da-f])([\da-f])([\da-f])$/i.exec(value);
  if (short) return short.slice(1).map((c) => Number.parseInt(c + c, 16));
  const full = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value);
  return full ? full.slice(1).map((c) => Number.parseInt(c, 16)) : null;
}

function parseFunctionalRgb(value) {
  const match = /^rgba?\(\s*([\d.]+)\s*,?\s*([\d.]+)\s*,?\s*([\d.]+)\s*(?:[,/]\s*([\d.]+))\s*\)$/i.exec(value) ??
    /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/i.exec(value);
  if (!match) return null;
  return { rgb: [Number(match[1]), Number(match[2]), Number(match[3])], alpha: match[4] ? Number(match[4]) : 1 };
}

// Resolves a raw CSS value (hex, rgb()/rgba(), var(), color-mix(), or the
// black/white/transparent keywords) to { rgb: [r,g,b], alpha } in the given
// token map. Returns null when the value is something this audit script
// deliberately doesn't guess at (currentcolor, gradients, etc.) — callers
// list those as "unresolved" rather than fabricating a ratio.
export function resolveValue(rawValue, tokenMap, seen = new Set()) {
  const value = rawValue.trim();

  if (/^transparent$/i.test(value)) return { rgb: [0, 0, 0], alpha: 0 };
  if (/^black$/i.test(value)) return { rgb: [0, 0, 0], alpha: 1 };
  if (/^white$/i.test(value)) return { rgb: [255, 255, 255], alpha: 1 };
  if (/^currentcolor$/i.test(value)) return null;

  const hex = parseHex(value);
  if (hex) return { rgb: hex, alpha: 1 };

  const functional = parseFunctionalRgb(value);
  if (functional) return functional;

  const varMatch = /^var\(\s*(--[\w-]+)\s*(?:,([\s\S]+))?\)$/.exec(value);
  if (varMatch) {
    const [, name, fallback] = varMatch;
    if (seen.has(name)) return null;
    if (tokenMap.has(name)) return resolveValue(tokenMap.get(name), tokenMap, new Set([...seen, name]));
    return fallback ? resolveValue(fallback, tokenMap, seen) : null;
  }

  const mixMatch = /^color-mix\(([\s\S]+)\)$/.exec(value);
  if (mixMatch) {
    const [, partA, partB] = splitTopLevelArgs(mixMatch[1]);
    if (!partA || !partB) return null;
    const a = splitColorAndPercent(partA, tokenMap, seen);
    const b = splitColorAndPercent(partB, tokenMap, seen);
    const colorA = resolveValue(a.color, tokenMap, seen);
    const colorB = resolveValue(b.color, tokenMap, seen);
    if (!colorA || !colorB) return null;
    let p1 = a.percent;
    let p2 = b.percent;
    if (p1 === null && p2 === null) [p1, p2] = [50, 50];
    else if (p1 === null) p1 = 100 - p2;
    else if (p2 === null) p2 = 100 - p1;
    const w1 = p1 / 100;
    const w2 = p2 / 100;
    const alpha = colorA.alpha * w1 + colorB.alpha * w2;
    const rgb = alpha === 0
      ? [0, 0, 0]
      : colorA.rgb.map((c, i) => (c * colorA.alpha * w1 + colorB.rgb[i] * colorB.alpha * w2) / alpha);
    return { rgb, alpha };
  }

  return null;
}

export function compositeOver(fg, bgRgb) {
  if (fg.alpha >= 1) return fg.rgb;
  return fg.rgb.map((c, i) => c * fg.alpha + bgRgb[i] * (1 - fg.alpha));
}

function linearize(channel) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance([r, g, b]) {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function contrastRatio(rgbA, rgbB) {
  const lighter = Math.max(luminance(rgbA), luminance(rgbB));
  const darker = Math.min(luminance(rgbA), luminance(rgbB));
  return (lighter + 0.05) / (darker + 0.05);
}
