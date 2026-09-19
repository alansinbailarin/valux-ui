import { useEffect } from "react";
import type { RefObject } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  /** Element to focus on activation instead of the first tabbable. */
  initial?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const container = ref.current;
    if (!active || !container) return;

    const previous = document.activeElement as HTMLElement | null;
    const items = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
    (initial?.current ?? items()[0] ?? container).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusables = items();
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => {
      container.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [ref, active, initial]);
}
