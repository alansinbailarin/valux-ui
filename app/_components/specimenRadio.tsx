import { useState } from "react";
import { Radio, RadioGroup } from "@/src";
import type { Specimen } from "./specimenTypes";

export const RADIO_SPECIMEN: Specimen = {
  id: "radio",
  label: "Radio",
  description: "Accessible radio group for single-choice selections with smooth indicator transitions and clear focus rings",
  height: 230,
  node: (
    <RadioGroup defaultValue="pro" label="RadioGroup">
      <Radio value="free" label="Free" />
      <Radio value="pro" label="Pro" />
      <Radio value="team" label="Team" />
    </RadioGroup>
  ),
  controls: [
    { kind: "options", prop: "size", options: ["sm", "md", "lg"], initial: "md" },
    { kind: "flag", prop: "disabled" },
    { kind: "flag", prop: "withDescriptions" }
  ],
  render: function RadioRenderer(v) {
    const [value, setValue] = useState("pro");
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <RadioGroup value={value} onValueChange={setValue} label="Select a plan">
          <Radio 
            value="free" 
            label="Free" 
            size={v.size as "sm" | "md" | "lg"} 
            disabled={Boolean(v.disabled)} 
            description={v.withDescriptions ? "Basic features for individuals" : undefined}
          />
          <Radio 
            value="pro" 
            label="Pro" 
            size={v.size as "sm" | "md" | "lg"} 
            disabled={Boolean(v.disabled)}
            description={v.withDescriptions ? "Advanced features for professionals" : undefined}
          />
          <Radio 
            value="team" 
            label="Team" 
            size={v.size as "sm" | "md" | "lg"} 
            disabled={Boolean(v.disabled)}
            description={v.withDescriptions ? "Collaboration tools for organizations" : undefined}
          />
        </RadioGroup>
        <div style={{ fontSize: '0.875rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 60%, transparent)', fontFamily: 'monospace' }}>
          Selected: &quot;{value}&quot;
        </div>
      </div>
    );
  },
  renderSnippet: (v) => {
    const sizeStr = v.size && v.size !== "md" ? ` size="${v.size}"` : "";
    const disabledStr = v.disabled ? " disabled" : "";
    const withDesc = Boolean(v.withDescriptions);

    const code = `import { useState } from "react";
import { Radio, RadioGroup } from "@valux/ui";

export function Example() {
  const [value, setValue] = useState("pro");

  return (
    <RadioGroup value={value} onValueChange={setValue} label="Select a plan">
      <Radio value="free" label="Free"${sizeStr}${disabledStr}${withDesc ? ' description="Basic features for individuals"' : ''} />
      <Radio value="pro" label="Pro"${sizeStr}${disabledStr}${withDesc ? ' description="Advanced features for professionals"' : ''} />
      <Radio value="team" label="Team"${sizeStr}${disabledStr}${withDesc ? ' description="Collaboration tools for organizations"' : ''} />
    </RadioGroup>
  );
}
`;
    return [{ tok: "plain", text: code }];
  }
};
