"use client";

import { Tooltip as TooltipRoot } from "./Tooltip";
import { TooltipContent } from "./TooltipContent";
import { TooltipDescription, TooltipTitle } from "./TooltipParts";
import { TooltipTrigger } from "./TooltipTrigger";

type TooltipComponent = typeof TooltipRoot & {
  Trigger: typeof TooltipTrigger;
  Content: typeof TooltipContent;
  Title: typeof TooltipTitle;
  Description: typeof TooltipDescription;
};

const Tooltip = TooltipRoot as TooltipComponent;
Tooltip.Trigger = TooltipTrigger;
Tooltip.Content = TooltipContent;
Tooltip.Title = TooltipTitle;
Tooltip.Description = TooltipDescription;

export { Tooltip };
export type {
  TooltipAlign,
  TooltipContentProps,
  TooltipProps,
  TooltipSide,
  TooltipTriggerProps,
} from "./Tooltip.types";
