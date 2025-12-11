const START_COLOR = [244, 63, 94]; // var(--primary)
const END_COLOR = [20, 184, 166]; // var(--accent)

const toRgba = ([r, g, b], alpha) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

const interpolate = (start, end, t) => [
  Math.round(start[0] + (end[0] - start[0]) * t),
  Math.round(start[1] + (end[1] - start[1]) * t),
  Math.round(start[2] + (end[2] - start[2]) * t),
];

export const buildColorPalette = (count, alpha = 0.9) => {
  const safeCount = Math.max(count, 1);

  if (safeCount === 1) {
    return [toRgba(START_COLOR, alpha)];
  }

  return Array.from({ length: safeCount }, (_, index) => {
    const t = index / (safeCount - 1);
    const color = interpolate(START_COLOR, END_COLOR, t);
    return toRgba(color, alpha);
  });
};
