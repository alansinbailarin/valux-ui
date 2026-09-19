/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode, useState, useRef, useCallback } from "react";
import { Card } from "@/src";
import type { Specimen, SpecimenValues } from "./specimenTypes";
import { ExpandPanel } from "./ExpandPanel";
import { withExpandTransition } from "./expandTransition";

export function SpecimenCard({ spec, children }: { spec: Specimen; children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(false);
  
  const [values, setValues] = useState<SpecimenValues>(() => {
    const init: SpecimenValues = {};
    for (const control of spec.controls || []) {
      if (control.kind === "options") init[control.prop] = control.initial;
      if (control.kind === "flag") init[control.prop] = false;
    }
    return init;
  });

  const onChange = useCallback((prop: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [prop]: value }));
  }, []);

  const cardRef = useRef<HTMLDivElement>(null);

  const open = () => {
    setActive(true);
    withExpandTransition(
      () => setExpanded(true),
      () => {}
    );
  };

  const close = () => {
    withExpandTransition(
      () => setExpanded(false),
      () => setActive(false)
    );
  };

  return (
    <>
      
      <Card
        ref={cardRef}
        className={`mosaic__specimen ${expanded ? "mosaic__specimen--vacated" : ""}`}
        data-spec-active={active ? "" : undefined}
        style={{ height: "15rem", cursor: expanded ? 'default' : 'pointer', position: 'relative', display: 'flex', flexDirection: 'column' }}
        onClick={expanded ? undefined : open}
      >
        <div className="specimen-chip" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </div>
        <div 
          style={{ 
            padding: "1rem 1.25rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--vx-color-surface-dim)",
            borderTop: "1px solid color-mix(in srgb, var(--vx-color-on-surface) 6%, transparent)",
            pointerEvents: "none"
          }}
        >
          {spec.label}
        </div>
      </Card>
      
      {expanded && (
        <ExpandPanel
          spec={spec}
          values={values}
          onChange={onChange}
          collapse={close}
          closeRef={cardRef as any}
        >
          {children}
        </ExpandPanel>
      )}
    </>
  );
}
