import type { NativeThemeControlsProps } from "./showroom.types";

export function NativeThemeControls({
  primary,
  tint,
  onPrimaryChange,
  onTintChange,
}: NativeThemeControlsProps) {
  return (
    <div className="space-y-5">
      <label className="flex items-center justify-between gap-4 text-xs font-medium text-zinc-500">
        Color primario
        <input
          aria-label="Color primario"
          type="color"
          value={primary ?? "#18181b"}
          onChange={(event) => onPrimaryChange(event.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border border-zinc-200 bg-transparent p-1"
        />
      </label>
      <div className="space-y-2 text-xs font-medium text-zinc-500">
        <div className="flex justify-between">
          <label htmlFor="showroom-tint">Intensidad</label>
          <output htmlFor="showroom-tint">{tint}%</output>
        </div>
        <input
          id="showroom-tint"
          type="range"
          min="0"
          max="100"
          step="10"
          value={tint}
          onChange={(event) => onTintChange(Number(event.target.value))}
          className="w-full cursor-pointer accent-zinc-950"
        />
      </div>
    </div>
  );
}
