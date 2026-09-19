"use client";

import { createPortal } from "react-dom";

import type { TooltipContentProps } from "./Tooltip.types";
import { useTooltipContext } from "./TooltipContext";
import { TooltipSurface } from "./TooltipSurface";
import { usePortalNode } from "../a11y/usePortalNode";
import { applyPortalTheme, usePortalTheme } from "../a11y/usePortalTheme";

export function TooltipContent(props: TooltipContentProps) {
  const { phase, triggerRef } = useTooltipContext();
  const portalNode = usePortalNode(phase !== "closed", (node) =>
    applyPortalTheme(node, triggerRef.current),
  );
  usePortalTheme(portalNode, triggerRef);

  if (!portalNode) return null;

  return createPortal(<TooltipSurface {...props} />, portalNode);
}
