"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import type { SelectTriggerProps } from "./Select.types";
import { useSelectContext } from "./SelectContext";

/** Input-look field that opens the panel; the WHOLE field is the morph
 * origin, so the panel visibly grows out of the bordered box. */
export function SelectTrigger({
  label,
  placeholder = "Select…",
  hint,
  message,
  tone,
  variant = "outline",
  size = "md",
  ...props
}: SelectTriggerProps) {
  const { options, value, open, phase, setOpen, triggerRef, selectId, disabled } =
    useSelectContext();
  const hidden = phase !== "closed";
  const [landed, setLanded] = useState(false);
  const previous = useRef(phase);
  useEffect(() => {
    if (previous.current === "closing" && phase === "closed") {
      setLanded(true);
      const timer = setTimeout(() => setLanded(false), 500);
      previous.current = phase;
      return () => clearTimeout(timer);
    }
    previous.current = phase;
  }, [phase]);
  const origin =
    phase === "closing" ? "closing" : hidden ? "hidden" : landed ? "landed" : undefined;

  const selected = options.find((option) => option.value === value);
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div
      className="vx-select"
      data-vx-select=""
      data-vx-size={size}
      data-vx-variant={variant}
      data-vx-tone={tone}
    >
      {label ? (
        <label
          className="vx-select__label"
          id={`${selectId}-label`}
          htmlFor={`${selectId}-trigger`}
        >
          {label}
        </label>
      ) : null}
      <div
        ref={(node) => {
          triggerRef.current = node;
        }}
        className="vx-select__field"
        data-vx-morph-origin={origin}
      >
        <button
          {...props}
          id={`${selectId}-trigger`}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={hidden ? selectId : undefined}
          aria-haspopup="listbox"
          disabled={disabled}
          className="vx-select__button"
          onClick={() => setOpen(!open)}
          onKeyDown={onKeyDown}
        >
          <span className="vx-select__content">
            <span className="vx-select__value" data-vx-placeholder={selected ? undefined : ""}>
              {selected ? selected.label : placeholder}
            </span>
          </span>
          <svg className="vx-select__chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="m2.5 4.5 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {message || hint ? (
        <span className="vx-select__msg" role={message && tone ? "status" : undefined}>
          {message ?? hint}
        </span>
      ) : null}
    </div>
  );
}
