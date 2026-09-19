/* eslint-disable max-lines */
"use client";

import { Radio, RadioGroup, Switch } from "@/src";

import { CodeBlock } from "./CodeBlock";
import type { Specimen, SpecimenValues } from "./specimenTypes";

import {
  SwatchIcon,
  PaintBrushIcon,
  ArrowsPointingOutIcon,
  CogIcon
} from "@heroicons/react/24/outline";

function getControlIcon(prop: string) {
  switch (prop) {
    case "variant": return SwatchIcon;
    case "color": return PaintBrushIcon;
    case "size": return ArrowsPointingOutIcon;
    default: return CogIcon;
  }
}

function getControlDescription(prop: string) {
  switch (prop) {
    case "variant": return "Adjusts the core visual style and background treatment";
    case "color": return "Sets the primary semantic color theme";
    case "size": return "Scales the component's internal padding and dimensions";
    case "side": return "Determines the anchored edge from which it expands";
    case "align": return "Controls alignment relative to the trigger axis";
    case "surface": return "Defines if the background inherits the trigger color";
    case "height": return "Limits the vertical expansion behavior";
    case "tone": return "Applies a semantic meaning via color variations";
    case "type": return "Sets the expected data format for the input";
    case "position": return "Anchors the element to a specific screen corner";
    default: return "Configures the component's internal behavior";
  }
}

export function SpecimenDetail({
  spec,
  values,
  onChange,
}: {
  spec: Specimen;
  values: SpecimenValues;
  onChange: (prop: string, value: string | boolean) => void;
}) {
  const { id, label, description, controls } = spec;
  const options = controls?.filter((c) => c.kind === "options") || [];
  const flags = controls?.filter((c) => c.kind === "flag") || [];

  const cardStyle = {
    border: "1px solid color-mix(in srgb, var(--vx-color-on-surface) 12%, transparent)",
    borderRadius: "var(--vx-radius-container, 1rem)",
    padding: "1.25rem 1.5rem",
    background: "transparent"
  };

  return (
    <div className="expand__detail">
      <h2 className="expand__name">{label}</h2>
      {description && <p className="expand__description">{description}</p>}

      {controls && controls.length > 0 && (
        <div 
          className="expand__props" 
          style={{ 
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "2rem"
          }}
        >
          {options.map((control) => {
            const ControlIcon = getControlIcon(control.prop);
            const desc = getControlDescription(control.prop);
            return (
              <div key={control.prop} style={cardStyle}>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600, color: 'var(--vx-color-on-surface)' }}>
                    <ControlIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                    {control.prop}
                  </span>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 50%, transparent)' }}>
                    {desc}
                  </p>
                </div>
                <RadioGroup
                  label={control.prop}
                  value={String(values[control.prop])}
                  onValueChange={(value) => onChange(control.prop, value)}
                >
                  {control.options.map((option) => (
                    <Radio key={option} value={option} label={option} />
                  ))}
                </RadioGroup>
              </div>
            );
          })}
          
          {flags.length > 0 && (
            <div className="expand__flags" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600, color: 'var(--vx-color-on-surface)' }}>
                  <CogIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                  states
                </span>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 50%, transparent)' }}>
                  Toggles specific boolean behaviors and modifiers
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '0.625rem 1.25rem' }}>
                {flags.map((control) => (
                  <Switch
                    key={control.prop}
                    label={control.prop}
                    checked={Boolean(values[control.prop])}
                    onChange={(event) => onChange(control.prop, event.target.checked)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {controls && controls.length > 0 && (
        <CodeBlock spec={spec} values={values} />
      )}
    </div>
  );
}
