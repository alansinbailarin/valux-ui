/** Blends a (possibly translucent) foreground color over an opaque
 * background color; returns null when either cannot be parsed. */
export function compositeOver(
  foreground: string,
  background: string,
): string | null {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) return null;
  const a = fg[3];
  const mix = (f: number, b: number) => Math.round(f * a + b * (1 - a));
  return `rgb(${mix(fg[0], bg[0])}, ${mix(fg[1], bg[1])}, ${mix(fg[2], bg[2])})`;
}

let scratch: CanvasRenderingContext2D | null | undefined;

/** Resolves ANY color the browser can compute — modern engines serialize
 * color-mix() results as oklab()/color(srgb ...), and new syntaxes keep
 * appearing — by painting one pixel and reading it back. Regexes stay as
 * fast paths (and as the only path in jsdom, where canvas is stubbed). */
function parseColor(color: string): [number, number, number, number] | null {
  const rgb = /rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/.exec(color);
  if (rgb) {
    return [+rgb[1], +rgb[2], +rgb[3], rgb[4] === undefined ? 1 : +rgb[4]];
  }
  const srgb = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/.exec(color);
  if (srgb) {
    return [+srgb[1] * 255, +srgb[2] * 255, +srgb[3] * 255, srgb[4] === undefined ? 1 : +srgb[4]];
  }

  if (scratch === undefined) {
    scratch =
      typeof document === "undefined"
        ? null
        : document
            .createElement("canvas")
            .getContext("2d", { willReadFrequently: true });
    if (scratch) {
      scratch.canvas.width = 1;
      scratch.canvas.height = 1;
    }
  }
  if (!scratch) return null;
  scratch.clearRect(0, 0, 1, 1);
  scratch.fillStyle = color;
  scratch.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = scratch.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
}

/** The color the eye actually sees on `element`: its computed background
 * alpha-composited over its ancestors' until opaque (white fallback). */
export function compositeBackground(element: HTMLElement): string | null {
  const layers: Array<[number, number, number, number]> = [];
  let node: HTMLElement | null = element;

  while (node) {
    const parsed = parseColor(getComputedStyle(node).backgroundColor);
    if (parsed && parsed[3] > 0) {
      layers.push(parsed);
      if (parsed[3] >= 0.99) break;
    }
    node = node.parentElement;
  }
  if (layers.length === 0) return null;

  let [r, g, b] = [255, 255, 255]; // base fallback
  for (const [lr, lg, lb, la] of layers.reverse()) {
    r = lr * la + r * (1 - la);
    g = lg * la + g * (1 - la);
    b = lb * la + b * (1 - la);
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}
