"use client";

import type { ReactNode } from "react";

import type { InputSize, InputTone, InputVariant } from "./Input.types";

const GLYPHS: Record<InputTone, string> = {
  danger: "M4.5 4.5l7 7m0-7l-7 7",
  success: "M3.5 8.5l3 3 6-7",
  warning: "M8 4v5m0 3v.01",
};

export interface FieldShellProps {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  message?: ReactNode;
  tone?: InputTone;
  variant?: InputVariant;
  size?: InputSize;
  prefix?: ReactNode;
  suffix?: ReactNode;
  count?: string;
  multiline?: boolean;
  children: ReactNode;
}

/** Shared chrome for Input and TextArea: label above, affixes inside,
 * hint/status line (with the toast-family dot) below. The field border
 * stays NEUTRAL in every tone — color lives in the message and caret. */
export function FieldShell({
  id,
  label,
  hint,
  message,
  tone,
  variant = "outline",
  size = "md",
  prefix,
  suffix,
  count,
  multiline,
  children,
}: FieldShellProps) {
  const status = message ?? hint;
  return (
    <div
      className="vx-input"
      data-vx-input=""
      data-vx-variant={variant}
      data-vx-size={size}
      data-vx-tone={tone}
      data-vx-multiline={multiline ? "" : undefined}
      data-vx-prefix={prefix ? "" : undefined}
      data-vx-suffix={suffix ? "" : undefined}
    >
      {label ? (
        <label className="vx-input__label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <span className="vx-input__wrap">
        {children}
        {prefix ? <span className="vx-input__affix vx-input__affix--pre">{prefix}</span> : null}
        {suffix ? <span className="vx-input__affix vx-input__affix--suf">{suffix}</span> : null}
      </span>
      {status || count ? (
        <span className="vx-input__foot">
          {status ? (
            <span className="vx-input__msg" id={`${id}-msg`} role={message && tone ? "status" : undefined}>
              {message && tone ? (
                <span className="vx-input__dot" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none">
                    <path d={GLYPHS[tone]} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              ) : null}
              {status}
            </span>
          ) : null}
          {count ? <span className="vx-input__count">{count}</span> : null}
        </span>
      ) : null}
    </div>
  );
}
