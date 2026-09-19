"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ValuxProvider, Switch } from "@/src";
import type { ValuxMode } from "@/src";

const NAV = [
  ["/button", "Button"],
  ["/menu", "Menu"],
  ["/popover", "Popover"],
  ["/tooltip", "Tooltip"],
  ["/dialog", "Dialog"],
  ["/sheet", "Sheet"],
  ["/drawer", "Drawer"],
  ["/card", "Card"],
  ["/toast", "Toast"],
  ["/input", "Input"],
  ["/switch", "Switch"],
  ["/selection", "Checkbox/Radio"],
  ["/select", "Select"],
  ["/context-menu", "Context menu"],
  ["/transition-lab", "Transitions"],
  ["/test", "Test"],
] as const;

const EXTRAS = [["/color-demo", "Color demo"]] as const;

/** Shared showroom chrome: sidebar navigation + optional page header. */
export function ShowroomShell({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mode, setMode] = useState<ValuxMode>("light");
  const dark = mode === "dark";

  const link = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={`block rounded-lg px-3 py-1.5 text-sm ${
        pathname === href
          ? dark
            ? "bg-white font-semibold text-zinc-950"
            : "bg-zinc-900 font-semibold text-white"
          : dark
            ? "text-zinc-400 hover:bg-zinc-800"
            : "text-zinc-600 hover:bg-zinc-200"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <main className="min-h-[100dvh]">
      <ValuxProvider
        theme={{ mode }}
        className={`min-h-[100dvh] lg:grid lg:grid-cols-[13rem_1fr] ${
          dark ? "bg-zinc-950 text-zinc-50" : "bg-white text-zinc-950"
        }`}
      >
        <aside
          className={`flex flex-col border-b px-4 py-6 lg:sticky lg:top-0 lg:h-[100dvh] lg:border-r lg:border-b-0 ${
            dark ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-white"
          }`}
        >
          <Link
            href="/"
            className={`mb-4 block text-xs font-medium tracking-[0.2em] uppercase ${
              dark ? "text-zinc-500 hover:text-white" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Valux UI
          </Link>
          <nav className="flex flex-wrap gap-1 lg:flex-col">
            {NAV.map(([href, label]) => link(href, label))}
            <div
              className={`my-2 hidden h-px w-full lg:block ${dark ? "bg-zinc-800" : "bg-zinc-200"}`}
            />
            {EXTRAS.map(([href, label]) => link(href, label))}
          </nav>
          <div
            className={`mt-6 border-t pt-6 lg:mt-auto ${dark ? "border-zinc-800" : "border-zinc-200"}`}
          >
            <Switch
              size="sm"
              label="Dark mode"
              checked={dark}
              onChange={(event) => setMode(event.target.checked ? "dark" : "light")}
            />
          </div>
        </aside>
        <div className="px-4 py-10 sm:px-6 lg:py-14">
          <div className="mx-auto max-w-6xl">
            {title ? (
              <header className="mb-8 max-w-2xl">
                <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                  {title}
                </h1>
                {description ? (
                  <p
                    className={`mt-4 text-sm leading-6 sm:text-base ${
                      dark ? "text-zinc-400" : "text-zinc-600"
                    }`}
                  >
                    {description}
                  </p>
                ) : null}
              </header>
            ) : null}
            {children}
          </div>
        </div>
      </ValuxProvider>
    </main>
  );
}
