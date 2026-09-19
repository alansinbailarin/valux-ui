import type {
  ButtonColor,
  ButtonVariant,
  ValuxDensity,
  ValuxMode,
} from "@/src";

export type ShowroomFont = "sans" | "mono";
export type ShowroomElement = "button" | "link";
export type ShowroomState = "enabled" | "disabled" | "loading";
export type ShowroomIcons = "none" | "start" | "end" | "both";
export type ShowroomContent = "text" | "icon-only";
export type ShowroomWidth = "auto" | "full";
export type ShowroomCursor = "pointer" | "default" | "grab";

export interface ShowroomControlsProps {
  element: ShowroomElement;
  state: ShowroomState;
  cursor: ShowroomCursor;
  variant: ButtonVariant;
  color: ButtonColor;
  icons: ShowroomIcons;
  content: ShowroomContent;
  width: ShowroomWidth;
  mode: ValuxMode;
  primary?: string;
  tint: number;
  density: ValuxDensity;
  font: ShowroomFont;
  loadingText: string;
  onElementChange: (value: ShowroomElement) => void;
  onStateChange: (value: ShowroomState) => void;
  onCursorChange: (value: ShowroomCursor) => void;
  onVariantChange: (value: ButtonVariant) => void;
  onColorChange: (value: ButtonColor) => void;
  onIconsChange: (value: ShowroomIcons) => void;
  onContentChange: (value: ShowroomContent) => void;
  onWidthChange: (value: ShowroomWidth) => void;
  onModeChange: (value: ValuxMode) => void;
  onPrimaryChange: (value: string) => void;
  onTintChange: (value: number) => void;
  onDensityChange: (value: ValuxDensity) => void;
  onFontChange: (value: ShowroomFont) => void;
  onLoadingTextChange: (value: string) => void;
}

export interface ButtonPreviewProps {
  color: ButtonColor;
  content: ShowroomContent;
  cursor: ShowroomCursor;
  element: ShowroomElement;
  icons: ShowroomIcons;
  loadingText: string;
  state: ShowroomState;
  variant: ButtonVariant;
  width: ShowroomWidth;
}

export interface LoadingTextControlProps {
  value: string;
  onChange: (value: string) => void;
}

export interface NativeThemeControlsProps {
  primary?: string;
  tint: number;
  onPrimaryChange: (value: string) => void;
  onTintChange: (value: number) => void;
}

export interface Option<T extends string> {
  label: string;
  value: T;
}

export interface OptionGroupProps<T extends string> {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}
