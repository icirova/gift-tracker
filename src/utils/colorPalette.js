const BASE_COLORS = [
  [244, 63, 94], // primary
  [249, 115, 22],
  [250, 204, 21],
  [45, 212, 191],
  [20, 184, 166],
  [14, 165, 233],
  [99, 102, 241],
  [129, 140, 248],
];

const toRgba = ([r, g, b], alpha) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

const lightenColor = (rgb, amount) => {
  const [r, g, b] = rgb;
  const mix = (channel) => Math.round(channel + (255 - channel) * amount);
  return [mix(r), mix(g), mix(b)];
};

export const buildColorPalette = (count, alpha = 0.92) => {
  const safeCount = Math.max(count, 1);

  return Array.from({ length: safeCount }, (_, index) => {
    const colorIndex = index % BASE_COLORS.length;
    const lightenStep = Math.floor(index / BASE_COLORS.length);
    const lightenAmount = Math.min(0.35, lightenStep * 0.12);
    const baseColor = BASE_COLORS[colorIndex];
    const adjustedColor = lightenAmount ? lightenColor(baseColor, lightenAmount) : baseColor;
    return toRgba(adjustedColor, alpha);
  });
};
