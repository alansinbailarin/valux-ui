"use client";

import { useLayoutEffect, useRef, useState } from "react";

import type { SelectContentProps, SelectOption } from "./Select.types";
import { SelectOptions } from "./SelectOptions";
import { useSelectContext } from "./SelectContext";
import { useSelectKeyboard } from "./useSelectKeyboard";
import { useDismiss } from "../a11y/useDismiss";
import { useMenuPosition } from "../menu/useMenuPosition";
import { useCloseScrub } from "../morph/useCloseScrub";
import { useMorph } from "../morph/useMorph";

function textOf(option: SelectOption): string {
  return (option.textValue ?? String(option.label)).toLowerCase();
}

export function SelectContentSurface({
  side = "auto",
  align = "auto",
  searchable = false,
  searchPlaceholder = "Search…",
  emptyMessage = "No results",
  className,
  style,
  ...props
}: SelectContentProps) {
  const { options, value, select, phase, setOpen, setPhase, triggerRef, selectId } =
    useSelectContext();
  const panelRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const [filter, setFilter] = useState("");
  const active = phase === "opening" || phase === "open";

  // The panel is EXACTLY as wide as the field it blooms from, and the
  // return-ghost inherits the field's text inset so the label lands where
  // the trigger text lives (left-aligned, not centered). Declared BEFORE
  // useMenuPosition so the width is set when the panel is measured.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger || phase === "closed") return;
    panel.style.width = `${trigger.getBoundingClientRect().width}px`;
    const button = trigger.querySelector("button");
    if (button) {
      panel.style.setProperty(
        "--vx-select-ghost-px",
        getComputedStyle(button).paddingLeft,
      );
    }
  }, [phase, triggerRef]);

  useMenuPosition({ panelRef, ghostRef, triggerRef, phase, side, align, surface: "auto" });
  useMorph({
    phase,
    panelRef,
    triggerRef,
    ghostRef,
    onOpened: () => setPhase("open"),
    onClosed: () => {
      setPhase("closed");
      setFilter("");
    },
  });
  useDismiss({ active, dismissable: true, panelRef, onDismiss: () => setOpen(false) });
  useCloseScrub({
    panelRef,
    triggerRef,
    active: phase === "open",
    onDismiss: () => setOpen(false),
  });
  useSelectKeyboard({ ref: panelRef, active, onClose: () => setOpen(false) });

  // Focus lands on the filter (searchable) or the selected option.
  useLayoutEffect(() => {
    if (phase !== "open") return;
    const panel = panelRef.current;
    if (!panel) return;
    const target = searchable
      ? panel.querySelector<HTMLElement>(".vx-select__search input")
      : (panel.querySelector<HTMLElement>('[role="option"][aria-selected="true"]') ??
        panel.querySelector<HTMLElement>('[role="option"]:not([disabled])'));
    target?.focus();
  }, [phase, searchable]);
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    return () => trigger?.querySelector<HTMLElement>("button")?.focus();
  }, [triggerRef]);

  const shown = filter
    ? options.filter((option) => textOf(option).includes(filter.toLowerCase()))
    : options;

  return (
    <div
      {...props}
      ref={panelRef}
      id={selectId}
      data-vx-select-panel=""
      data-vx-phase={phase}
      className={["vx-select-panel", className].filter(Boolean).join(" ")}
      style={{ position: "fixed", ...style }}
    >
      {searchable ? (
        <div className="vx-select__search">
          <input
            value={filter}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            onChange={(event) => setFilter(event.target.value)}
          />
        </div>
      ) : null}
      <SelectOptions
        options={shown}
        value={value}
        select={select}
        labelledBy={`${selectId}-label`}
        emptyMessage={emptyMessage}
      />
      {phase === "closing" ? (
        <div aria-hidden="true" className="vx-select-ghost">
          <span ref={ghostRef} className="vx-select-ghost__inner" />
        </div>
      ) : null}
    </div>
  );
}
