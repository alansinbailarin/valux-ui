import type { InputHTMLAttributes, ReactNode } from "react";

export type SwitchSize = "sm" | "md" | "lg";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "role"> {
  /** Visible label beside the control (clicking it toggles). */
  label?: ReactNode;
  /** Secondary line under the label. */
  description?: ReactNode;
  /** Track sizes tuned to the Button scale rhythm. Default "md". */
  size?: SwitchSize;
  /** Put the label BEFORE the control (settings-row style). */
  labelFirst?: boolean;
}
