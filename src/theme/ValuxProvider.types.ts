import type { CSSProperties, HTMLAttributes } from "react";

export type ValuxMode = "system" | "light" | "dark";
export type ValuxDensity = "xs" | "sm" | "md" | "lg";

export interface ValuxColorTheme {
  primary?: string;
  onPrimary?: string;
  surfaceTint?: number;
}

/* Rounding is deliberately NOT themeable per component or per size: the kit
 * ships one pronounced radius (--vx-radius-control) shared by everything. */
export interface ValuxTheme {
  mode?: ValuxMode;
  color?: ValuxColorTheme;
  density?: ValuxDensity;
  fontFamily?: string;
}

export interface ValuxProviderProps
  extends HTMLAttributes<HTMLDivElement> {
  theme?: ValuxTheme;
}

export type ThemeStyle = CSSProperties &
  Record<`--vx-${string}`, string | number | undefined>;
