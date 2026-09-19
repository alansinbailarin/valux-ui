import { useState } from "react";
import { Checkbox } from "@/src";
import type { Specimen } from "./specimenTypes";

export const CHECKBOX_SPECIMEN: Specimen = {
  id: "checkbox",
  label: "Checkbox",
  description: "Form control for multiple selections, supporting native indeterminate states and fluid checked animations",
  height: 230,
  node: <Checkbox defaultChecked label="Remember me" />,
  controls: [
    { kind: "options", prop: "size", options: ["sm", "md", "lg"], initial: "md" },
    { kind: "flag", prop: "disabled" },
    { kind: "flag", prop: "indeterminate" },
    { kind: "flag", prop: "withDescription" }
  ],
  render: function CheckboxRenderer(v) {
    const [checked, setChecked] = useState(true);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <Checkbox 
          checked={checked} 
          onChange={(e) => setChecked(e.target.checked)} 
          label="Accept Terms and Conditions" 
          size={v.size as "sm" | "md" | "lg"} 
          disabled={Boolean(v.disabled)}
          indeterminate={Boolean(v.indeterminate)}
          description={v.withDescription ? "You must agree to continue using the application." : undefined}
        />
        <div style={{ fontSize: '0.875rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 60%, transparent)', fontFamily: 'monospace' }}>
          Current state: {v.indeterminate ? '"indeterminate"' : (checked ? 'true' : 'false')}
        </div>
      </div>
    );
  },
  renderSnippet: (v) => {
    const props = [];
    if (v.size && v.size !== "md") props.push(`size="${v.size}"`);
    if (v.disabled) props.push(`disabled`);
    if (v.indeterminate) props.push(`indeterminate`);
    if (v.withDescription) props.push(`description="You must agree to continue using the application."`);
    
    props.push(`label="Accept Terms and Conditions"`);
    props.push(`checked={checked}`);
    props.push(`onChange={(e) => setChecked(e.target.checked)}`);
    
    const propsString = props.length > 0 ? `\n  ${props.join("\n  ")}\n` : "";

    const code = `import { useState } from "react";
import { Checkbox } from "@valux/ui";

export function Example() {
  const [checked, setChecked] = useState(true);

  return (
    <Checkbox${propsString}/>
  );
}
`;
    return [{ tok: "plain", text: code }];
  }
};
