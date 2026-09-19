"use client";

import { useState } from "react";

import { ValuxProvider, Toaster } from "@/src";
import type { ValuxMode } from "@/src";

import { StudioBoard } from "./StudioBoard";
import { StudioToolbar } from "./StudioToolbar";

export function ThemeStudio() {
  const [primary, setPrimary] = useState("#4f46e5");
  const [mode, setMode] = useState<ValuxMode>("light");
  const [tint, setTint] = useState(30);

  return (
    <div className="space-y-4">
      <StudioToolbar
        primary={primary}
        mode={mode}
        tint={tint}
        onPrimary={setPrimary}
        onMode={setMode}
        onTint={setTint}
      />
      <ValuxProvider
        theme={{ mode, color: { primary, surfaceTint: tint } }}
        className="block rounded-[2rem] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_60px_-24px_rgba(0,0,0,0.18)] sm:p-6"
        style={{
          background:
            "color-mix(in srgb, var(--vx-color-primary) 7%, var(--vx-color-surface))",
          color: "var(--vx-color-on-surface)",
        }}
      >
        <Toaster position="top" />
        <StudioBoard />
      </ValuxProvider>
    </div>
  );
}
