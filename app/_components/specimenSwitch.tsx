import { useState } from "react";
import { Switch } from "@/src";
import type { Specimen } from "./specimenTypes";

export const SWITCH_SPECIMEN: Specimen = {
  id: "switch",
  label: "Switch",
  description: "Tactile toggle switch for immediate boolean settings, featuring spring-based motion and clear visual feedback",
  height: 230,
  node: <Switch defaultChecked label="Switch" />,
  controls: [
    { kind: "options", prop: "size", options: ["sm", "md", "lg"], initial: "md" },
    { kind: "flag", prop: "disabled" },
    { kind: "flag", prop: "withDescription" },
    { kind: "flag", prop: "labelFirst" }
  ],
  render: function SwitchRenderer(v) {
    const [checked, setChecked] = useState(true);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <Switch 
          checked={checked} 
          onChange={(e) => setChecked(e.target.checked)} 
          label="Notifications" 
          size={v.size as "sm" | "md" | "lg"} 
          disabled={Boolean(v.disabled)}
          description={v.withDescription ? "Receive alerts via email and SMS." : undefined}
          labelFirst={Boolean(v.labelFirst)}
        />
        <div style={{ fontSize: '0.875rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 60%, transparent)', fontFamily: 'monospace' }}>
          Current state: {checked ? 'true' : 'false'}
        </div>
      </div>
    );
  },
  renderSnippet: (v) => {
    const props = [];
    if (v.size && v.size !== "md") props.push(`size="${v.size}"`);
    if (v.disabled) props.push(`disabled`);
    if (v.withDescription) props.push(`description="Receive alerts via email and SMS."`);
    if (v.labelFirst) props.push(`labelFirst`);
    
    props.push(`label="Notifications"`);
    props.push(`checked={checked}`);
    props.push(`onChange={(e) => setChecked(e.target.checked)}`);
    
    const propsString = props.length > 0 ? `\n  ${props.join("\n  ")}\n` : "";

    const code = `import { useState } from "react";
import { Switch } from "@valux/ui";

export function Example() {
  const [checked, setChecked] = useState(true);

  return (
    <Switch${propsString}/>
  );
}
`;
    return [{ tok: "plain", text: code }];
  }
};
