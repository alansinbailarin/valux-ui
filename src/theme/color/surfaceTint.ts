function formatPercent(value: number): string {
  return `${Number(value.toFixed(3))}%`;
}

export function resolveSurfaceTint(
  surfaceTint?: number,
): { surface: string; raised: string } | undefined {
  if (surfaceTint === undefined) {
    return undefined;
  }

  if (!Number.isFinite(surfaceTint)) {
    throw new Error(
      "[ValuxProvider] color.surfaceTint must be a finite number.",
    );
  }

  const clampedTint = Math.min(100, Math.max(0, surfaceTint));
  const effectiveTint = clampedTint * 0.2;

  return {
    surface: formatPercent(effectiveTint),
    raised: formatPercent(effectiveTint * 0.6),
  };
}
