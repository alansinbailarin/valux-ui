/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Toaster, toast } from "@/src";
import type { Specimen } from "./specimenTypes";

export const TOAST_SPECIMEN: Specimen = {
  id: "toast",
  label: "Toast",
  description: "Imperative message stack for non-blocking notifications, featuring auto-dismissal, semantic tones, and action callbacks",
  height: 230,
  node: (
    <Button variant="soft" onClick={(e) => { e.stopPropagation(); toast("Hello there!"); }}>
Toast
    </Button>
  ),
  controls: [
    { kind: "options", prop: "position", options: ["bottom", "top", "bottom-right", "bottom-left", "top-right", "top-left"], initial: "bottom" },
    { kind: "options", prop: "tone", options: ["neutral", "success", "danger", "warning", "info"], initial: "neutral" },
    { kind: "flag", prop: "withAction" },
    { kind: "flag", prop: "infiniteDuration" },
  ],
  render: (v) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', width: '100%', padding: '2rem 0' }}>
        <style>{`.global-toaster { display: none !important; }`}</style>
        <Toaster position={v.position as any} />
        <Button 
          color="primary" 
          onClick={() => {
            const hasAction = Boolean(v.withAction);
            const isNeutral = v.tone === "neutral";
            
            toast({
              title: isNeutral ? "Changes saved" : "Task completed",
              description: hasAction 
                ? "Your document has been updated and published." 
                : (isNeutral ? undefined : "Everything looks good."),
              tone: isNeutral ? undefined : v.tone as any,
              action: hasAction ? { label: "Undo", onClick: () => alert("Undone!") } : undefined,
              duration: v.infiniteDuration ? 0 : undefined
            });
          }}
        >
Toast
        </Button>
      </div>
    );
  },
  renderSnippet: (v) => {
    const props = [];
    if (v.position && v.position !== "bottom") props.push(`position="${v.position}"`);
    const propsString = props.length > 0 ? ` ${props.join(" ")}` : "";

    const hasAction = Boolean(v.withAction);
    const isNeutral = v.tone === "neutral";

    let opts = "";
    if (!isNeutral || hasAction) {
      opts += `{\n            title: "${isNeutral ? 'Changes saved' : 'Task completed'}",\n`;
      if (hasAction) opts += `            description: "Imperative message stack for non-blocking notifications, featuring auto-dismissal, semantic tones, and action callbacks",\n`;
      else if (!isNeutral) opts += `            description: "Imperative message stack for non-blocking notifications, featuring auto-dismissal, semantic tones, and action callbacks",\n`;
      
      if (!isNeutral) opts += `            tone: "${v.tone}",\n`;
      if (hasAction) opts += `            action: { label: "Undo", onClick: () => console.log("Undone!") }\n`;
      opts += "          }";
    } else {
      opts = `"Changes saved"`;
    }

    const code = `import { Button, Toaster, toast } from "@valux/ui";

export function App() {
  return (
    <>
      {/* Place Toaster once at the root of your app */}
      <Toaster${propsString} />
      
      <Button 
        onClick={() => {
          toast(${opts});
        }}
      >
Toast
      </Button>
    </>
  );
}
`;
    return [{ tok: "plain", text: code }];
  }
};
