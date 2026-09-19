"use client";

/** Built-in reveal toggle for type="password". */
export function PasswordEye({
  revealed,
  label,
  onToggle,
}: {
  revealed: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="vx-input__eye"
      aria-label={label}
      aria-pressed={revealed}
      onClick={onToggle}
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M2.5 10s2.8-4.5 7.5-4.5S17.5 10 17.5 10s-2.8 4.5-7.5 4.5S2.5 10 2.5 10Z" />
        {revealed ? <path d="m4 16 12-12" strokeLinecap="round" /> : <circle cx="10" cy="10" r="2" />}
      </svg>
    </button>
  );
}
