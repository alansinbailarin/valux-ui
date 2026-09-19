"use client";

import { createContext, useContext, useId, useState } from "react";
import type { ReactNode } from "react";

export interface RadioGroupProps {
  /** Group label, rendered above and wired via aria-labelledby. */
  label?: ReactNode;
  /** Controlled selected value. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Form field name (auto-generated when omitted). */
  name?: string;
  disabled?: boolean;
  children: ReactNode;
}

export interface RadioGroupState {
  name: string;
  value: string | undefined;
  disabled: boolean;
  select: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupState | null>(null);

export function useRadioGroup(): RadioGroupState {
  const context = useContext(RadioGroupContext);
  if (!context) throw new Error("<Radio> must live inside a <RadioGroup>");
  return context;
}

/** Groups Radio items under one form name; arrow keys move the selection
 * natively. Controlled (value/onValueChange) or uncontrolled. */
export function RadioGroup({
  label,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled = false,
  children,
}: RadioGroupProps) {
  const autoName = useId();
  const labelId = useId();
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;

  const state: RadioGroupState = {
    name: name ?? autoName,
    value: controlled ? value : inner,
    disabled,
    select: (next) => {
      if (!controlled) setInner(next);
      onValueChange?.(next);
    },
  };

  return (
    <div
      role="radiogroup"
      className="vx-radio-group"
      data-vx-radio-group=""
      aria-labelledby={label ? labelId : undefined}
    >
      {label ? (
        <span className="vx-radio-group__label" id={labelId}>
          {label}
        </span>
      ) : null}
      <RadioGroupContext.Provider value={state}>{children}</RadioGroupContext.Provider>
    </div>
  );
}
