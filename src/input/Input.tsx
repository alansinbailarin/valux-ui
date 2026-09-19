"use client";

import { forwardRef, useId, useRef, useState } from "react";

import { FieldShell } from "./FieldShell";
import type { InputProps } from "./Input.types";
import { NumberSteppers } from "./NumberSteppers";
import { PasswordEye } from "./PasswordEye";
import { TYPE_PRESETS } from "./typePresets";

/** Text field with curated types (text · email · password · search ·
 * number · tel · url): each wires the right mobile keyboard and behavior.
 * Password renders a built-in eye toggle. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    message,
    tone,
    variant,
    size,
    prefix,
    suffix,
    showCount,
    revealLabel = "Show password",
    stepLabels = ["Increase", "Decrease"],
    type = "text",
    id: idProp,
    className: _className, // stripped: chrome owns styling
    onChange,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const innerRef = useRef<HTMLInputElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [length, setLength] = useState(
    () => String(rest.value ?? rest.defaultValue ?? "").length,
  );

  const isPassword = type === "password";
  const finalSuffix =
    suffix ??
    (isPassword ? (
      <PasswordEye
        revealed={revealed}
        label={revealLabel}
        onToggle={() => setRevealed((current) => !current)}
      />
    ) : type === "number" ? (
      <NumberSteppers inputRef={innerRef} labels={stepLabels} />
    ) : undefined);

  const describedBy =
    [message ?? hint ? `${id}-msg` : null, rest["aria-describedby"] ?? null]
      .filter(Boolean)
      .join(" ") || undefined;

  const count =
    showCount && rest.maxLength != null ? `${length}/${rest.maxLength}` : undefined;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      message={message}
      tone={tone}
      variant={variant}
      size={size}
      prefix={prefix}
      suffix={finalSuffix}
      count={count}
    >
      <input
        {...TYPE_PRESETS[type]}
        {...rest}
        ref={(node) => {
          innerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        id={id}
        type={isPassword && revealed ? "text" : type}
        className="vx-input__control"
        aria-describedby={describedBy}
        aria-invalid={tone === "danger" ? true : rest["aria-invalid"]}
        onChange={(event) => {
          setLength(event.currentTarget.value.length);
          onChange?.(event);
        }}
      />
    </FieldShell>
  );
});
