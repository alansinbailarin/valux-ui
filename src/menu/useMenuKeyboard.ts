import { useEffect } from "react";
import type { RefObject } from "react";

import { matchesShortcut } from "./shortcut";

export interface MenuKeyboardOptions {
  ref: RefObject<HTMLElement | null>;
  active: boolean;
  onClose: () => void;
}

const ITEM = '[role="menuitem"]:not([disabled])';

export function useMenuKeyboard({
  ref,
  active,
  onClose,
}: MenuKeyboardOptions): void {
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

      const items = Array.from(container.querySelectorAll<HTMLElement>(ITEM));
      if (items.length === 0) return;
      const index = items.indexOf(document.activeElement as HTMLElement);

      // Functional shortcuts: a matching combo activates its item directly.
      const bound = items.find((item) => {
        const shortcut = item.getAttribute("data-vx-shortcut");
        return shortcut !== null && matchesShortcut(event, shortcut);
      });
      if (bound) {
        event.preventDefault();
        bound.click();
        return;
      }

      let next: HTMLElement | undefined;
      if (event.key === "ArrowDown") next = items[index + 1] ?? items[0];
      else if (event.key === "ArrowUp")
        next = items[index - 1] ?? items[items.length - 1];
      else if (event.key === "Home") next = items[0];
      else if (event.key === "End") next = items[items.length - 1];
      else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
        // Type-ahead: accumulate printable characters (buffer resets after
        // 500ms) and focus the next item whose label starts with them.
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
