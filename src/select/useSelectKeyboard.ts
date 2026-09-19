import { useEffect } from "react";
import type { RefObject } from "react";

const OPTION = '[role="option"]:not([disabled])';

/** Listbox keyboard: arrows/Home/End move focus, printable characters
 * type-ahead, Tab closes (focus returns to the trigger). Enter/Space
 * activate natively (options are buttons). */
export function useSelectKeyboard({
  ref,
  active,
  onClose,
}: {
  ref: RefObject<HTMLElement | null>;
  active: boolean;
  onClose: () => void;
}): void {
  useEffect(() => {
    const container = ref.current;
    if (!active || !container) return;

    let typed = "";
    let typedAt = 0;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        onClose();
        return;
      }
      const inSearch = (event.target as HTMLElement).closest(".vx-select__search");
      const items = Array.from(container.querySelectorAll<HTMLElement>(OPTION));
      if (items.length === 0) return;
      const index = items.indexOf(document.activeElement as HTMLElement);

      let next: HTMLElement | undefined;
      if (event.key === "ArrowDown") next = items[index + 1] ?? items[0];
      else if (event.key === "ArrowUp") next = items[index - 1] ?? items[items.length - 1];
      else if (!inSearch && event.key === "Home") next = items[0];
      else if (!inSearch && event.key === "End") next = items[items.length - 1];
      else if (
        !inSearch &&
        event.key.length === 1 &&
        !event.metaKey &&
        !event.ctrlKey
      ) {
        const now = Date.now();
        typed = (now - typedAt < 500 ? typed : "") + event.key.toLowerCase();
        typedAt = now;
        const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)];
        next = ordered.find((item) =>
          (item.textContent ?? "").trim().toLowerCase().startsWith(typed),
        );
      }

      if (next) {
        event.preventDefault();
        next.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }, [ref, active, onClose]);
}
