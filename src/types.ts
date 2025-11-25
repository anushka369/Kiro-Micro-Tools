export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export type ColorFormat = 'HEX' | 'RGB' | 'HSL';

export interface Color {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  locked: boolean;
}

export type HarmonyRule = 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'monochromatic';

export interface Palette {
  colors: Color[];
  harmonyRule?: HarmonyRule;
}
