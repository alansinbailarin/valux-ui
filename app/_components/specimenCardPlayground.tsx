import { Card, Button } from "@/src";
import type { Specimen } from "./specimenTypes";

export const CARD_SPECIMEN: Specimen = {
  id: "card",
  label: "Card",
  description: "Versatile content container with semantic variants, built-in padding control, and elegant hover elevations",
  height: 280,
  node: (
    <Card variant="outline" style={{ width: '14rem' }}>
      <Card.Header>
        <Card.Title>Hey Jude.pdf</Card.Title>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 60%, transparent)' }}>2.4 MB</p>
      </Card.Header>
    </Card>
  ),
  controls: [
    { kind: "options", prop: "variant", options: ["outline", "elevated", "soft"], initial: "outline" },
    { kind: "options", prop: "padding", options: ["default", "none"], initial: "default" },
    { kind: "flag", prop: "withMedia" },
    { kind: "flag", prop: "withFooter" },
    { kind: "flag", prop: "subtleFooter" },
  ],
  render: (v) => {
    return (
      <Card
        variant={v.variant as "outline" | "elevated" | "soft"}
        padding={v.padding as "default" | "none"}
        style={{ width: '20rem' }}
      >
        {v.withMedia && (
          <Card.Media
            src="https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=1000&auto=format&fit=crop"
            alt="Mountains"
            ratio={16/9}
          />
        )}
        <Card.Header>
          <Card.Title>Yosemite Valley</Card.Title>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 60%, transparent)' }}>
            California, USA
          </p>
        </Card.Header>
        <Card.Body>
          <p style={{ margin: 0, color: 'color-mix(in srgb, var(--vx-color-on-surface) 80%, transparent)' }}>
            Yosemite National Park is in California&apos;s Sierra Nevada mountains. It&apos;s famous for its giant, ancient sequoia trees, and for Tunnel View.
          </p>
        </Card.Body>
        {v.withFooter && (
          <Card.Footer surface={v.subtleFooter ? "subtle" : "none"} style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="soft">Share</Button>
            <Button color="primary">Book now</Button>
          </Card.Footer>
        )}
      </Card>
    );
  },
  renderSnippet: (v) => {
    const props = [];
    if (v.variant && v.variant !== "outline") props.push(`variant="${v.variant}"`);
    if (v.padding && v.padding !== "default") props.push(`padding="${v.padding}"`);
    const propsString = props.length > 0 ? ` ${props.join(" ")}` : "";

    let code = `import { Card, Button } from "@valux/ui";\n\nexport function Example() {\n  return (\n    <Card${propsString}>\n`;
    
    if (v.withMedia) {
      code += `      <Card.Media\n        src="/yosemite.jpg"\n        alt="Mountains"\n        ratio={16/9}\n      />\n`;
    }
    
    code += `      <Card.Header>\n        <Card.Title>Yosemite Valley</Card.Title>\n        <p>California, USA</p>\n      </Card.Header>\n`;
    code += `      <Card.Body>\n        <p>Yosemite National Park is famous for its giant sequoia trees.</p>\n      </Card.Body>\n`;
    
    if (v.withFooter) {
      code += `      <Card.Footer${v.subtleFooter ? ' surface="subtle"' : ''}>\n        <Button variant="soft">Share</Button>\n        <Button color="primary">Book now</Button>\n      </Card.Footer>\n`;
    }
    
    code += `    </Card>\n  );\n}\n`;
    
    return [{ tok: "plain", text: code }];
  }
};
