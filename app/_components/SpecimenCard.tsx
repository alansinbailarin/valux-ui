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
        style={{ height: "15rem", cursor: expanded ? 'default' : 'pointer' }}
        onClick={expanded ? undefined : open}
      >
        <div className="specimen-chip">
          {children}
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
