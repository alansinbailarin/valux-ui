"use client";

import { createPortal } from "react-dom";

import type { SheetContentProps } from "./Sheet.types";
import { SheetClose } from "./SheetClose";
import { SheetContentSurface } from "./SheetContentSurface";
import { useSheetContext } from "./SheetContext";
import { usePortalNode } from "../a11y/usePortalNode";
import { applyPortalTheme, usePortalTheme } from "../a11y/usePortalTheme";

export function SheetContent({
  closeLabel = "Close",
  children,
  ...props
}: SheetContentProps) {
  const { phase, triggerRef } = useSheetContext();
  const portalNode = usePortalNode(phase !== "closed", (node) =>
    applyPortalTheme(node, triggerRef.current),
  );
  usePortalTheme(portalNode, triggerRef);

  if (!portalNode) return null;

  return createPortal(
    <div data-vx-sheet-root="" data-vx-phase={phase}>
      <div data-vx-sheet-scrim="" data-vx-phase={phase} />
      <SheetContentSurface portalNode={portalNode} {...props}>
        {children}
        <SheetClose className="vx-sheet__x" aria-label={closeLabel}>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
            <path
              d="M4 4l8 8m0-8l-8 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </SheetClose>
      </SheetContentSurface>
    </div>,
    portalNode,
  );
}
