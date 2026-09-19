import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

/** Curated usable types: each wires the right mobile keyboard and
 * behavior (inputMode, enterKeyHint, autocomplete, password eye, no
 * number spinners). Dates/files/colors are future components, not types. */
export type InputType =
  | "text"
  | "email"
  | "password"
  | "search"
  | "number"
  | "tel"
  | "url";

export type InputVariant = "outline" | "soft";
export type InputSize = "sm" | "md" | "lg";
export type InputTone = "danger" | "success" | "warning";

interface FieldShared {
  /** Always labeled: visible text above the field (or use aria-label). */
  label?: ReactNode;
  /** Help text under the field; replaced by `message` when present. */
  hint?: ReactNode;
  /** Status line under the field (pairs with `tone` for the dot). */
  message?: ReactNode;
  /** Colors the message dot/text and the caret — NEVER the border. */
  tone?: InputTone;
  /** "outline" (default): subtle border, no fill. "soft": washed fill. */
  variant?: InputVariant;
  /** Heights match the Button scale: 2 / 2.5 / 3rem. Default "md". */
  size?: InputSize;
}

export interface InputProps
  extends FieldShared,
    Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "prefix"> {
  type?: InputType;
  /** Leading icon/text inside the field. */
  prefix?: ReactNode;
  /** Trailing icon/text/button inside the field (password renders its
   * own eye toggle; a custom suffix replaces it). */
  suffix?: ReactNode;
  /** Show a live character counter (requires maxLength). */
  showCount?: boolean;
  /** Accessible label for the password eye toggle. */
  revealLabel?: string;
  /** Accessible labels for the number steppers: [increase, decrease]. */
  stepLabels?: [string, string];
}

export interface TextAreaProps
  extends FieldShared,
    TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Grow with content (default true) up to `maxRows`. */
  autoGrow?: boolean;
  maxRows?: number;
  showCount?: boolean;
}
