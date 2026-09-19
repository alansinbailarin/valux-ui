import type { Rgb } from "./color.types";

function toRgb(channels: number[]): Rgb {
  return [channels[0], channels[1], channels[2]];
}

function parseHex(color: string): Rgb | null {
  const short = /^#([\da-f])([\da-f])([\da-f])$/i.exec(color);

  if (short) {
    return toRgb(
      short
        .slice(1)
        .map((channel) => Number.parseInt(channel + channel, 16)),
    );
  }

  const full = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color);

  if (!full) {
    return null;
  }

  return toRgb(
    full.slice(1).map((channel) => Number.parseInt(channel, 16)),
  );
}

function parseRgb(color: string): Rgb | null {
  const integers =
    /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(
      color,
    );

  if (integers) {
    const channels = integers.slice(1).map(Number);

    return channels.every((channel) => channel >= 0 && channel <= 255)
      ? toRgb(channels)
      : null;
  }

  const percentages =
    /^rgb\(\s*(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*\)$/i.exec(
      color,
    );

  if (!percentages) {
    return null;
  }

  const values = percentages.slice(1).map(Number);

  if (!values.every((channel) => channel >= 0 && channel <= 100)) {
    return null;
  }

  return toRgb(values.map((channel) => (channel / 100) * 255));
}

export function parseColor(color: string): Rgb | null {
  const normalizedColor = color.trim();

  return parseHex(normalizedColor) ?? parseRgb(normalizedColor);
}
