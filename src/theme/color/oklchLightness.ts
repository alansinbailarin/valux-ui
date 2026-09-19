import type { Rgb } from "./color.types";

function linearize(channel: number): number {
  const value = channel / 255;

  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}

/** OKLab/OKLCH lightness (0-100) of an sRGB color. Used by surface
 * contrast rules (e.g. Card's dark-mode raised-vs-base check). */
export function oklchLightness([red, green, blue]: Rgb): number {
  const r = linearize(red);
  const g = linearize(green);
  const b = linearize(blue);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return (0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s) * 100;
}
