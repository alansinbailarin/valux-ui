"use client";

import { forwardRef, useEffect, useId, useRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

export type CheckboxSize = "sm" | "md" | "lg";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Visible label beside the box (clicking it toggles). */
  label?: ReactNode;
  /** Secondary line under the label. */
  description?: ReactNode;
  /** Mixed state (e.g. a "select all" over a partial selection). */
  indeterminate?: boolean;
  /** Box size. Default "md". */
  size?: CheckboxSize;
}

/** Native checkbox styled to the kit: soft-cornered box, checkmark that
 * DRAWS itself in, indeterminate bar. Forms and keyboard for free. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { label, description, indeterminate, size = "md", id: idProp, className: _className, ...rest },
    ref,
  ) {
    const autoId = useId();
    const id = idProp ?? autoId;
    const innerRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = Boolean(indeterminate);
    }, [indeterminate]);

    return (
      <label className="vx-check" data-vx-check="" data-vx-size={size} htmlFor={id}>
        <input
          {...rest}
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          id={id}
          type="checkbox"
          className="vx-check__input"
          aria-describedby={description ? `${id}-desc` : rest["aria-describedby"]}
        />
        <span className="vx-check__box" aria-hidden="true">
          <svg viewBox="0 0 14 14" fill="none">
            <path
              className="vx-check__mark"
              d="M3 7.4l2.7 2.7L11 4.6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="vx-check__bar"
              d="M3.5 7h7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
        {label || description ? (
          <span className="vx-check__text">
            {label ? <span className="vx-check__label">{label}</span> : null}
            {description ? (
              <span className="vx-check__description" id={`${id}-desc`}>
                {description}
              </span>
            ) : null}
          </span>
        ) : null}
      </label>
    );
  },
);
