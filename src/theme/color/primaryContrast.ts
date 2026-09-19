import type { PrimaryContrast, Rgb } from "./color.types";
import { parseColor } from "./parseColor";

const DARK_FOREGROUND = "#18181b";
const LIGHT_FOREGROUND = "#ffffff";
const MINIMUM_TEXT_CONTRAST = 4.5;
const HIGH_DARK_CONTRAST = 7;

function linearize(channel: number): number {
  const value = channel / 255;

  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}

function calculateLuminance([red, green, blue]: Rgb): number {
  return (
    0.2126 * linearize(red) +
    0.7152 * linearize(green) +
    0.0722 * linearize(blue)
  );
}

function calculateContrastRatio(first: Rgb, second: Rgb): number {
  const lighter = Math.max(
    calculateLuminance(first),
    calculateLuminance(second),
  );
  const darker = Math.min(
    calculateLuminance(first),
    calculateLuminance(second),
  );

  return (lighter + 0.05) / (darker + 0.05);
}

function scaleColor(color: Rgb, factor: number): Rgb {
  const [red, green, blue] = color;

  return [red, green, blue].map((channel) =>
    Math.floor(channel * factor),
  ) as [number, number, number];
}

function serializeColor([red, green, blue]: Rgb): string {
  return `rgb(${red} ${green} ${blue})`;
}

function darkenForLightText(primary: Rgb, light: Rgb): string {
  let passingFactor = 0;
  let failingFactor = 1;

  for (let iteration = 0; iteration < 12; iteration += 1) {
    const factor = (passingFactor + failingFactor) / 2;
    const candidate = scaleColor(primary, factor);

    if (
      calculateContrastRatio(candidate, light) >= MINIMUM_TEXT_CONTRAST
    ) {
      passingFactor = factor;
    } else {
      failingFactor = factor;
    }
  }

  return serializeColor(scaleColor(primary, passingFactor));
}

export function resolvePrimaryContrast(
  primary: string,
  onPrimary?: string,
): PrimaryContrast {
  if (onPrimary) {
    return { solid: primary, foreground: onPrimary };
  }

  const parsedPrimary = parseColor(primary);

  if (!parsedPrimary) {
    throw new Error(
      `[ValuxProvider] Cannot calculate text contrast for primary "${primary}". Set color.onPrimary explicitly.`,
    );
  }

  const dark = parseColor(DARK_FOREGROUND)!;
  const light = parseColor(LIGHT_FOREGROUND)!;

  if (calculateContrastRatio(parsedPrimary, dark) >= HIGH_DARK_CONTRAST) {
    return { solid: primary, foreground: DARK_FOREGROUND };
  }

  const solid =
    calculateContrastRatio(parsedPrimary, light) >= MINIMUM_TEXT_CONTRAST
      ? primary
      : darkenForLightText(parsedPrimary, light);

  return { solid, foreground: LIGHT_FOREGROUND };
}
