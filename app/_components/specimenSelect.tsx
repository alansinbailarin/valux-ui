import { useState } from "react";
import { Select } from "@/src";
import type { Specimen } from "./specimenTypes";

const COUNTRIES = [
  { value: "mx", label: "Mexico" },
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "br", label: "Brazil" },
  { value: "ar", label: "Argentina" },
  { value: "co", label: "Colombia" },
  { value: "cl", label: "Chile" },
  { value: "pe", label: "Peru" },
  { value: "ve", label: "Venezuela" },
  { value: "uy", label: "Uruguay" },
];

export const SELECT_SPECIMEN: Specimen = {
  id: "select",
  label: "Select",
  description: "Fully styled combobox for single-choice selections, offering native keyboard navigation and type-ahead support",
  height: 230,
  node: (
    <div style={{ width: "100%" }}>
      <Select options={COUNTRIES} defaultValue="mx">
        <Select.Trigger label="Select" />
        <Select.Content />
      </Select>
    </div>
  ),
  controls: [
    { kind: "options", prop: "variant", options: ["outline", "soft"], initial: "outline" },
    { kind: "options", prop: "size", options: ["sm", "md", "lg"], initial: "md" },
    { kind: "options", prop: "tone", options: ["neutral", "danger", "success", "warning"], initial: "neutral" },
    { kind: "flag", prop: "searchable" },
    { kind: "flag", prop: "disabled" },
    { kind: "flag", prop: "withHint" },
  ],
  render: function SelectRenderer(v) {
    const [value, setValue] = useState("mx");
    
    const tone = v.tone !== "neutral" ? (v.tone as "danger" | "success" | "warning") : undefined;
    let message = undefined;
    if (tone === "danger") message = "Service not available in this region.";
    if (tone === "success") message = "Available for next-day shipping!";
    if (tone === "warning") message = "Shipping delays expected.";

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '20rem' }}>
        <Select
          options={COUNTRIES}
          value={value}
          onValueChange={setValue}
          disabled={Boolean(v.disabled)}
        >
          <Select.Trigger
            variant={v.variant as "outline" | "soft"}
            size={v.size as "sm" | "md" | "lg"}
            tone={tone}
            label="Select"
            placeholder="Choose a country"
            hint={v.withHint ? "Select your primary residence." : undefined}
            message={message}
          />
          <Select.Content 
            searchable={Boolean(v.searchable)} 
            searchPlaceholder="Search country..."
          />
        </Select>
        
        <div style={{ fontSize: '0.875rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 60%, transparent)', fontFamily: 'monospace' }}>
          Selected value: {value || '""'}
        </div>
      </div>
    );
  },
  renderSnippet: (v) => {
    const props = [];
    if (v.variant && v.variant !== "outline") props.push(`variant="${v.variant}"`);
    if (v.size && v.size !== "md") props.push(`size="${v.size}"`);
    if (v.tone && v.tone !== "neutral") props.push(`tone="${v.tone}"`);
    
    props.push(`label="Select"`);
    props.push(`placeholder="Choose a country"`);
    if (v.withHint) props.push(`hint="Select your primary residence."`);
    
    if (v.tone === "danger") props.push(`message="Service not available in this region."`);
    if (v.tone === "success") props.push(`message="Available for next-day shipping!"`);
    if (v.tone === "warning") props.push(`message="Shipping delays expected."`);

    const triggerPropsStr = props.length > 0 ? `\n        ${props.join("\n        ")}\n      ` : "";
    const contentPropsStr = v.searchable ? ` searchable searchPlaceholder="Search country..."` : "";
    const disabledStr = v.disabled ? " disabled" : "";

    const code = `import { useState } from "react";
import { Select } from "@valux/ui";

const COUNTRIES = [
  { value: "mx", label: "Mexico" },
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
];

export function Example() {
  const [value, setValue] = useState("mx");

  return (
    <Select
      options={COUNTRIES}
      value={value}
      onValueChange={setValue}${disabledStr}
    >
      <Select.Trigger${triggerPropsStr}/>
      <Select.Content${contentPropsStr}/>
    </Select>
  );
}
`;
    return [{ tok: "plain", text: code }];
  }
};
