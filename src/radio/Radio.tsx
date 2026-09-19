"use client";

import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

import { useRadioGroup } from "./RadioGroup";

export interface RadioProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "name" | "value" | "checked" | "defaultChecked" | "onChange"
  > {
  /** This option's submitted value. */
  value: string;
  label?: ReactNode;
  description?: ReactNode;
  /** Ring size. Default "md". */
  size?: "sm" | "md" | "lg";
}

/** One option inside a RadioGroup: native radio styled to the kit — the
 * ring is a circle (radios ARE circular) and the dot POPS in. */
export function Radio({ value, label, description, size = "md", id: idProp, className: _className, ...rest }: RadioProps) {
  const group = useRadioGroup();
  const autoId = useId();
  const id = idProp ?? autoId;
  const checked = group.value === value;

  return (
    <label className="vx-radio" data-vx-radio="" data-vx-size={size} htmlFor={id}>
      <input
        {...rest}
        id={id}
        type="radio"
        className="vx-radio__input"
        name={group.name}
        value={value}
        disabled={rest.disabled ?? group.disabled}
        checked={checked}
        onChange={() => group.select(value)}
        aria-describedby={description ? `${id}-desc` : rest["aria-describedby"]}
      />
      <span className="vx-radio__ring" aria-hidden="true">
        <span className="vx-radio__dot" />
      </span>
      {label || description ? (
        <span className="vx-radio__text">
          {label ? <span className="vx-radio__label">{label}</span> : null}
          {description ? (
            <span className="vx-radio__description" id={`${id}-desc`}>
              {description}
            </span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}
