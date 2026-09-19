"use client";

import type { ValuxMode } from "@/src";

const SWATCHES = [
  ["#4f46e5", "Indigo"],
  ["#e11d48", "Rose"],
  ["#ea580c", "Orange"],
  ["#059669", "Emerald"],
  ["#0ea5e9", "Sky"],
  ["#7c3aed", "Violet"],
  ["#18181b", "Ink"],
] as const;

/** HeroUI-style rail: mode pills on the left, theme dots on the right. */
export function StudioToolbar({
  primary,
  mode,
  tint,
  onPrimary,
  onMode,
  onTint,
}: {
  primary: string;
  mode: ValuxMode;
  tint: number;
  onPrimary: (value: string) => void;
  onMode: (value: ValuxMode) => void;
  onTint: (value: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-1 rounded-full bg-zinc-100 p-1">
        {(["light", "dark"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onMode(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              mode === value ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
            }`}
          >
            {value}
          </button>
        ))}
        <label className="flex items-center gap-2 pr-3 pl-4 text-xs font-medium text-zinc-500">
          Tint
          <input
            type="range"
            min={0}
            max={60}
            value={tint}
            onChange={(event) => onTint(Number(event.target.value))}
            className="w-20 accent-zinc-700"
          />
        </label>
      </div>
      <div className="flex items-center gap-2.5">
        {SWATCHES.map(([value, name]) => (
          <button
            key={value}
            type="button"
            aria-label={name}
            onClick={() => onPrimary(value)}
            className="h-6 w-6 rounded-full transition-transform hover:scale-125"
            style={{
              background: value,
              boxShadow:
                primary === value ? `0 0 0 2px #fff, 0 0 0 4px ${value}` : undefined,
            }}
          />
        ))}
        <label
          className="grid h-6 w-6 cursor-pointer place-items-center rounded-full border border-dashed border-zinc-300 text-[10px] text-zinc-400 hover:scale-125"
          title="Custom color"
        >
          🎨
          <input
            type="color"
            value={primary}
            onChange={(event) => onPrimary(event.target.value)}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  );
}
