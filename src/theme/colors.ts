type HexColor = `#${string}`;

export const palette = {
  blue: "#142334" as HexColor,
  green: "#279B48" as HexColor,
} as const;

export type Palette = typeof palette;

export const appColors = {
  blue: palette.blue,
  green: palette.green,
  lightBg: "#FFFFFF" as HexColor,
  border: "rgba(20,35,52,0.15)",
  text: "#0F172A" as HexColor,
  subtle: "#64748B" as HexColor,
} as const;

export type AppColors = typeof appColors;
