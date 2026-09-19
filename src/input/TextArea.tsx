"use client";

import { forwardRef, useId, useState } from "react";

import { FieldShell } from "./FieldShell";
import type { TextAreaProps } from "./Input.types";

/** Multiline field sharing the Input chrome; grows with content. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      label,
      hint,
      message,
      tone,
      variant,
      size,
      showCount,
      autoGrow = true,
      maxRows = 8,
      id: idProp,
      className: _className, // stripped: chrome owns styling
      onInput,
      rows = 3,
      ...rest
    },
    ref,
  ) {
    const autoId = useId();
    const id = idProp ?? autoId;
    const [length, setLength] = useState(
      () => String(rest.value ?? rest.defaultValue ?? "").length,
    );

    const describedBy = message ?? hint ? `${id}-msg` : undefined;
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
        count={count}
        multiline
      >
        <textarea
          {...rest}
          ref={ref}
          id={id}
          rows={rows}
          className="vx-input__control"
          aria-describedby={describedBy}
          aria-invalid={tone === "danger" ? true : rest["aria-invalid"]}
          onInput={(event) => {
            const area = event.currentTarget;
            setLength(area.value.length);
            if (autoGrow) {
              const line = parseFloat(getComputedStyle(area).lineHeight) || 20;
              area.style.height = "auto";
              area.style.height = `${Math.min(area.scrollHeight, line * maxRows + 20)}px`;
            }
            onInput?.(event);
          }}
        />
      </FieldShell>
    );
  },
);
