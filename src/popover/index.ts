"use client";

import { Popover as PopoverRoot } from "./Popover";
import { PopoverClose } from "./PopoverClose";
import { PopoverContent } from "./PopoverContent";
import { PopoverTrigger } from "./PopoverTrigger";

type PopoverComponent = typeof PopoverRoot & {
  Trigger: typeof PopoverTrigger;
  Content: typeof PopoverContent;
  Close: typeof PopoverClose;
};

const Popover = PopoverRoot as PopoverComponent;
Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;
Popover.Close = PopoverClose;

export { Popover };
export type {
  PopoverAlign,
  PopoverCloseProps,
  PopoverContentProps,
  PopoverProps,
  PopoverSide,
  PopoverTriggerProps,
} from "./Popover.types";
