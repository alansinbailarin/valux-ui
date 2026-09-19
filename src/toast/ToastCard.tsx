"use client";

import { useEffect, useRef, useState } from "react";

import { ToastShape } from "./ToastShape";
import { markToastLeaving, removeToast } from "./toastStore";
import type { ToastItem } from "./toastStore";
import { useToastSwipe } from "./useToastSwipe";
import { prefersReducedMotion } from "../morph/reducedMotion";

/** One liquid tab-toast: goo shape layer + ink layer in lockstep. Click or
 * swipe dismisses; the auto-timer pauses on hover. */
export function ToastCard({ item, peek = 0 }: { item: ToastItem; peek?: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  // The revision this card was born with — a later bump means an in-place
  // update (toast.promise settle / coalesced re-fire).
  const [bornRevision] = useState(item.revision);
  // Born as a queued peek? Then reaching the stage must NOT replay the
  // liquid entrance — the already-formed card just slides to the front.
  const [bornAsPeek] = useState(peek > 0);
  const promoted = bornAsPeek && peek === 0;
  useToastSwipe(cardRef, item.id, item.leaving || peek > 0);

  useEffect(() => {
    if (peek > 0 || item.leaving || item.duration <= 0) return;
    let timer = setTimeout(() => markToastLeaving(item.id), item.duration);
    const card = cardRef.current;
    const pause = () => clearTimeout(timer);
    const resume = () => {
      clearTimeout(timer);
      timer = setTimeout(() => markToastLeaving(item.id), item.duration);
    };
    // Pause while hovered AND while the window is hidden/unfocused — a
    // toast must not expire where nobody could have read it.
    const onVisibility = () => (document.hidden ? pause() : resume());
    card?.addEventListener("pointerenter", pause);
    card?.addEventListener("pointerleave", resume);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", pause);
    window.addEventListener("focus", resume);
    return () => {
      clearTimeout(timer);
      card?.removeEventListener("pointerenter", pause);
      card?.removeEventListener("pointerleave", resume);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", pause);
      window.removeEventListener("focus", resume);
    };
  }, [item.id, item.duration, item.leaving, item.revision, peek]);

  useEffect(() => {
    if (!item.leaving || peek > 0) return;
    const card = cardRef.current;
    if (!card || prefersReducedMotion() || card.hasAttribute("data-vx-swiped")) {
      removeToast(item.id);
      return;
    }
    const onEnd = (event: AnimationEvent) => {
      if (event.animationName === "vx-toast-pill-out") removeToast(item.id);
    };
    card.addEventListener("animationend", onEnd);
    const fallback = setTimeout(() => removeToast(item.id), 650);
    return () => {
      clearTimeout(fallback);
      card.removeEventListener("animationend", onEnd);
    };
  }, [item.id, item.leaving, peek]);

  return (
    <div
      ref={cardRef}
      {...(peek > 0
        ? { "aria-hidden": true as const, "data-vx-peek": peek }
        : {
            role: item.tone === "danger" || item.tone === "warning" ? "alert" : "status",
            onClick: () => markToastLeaving(item.id),
          })}
      data-vx-toast=""
      data-vx-tone={item.tone}
      data-vx-phase={
        peek > 0
          ? "peek"
          : item.leaving
            ? "leaving"
            : item.revision > bornRevision
              ? "updating"
              : promoted
                ? "promoted"
                : "entering"
      }
      className="vx-toast"
    >
      <div className="vx-toast__goo" aria-hidden="true">
        <ToastShape item={item} />
      </div>
      <div className="vx-toast__ink">
        <ToastShape item={item} ink />
      </div>
    </div>
  );
}
