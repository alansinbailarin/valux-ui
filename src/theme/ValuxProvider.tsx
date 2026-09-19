import { forwardRef } from "react";

import { resolvePrimaryContrast, resolveSurfaceTint } from "./color";
import type {
  ValuxProviderProps,
  ThemeStyle,
} from "./ValuxProvider.types";

export const ValuxProvider = forwardRef<
  HTMLDivElement,
  ValuxProviderProps
>(function ValuxProvider(
  { children, className, style, theme, ...props },
  ref,
) {
  const color = theme?.color;
  const tint = resolveSurfaceTint(color?.surfaceTint);
  const themeStyle: ThemeStyle = {};

  if (color?.primary) {
    const contrast = resolvePrimaryContrast(color.primary, color.onPrimary);

    themeStyle["--vx-color-primary"] = color.primary;
    themeStyle["--vx-color-primary-solid"] = contrast.solid;
    themeStyle["--vx-color-on-primary"] = contrast.foreground;
  } else if (color?.onPrimary) {
    themeStyle["--vx-color-on-primary"] = color.onPrimary;
  }

  if (tint) {
    themeStyle["--vx-surface-tint"] = tint.surface;
    themeStyle["--vx-surface-tint-raised"] = tint.raised;
  }

  if (theme?.fontFamily) {
    themeStyle["--vx-font-family"] = theme.fontFamily;
  }

  return (
    <div
      {...props}
      ref={ref}
      data-vx-provider=""
      data-vx-mode={theme?.mode}
      data-vx-density={theme?.density}
      className={className}
      style={{ ...themeStyle, ...style }}
    >
      {children}
    </div>
  );
});
