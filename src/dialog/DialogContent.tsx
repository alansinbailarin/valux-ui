"use client";

import { createPortal } from "react-dom";

import type { DialogContentProps } from "./Dialog.types";
import { DialogContentSurface } from "./DialogContentSurface";
import { useDialogContext } from "./DialogContext";
import { DialogX } from "./DialogX";
import { usePortalNode } from "../a11y/usePortalNode";
import { applyPortalTheme, usePortalTheme } from "../a11y/usePortalTheme";

export function DialogContent({
  closeLabel = "Close",
  children,
  ...props
}: DialogContentProps) {
  const { phase, triggerRef } = useDialogContext();
  const portalNode = usePortalNode(phase !== "closed", (node) =>
    applyPortalTheme(node, triggerRef.current),
  );
  usePortalTheme(portalNode, triggerRef);

  if (!portalNode) return null;

  return createPortal(
    <div data-vx-dialog-root="" data-vx-phase={phase}>
      <div data-vx-dialog-scrim="" data-vx-phase={phase} />
      <DialogContentSurface portalNode={portalNode} {...props}>
        {children}
        {/* Last in DOM (absolute top-right visually): content gets first Tab. */}
        <DialogX label={closeLabel} />
      </DialogContentSurface>
    </div>,
    portalNode,
  );
}
