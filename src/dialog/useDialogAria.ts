import { useEffect } from "react";
import type { RefObject } from "react";

import type { MorphPhase } from "../morph/useMorph";

/** Wires aria-labelledby / aria-describedby to the Dialog.Title and
 * Dialog.Description parts when present, and warns in dev when the dialog
 * ends up with no accessible name at all. */
export function useDialogAria(
  panelRef: RefObject<HTMLElement | null>,
  dialogId: string,
  phase: MorphPhase,
  componentName = "Dialog",
): void {
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || phase === "closed") return;

    const title = document.getElementById(`${dialogId}-title`);
    if (title && panel.contains(title) && !panel.hasAttribute("aria-label")) {
      panel.setAttribute("aria-labelledby", title.id);
    }
    const description = document.getElementById(`${dialogId}-description`);
    if (description && panel.contains(description)) {
      panel.setAttribute("aria-describedby", description.id);
    }

    if (
      process.env.NODE_ENV !== "production" &&
      !panel.hasAttribute("aria-label") &&
      !panel.hasAttribute("aria-labelledby")
    ) {
      console.warn(
        `[valux] <${componentName}.Content> has no accessible name: add <${componentName}.Title>, aria-label, or aria-labelledby.`,
      );
    }
  }, [panelRef, dialogId, phase, componentName]);
}
