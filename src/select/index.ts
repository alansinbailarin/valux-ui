"use client";

import { Select as SelectRoot } from "./Select";
import { SelectContent } from "./SelectContent";
import { SelectTrigger } from "./SelectTrigger";

/** Compound Select: `Select` (root, options as data) + `Select.Trigger`
 * (Input-look field) + `Select.Content` (morphing listbox panel). */
export const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Content: SelectContent,
});

export type {
  SelectContentProps,
  SelectOption,
  SelectProps,
  SelectTriggerProps,
} from "./Select.types";
