"use client";

import { DialogClose } from "./DialogClose";

/** The dialog's one dismiss affordance: a ghost "X" pinned to the top-right
 * corner. Rendered by DialogContent for every dialog. */
export function DialogX({ label }: { label: string }) {
  return (
    <DialogClose className="vx-dialog__x" aria-label={label}>
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
        <path
          d="M4 4l8 8m0-8l-8 8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </DialogClose>
  );
}
