/* eslint-disable max-lines */
import { Button, Sheet, Card } from "@/src";
import { CheckIcon } from "lucide-react";
import type { Specimen } from "./specimenTypes";

const FEATURE = ({ text }: { text: string }) => (
  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 80%, transparent)' }}>
    <CheckIcon size={16} style={{ color: 'var(--vx-color-primary-base)' }} />
    {text}
  </li>
);

const SHEET_INNER = (
  <>
    <Sheet.Header>
      <Sheet.Title>Choose a Workspace Plan</Sheet.Title>
      <Sheet.Description>Upgrade to unlock advanced features and unlimited projects.</Sheet.Description>
    </Sheet.Header>
    <Sheet.Body>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <Card variant="outline" style={{ display: 'flex', flexDirection: 'column' }}>
          <Card.Body style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h4 style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Starter</h4>
            <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 60%, transparent)' }}>Perfect for side projects.</p>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>$0</span>
              <span style={{ fontSize: '0.875rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 50%, transparent)' }}>/mo</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              <FEATURE text="1 active project" />
              <FEATURE text="Community support" />
            </ul>
            <Button variant="soft" style={{ width: '100%', marginTop: 'auto' }}>Current Plan</Button>
          </Card.Body>
        </Card>

        <Card variant="soft" style={{ display: 'flex', flexDirection: 'column', border: '1px solid color-mix(in srgb, var(--vx-color-primary-base) 40%, transparent)' }}>
          <Card.Body style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h4 style={{ margin: '0 0 0.5rem', fontWeight: 600, color: 'var(--vx-color-primary-base)' }}>Pro</h4>
            <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 60%, transparent)' }}>For professional developers.</p>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>$12</span>
              <span style={{ fontSize: '0.875rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 50%, transparent)' }}>/mo</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              <FEATURE text="Unlimited projects" />
              <FEATURE text="Priority support" />
              <FEATURE text="Custom domains" />
            </ul>
            <Button color="primary" style={{ width: '100%', marginTop: 'auto' }}>Upgrade to Pro</Button>
          </Card.Body>
        </Card>

        <Card variant="outline" style={{ display: 'flex', flexDirection: 'column' }}>
          <Card.Body style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h4 style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Team</h4>
            <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 60%, transparent)' }}>For scaling organizations.</p>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>$49</span>
              <span style={{ fontSize: '0.875rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 50%, transparent)' }}>/mo</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              <FEATURE text="Everything in Pro" />
              <FEATURE text="Unlimited team members" />
              <FEATURE text="SSO & Advanced Security" />
            </ul>
            <Button variant="outline" style={{ width: '100%', marginTop: 'auto' }}>Contact Sales</Button>
          </Card.Body>
        </Card>
      </div>
    </Sheet.Body>
  </>
);

export const SHEET_SPECIMEN: Specimen = {
  id: "sheet",
  label: "Sheet",
  description: "Bottom-anchored mobile-first panel ideal for deep content, complex forms, or responsive pricing and navigation layouts",
  height: 230,
  node: (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button color="primary">Upgrade Plan</Button>
      </Sheet.Trigger>
      <Sheet.Content height="half">
        {SHEET_INNER}
      </Sheet.Content>
    </Sheet>
  ),
  controls: [
    { kind: "options", prop: "height", options: ["auto", "half", "full"], initial: "auto" },
    { kind: "flag", prop: "expandable" },
    { kind: "flag", prop: "dismissable" },
  ],
  render: (v) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '2rem 0' }}>
        <Sheet>
          <Sheet.Trigger asChild>
            <Button color="primary">Upgrade Plan</Button>
          </Sheet.Trigger>
          <Sheet.Content 
            height={v.height as "auto" | "half" | "full"}
            expandable={Boolean(v.expandable)}
            dismissable={v.dismissable !== false}
          >
            {SHEET_INNER}
          </Sheet.Content>
        </Sheet>
      </div>
    );
  },
  renderSnippet: (v) => {
    const props = [];
    if (v.height && v.height !== "auto") props.push(`height="${v.height}"`);
    if (v.expandable) props.push(`expandable`);
    if (v.dismissable === false) props.push(`dismissable={false}`);
    const propsString = props.length > 0 ? ` ${props.join(" ")}` : "";

    const code = `import { Button, Sheet, Card } from "@valux/ui";
import { CheckIcon } from "lucide-react";

export function Example() {
  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button color="primary">Upgrade Plan</Button>
      </Sheet.Trigger>
      <Sheet.Content${propsString}>
        <Sheet.Header>
          <Sheet.Title>Choose a Workspace Plan</Sheet.Title>
        </Sheet.Header>
        <Sheet.Body>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            <Card variant="outline" style={{ display: "flex", flexDirection: "column" }}>
              <Card.Body style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <h4>Starter</h4>
                <b style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>$0 /mo</b>
                <ul style={{ flex: 1 }}>
                  <li><CheckIcon size={16} /> 1 active project</li>
                </ul>
                <Button variant="soft" style={{ marginTop: "auto" }}>Current Plan</Button>
              </Card.Body>
            </Card>
            {/* ... Other Plans ... */}
          </div>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet>
  );
}
`;
    return [{ tok: "plain", text: code }];
  }
};
