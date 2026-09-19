"use client";

import { createPortal } from "react-dom";

import type { SelectContentProps } from "./Select.types";
import { SelectContentSurface } from "./SelectContentSurface";
import { useSelectContext } from "./SelectContext";
import { usePortalNode } from "../a11y/usePortalNode";
import { applyPortalTheme, usePortalTheme } from "../a11y/usePortalTheme";

export function SelectContent(props: SelectContentProps) {
  const { phase, triggerRef } = useSelectContext();
  const portalNode = usePortalNode(phase !== "closed", (node) =>
    applyPortalTheme(node, triggerRef.current),
  );
  usePortalTheme(portalNode, triggerRef);

  if (!portalNode) return null;

  return createPortal(<SelectContentSurface {...props} />, portalNode);
}
