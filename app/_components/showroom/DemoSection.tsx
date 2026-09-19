"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ValuxProvider } from "@/src";
import type { ValuxMode } from "@/src";

const THEME = { color: { primary: "#4f46e5", surfaceTint: 25 } };

/** Card grid with a light/dark toggle — every capability demo lives in one. */
export function DemoBoard({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ValuxMode>("light");
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
        <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Tema</span>
        {(["light", "dark"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={`rounded-lg px-3 py-1 text-xs font-semibold ${
              mode === value ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {value}
          </button>
        ))}
      </div>
      <ValuxProvider theme={{ mode, ...THEME }}>
        <div
          className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3"
          style={{ background: "var(--vx-color-surface)", color: "var(--vx-color-on-surface)" }}
        >
          {children}
        </div>
      </ValuxProvider>
    </section>
  );
}

/** One capability demo: label + free content area. */
export function Demo({ label, children, tall }: { label: string; children: ReactNode; tall?: boolean }) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 ${tall ? "min-h-56" : "min-h-36"}`}
      style={{ borderColor: "color-mix(in srgb, var(--vx-color-on-surface), transparent 88%)" }}
    >
      <p className="text-xs font-medium tracking-wide uppercase" style={{ opacity: 0.55 }}>
        {label}
      </p>
      <div className="flex flex-wrap items-start gap-2">{children}</div>
    </div>
  );
}
