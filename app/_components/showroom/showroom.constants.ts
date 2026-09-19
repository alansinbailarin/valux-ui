import type {
  ButtonColor,
  ButtonVariant,
  ValuxDensity,
  ValuxMode,
} from "@/src";

import type {
  Option,
  ShowroomCursor,
  ShowroomContent,
  ShowroomElement,
  ShowroomFont,
  ShowroomIcons,
  ShowroomState,
  ShowroomWidth,
} from "./showroom.types";

export const ELEMENT_OPTIONS: readonly Option<ShowroomElement>[] = [
  { label: "Button", value: "button" },
  { label: "Link", value: "link" },
];

export const STATE_OPTIONS: readonly Option<ShowroomState>[] = [
  { label: "Enabled", value: "enabled" },
  { label: "Disabled", value: "disabled" },
  { label: "Loading", value: "loading" },
];

export const VARIANT_OPTIONS: readonly Option<ButtonVariant>[] = [
  { label: "Solid", value: "solid" },
  { label: "Outline", value: "outline" },
  { label: "Soft", value: "soft" },
  { label: "Ghost", value: "ghost" },
];

export const COLOR_OPTIONS: readonly Option<ButtonColor>[] = [
  { label: "Neutral", value: "neutral" },
  { label: "Primary", value: "primary" },
  { label: "Danger", value: "danger" },
  { label: "Success", value: "success" },
  { label: "Warning", value: "warning" },
  { label: "Info", value: "info" },
];

export const ICON_OPTIONS: readonly Option<ShowroomIcons>[] = [
  { label: "None", value: "none" },
  { label: "Start", value: "start" },
  { label: "End", value: "end" },
  { label: "Both", value: "both" },
];

export const CONTENT_OPTIONS: readonly Option<ShowroomContent>[] = [
  { label: "Text", value: "text" },
  { label: "Icon only", value: "icon-only" },
];

export const WIDTH_OPTIONS: readonly Option<ShowroomWidth>[] = [
  { label: "Auto", value: "auto" },
  { label: "Full", value: "full" },
];

export const CURSOR_OPTIONS: readonly Option<ShowroomCursor>[] = [
  { label: "Pointer", value: "pointer" },
  { label: "Default", value: "default" },
  { label: "Grab", value: "grab" },
];

export const MODE_OPTIONS: readonly Option<ValuxMode>[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export const DENSITY_OPTIONS: readonly Option<ValuxDensity>[] = [
  { label: "Xs", value: "xs" },
  { label: "Sm", value: "sm" },
  { label: "Md", value: "md" },
  { label: "Lg", value: "lg" },
];

export const FONT_OPTIONS: readonly Option<ShowroomFont>[] = [
  { label: "Sans", value: "sans" },
  { label: "Mono", value: "mono" },
];

export const FONT_FAMILIES: Record<ShowroomFont, string> = {
  sans: "var(--font-geist-sans)",
  mono: "var(--font-geist-mono)",
};
