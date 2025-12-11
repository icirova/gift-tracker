const GOLDEN_ANGLE = 137.508;

const buildColor = (index, alpha = 0.9) => {
  const hue = (index * GOLDEN_ANGLE) % 360;
  return `hsla(${hue}, 65%, 45%, ${alpha})`;
};

export const buildColorPalette = (count, alpha = 0.9) =>
  Array.from({ length: Math.max(count, 1) }, (_, index) => buildColor(index, alpha));
