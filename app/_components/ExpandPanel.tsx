/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";

import { XMarkIcon } from "@heroicons/react/24/outline";

import { Button } from "@/src";

import { DraggableSpecimen } from "./DraggableSpecimen";
import { SpecimenDetail } from "./SpecimenDetail";
import type { Specimen, SpecimenValues } from "./specimenTypes";

const closeStyle = {
  borderRadius: 999,
  "--vx-button-background":
    "color-mix(in srgb, var(--vx-color-on-surface) 4%, transparent)",
  "--vx-button-background-hover":
    "color-mix(in srgb, var(--vx-color-on-surface) 9%, transparent)",
  "--vx-button-foreground":
    "color-mix(in srgb, var(--vx-color-on-surface) 62%, transparent)",
} as CSSProperties;

/** The giant panel: quiet close circle, detail playground on the left,
 * live canvas on the right. */
export function ExpandPanel({
  spec,
  values,
  onChange,
  collapse,
  closeRef,
  children,
}: {
  spec: Specimen;
  values: SpecimenValues;
  onChange: (prop: string, value: string | boolean) => void;
  collapse: () => void;
  closeRef: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
}) {
  return (
    <div className="expand">
      <div className="expand__scrim" onClick={collapse} />
      <section
        className="expand__panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${spec.label} component`}
      >
        <header className="expand__bar">
          <Button
            ref={closeRef}
            variant="soft"
            iconOnly
            aria-label="Close"
            style={closeStyle}
            onClick={collapse}
          >
            <XMarkIcon />
          </Button>
        </header>
        <div className="expand__body">
          <SpecimenDetail spec={spec} values={values} onChange={onChange} />
          {/* Live here, on purpose: the canvas is where you touch — and
              where the detail panel's knobs land in real time. */}
          <div className="expand__canvas">
            <DraggableSpecimen>
              <span className="specimen-chip">
                {spec.render ? (() => {
                  const Render = spec.render as React.FC<any>;
                  return <Render {...values} />;
                })() : children}
              </span>
            </DraggableSpecimen>
          </div>
        </div>
      </section>
    </div>
  );
}
