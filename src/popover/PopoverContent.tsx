"use client";

import { createPortal } from "react-dom";

import type { PopoverContentProps } from "./Popover.types";
import { PopoverContentSurface } from "./PopoverContentSurface";
import { usePopoverContext } from "./PopoverContext";
import { usePortalNode } from "../a11y/usePortalNode";
import { applyPortalTheme, usePortalTheme } from "../a11y/usePortalTheme";

export function PopoverContent(props: PopoverContentProps) {
  const { phase, triggerRef } = usePopoverContext();
  const portalNode = usePortalNode(phase !== "closed", (node) =>
    applyPortalTheme(node, triggerRef.current),
  );
  usePortalTheme(portalNode, triggerRef);

  if (!portalNode) return null;

  return createPortal(<PopoverContentSurface {...props} />, portalNode);
}
