import { useLayoutEffect } from "react";

/** Locks page scroll while a modal surface is open. `overflow: hidden` on
 * body alone is not enough: iOS Safari ignores it, so the body is also
 * pinned (position: fixed at the current scroll offset) and restored — with
 * scrollbar-width compensation so desktop layout never shifts. */
export function useScrollLock(active: boolean): void {
  useLayoutEffect(() => {
    if (!active) return;

    const { body, documentElement } = document;
    const scrollY = window.scrollY;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    const previous = {
      htmlOverflow: documentElement.style.overflow,
      overflow: body.style.overflow,
      padding: body.style.paddingRight,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };

    documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      documentElement.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.padding;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      if (scrollY) window.scrollTo(0, scrollY);
    };
  }, [active]);
}
