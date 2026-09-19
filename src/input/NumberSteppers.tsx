"use client";

import type { RefObject } from "react";

/** Styled replacement for the native number spinners: stepUp/stepDown
 * honor step/min/max, and a real input event keeps React onChange (and
 * the counter) in sync. Keyboard users already have ArrowUp/ArrowDown on
 * the input itself, so the buttons stay out of the tab order. */
export function NumberSteppers({
  inputRef,
  labels,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  labels: [string, string];
}) {
  const step = (direction: 1 | -1) => {
    const input = inputRef.current;
    if (!input || input.disabled || input.readOnly) return;
    if (direction === 1) input.stepUp();
    else input.stepDown();
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  };

  return (
    <span className="vx-input__steppers">
      <button
        type="button"
        className="vx-input__step"
        aria-label={labels[0]}
        tabIndex={-1}
        onClick={() => step(1)}
      >
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="m2.5 7.5 3.5-3.5L9.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        className="vx-input__step"
        aria-label={labels[1]}
        tabIndex={-1}
        onClick={() => step(-1)}
      >
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="m2.5 4.5 3.5 3.5 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </span>
  );
}
