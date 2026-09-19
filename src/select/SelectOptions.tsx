"use client";

import type { ReactNode } from "react";

import type { SelectOption } from "./Select.types";

/** The listbox rows: options hover as full pills, the selected one
 * carries the family checkmark and the primary color. */
export function SelectOptions({
  options,
  value,
  select,
  labelledBy,
  emptyMessage,
}: {
  options: SelectOption[];
  value: string | undefined;
  select: (value: string) => void;
  labelledBy: string;
  emptyMessage: ReactNode;
}) {
  return (
    <div role="listbox" aria-labelledby={labelledBy} className="vx-select__list">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="option"
          aria-selected={option.value === value}
          disabled={option.disabled}
          className="vx-select__option"
          onClick={() => select(option.value)}
        >
          <span className="vx-select__option-text">
            <span>{option.label}</span>
            {option.description ? (
              <span className="vx-select__option-desc">{option.description}</span>
            ) : null}
          </span>
          {option.value === value ? (
            <svg className="vx-select__check" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7.4l2.7 2.7L11 4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
        </button>
      ))}
      {options.length === 0 ? <p className="vx-select__empty">{emptyMessage}</p> : null}
    </div>
  );
}
