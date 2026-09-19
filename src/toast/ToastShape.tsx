"use client";

import { markToastLeaving } from "./toastStore";
import type { ToastItem, ToastTone } from "./toastStore";

const GLYPHS: Record<ToastTone, string> = {
  neutral: "M4 8h8",
  success: "M3.5 8.5l3 3 6-7",
  danger: "M4.5 4.5l7 7m0-7l-7 7",
  warning: "M8 4v5m0 3v.01",
  info: "M8 7v5m0-8v.01",
};

export function ToastShape({ item, ink }: { item: ToastItem; ink?: boolean }) {
  // Keyed by revision: an update (toast.promise settle, coalesced re-fire)
  // remounts the swap-sensitive nodes so their animations restart.
  const swap = item.revision;
  return (
    <>
      <div className="vx-toast__pill">
        <span key={`dot-${swap}`} className="vx-toast__dot" aria-hidden="true">
          {item.loading ? (
            <svg viewBox="0 0 16 16" fill="none" className="vx-toast__spinner">
              <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeDasharray="26" strokeDashoffset="18" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="none">
              <path d={GLYPHS[item.tone]} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span key={`title-${swap}`} className="vx-toast__title">
          {item.title}
        </span>
      </div>
      {item.description || item.action ? (
        <div key={`panel-${swap}`} className="vx-toast__panel">
          {item.description ? (
            <p className="vx-toast__description">{item.description}</p>
          ) : null}
          {item.action ? (
            <button
              type="button"
              className="vx-toast__action"
              tabIndex={ink ? 0 : -1}
              onClick={(event) => {
                event.stopPropagation();
                item.action?.onClick();
                markToastLeaving(item.id);
              }}
            >
              {item.action.label}
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
