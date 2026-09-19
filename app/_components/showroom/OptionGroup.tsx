import type { OptionGroupProps } from "./showroom.types";

export function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: OptionGroupProps<T>) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-medium text-zinc-500">{label}</legend>
      <div className="flex flex-wrap gap-1 rounded-xl bg-zinc-100 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-950 aria-pressed:bg-white aria-pressed:text-zinc-950 aria-pressed:shadow-sm"
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
