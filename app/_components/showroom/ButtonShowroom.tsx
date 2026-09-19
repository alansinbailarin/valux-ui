"use client";

import { useState } from "react";
import { ValuxProvider } from "@/src";
import type {
  ButtonColor,
  ButtonVariant,
  ValuxDensity,
  ValuxMode,
  ValuxTheme,
} from "@/src";

import { FONT_FAMILIES } from "./showroom.constants";
import type {
  ShowroomContent,
  ShowroomCursor,
  ShowroomElement,
  ShowroomFont,
  ShowroomIcons,
  ShowroomState,
  ShowroomWidth,
} from "./showroom.types";
import { ButtonPreview } from "./ButtonPreview";
import { ShowroomControls } from "./ShowroomControls";

export function ButtonShowroom() {
  const [element, setElement] = useState<ShowroomElement>("button");
  const [state, setState] = useState<ShowroomState>("enabled");
  const [cursor, setCursor] = useState<ShowroomCursor>("pointer");
  const [variant, setVariant] = useState<ButtonVariant>("solid");
  const [color, setColor] = useState<ButtonColor>("neutral");
  const [icons, setIcons] = useState<ShowroomIcons>("none");
  const [content, setContent] = useState<ShowroomContent>("text");
  const [width, setWidth] = useState<ShowroomWidth>("auto");
  const [loadingText, setLoadingText] = useState("");
  const [mode, setMode] = useState<ValuxMode>("system");
  const [primary, setPrimary] = useState<string>();
  const [tint, setTint] = useState(0);
  const [density, setDensity] = useState<ValuxDensity>("md");
  const [font, setFont] = useState<ShowroomFont>("sans");
  const theme: ValuxTheme = {
    mode,
    color: { primary, surfaceTint: tint },
    density,
    fontFamily: FONT_FAMILIES[font],
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:grid lg:grid-cols-[19rem_1fr]">
      <ShowroomControls
        element={element}
        state={state}
        cursor={cursor}
        variant={variant}
        color={color}
        icons={icons}
        content={content}
        width={width}
        mode={mode}
        primary={primary}
        tint={tint}
        density={density}
        font={font}
        loadingText={loadingText}
        onElementChange={setElement}
        onStateChange={setState}
        onCursorChange={setCursor}
        onVariantChange={setVariant}
        onColorChange={setColor}
        onIconsChange={setIcons}
        onContentChange={setContent}
        onWidthChange={setWidth}
        onModeChange={setMode}
        onPrimaryChange={setPrimary}
        onTintChange={setTint}
        onDensityChange={setDensity}
        onFontChange={setFont}
        onLoadingTextChange={setLoadingText}
      />
      <ValuxProvider
        data-testid="button-preview"
        theme={theme}
        className="flex min-h-96 items-center justify-center bg-[var(--vx-color-surface)] p-8 text-[var(--vx-color-on-surface)] transition-colors"
      >
        <div className="button-preview-stage">
          <ButtonPreview
            color={color}
            content={content}
            cursor={cursor}
            element={element}
            icons={icons}
            loadingText={loadingText}
            state={state}
            variant={variant}
            width={width}
          />
        </div>
      </ValuxProvider>
    </section>
  );
}
