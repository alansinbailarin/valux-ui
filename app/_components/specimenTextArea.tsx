import { useState } from "react";
import { TextArea } from "@/src";
import type { Specimen } from "./specimenTypes";

export const TEXTAREA_SPECIMEN: Specimen = {
  id: "textarea",
  label: "TextArea",
  description: "Multi-line text field that automatically expands its height to fit the content while maintaining strict max-length bounds",
  height: 300,
  node: (
    <div style={{ width: "100%" }}>
      <TextArea label="TextArea" placeholder="Type here..." rows={4} />
    </div>
  ),
  controls: [
    { kind: "options", prop: "variant", options: ["outline", "soft"], initial: "outline" },
    { kind: "options", prop: "size", options: ["sm", "md", "lg"], initial: "md" },
    { kind: "options", prop: "tone", options: ["neutral", "danger", "success", "warning"], initial: "neutral" },
    { kind: "flag", prop: "disabled" },
    { kind: "flag", prop: "withHint" },
    { kind: "flag", prop: "autoGrow" },
    { kind: "flag", prop: "showCount" },
  ],
  render: function TextAreaRenderer(v) {
    const [value, setValue] = useState("");
    
    const tone = v.tone !== "neutral" ? (v.tone as "danger" | "success" | "warning") : undefined;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '20rem' }}>
        <TextArea
          variant={v.variant as "outline" | "soft"}
          size={v.size as "sm" | "md" | "lg"}
          tone={tone}
          disabled={Boolean(v.disabled)}
          label="Bio"
          hint={v.withHint ? "Maximum 150 characters." : undefined}
          placeholder="Tell us about yourself..."
          autoGrow={v.autoGrow !== false}
          showCount={Boolean(v.showCount)}
          maxLength={v.showCount ? 150 : undefined}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
        />
      </div>
    );
  },
  renderSnippet: (v) => {
    const props = [];
    if (v.variant && v.variant !== "outline") props.push(`variant="${v.variant}"`);
    if (v.size && v.size !== "md") props.push(`size="${v.size}"`);
    if (v.tone && v.tone !== "neutral") props.push(`tone="${v.tone}"`);
    if (v.disabled) props.push(`disabled`);
    if (v.autoGrow === false) props.push(`autoGrow={false}`);
    if (v.showCount) {
      props.push(`showCount`);
      props.push(`maxLength={150}`);
    }
    
    props.push(`label="Bio"
          hint={v.withHint ? "Maximum 150 characters." : undefined}`);
    props.push(`placeholder="Tell us about yourself..."`);
    props.push(`value={value}`);
    props.push(`onChange={(e) => setValue(e.target.value)}`);

    const propsString = props.length > 0 ? `\n  ${props.join("\n  ")}\n` : "";

    const code = `import { useState } from "react";\nimport { TextArea } from "@valux/ui";\n\nexport function Example() {\n  const [value, setValue] = useState("");\n\n  return (\n    <TextArea${propsString}/>\n  );\n}\n`;
    
    return [{ tok: "plain", text: code }];
  }
};
