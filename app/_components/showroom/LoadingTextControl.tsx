import type { LoadingTextControlProps } from "./showroom.types";

export function LoadingTextControl({
  onChange,
  value,
}: LoadingTextControlProps) {
  return (
    <div className="space-y-2">
      <label
        className="block text-xs font-medium text-zinc-500"
        htmlFor="showroom-loading-text"
      >
        Texto loading
      </label>
      <input
        id="showroom-loading-text"
        className="h-9 w-full cursor-text rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-400"
        placeholder="Vacío = solo spinner"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
