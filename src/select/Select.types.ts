import type { HTMLAttributes, ReactNode } from "react";

import type { InputSize, InputTone, InputVariant } from "../input/Input.types";
import type { MenuAlign, MenuSide } from "../menu/Menu.types";

export type MorphPhase = "closed" | "opening" | "open" | "closing";

/** Options are DATA (not free composition): the trigger can resolve the
 * selected label while closed, and the combobox filter stays trivial. */
export interface SelectOption {
  value: string;
  label: ReactNode;
  /** Secondary line under the label. */
  description?: ReactNode;
  disabled?: boolean;
  /** Text used for filtering/type-ahead when label is not a string. */
  textValue?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Form field name — submits the selected value via a hidden input. */
  name?: string;
  disabled?: boolean;
  children: ReactNode;
}

export interface SelectTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  /** Field label above the trigger. */
  label?: ReactNode;
  placeholder?: ReactNode;
  hint?: ReactNode;
  message?: ReactNode;
  tone?: InputTone;
  variant?: InputVariant;
  size?: InputSize;
}

export interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: MenuSide;
  align?: MenuAlign;
  /** Show a filter field at the top of the panel (combobox mode). */
  searchable?: boolean;
  /** Placeholder for the filter field. */
  searchPlaceholder?: string;
  /** Shown when the filter matches nothing. */
  emptyMessage?: ReactNode;
}
