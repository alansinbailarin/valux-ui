"use client";

import { DIALOG_SPECIMEN } from "./specimenDialog";
import { TOOLTIP_SPECIMEN } from "./specimenTooltip";
import { SHEET_SPECIMEN } from "./specimenSheet";
import { DRAWER_SPECIMEN } from "./specimenDrawer";
import { POPOVER_SPECIMEN } from "./specimenPopover";
import { MENU_SPECIMEN } from "./specimenMenu";
import { CONTEXT_MENU_SPECIMEN } from "./specimenContextMenu";
import { TOAST_SPECIMEN } from "./specimenToast";
import type { Specimen } from "./specimens";

export const OVERLAY_SPECIMENS: Specimen[] = [
  DIALOG_SPECIMEN,
  TOOLTIP_SPECIMEN,
  SHEET_SPECIMEN,
  DRAWER_SPECIMEN,
  POPOVER_SPECIMEN,
  MENU_SPECIMEN,
  CONTEXT_MENU_SPECIMEN,
  TOAST_SPECIMEN,
];
