"use client";

import { forwardRef, useId, useRef } from "react";

import type { SwitchProps } from "./Switch.types";
import { useSwitchDrag } from "./useSwitchDrag";

/** Native-feel toggle: a real checkbox (form + keyboard for free) styled
 * as an iOS-style pill track. The thumb squishes while pressed and can be
 * DRAGGED — release past the midpoint commits. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    label,
    description,
    size = "md",
    labelFirst,
    id: idProp,
    className: _className, // stripped: chrome owns styling
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const trackRef = useRef<HTMLSpanElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  useSwitchDrag(trackRef, inputRef);

  return (
    <label
      className="vx-switch"
      data-vx-switch=""
      data-vx-size={size}
      data-vx-label-first={labelFirst ? "" : undefined}
      htmlFor={id}
    >
      <input
        {...rest}
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        id={id}
        type="checkbox"
        role="switch"
        className="vx-switch__input"
        aria-describedby={description ? `${id}-desc` : rest["aria-describedby"]}
      />
      <span ref={trackRef} className="vx-switch__track" aria-hidden="true">
        <span className="vx-switch__fill" data-vx-fill="" />
        <span className="vx-switch__thumb" data-vx-thumb="" />
      </span>
      {label || description ? (
        <span className="vx-switch__text">
          {label ? <span className="vx-switch__label">{label}</span> : null}
          {description ? (
            <span className="vx-switch__description" id={`${id}-desc`}>
              {description}
            </span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
});
