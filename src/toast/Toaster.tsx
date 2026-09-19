"use client";

import { useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { ToastCard } from "./ToastCard";
import { getToasts, subscribeToasts } from "./toastStore";
import { usePortalNode } from "../a11y/usePortalNode";
import { applyPortalTheme } from "../a11y/usePortalTheme";

export type ToasterPosition =
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right";

export interface ToasterProps {
  /** Where the stack lives. Lateral positions anchor the pill (and the
   * liquid stretch) to that side. */
  position?: ToasterPosition;
  /** How many toasts show at once; the rest queue FIFO and enter one by one
   * as each visible toast expires or is dismissed. Default 1. */
  maxVisible?: number;
  className?: string;
}

const EMPTY: [] = [];
const getServerToasts = () => EMPTY;

function announcementFor(items: readonly { title: unknown; description?: unknown }[]) {
  const last = items[items.length - 1];
  if (!last) return "";
  const title = typeof last.title === "string" ? last.title : "";
  const description = typeof last.description === "string" ? last.description : "";
  return [title, description].filter(Boolean).join(". ");
}

/** Mount ONCE (e.g. in your root layout); then call `toast(...)` anywhere. */
export function Toaster({ position = "top", maxVisible = 1, className }: ToasterProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const items = useSyncExternalStore(subscribeToasts, getToasts, getServerToasts);
  const portalNode = usePortalNode(true, (node) =>
    applyPortalTheme(node, anchorRef.current),
  );

  // FIFO: the oldest is on stage; newcomers wait. A leaving toast keeps its
  // slot until its exit finishes, then the next one enters. The first two
  // QUEUED toasts peek a few pixels behind the last visible card, so a
  // waiting line is always visible.
  const count = Math.max(1, maxVisible);
  const visible = items.slice(0, count);
  const peeks = items.slice(count, count + 2);

  return (
    <>
      {/* In-tree anchor: the portal copies the nearest provider's theme. */}
      <span hidden ref={anchorRef} />
      {portalNode
        ? createPortal(
            <div data-vx-toaster="" data-vx-position={position} aria-label="Notifications" className={className}>
              {/* Pre-existing live region: updating its TEXT is what screen
                  readers reliably announce (a region inserted together with
                  its content is often missed). */}
              <div aria-live="polite" aria-atomic="true" data-vx-announcer="">
                {announcementFor(items)}
              </div>
              <svg width="0" height="0" aria-hidden="true">
                <defs>
                  <filter id="vx-toast-goo" colorInterpolationFilters="sRGB">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                    <feColorMatrix
                      in="blur"
                      mode="matrix"
                      values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 -19"
                    />
                  </filter>
                </defs>
              </svg>
              {visible.map((item, index) => {
                // Slots persist across promotions (index key); cards are
                // id-keyed INSIDE the slot, so when a queued card reaches
                // the stage it is the SAME element with new props — it
                // simply slides to the front (no remount, no re-entrance).
                const last = index === visible.length - 1;
                // ONE flat, id-keyed children array: a queued card keeps
                // its DOM node when it becomes the stage card (a nested
                // peek array would be a separate key namespace = remount).
                const stack = last ? [item, ...peeks] : [item];
                return (
                  <div key={`slot-${index}`} className="vx-toast-slot">
                    {stack.map((entry, depth) => (
                      <ToastCard key={entry.id} item={entry} peek={depth} />
                    ))}
                  </div>
                );
              })}
            </div>,
            portalNode,
          )
        : null}
    </>
  );
}
